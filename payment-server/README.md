# GharDhundho Razorpay payment server

This service creates Razorpay orders and verifies checkout signatures. Keep the
Razorpay secret only in the server environment; never put it in Vite variables
or commit it to Git.

## Local Test Mode

```powershell
Set-Location payment-server
npm install
Copy-Item .env.example .env
# Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
npm start
```

Endpoints:

- `GET /health`
- `POST /create-order` (`amount` is in paise)
- `POST /verify-payment`

Firebase Spark hosting cannot run this Node server. Deploy this folder to
Vercel, Render, or Railway, then use its HTTPS URL from the frontend. For
Vercel, add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
`ALLOWED_ORIGINS` as project environment variables.
