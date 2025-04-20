import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Import route files from the 'routes/database' folder
import balanceApi from './routes/database/balance.route';
import chargeCardsApi from './routes/database/charge-cards.route';
import checkInApi from './routes/database/check-in.route';
import checkOutApi from './routes/database/check-out.route';
import headCountApi from './routes/database/head-count.route';
import preferencesApi from './routes/database/preferences.route';
import sportsFacilitiesApi from './routes/database/sports-facilities.route';
import transactionsApi from './routes/database/transactions.route';
import updateProfilePicApi from './routes/database/profile-pic.route';
import userApi from './routes/database/user.route';
import wagerApi from './routes/database/wager.route';
import wagerConfirmApi from './routes/database/wager-confirm.route';
import wagerInfoApi from './routes/database/wager-info.route';
import wagerParticipantsApi from './routes/database/wager-participants.route';
import wagerResetVotesApi from './routes/database/wager-reset-votes.route';
import stripeRedirectRoutes from "./stripe-redirect"
import stripeStatus from "./routes/stripe/status.route"

// Import Stripe-related APIs
import connectedAccountApi from './routes/stripe/connected-account.route';
import createApi from './routes/stripe/create.route';
import payApi from './routes/stripe/pay.route';
import payoutApi from './routes/stripe/payout.route';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Create HTTP server instance
const httpServer = createServer(app);

// Setup Socket.IO with CORS config
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // change this in prod
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SOCKET.IO EVENTS ---
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle incoming messages
  socket.on("send-message", ({ text, senderId, username }) => {
    // Broadcast message to all other clients (excluding the sender)
    socket.broadcast.emit("receive-message", { text, senderId, username });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Registering routes with their respective paths
app.use('/api/database/balance', balanceApi);
app.use('/api/database/charge-cards', chargeCardsApi);
app.use('/api/database/check-in', checkInApi);
app.use('/api/database/check-out', checkOutApi);
app.use('/api/database/head-count', headCountApi);
app.use('/api/database/preferences', preferencesApi);
app.use('/api/database/sports-facilities', sportsFacilitiesApi);
app.use('/api/database/transactions', transactionsApi);
app.use('/api/database/update-profile-pic', updateProfilePicApi);
app.use('/api/database/user', userApi);
app.use('/api/database/wager', wagerApi);
app.use('/api/database/wager-confirm', wagerConfirmApi);
app.use('/api/database/wager-info', wagerInfoApi);
app.use('/api/database/wager-participants', wagerParticipantsApi);
app.use('/api/database/wager-reset-votes', wagerResetVotesApi);


// Stripe API routes
app.use('/api/stripe/connected-account', connectedAccountApi);
app.use('/api/stripe/create', createApi);
app.use('/api/stripe/pay', payApi);
app.use('/api/stripe/payout', payoutApi);
app.use("/api/stripe/redirect", stripeRedirectRoutes);
app.use("/api/stripe/status", stripeStatus)

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the OpenPlay API!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy!" });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
