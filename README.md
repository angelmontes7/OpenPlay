# 🏀 OpenPlay

**OpenPlay** is a real-time sports location tracker and social app that helps athletes find nearby courts and fields, join games, chat with other players, and place friendly wagers. Built to turn casual sports into connected communities.

---

## 📸 Preview

> - Onboarding


https://github.com/user-attachments/assets/319d507e-c981-4f59-88f7-65790b7faf35


> - SignUp/SignIn



https://github.com/user-attachments/assets/81f49eee-26a9-42cb-af26-d9b6008bce36


> - Home Page

> - Chat

> - Wager Tab

> - Wallet

> - Profile



https://github.com/user-attachments/assets/cf668502-b11b-4fa8-91d1-7d98970eb359


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

