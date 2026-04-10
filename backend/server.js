import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import midtransClient from 'midtrans-client'

dotenv.config()

// Initialize Firebase
const getPrivateKey = () => {
  const pk = process.env.FIREBASE_PRIVATE_KEY || ''
  // Remove quotes if present
  const unquoted = pk.startsWith('"') && pk.endsWith('"') ? pk.slice(1, -1) : pk
  // Replace escaped newlines \n with actual newlines
  return unquoted.replace(/\\n/g, '\n')
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: getPrivateKey(),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
}

console.log('🔧 Initializing Firebase with project:', serviceAccount.projectId)
try {
  initializeApp({ credential: cert(serviceAccount) })
  console.log('✅ Firebase initialized successfully')
} catch (err) {
  console.error('❌ Firebase error:', err.message)
  process.exit(1)
}

const db = getFirestore()
const adminAuth = getAuth()

// Initialize Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
})

// Express app
const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Green Mini Soccer Backend OK', timestamp: new Date().toISOString() })
})

// Utility function
function calculateGrossAmount(itemDetails = []) {
  return itemDetails.reduce((sum, item) => {
    const price = Number(item?.price) || 0
    const qty = Number(item?.quantity) || 0
    return sum + price * qty
  }, 0)
}

// POST /api/payment - Create Midtrans payment token
app.post('/api/payment', async (req, res) => {
  try {
    // 1. Verify Firebase ID token
    const authHeader = req.get('Authorization') || req.get('authorization') || ''
    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    if (!match) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token' })
    }

    let decoded
    try {
      decoded = await adminAuth.verifyIdToken(match[1])
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token', details: err.message })
    }

    // 2. Extract booking data
    const { bookingId, customerName, customerEmail, duration, startHour, rentals } = req.body
    if (!bookingId || !duration) {
      return res.status(400).json({ error: 'Missing required fields: bookingId, duration' })
    }

    // 3. Get booking from Firestore
    const bookingRef = db.collection('bookings').doc(bookingId)
    const bookingSnap = await bookingRef.get()
    if (!bookingSnap.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = bookingSnap.data() || {}
    
    // Verify user is the booking owner
    if (booking.bookedByUid && booking.bookedByUid !== decoded.uid) {
      return res.status(403).json({ error: 'Unauthorized - booking belongs to different user' })
    }
    
    // Prevent duplicate payments - check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' })
    }
    
    // Prevent re-initiating payment if one is pending
    if (booking.paymentStatus === 'pending' && booking.paymentOrderId) {
      console.warn(`Duplicate payment attempt for booking ${bookingId}`)
      return res.status(400).json({ error: 'Payment already in progress for this booking' })
    }

    // 4. Get pricing from Firestore
    const pricingSnap = await db.collection('settings').doc('pricing').get()
    const pricing = pricingSnap.exists ? pricingSnap.data() : {}

    // 5. Build item details
    const itemDetails = []
    const fieldMorningHours = Math.max(0, Math.min(duration, 16 - startHour))
    const fieldEveningHours = Math.max(0, duration - fieldMorningHours)

    if (fieldMorningHours > 0) {
      itemDetails.push({
        id: 'field-morning',
        price: pricing.fieldMorning || 0,
        quantity: fieldMorningHours,
        name: `Sewa Lapangan Pagi (${fieldMorningHours} jam)`
      })
    }
    if (fieldEveningHours > 0) {
      itemDetails.push({
        id: 'field-evening',
        price: pricing.fieldEvening || 0,
        quantity: fieldEveningHours,
        name: `Sewa Lapangan Malam (${fieldEveningHours} jam)`
      })
    }
    if (rentals?.photographer) {
      itemDetails.push({ id: 'photographer', price: pricing.photographer || 0, quantity: 1, name: 'Sewa Fotografer' })
    }
    if ((rentals?.shoes || 0) > 0) {
      itemDetails.push({ id: 'shoes', price: pricing.shoes || 0, quantity: rentals.shoes, name: 'Sewa Sepatu' })
    }
    if ((rentals?.vests || 0) > 0) {
      itemDetails.push({ id: 'vests', price: pricing.vests || 0, quantity: rentals.vests, name: 'Sewa Rompi' })
    }
    if ((rentals?.jerseys || 0) > 0) {
      itemDetails.push({ id: 'jerseys', price: pricing.jerseys || 0, quantity: rentals.jerseys, name: 'Sewa Kaos Tim' })
    }

    const grossAmount = calculateGrossAmount(itemDetails)
    if (grossAmount <= 0) {
      return res.status(400).json({ error: 'Gross amount must be greater than 0' })
    }

    // 6. Create Midtrans transaction
    const orderId = `booking-${bookingId}-${Date.now()}`
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerName || booking.name || 'Customer',
        email: customerEmail || booking.bookedBy || 'noreply@greenminisoccer.com'
      },
      custom_expiry: {
        expiry_duration: 60,
        unit: 'minute'
      }
    }

    const transaction = await snap.createTransaction(parameter)

    // 7. Update booking with payment info
    await bookingRef.update({
      paymentOrderId: orderId,
      paymentStatus: 'pending',
      totalPrice: grossAmount
    })

    // 8. Return token & redirect URL
    res.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url
    })
  } catch (err) {
    console.error('Payment endpoint error:', err)
    res.status(500).json({ error: 'Internal Server Error', message: err?.message })
  }
})

// Midtrans Webhook
app.post('/api/webhook/midtrans', async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body)
    const { order_id, transaction_status, fraud_status } = notification

    console.log(`Webhook: order=${order_id} status=${transaction_status} fraud=${fraud_status}`)

    // Find booking by orderId
    const snapshot = await db.collection('bookings')
      .where('paymentOrderId', '==', order_id)
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.warn('Booking not found for order:', order_id)
      return res.status(200).send('OK')
    }

    const bookingDoc = snapshot.docs[0]
    const bookingData = bookingDoc.data()
    
    // Prevent duplicate processing - check current payment status
    if (bookingData.paymentStatus === 'paid') {
      console.log(`⏭️ Skipping webhook - booking already marked as paid: ${order_id}`)
      return res.status(200).send('OK')
    }
    
    let paymentStatus = 'pending'

    // Only process valid status transitions
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept') {
        paymentStatus = 'paid'
        console.log(`✅ Payment confirmed for order: ${order_id}`)
      } else if (fraud_status === 'challenge') {
        paymentStatus = 'fraud_challenge'  // Still pending manual review
        console.log(`⚠️ Fraud challenge for order: ${order_id}`)
      } else {
        paymentStatus = 'fraud'
        console.log(`❌ Fraud detected for order: ${order_id}`)
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      paymentStatus = 'failed'
      console.log(`❌ Payment failed for order: ${order_id} - status: ${transaction_status}`)
    }

    await bookingDoc.ref.update({
      paymentStatus,
      paymentNotification: notification,
      paymentUpdatedAt: new Date().toISOString()
    })

    res.status(200).send('OK')
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).send('Error')
  }
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
  console.log(`📍 Payment endpoint: http://localhost:${PORT}/api/payment`)
})
