import { Stripe } from "stripe";
import express from "express";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post("/", async (req, res) => {
  try {
    const { payment_method_id, payment_intent_id, customer_id, client_secret } = req.body;

    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentMethod = await stripe.paymentMethods.attach(
      payment_method_id,
      { customer: customer_id },
    );

    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
    });

    return res.status(200).json({
        success: true,
        message: "Payment successful",
        result: result,
      },
    );
  } catch (error) {
    console.error("Error paying:", error);
    return res.status(500).json({ error: "Internal Server Error" })
  }
});

export default router;