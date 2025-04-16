import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

// Import route files from the 'routes/database' folder
import balanceApi from './routes/database/balance.route.ts';
import chargeCardsApi from './routes/database/charge-cards.route.ts';
import checkInApi from './routes/database/check-in.route.ts';
import checkOutApi from './routes/database/check-out.route.ts';
import headCountApi from './routes/database/head-count.route.ts';
import preferencesApi from './routes/database/preferences.route.ts';
import sportsFacilitiesApi from './routes/database/sports-facilities.route.ts';
import transactionsApi from './routes/database/transactions.route.ts';
import updateProfilePicApi from './routes/database/profile-pic.route.ts';
import userApi from './routes/database/user.route.ts';
import wagerApi from './routes/database/wager.route.ts';
import wagerConfirmApi from './routes/database/wager-confirm.route.ts';
import wagerInfoApi from './routes/database/wager-info.route.ts';
import wagerParticipantsApi from './routes/database/wager-participants.route.ts';
import wagerResetVotesApi from './routes/database/wager-reset-votes.route.ts';

// Import Stripe-related APIs
import connectedAccountApi from './routes/stripe/connected-account.route.ts';
import createApi from './routes/stripe/create.route.ts';
import payApi from './routes/stripe/pay.route.ts';
import payoutApi from './routes/stripe/payout.route.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registering routes with their respective paths
app.use('/api/balance', balanceApi);
app.use('/api/charge-cards', chargeCardsApi);
app.use('/api/check-in', checkInApi);
app.use('/api/check-out', checkOutApi);
app.use('/api/head-count', headCountApi);
app.use('/api/preferences', preferencesApi);
app.use('/api/sports-facilities', sportsFacilitiesApi);
app.use('/api/transactions', transactionsApi);
app.use('/api/update-profile-pic', updateProfilePicApi);
app.use('/api/user', userApi);
app.use('/api/wager', wagerApi);
app.use('/api/wager-confirm', wagerConfirmApi);
app.use('/api/wager-info', wagerInfoApi);
app.use('/api/wager-participants', wagerParticipantsApi);
app.use('/api/wager-reset-votes', wagerResetVotesApi);

// Stripe API routes
app.use('/api/connected-account', connectedAccountApi);
app.use('/api/create', createApi);
app.use('/api/pay', payApi);
app.use('/api/payout', payoutApi);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the OpenPlay API!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
