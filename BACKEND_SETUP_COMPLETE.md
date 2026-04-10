# Express Backend Setup - Complete ✅

## What Was Completed

### Backend Infrastructure Created
✅ **backend/server.js** - Express app with:
  - Firebase Admin SDK initialization
  - Midtrans Snap client setup
  - POST `/api/payment` endpoint (creates payment token)
  - POST `/api/webhook/midtrans` endpoint (payment status updates)
  - Express + CORS configured

✅ **backend/package.json** - All dependencies installed:
  - express, cors, dotenv
  - firebase-admin (Firestore + Auth verification)
  - midtrans-client (payment gateway)
  - npm scripts: `npm start` and `npm run dev`

✅ **backend/.env** - Environment template with placeholders:
  - Firebase credentials (projectId, privateKey, clientEmail)
  - Midtrans credentials (serverKey, clientKey)
  - Production/Sandbox toggle

✅ **backend/.gitignore** - Standard Node.js ignores (.env, node_modules, etc)

✅ **backend/README.md** - Complete documentation:
  - Setup instructions (install & configure)
  - API endpoint documentation
  - How it works (flow diagram)
  - Testing guide with curl
  - Deployment options (Railway, Render, etc)
  - Production checklist

✅ **FRONTEND_UPDATE.md** - Frontend integration guide:
  - Step-by-step changes to FindAGame.jsx
  - Remove Cloud Functions, use fetch() instead
  - Complete code template ready to copy-paste
  - Testing procedures
  - Troubleshooting tips

---

## Next Steps (In Order)

### 1️⃣ Fill in Backend Credentials (10 min)
**Do this:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts → Generate New Private Key
3. Copy values to `backend/.env`:
   - `projectId` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

4. Go to [Midtrans Dashboard](https://dashboard.midtrans.com/)
5. Settings → API Keys → Copy Sandbox keys to `backend/.env`:
   - Server Key → `MIDTRANS_SERVER_KEY`
   - Client Key → `MIDTRANS_CLIENT_KEY`
   - Keep `MIDTRANS_IS_PRODUCTION=false`

### 2️⃣ Test Backend Locally (5 min)
```bash
cd backend
npm install
npm run dev
```
Should print: `🚀 Backend running at http://localhost:5000`

### 3️⃣ Update Frontend (15 min)
Follow [FRONTEND_UPDATE.md](FRONTEND_UPDATE.md):
- Remove Firebase Functions import
- Replace payment logic with fetch() call to backend
- Test complete payment flow

### 4️⃣ Test End-to-End (10 min)
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Try full booking → payment flow
4. Verify Firestore shows `paymentStatus: 'paid'`

### 5️⃣ Deploy Backend (Later)
When ready for production:
- Choose hosting: Railway.app or Render.com (recommended)
- Follow backend/README.md deployment section
- Set production Midtrans keys + `MIDTRANS_IS_PRODUCTION=true`
- Get live URL (e.g., https://green-mini-soccer-backend.railway.app)
- Update frontend env var to production URL

---

## File Structure
```
e:\mini-soccer\
├── backend/                 ← NEW DIRECTORY
│   ├── server.js           ← Express app (READY)
│   ├── package.json        ← Dependencies (READY)
│   ├── .env                ← Config (NEEDS YOUR CREDENTIALS)
│   ├── .gitignore          ← Git ignores (READY)
│   └── README.md           ← Setup guide (READY)
├── src/
│   ├── components/
│   │   └── FindAGame.jsx   ← NEEDS UPDATE (payment logic)
│   └── ...
├── FRONTEND_UPDATE.md      ← Integration guide (NEW)
└── ...
```

---

## Current Architecture Diagram

```
┌─────────────────────────┐
│   Frontend (React)      │
│  FindAGame.jsx (Vite)   │
└────────────┬────────────┘
             │ fetch() with Bearer token
             │ POST /api/payment
             ↓
┌─────────────────────────┐
│  Backend (Express.js)   │
│  localhost:5000         │ ← NEW
│  - Midtrans client      │
│  - Firebase admin       │
│  - Firestore updates    │
└────────────┬────────────┘
             │ snap.createTransaction()
             │ + webhook callbacks
             ↓
┌─────────────────────────┐
│  Midtrans Snap Gateway  │
│  (Payment Processing)   │
└─────────────────────────┘
             │
             ↓ webhook
┌─────────────────────────┐
│  Firestore              │
│  (Booking + Payment)    │
└─────────────────────────┘
```

---

## Key Differences from Cloud Functions

| Aspect | Cloud Functions | Express Backend |
|--------|---|---|
| Cost | $0.40 per million invokes (can get expensive) | Free (if using Railway/Render free tier) |
| Latency | ~500-1000ms (cold start) | ~100-200ms (warm) |
| Control | Limited by Google | Full server control |
| Deployment | Automatic | Manual (Railway/Render) |
| Debugging | Cloud Function logs | Server logs + debugger |
| Scaling | Automatic | Auto (on Railway/Render) |

---

## Commands Reference

```bash
# Backend
cd backend
npm install          # First time only
npm run dev          # Start with hot reload
npm start            # Start production

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production

# Testing
curl -X POST http://localhost:5000/api/payment \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Important Notes for User

1. ⚠️ **Never commit .env to Git** - Already in .gitignore, but double-check
2. 🔑 **Firebase Private Key** - Keep `\n` characters exactly as-is in .env
3. 📱 **Testing on Mobile** - Replace `localhost` with PC IP (e.g., 192.168.0.103:5000)
4. 🧪 **Midtrans Sandbox** - Keep `MIDTRANS_IS_PRODUCTION=false` for testing
5. ✅ **Webhook Testing** - Only works when backend is reachable (not localhost)

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Fill credentials | 10 min | 🟡 TODO |
| Test backend | 5 min | 🟡 TODO |
| Update frontend | 15 min | 🟡 TODO |
| Test end-to-end | 10 min | 🟡 TODO |
| Deploy to Railway | 10 min | 🟡 TODO (later) |
| **Total** | **~50 min** | |

---

## Success Criteria

✅ Backend starts without errors
✅ POST /api/payment returns valid Midtrans token
✅ Frontend payment flow works (shows Midtrans popup)
✅ Booking saved to Firestore with payment info
✅ Payment status updates when payment completes
✅ All tests pass before deploying to production

---

**Status:** 🟢 **Backend Ready** - Waiting for credentials + frontend update

**Next Action:** Fill in `.env` and test locally
