# ⛽ FuelTracker Pro

**FuelTracker Pro** is a mission-critical full-stack MERN application designed to tackle fuel scarcity and information asymmetry. By connecting drivers with fuel stations in real-time through community-driven intelligence, it saves time, reduces congestion, and brings transparency to the fuel ecosystem.

---

## 🚀 The Problem & Our Solution

### 🚩 The Problem
During fuel shortages or price fluctuations, drivers often waste hours "station hopping"—burning precious fuel just to find a pump that is actually operational. Lack of real-time data leads to:
- **Massive Queues**: Vehicles clogging roads without knowing if fuel will even be available when they reach the front.
- **Information Blackouts**: Station facilities and prices are often unknown until you arrive.
- **Public Frustration**: Immense loss of productivity and fuel for the general public.

### 💡 Our Solution: Community Intelligence
FuelTracker Pro leverages **Crowdsourced Intel**. By empowering riders on the road to report live availability, we create a real-time "Fuel Map".
- **Real-time Map**: Visualize exactly which stations have Octane, Diesel, or CNG available *right now*.
- **Trust Metrics**: Reports are backed by a reputation system (points/levels) to ensure data integrity.
- **Seamless Management**: Station owners can update their own status in seconds, while admins oversee the entire ecosystem.

---

## 🌟 Key Features in Depth

### 👤 User Roles & Permissions

#### 1. 🛡️ Admin (The Controller)
- **Advanced Dashboard**: Visualizes total users, verified stations, and real-time fuel demand insights.
- **Entity Management**: Comprehensive CRUD for users and stations with status toggling (Active/Blocked).
- **System Settings**: Manage global app config, maintenance mode, and support contact info.
- **Security Control**: Authorized access to "Danger Zone" actions (Cache clear, Factory reset) protected by **2FA Email OTP**.
- **Server Health**: Live monitoring of Database, Cloudinary, and API status.

#### 2. ⛽ Station Owner (The Provider)
- **Inventory Dashboard**: A mobile-optimized toggle system to update fuel status (Available, Limited, Out) instantly.
- **Dynamic Pricing**: Update per-liter prices for Octane, Diesel, Petrol, and CNG to match market rates.
- **Facility Management**: Manage station metadata including restrooms, prayer rooms, coffee shops, and security images.
- **Approval Workflow**: Submit stations for admin verification to earn the "Verified" badge and increase rider trust.

#### 3. 🏍️ Rider (The Contributor)
- **Smart Discovery**: Radius-based search and geolocation tracking to find the nearest operational pumps.
- **Discovery Reporting**: Report fuel status for any station and earn **Reputation Points**.
- **Reputation System**: Progress through levels (**Newbie → Expert → Master**) based on the accuracy of your reports.
- **Interactive Intel**: Leave reviews, rate stations, and view community feedback before heading out.
- **Social Integration**: One-click login via Google and Apple for frictionless onboarding.

---

## 🛠️ Tech Stack

### 🎨 Frontend (Client)
- **React 18 & Vite**: For a lightning-fast SPA experience.
- **Tailwind CSS**: Premium, custom-styled utility-first UI.
- **Framer Motion**: Smooth micro-animations and page transitions.
- **Lucide React**: Clean, modern iconography.
- **Context API**: Global state management for Authentication and Multi-language (EN/BN).
- **Axios**: Interceptor-based API communication.

### ⚙️ Backend (Server)
- **Node.js & Express**: High-performance RESTful API.
- **TypeScript**: Ensuring robust type safety across the entire data flow.
- **MongoDB & Mongoose**: Flexible document storage with geospatial indexing for nearby searches.
- **JWT & Cookies**: Secure, stateless authentication with refresh token rotation.
- **Cloudinary SDK**: For high-performance image optimization and storage.
- **Socket.IO**: (Planned) For real-time "Fuel Out" broadcast notifications.
- **Zod**: Strict schema validation for every incoming request.

---

## 📂 Project Architecture

```text
FuelTracker/
├── Client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Atomic UI components
│   │   ├── pages/          # Page-level views (Home, Admin, About, etc.)
│   │   ├── context/        # Auth & Localization providers
│   │   ├── helpers/        # API services and axios config
│   │   └── data/           # Mock data and constants
├── Server/                 # Express backend
│   ├── src/
│   │   ├── modules/        # Feature-based modular structure
│   │   │   ├── usersAuth/  # User & Auth logic
│   │   │   ├── station/    # Station & Inventory logic
│   │   │   ├── admin/      # System-wide settings & stats
│   │   │   └── review/     # Feedback & Rating logic
│   │   ├── middleware/     # Auth, Roles, and Error handlers
│   │   ├── helpers/        # Mailers, OTP, and CustomErrors
│   │   └── config/         # Environment & DB config
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local instance.
- Cloudinary Account (for station images).

### 2. Backend Installation
```bash
cd Server
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_KEYS, and SMTP_DETAILS
npm run dev
```

### 3. Frontend Installation
```bash
cd Client
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api/v1
npm run dev
```

---

## 🛡️ Security Features
- **Hashed Passwords**: Using BCrypt with 10 salt rounds.
- **Role-Based Access Control (RBAC)**: Strict middleware-level permission checks.
- **2FA Authorization**: Critical admin actions require OTP verification sent via email.
- **Input Sanitization**: Zod-based validation to prevent injection and malformed data.
- **Secure Cookies**: HTTP-only, SameSite=Strict cookies for token storage.

---

## 📄 License
This project is licensed under the MIT License.

---
Developed with ❤️ by **FuelTracker Team**
