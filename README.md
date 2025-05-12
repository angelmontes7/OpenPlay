# 🏀 OpenPlay

**OpenPlay** is a real-time sports location tracker and social app that helps athletes find nearby courts and fields, join games, chat with other players, and place friendly wagers. Built to turn casual sports into connected communities.

---

## 📸 Preview

> - SignUp

> - SignIn

> - Home Page

> - Setting up Payments

> - Withdrawing funds

> - Storing Card Info

> - Wager Tab

> - Web dashboard showing profit/loss

> - Marketing site landing page

---

## 🚀 Features

- 📍 **Geolocation Search** to find nearby courts/fields
- 👥 **Facility Chatrooms** via Socket.io
- ✅ **Clerk Authentication** (Email & Google Sign-In)
- 💸 **In-App Wagers** with Stripe integration
- ⚖️ **Dispute System** for fair play
- 🌐 **Marketing Website + Dashboard**  
  - Users can sign up or log in via the website  
  - View wager history and **track profit/loss**

---

## 🌐 Website & Dashboard

OpenPlay comes with a public **marketing site** and **web dashboard** for logged-in users.

### 🌍 Marketing Page
- Introduces the app
- Prompts users to sign up or log in
- Showcases app features

### 📊 User Dashboard
- Displays wager history, total games, and **profit/loss**
- Accessible after login
- Synced with mobile app data via shared backend

---

## 🛠️ Tech Stack

**Frontend (Mobile):**
- React Native (Expo)
- NativeWind (Tailwind CSS)
- Expo Location
- rn-credit-card (Card UI)

**Backend:**
- Node.js + Express
- PostgreSQL (Neon)
- Socket.io for real-time chat
- Stripe API for payments
- Supabase for media hosting

**Website (Web App):**
- React
- Clerk for authentication
- Shared backend APIs (same as mobile)
- Profit/loss calculation via Stripe + DB stats

