import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const { status } = req.query;

  if (status === "success") {
    // Return onboarding success response
    return res.send("✅ Stripe onboarding successful! You can now return to the app.");
  }

  if (status === "refresh") {
    // Redirect to Stripe onboarding again or show message
    return res.send("🔁 Stripe onboarding was interrupted. Please try again.");
  }

  // Fallback for other statuses or missing status
  return res.status(400).send("Invalid or missing status.");
});

export default router;
