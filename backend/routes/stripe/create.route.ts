import { Stripe } from "stripe";
import express from "express";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post("/", async (req, res) => {
  const { name, email, amount, connectedAccountId } = req.body;

  if (!name || !email || !amount || !connectedAccountId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let customer;
  const existingCustomers = await stripe.customers.list({ email });
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({ name, email });
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-06-20" }
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(amount) * 100,
    currency: "usd",
    customer: customer.id,
    payment_method_types: ["card"],
    transfer_data: {
      destination: connectedAccountId, // <-- This sends funds to the user's connected account
    },
  });

  return res.status(200).json({
    paymentIntent: paymentIntent,
    ephemeralKey: ephemeralKey,
    customer: customer.id,
  });
});


export default router;