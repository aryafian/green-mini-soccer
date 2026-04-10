# Frontend Update Guide - Using Express Backend

## Overview
Switch from Firebase Cloud Functions (expensive) to self-hosted Express backend for payment processing.

## Current State
- Frontend calls Firebase Cloud Functions at `https://asia-southeast1-green-mini-soccer.cloudfunctions.net/`
- Backend is now available locally at `http://localhost:5000` (dev) or production URL (deployed)

## What Changed
- **Old Flow**: Frontend → Cloud Function → Midtrans
- **New Flow**: Frontend → Express Backend (localhost:5000) → Midtrans

## Update Instructions

### 1. Update FindAGame.jsx

#### Remove Firebase Functions Import
**Before:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions'
```

**After:** (Delete this line)
The frontend will use `fetch` API instead of Firebase callable functions.

---

#### Replace Payment Logic
In `handleBookingSubmit()` function, replace the Cloud Function call with backend API call.

**Before (lines ~265-275):**
```javascript
// Call Cloud Function to get Snap token
const functions = getFunctions(app, 'asia-southeast1')
const createPayment = httpsCallable(functions, 'createPayment')
const result = await createPayment({
  bookingId,
  customerName: currentUser.name,
  customerEmail: currentUser.email,
  totalPrice,
  duration,
  startHour: 6 + selectedSlot.timeIndex,
  rentals: newBooking.rentals
})

const { token } = result.data
```

**After:**
```javascript
// Get Firebase ID token
const idToken = await currentUser.getIdToken()

// Call Express backend
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const response = await fetch(`${backendUrl}/api/payment`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bookingId,
    customerName: currentUser.name,
    customerEmail: currentUser.email,
    duration,
    startHour: 6 + selectedSlot.timeIndex,
    rentals: newBooking.rentals
  })
})

if (!response.ok) {
  throw new Error(`Payment API error: ${response.status}`)
}

const { token } = await response.json()
```

---

### 2. Add Environment Variable (Optional)

Create `.env` file in workspace root:
```
VITE_BACKEND_URL=http://localhost:5000
```

Or for production, create `.env.production`:
```
VITE_BACKEND_URL=https://your-backend-domain.com
```

Frontend will use `http://localhost:5000` if env var not set.

---

### 3. Update currentUser Object

The backend expects `currentUser` to have `getIdToken()` method. Make sure:

**In App.jsx or wherever currentUser is set:**
```javascript
const [currentUser, setCurrentUser] = useState(null)

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Add getIdToken method for backend auth
      setCurrentUser({
        name: user.displayName || 'User',
        email: user.email,
        uid: user.uid,
        getIdToken: () => user.getIdToken()
      })
    } else {
      setCurrentUser(null)
    }
  })
  return unsubscribe
}, [])
```

If you already have this structure, no changes needed. ✓

---

## Testing

### 1. Start Backend
```bash
cd backend
npm install  # First time only
npm run dev
```

Server will print: `🚀 Backend running at http://localhost:5000`

### 2. Start Frontend
```bash
npm run dev
```

Frontend will be at `http://localhost:3000` or `http://192.168.0.xxx:3000`

### 3. Test Payment Flow
1. Open app → Go to "Find a Game"
2. Select date/time/items → Click checkout
3. Should see Midtrans payment popup
4. Test with Midtrans Sandbox card:
   - Card Number: `4011111111111111`
   - Exp: Any future date
   - CVV: `123`
   - OTP: `123456`

### 4. Verify in Firestore
After successful payment, check that booking's `paymentStatus` changed from `pending` to `paid`.

---

## Troubleshooting

### Frontend Can't Reach Backend
**Error:** `Failed to fetch` or `Cannot reach http://localhost:5000`

**Solution:**
1. Make sure backend is running: `npm run dev` in `/backend` folder
2. Check backend is on port 5000: `http://localhost:5000/` should show `{"message":"Green Mini Soccer Backend OK"}`
3. If using mobile/network testing, replace `localhost` with your machine IP (e.g., `192.168.0.103:5000`)

### "Authorization" Header Missing
**Error:** `Invalid or expired token`

**Solution:**
- Make sure `getIdToken()` is being called correctly
- Check `Authorization: Bearer ${idToken}` is in request headers
- Token expires in 1 hour; it will auto-refresh

### CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Backend has `cors()` middleware enabled
- Check browser console for exact error
- Verify backend is actually running

### Midtrans Payment Fails
**Error:** `error: 'Invalid token'` from Midtrans

**Solution:**
- Check Midtrans keys in `.env` are correct (Server Key + Client Key)
- Verify `MIDTRANS_IS_PRODUCTION=false` for Sandbox keys
- Check Firebase credentials are valid

---

## Code Template (Complete Update)

If you want the full replacement code for reference:

**FindAGame.jsx - handleBookingSubmit() payment section:**
```javascript
try {
  setPaymentLoading(true)

  // Insert booking into Firestore
  const newBooking = {
    date: selectedDate.toDateString(),
    timeIndex: selectedSlot.timeIndex,
    duration,
    name: currentUser.name,
    bookedBy: currentUser.email,
    bookedByUid: currentUser.uid,
    rentals,
    totalPrice: calculatePrice(),
    paymentStatus: 'pending'
  }

  const docRef = await addDoc(collection(db, 'bookings'), newBooking)
  const bookingId = docRef.id

  // Close modal before payment
  setIsBookingModalOpen(false)
  setSelectedSlot(null)
  setPaymentLoading(false)

  // Get Firebase ID token
  const idToken = await currentUser.getIdToken()

  // Call Express backend
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
  const response = await fetch(`${backendUrl}/api/payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bookingId,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      duration,
      startHour: 6 + selectedSlot.timeIndex,
      rentals
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Payment API error: ${response.status}`)
  }

  const { token } = await response.json()

  // Open Midtrans payment popup
  window.snap.pay(token, {
    onSuccess: () => {
      alert('Pembayaran berhasil! Booking Anda telah dikonfirmasi.')
    },
    onPending: () => {
      alert('Pembayaran sedang diproses. Booking Anda menunggu konfirmasi pembayaran.')
    },
    onError: () => {
      alert('Pembayaran gagal. Booking telah dibatalkan. Silakan coba booking ulang.')
    },
    onClose: () => {
      alert('Anda menutup halaman pembayaran. Booking perlu dibayar untuk dikonfirmasi.')
    }
  })

} catch (error) {
  console.error('Error submitting booking:', error)
  setPaymentLoading(false)
  alert(`Gagal melakukan booking: ${error.message}`)
}
```

---

## Next Steps

1. ✅ Backend is ready at `e:\mini-soccer\backend\`
2. ⏳ Update FindAGame.jsx with code above
3. ⏳ Test locally (backend + frontend)
4. ⏳ Deploy backend to Railway/Render/other
5. ⏳ Update frontend with production URL

## References

- Backend API docs: [backend/README.md](backend/README.md)
- Express server: [backend/server.js](backend/server.js)
- Midtrans Snap docs: https://docs.midtrans.com/
