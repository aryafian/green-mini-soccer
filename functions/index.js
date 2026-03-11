const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const midtransClient = require('midtrans-client')

initializeApp()
const db = getFirestore()

// ─── Midtrans Snap Client ─────────────────────────────────────────────────────
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
})

// ─── 1. Create Payment (dipanggil dari frontend) ──────────────────────────────
exports.createPayment = onCall({ region: 'asia-southeast1' }, async (request) => {
  const { auth, data } = request

  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login diperlukan untuk melakukan booking.')
  }

  const {
    bookingId, customerName, customerEmail, duration,
    startHour, rentals, totalPrice
  } = data

  if (!bookingId || !totalPrice) {
    throw new HttpsError('invalid-argument', 'Data booking tidak lengkap.')
  }

  const orderId = `booking-${bookingId}-${Date.now()}`

  // Buat item details untuk Midtrans
  const itemDetails = []
  const fieldMorningHours = Math.max(0, Math.min(duration, 16 - startHour))
  const fieldEveningHours = Math.max(0, duration - fieldMorningHours)

  // Load pricing dari Firestore
  const pricingDoc = await db.collection('settings').doc('pricing').get()
  const pricing = pricingDoc.exists ? pricingDoc.data() : {}

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
  if (rentals?.shoes > 0) {
    itemDetails.push({ id: 'shoes', price: pricing.shoes || 0, quantity: rentals.shoes, name: 'Sewa Sepatu' })
  }
  if (rentals?.vests > 0) {
    itemDetails.push({ id: 'vests', price: pricing.vests || 0, quantity: rentals.vests, name: 'Sewa Rompi' })
  }
  if (rentals?.jerseys > 0) {
    itemDetails.push({ id: 'jerseys', price: pricing.jerseys || 0, quantity: rentals.jerseys, name: 'Sewa Kaos Tim' })
  }

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: totalPrice
    },
    item_details: itemDetails,
    customer_details: {
      first_name: customerName,
      email: customerEmail
    },
    custom_expiry: {
      expiry_duration: 60,
      unit: 'minute'
    }
  }

  try {
    const transaction = await snap.createTransaction(parameter)

    // Simpan orderId ke dokumen booking agar bisa dicocokkan saat webhook
    await db.collection('bookings').doc(bookingId).update({
      paymentOrderId: orderId,
      paymentStatus: 'pending',
      totalPrice
    })

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url
    }
  } catch (err) {
    console.error('Midtrans error:', err)
    throw new HttpsError('internal', 'Gagal membuat transaksi pembayaran: ' + err.message)
  }
})

// ─── 2. Midtrans Webhook Notification ────────────────────────────────────────
exports.midtransWebhook = onRequest({ region: 'asia-southeast1' }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  try {
    const notification = await snap.transaction.notification(req.body)
    const { order_id, transaction_status, fraud_status } = notification

    console.log(`Webhook: order=${order_id} status=${transaction_status} fraud=${fraud_status}`)

    // Cari booking berdasarkan orderId
    const snapshot = await db.collection('bookings')
      .where('paymentOrderId', '==', order_id)
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.warn('Booking tidak ditemukan untuk order:', order_id)
      res.status(200).send('OK')
      return
    }

    const bookingDoc = snapshot.docs[0]
    let paymentStatus = 'pending'

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      paymentStatus = fraud_status === 'accept' ? 'paid' : 'fraud'
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      paymentStatus = 'failed'
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
