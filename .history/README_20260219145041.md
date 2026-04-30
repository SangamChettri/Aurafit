# Fitness Platform - All-in-One Health & Fitness Solution

A comprehensive fitness platform built with React Native (CLI) and Express.js, designed to help users achieve their health goals through smart technology and personalized guidance.

## Features

- 🏋️ Workout Logging & Tracking
- 📊 Progress Analytics with Visual Charts
- 🎯 Custom Goal Setting
- 💧 Water Intake Tracking
- 🤖 AI-Powered Workout Plans
- 👥 Social & Community Features
- ⌚ Wearable Device Integration
- 👨‍🏫 Personalized Coaching (Premium)
- 📱 Premium Subscription Management
- 🔐 Secure Authentication
- 👨‍💼 Admin Panel

## Tech Stack

### Frontend
- React Native (CLI)
- Tailwind CSS (NativeWind)
- Form Validation Libraries
- React Navigation
- Chart Libraries

### Backend
- Express.js
- MySQL with Prisma ORM
- JWT Authentication
- Bcrypt for Password Hashing
- Multer for File Uploads
- Cookie-based Sessions

## Project Structure

```
.
├── backend/          # Express.js API server
├── frontend/         # React Native application
├── package.json      # Root package.json with concurrently
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server
- Android Studio (for React Native Android development)
- Java JDK

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Setup Database:**
   - Create a MySQL database
   - Update `backend/.env` with your database credentials
   - Run migrations:
     ```bash
     npm run prisma:migrate
     ```

3. **Initialize Admin & Locations:**
   ```bash
   cd backend
   npm run init
   ```

4. **Start Development Servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - React Native Metro bundler

### Environment Variables

Create `backend/.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/fitness_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Run both frontend and backend concurrently
- `npm run server` - Run only backend server
- `npm run client` - Run only React Native app
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Documentation

API endpoints will be documented in `backend/README.md`

## License

ISC
