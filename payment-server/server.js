import dotenv from "dotenv";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

dotenv.config();
dotenv.config({ path: "../.env", override: false });

const app = express();
const port = Number(process.env.PORT || 8080);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const trustedOrigins = new Set([
  ...allowedOrigins,
  "https://ghardhundho-1600e.web.app",
  "https://ghardhundho-1600e.firebaseapp.com",
 
]);

const razorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
);
const razorpay = razorpayConfigured
  ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  : null;

app.use(cors({
  origin(origin, callback) {
    if (!origin || trustedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed"));
  },
}));
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    razorpayConfigured,
    mode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "test" : "live",
    debug: {
      hasKeyId: Boolean(process.env.RAZORPAY_KEY_ID),
      keyIdLength: (process.env.RAZORPAY_KEY_ID || "").length,
      keyIdPrefix: (process.env.RAZORPAY_KEY_ID || "").slice(0, 8),
      hasKeySecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
      keySecretLength: (process.env.RAZORPAY_KEY_SECRET || "").length,
      vercelEnv: process.env.VERCEL_ENV || "not-set",
    },
  });
});

app.post("/create-order", async (request, response, next) => {
  try {
    if (!razorpay) {
      response.status(503).json({ error: "Razorpay credentials are not configured" });
      return;
    }

    const { amount, currency = "INR", receipt, propertyId, userId } = request.body;
    const numericAmount = Number(amount);

    if (!propertyId || !userId || currency !== "INR"
      || !Number.isInteger(numericAmount) || numericAmount < 100) {
      response.status(400).json({
        error: "propertyId, userId, INR currency, and a valid amount are required",
      });
      return;
    }

    const order = await razorpay.orders.create({
      amount: numericAmount,
      currency,
      receipt: String(receipt || `ghardhundho_${Date.now()}`).slice(0, 40),
      notes: {
        propertyId: String(propertyId || "").slice(0, 100),
        userId: String(userId || "").slice(0, 100),
      },
    });

    response.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/verify-payment", (request, response) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    response.status(503).json({ verified: false, error: "Razorpay credentials are not configured" });
    return;
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = request.body;

  if (!orderId || !paymentId || !signature) {
    response.status(400).json({ verified: false, error: "Payment fields are required" });
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const receivedSignature = Buffer.from(String(signature));
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  const verified = receivedSignature.length === expectedSignatureBuffer.length
    && crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignature);

  response.status(verified ? 200 : 400).json({ verified });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Payment service error" });
});

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`GharDhundho payment server listening on port ${port}`);
  });
}