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
Vercel, Render, or Railway, then use its HTTPS URL from the frontend.

For Vercel:

1. Create a Vercel project with `payment-server` as its Root Directory.
2. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `ALLOWED_ORIGINS` as
   Vercel environment variables. `ALLOWED_ORIGINS` must include the deployed
   Firebase Hosting URL.
3. Deploy from the repository root with `npm run deploy:payment`, or deploy
   from the `payment-server` directory with `npx vercel --prod`.
4. Set the resulting HTTPS project URL as the frontend
   `VITE_PAYMENT_API_URL` value before building Firebase Hosting.

The Vercel function exposes `/health`, `/create-order`, and `/verify-payment`
through the same Express app.
