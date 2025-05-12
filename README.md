# 🏀 OpenPlay

**OpenPlay** is a real-time sports location tracker and social app designed to turn casual sports into connected communities. Players can find nearby courts and fields, join live games, chat with others, and place friendly wagers — all in one platform.

---

## 📸 App & Web Preview

> 📱 **Mobile App Screens**
- **Onboarding**
  
  [Onboarding](https://github.com/user-attachments/assets/319d507e-c981-4f59-88f7-65790b7faf35)

- **Sign Up / Sign In**
  
  [Sign In](https://github.com/user-attachments/assets/81f49eee-26a9-42cb-af26-d9b6008bce36)

- **Home Page**
  
  [Home](https://github.com/user-attachments/assets/1b9d9084-7ad8-4959-94f2-64581c446ece)

- **Chat (Per-Facility Rooms)**
  
  [Chat](https://github.com/user-attachments/assets/63d7b24b-7f86-47dc-8c04-43981dda10bf)

- **Wager Tab**
  
  [Wagers](https://github.com/user-attachments/assets/1f21ff11-ddb7-40ca-ab76-21f97a6ef9c2)

- **Wallet**
  
  [Wallet](https://github.com/user-attachments/assets/c581c824-0b0e-496a-af8a-2c9b53f404e0)

- **Profile**
  
  [Profile](https://github.com/user-attachments/assets/cf668502-b11b-4fa8-91d1-7d98970eb359)

> 🌐 **Web Dashboard & Marketing Site**
- **User Dashboard (Profit/Loss Tracking)**
  
  [Dashboard](https://github.com/user-attachments/assets/283d759a-aade-4a69-9aa3-b8264a87b42f)

- **Marketing Landing Page**
  
  [Marketing Page](https://github.com/user-attachments/assets/a03f410e-132b-4c2b-ad71-d43e8d36fbea)

---

## 🚀 Features

- 📍 **Find Nearby Courts/Fields** with geolocation and search
- 👥 **Real-Time Chatrooms** per sports facility
- ✅ **User Authentication** with Clerk (Email + Google)
- 💸 **Friendly Wagers** using Stripe Connect
- 📊 **Profit/Loss Dashboard** on the web
- ⚖️ **Dispute Resolution** for wagers
- 🌐 **Responsive Website** for marketing and user dashboard access

---

## 🌐 Website & Dashboard

OpenPlay includes a dedicated marketing website and web dashboard.

### 🌍 Marketing Site
- Introduces OpenPlay and its core value props
- Includes signup and login options
- Optimized for conversions and SEO

### 📊 User Dashboard
- Tracks wager stats: games played, wins, losses, and net profit/loss
- Synced with mobile data via the shared backend
- Accessible through Clerk login

---

## 🛠️ Tech Stack

### 📱 Mobile App
- **Framework**: React Native (Expo)
- **Styling**: NativeWind (Tailwind CSS for RN)
- **Geolocation**: Expo Location, Google Places API
- **State Management**: Zustand
- **Payment UI**: `rn-credit-card` package

### 🖥️ Backend
- **Server**: Node.js + Express
- **Database**: PostgreSQL via Neon
- **Real-time Communication**: Socket.io
- **Authentication**: Clerk
- **Payments**: Stripe API (Connect, Balance, Payouts)
- **Storage**: Supabase (for images/media)

### 🌐 Website
- **Framework**: React
- **Auth**: Clerk (same user base as mobile)
- **Dashboard Data**: Pulled from shared backend and Stripe
