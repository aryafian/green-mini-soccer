# 🚀 Quick Start Checklist

## Phase 1: Get Credentials (10 min)

### Firebase Service Account
- [ ] Go to https://console.firebase.google.com/
- [ ] Select `green-mini-soccer` project
- [ ] Project Settings → Service Accounts
- [ ] Click "Generate New Private Key" (JSON file downloads)
- [ ] Open `backend/.env`
- [ ] Copy from JSON to .env:
  - `projectId` → `FIREBASE_PROJECT_ID`
  - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` exactly)
  - `client_email` → `FIREBASE_CLIENT_EMAIL`

### Midtrans Keys
- [ ] Go to https://dashboard.midtrans.com/
- [ ] Go to Settings → API Keys
- [ ] Copy Sandbox keys (important: SANDBOX, not Production yet)
  - Sandbox Server Key → `MIDTRANS_SERVER_KEY` in `.env`
  - Sandbox Client Key → `MIDTRANS_CLIENT_KEY` in `.env`
- [ ] Leave `MIDTRANS_IS_PRODUCTION=false`
- [ ] **Save `.env` file**

---

## Phase 2: Test Backend Locally (5 min)

```bash
cd backend
npm install
npm run dev
```

✅ Should see: `🚀 Backend running at http://localhost:5000`

- [ ] Open browser: http://localhost:5000/
- [ ] Should show: `{"message":"Green Mini Soccer Backend OK"}`
- [ ] Backend is working! ✓

---

## Phase 3: Update Frontend (15 min)

Open `src/components/FindAGame.jsx`:

### 1. Remove Firebase Functions import (Line 2)
```javascript
// DELETE THIS LINE:
import { getFunctions, httpsCallable } from 'firebase/functions'
```

### 2. Replace payment code (Around line 265 in handleBookingSubmit)
**Delete this:**
```javascript
const functions = getFunctions(app, 'asia-southeast1')
const createPayment = httpsCallable(functions, 'createPayment')
const result = await createPayment({...})
const { token } = result.data
```

**Replace with:**
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
    rentals
  })
})

if (!response.ok) {
  throw new Error(`Payment API error: ${response.status}`)
}

const { token } = await response.json()
```

- [ ] Save `FindAGame.jsx`
- [ ] Frontend is updated! ✓

---

## Phase 4: Test Full Flow (10 min)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

- [ ] Open browser: http://localhost:3000
- [ ] Go to "Find a Game"
- [ ] Select date → time → items
- [ ] Click checkout
- [ ] **Midtrans popup should appear** ✓

### Test Payment (Sandbox)
Use Midtrans test card:
- Card: `4011111111111111`
- Exp: `12/25`
- CVV: `123`
- OTP: `123456`

- [ ] Payment completes
- [ ] See success message
- [ ] Check Firestore: booking should show `paymentStatus: 'paid'` ✓

---

## Phase 5: Deploy Backend (Later)

When everything works locally, deploy to free hosting:

### Option A: Railway.app (Easiest)
```bash
npm install -g railway
railway login
cd backend
railway link
railway up
```

- [ ] Get production URL (e.g., `green-mini-soccer-backend.railway.app`)
- [ ] Copy to `.env.production` in frontend

### Option B: Render.com
- [ ] Connect GitHub repo to Render
- [ ] Select `backend` directory
- [ ] Add environment variables
- [ ] Deploy

- [ ] Get production URL
- [ ] Update frontend env var

---

## Troubleshooting

### Backend won't start
```bash
# Try deleting node_modules and reinstalling
cd backend
rm -r node_modules
npm install
npm run dev
```

### Frontend can't connect to backend
- [ ] Check backend is running: `http://localhost:5000/`
- [ ] Check network tab in browser DevTools for failed requests
- [ ] Try on PC (not phone) first
- [ ] Check firewall isn't blocking port 5000

### Midtrans popup doesn't appear
- [ ] Check browser console for errors
- [ ] Verify Backend returned a valid token
- [ ] Check Midtrans keys in `.env` are correct
- [ ] Verify `MIDTRANS_IS_PRODUCTION=false` for Sandbox

### Payment fails with "Invalid token"
- [ ] Check Firebase ID token is being sent
- [ ] Token might be expired (auto-refreshes, but check console)
- [ ] Verify Midtrans Server Key is correct

---

## Command Reference

```bash
# Start everything
cd backend && npm run dev      # Terminal 1
cd .. && npm run dev           # Terminal 2 (frontend)

# Quick test
curl -X GET http://localhost:5000/

# Deploy
railway up

# Kill backend
Ctrl+C in terminal 1
```

---

## Files to Remember

| File | Purpose | Status |
|------|---------|--------|
| `backend/.env` | Credentials | 🟡 FILL IN |
| `backend/server.js` | Backend app | ✅ READY |
| `src/components/FindAGame.jsx` | Frontend logic | 🟡 UPDATE |
| `backend/README.md` | Full docs | ✅ REFERENCE |
| `FRONTEND_UPDATE.md` | Integration guide | ✅ REFERENCE |

---

## Success Indicators

✅ Backend starts at http://localhost:5000
✅ Frontend calls /api/payment endpoint
✅ Midtrans popup appears on checkout
✅ Test payment works with sandbox card
✅ Firestore booking shows payment status
✅ Everything ready for production deployment

---

**Total Time: ~50 minutes**

**Start with Phase 1!** 👉 Fill in `.env`
