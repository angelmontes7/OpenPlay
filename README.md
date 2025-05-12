# 🏀 OpenPlay

**OpenPlay** is a real-time sports location tracker and social app that helps athletes find nearby courts and fields, join games, chat with other players, and place friendly wagers. Built to turn casual sports into connected communities.

---

## 📸 Preview

> - Onboarding
https://github.com/user-attachments/assets/319d507e-c981-4f59-88f7-65790b7faf35

> - SignUp/SignIn
https://github.com/user-attachments/assets/81f49eee-26a9-42cb-af26-d9b6008bce36

> - Home Page
https://github.com/user-attachments/assets/1b9d9084-7ad8-4959-94f2-64581c446ece

> - Chat
https://github.com/user-attachments/assets/63d7b24b-7f86-47dc-8c04-43981dda10bf

> - Wager Tab
https://github.com/user-attachments/assets/1f21ff11-ddb7-40ca-ab76-21f97a6ef9c2

> - Wallet
https://github.com/user-attachments/assets/c581c824-0b0e-496a-af8a-2c9b53f404e0

> - Profile
https://github.com/user-attachments/assets/cf668502-b11b-4fa8-91d1-7d98970eb359

> - Web dashboard showing profit/loss
https://github.com/user-attachments/assets/283d759a-aade-4a69-9aa3-b8264a87b42f

> - Marketing site landing page
https://github.com/user-attachments/assets/a03f410e-132b-4c2b-ad71-d43e8d36fbea


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

