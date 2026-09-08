# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Property-Rental-Platform

## Supabase image storage

Supabase is used only for property image files. Create a public Storage bucket
named `property-images` (or set `VITE_SUPABASE_IMAGE_BUCKET`) and configure
these frontend variables in `.env`:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_IMAGE_BUCKET=property-images
```

The Firebase Auth/Firestore data flow remains unchanged.

## Payment server on Vercel

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `ALLOWED_ORIGINS` in the
Vercel project for `payment-server`, then deploy with:

```powershell
npm run deploy:payment
```

Set the deployed Vercel URL as `VITE_PAYMENT_API_URL` before running
`npm run deploy` for Firebase Hosting.

## Automatic deployment from GitHub

GitHub Actions is the deployment source of truth. Every push to `main`
deploys the frontend and Firestore rules to Firebase Hosting and the payment
server to Vercel. Configure these repository secrets before enabling the
workflow:

- `FIREBASE_SERVICE_ACCOUNT` (Firebase service-account JSON)
- `FIREBASE_PROJECT_ID`
- `VERCEL_TOKEN`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_IMAGE_BUCKET`
- `VITE_PAYMENT_API_URL`

Also configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
`ALLOWED_ORIGINS` in the Vercel project's Production environment. Supabase
Storage remains shared because both local and deployed frontends use the same
Supabase project and bucket.
