import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { neon } from '@neondatabase/serverless';
const db = neon(process.env.DATABASE_URL!);

// Import route files from the 'routes/database' folder
import balanceApi from './routes/database/balance.route';
import chargeCardsApi from './routes/database/charge-cards.route';
import checkInApi from './routes/database/check-in.route';
import checkOutApi from './routes/database/check-out.route';
import headCountApi from './routes/database/head-count.route';
import preferencesApi from './routes/database/preferences.route';
import profilePicApi from './routes/database/profile-pic.route'
import sportsFacilitiesApi from './routes/database/sports-facilities.route';
import transactionsApi from './routes/database/transactions.route';
import updateProfilePicApi from './routes/database/profile-pic.route';
import userApi from './routes/database/user.route';
import wagerApi from './routes/database/wager.route';
import wagerConfirmApi from './routes/database/wager-confirm.route';
import wagerInfoApi from './routes/database/wager-info.route';
import wagerParticipantsApi from './routes/database/wager-participants.route';
import wagerResetVotesApi from './routes/database/wager-reset-votes.route';
import messagesApi from "./routes/database/messages.route"
import averageRatingApi from "./routes/database/average-ratings.route"
import rateFacilityApi from "./routes/database/rate.route"
import companyRevenueApi from "./routes/database/company-revenue.route"

// Import Stripe-related APIs
import connectedAccountApi from './routes/stripe/connected-account.route';
import createApi from './routes/stripe/create.route';
import payApi from './routes/stripe/pay.route';
import payoutApi from './routes/stripe/payout.route';
import stripeRedirectRoutesApi from "./stripe-redirect"
import stripeStatusApi from "./routes/stripe/status.route"

// Import Supabase-related API's
import uploadRoutes from './routes/supabase/upload.route'

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

  socket.on("join-room", (roomId) => {
    console.log(`User joined room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on("leave-room", (roomId) => {
    console.log(`User left room: ${roomId}`);
    socket.leave(roomId);
  });

  // Handle incoming messages
  socket.on("send-message", async ({ text, senderId, username, roomId }) => {
    try {
      // Save to DB
      await db`
      INSERT INTO messages (facility_id, text, sender_id, username)
      VALUES (${roomId}, ${text}, ${senderId}, ${username})
      `;
      const message = { text, senderId, username };
      io.to(roomId).emit("receive-message", message);
    } catch (err) {
      console.error("Error saving message:", err);
    }
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
app.use('/api/database/profile-pic', profilePicApi);
app.use('/api/database/sports-facilities', sportsFacilitiesApi);
app.use('/api/database/transactions', transactionsApi);
app.use('/api/database/update-profile-pic', updateProfilePicApi);
app.use('/api/database/user', userApi);
app.use('/api/database/wager', wagerApi);
app.use('/api/database/wager-confirm', wagerConfirmApi);
app.use('/api/database/wager-info', wagerInfoApi);
app.use('/api/database/wager-participants', wagerParticipantsApi);
app.use('/api/database/wager-reset-votes', wagerResetVotesApi);
app.use('/api/database/messages', messagesApi);
app.use('/api/database/average-ratings', averageRatingApi);
app.use('/api/database/rate', rateFacilityApi)
app.use('/api/database/company-revenue', companyRevenueApi)

// Stripe API routes
app.use('/api/stripe/connected-account', connectedAccountApi);
app.use('/api/stripe/create', createApi);
app.use('/api/stripe/pay', payApi);
app.use('/api/stripe/payout', payoutApi);
app.use("/api/stripe/redirect", stripeRedirectRoutesApi);
app.use("/api/stripe/status", stripeStatusApi)

// Supabase API routes
app.use('/api/supabase/upload', uploadRoutes)

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
