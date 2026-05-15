# 🚀 FuelTracker Backend

This is the backend API for **FuelTracker Pro**, built with Node.js, Express, TypeScript, and MongoDB.

## 🛠️ Features
- **Modular Architecture**: Feature-based module organization.
- **TypeScript**: Robust type safety across the application.
- **Authentication**: JWT-based auth with Role-Based Access Control (RBAC).
- **Validation**: Zod schema validation for all incoming requests.
- **Image Management**: Integration with Cloudinary.
- **Real-time**: Socket.IO support for live updates.

## 🏃‍♂️ Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   ```bash
   cp .env.example .env
   ```
   Fill in `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, etc.

3. Run Development Server:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   npm start
   ```

## 📂 Module Overview
- `usersAuth`: Registration, Login, Social Auth, and User Management.
- `station`: Station creation, fuel updates, and search logic.
- `admin`: System-wide statistics and settings.
- `review`: Station ratings and feedback system.
- `helpline`: Emergency support and messaging.

---
For full project details, please refer to the [Main README](../README.md).