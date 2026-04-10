# Green Mini Soccer Backend - Express.js Server

## Overview
Self-hosted Express.js backend for processing Midtrans payments. This replaces Firebase Cloud Functions (which are too expensive) with a simple, free-to-host backend.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Edit `.env` file and fill in your credentials:

#### Firebase Admin SDK
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `green-mini-soccer` project
3. Go to **Project Settings** → **Service Accounts** tab
4. Click **Generate New Private Key**
5. A JSON file will download — copy these values to `.env`:
   - `projectId` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` format exactly as-is)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

#### Midtrans API Keys
1. Go to [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Go to **Settings** → **API Keys**
3. Copy:
   - **Sandbox Server Key** → `MIDTRANS_SERVER_KEY`
   - **Sandbox Client Key** → `MIDTRANS_CLIENT_KEY`
   - Keep `MIDTRANS_IS_PRODUCTION="false"` for Sandbox testing
4. (Later, when deploying to production, switch to Production keys and set `MIDTRANS_IS_PRODUCTION="true"`)

### 3. Run Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:5000`
- Health check: `http://localhost:5000/`
- Payment endpoint: `POST http://localhost:5000/api/payment`

## API Endpoints

### POST `/api/payment`
Creates a Midtrans payment token for checkout.

**Request Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bookingId": "booking-123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "duration": 2,
  "startHour": 16,
  "rentals": {
    "photographer": false,
    "shoes": 2,
    "vests": 0,
    "jerseys": 4
  }
}
```

**Response (Success):**
```json
{
  "token": "2de0bcc3-47d9-4991-b8b1-e9c944f2e0b1",
  "redirectUrl": "https://app.sandbox.midtrans.com/snap/v3/..."
}
```

**Response (Error):**
```json
{
  "error": "Error message here",
  "message": "Detailed error reason (if applicable)"
}
```

### POST `/api/webhook/midtrans`
Webhook for Midtrans payment notifications (configured in Midtrans Dashboard).

## How It Works

1. **Frontend** (React) calls `/api/payment` with booking details
2. **Backend** verifies Firebase ID token from Authorization header
3. **Backend** loads booking from Firestore + pricing from settings
4. **Backend** builds Midtrans transaction with calculated gross amount
5. **Backend** returns Snap token + redirect URL
6. **Frontend** either:
   - Redirects to Midtrans URL, or
   - Opens Snap popup with token
7. **User** completes payment in Midtrans interface
8. **Midtrans** sends webhook to `/api/webhook/midtrans`
9. **Backend** updates booking payment status in Firestore

## Testing Locally

### 1. Frontend Configuration
Update [src/components/FindAGame.jsx](../src/components/FindAGame.jsx) to use backend:

Change:
```javascript
const backendUrl = 'http://localhost:5000/api/payment';
```

Make sure the frontend already has fallback logic to call this URL.

### 2. Test with curl
```bash
# Get your Firebase ID token from browser console:
# window.firebase.auth().currentUser.getIdToken().then(token => console.log(token))

export TOKEN="your_firebase_id_token_here"

curl -X POST http://localhost:5000/api/payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-booking-$(date +%s)",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "duration": 2,
    "startHour": 16,
    "rentals": {"photographer": false, "shoes": 1, "vests": 0, "jerseys": 2}
  }'
```

## Deployment

### Option A: Railway.app (Recommended)
1. Install Railway CLI:
   ```bash
   npm install -g railway
   ```
2. Login:
   ```bash
   railway login
   ```
3. Link to your project:
   ```bash
   cd backend && railway link
   ```
4. Deploy:
   ```bash
   railway up
   ```
5. Set environment variables in Railway dashboard

### Option B: Render.com
1. Connect your GitHub repo to Render
2. Create new Web Service, select repository
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Option C: Other Providers
- Vercel (serverless)
- Heroku (with paid dyno)
- DigitalOcean App Platform
- AWS/GCP/Azure

## Production Checklist
- [ ] Update Midtrans keys to Production (Server Key + Client Key)
- [ ] Set `MIDTRANS_IS_PRODUCTION="true"` in production `.env`
- [ ] Update frontend to use production backend URL
- [ ] Test payment flow end-to-end with real Midtrans account
- [ ] Set up Midtrans webhook to point to production URL in Midtrans Dashboard
- [ ] Monitor logs and errors

## Troubleshooting

### "Invalid or expired token" Error
- Make sure `Authorization: Bearer <TOKEN>` header is present
- Token should be a valid Firebase ID token (not custom token)
- Token expires in 1 hour; refresh if needed

### Midtrans Connection Error
- Check `MIDTRANS_SERVER_KEY` and `MIDTRANS_CLIENT_KEY` are correct
- Verify `MIDTRANS_IS_PRODUCTION` matches your keys (false for Sandbox keys)

### Firebase Not Initialized
- Ensure `.env` variables are filled in correctly
- Check `FIREBASE_PRIVATE_KEY` preserves `\n` characters exactly

### CORS Errors in Frontend
- Backend already has `cors()` middleware enabled
- Check browser console for exact error message

## File Structure
```
backend/
├── server.js          # Main Express app & endpoints
├── package.json       # Dependencies & scripts
├── .env               # Configuration (DO NOT COMMIT)
├── .gitignore         # Ignores node_modules, .env
└── README.md          # This file
```

## Next Steps
1. Fill in `.env` with your Firebase + Midtrans credentials
2. Run `npm run dev` and test endpoint
3. Update frontend to use backend URL
4. Deploy to Railway/Render
5. Update frontend with production URL

## Support
For issues:
- Check `.env` configuration
- Review server logs: `npm run dev`
- Test endpoint with curl
- Check Midtrans webhook logs in dashboard
