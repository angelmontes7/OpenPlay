import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

// Import route files from the 'routes/database' folder
import balanceApi from './routes/database/balance+api';
import chargeCardsApi from './routes/database/charge_cards+api';
import checkInApi from './routes/database/check_in+api';
import checkOutApi from './routes/database/check_out+api';
import headCountApi from './routes/database/head_count+api';
import preferencesApi from './routes/database/preferences+api';
import sportsFacilitiesApi from './routes/database/sports_facilities+api';
import transactionsApi from './routes/database/transactions+api';
import updateProfilePicApi from './routes/database/update_profile_pic+api';
import userApi from './routes/database/user+api';
import wagerApi from './routes/database/wager+api';
import wagerConfirmApi from './routes/database/wager_confirm+api';
import wagerInfoApi from './routes/database/wager_info+api';
import wagerParticipantsApi from './routes/database/wager_participants+api';
import wagerResetVotesApi from './routes/database/wager_reset_votes+api';

// Import Stripe-related APIs
import connectedAccountApi from './routes/stripe/connected-account+api';
import createApi from './routes/stripe/create+api';
import payApi from './routes/stripe/pay+api';
import payoutApi from './routes/stripe/payout+api';

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