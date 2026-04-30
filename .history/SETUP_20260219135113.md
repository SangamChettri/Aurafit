# Fitness Platform - Setup Guide

Complete setup instructions for the all-in-one fitness platform.

## Prerequisites

- Node.js (v18+)
- MySQL Server (running locally)
- Android Studio (for React Native development)
- Java JDK

## Installation Steps

### 1. Install All Dependencies

From the root directory:

```bash
npm run install-all
```

This installs dependencies for:
- Root project (concurrently)
- Backend (Express.js)
- Frontend (React Native)
- Admin Panel (React + Vite)

### 2. Database Setup

1. Create a MySQL database:
   ```sql
   CREATE DATABASE fitness_db;
   ```

2. Configure backend environment:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. Edit `backend/.env` and update:
   ```env
   DATABASE_URL="mysql://root:yourpassword@localhost:3306/fitness_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   GOOGLE_CLIENT_ID="your-google-client-id"  # Optional for now
   ```

4. Run Prisma migrations:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Initialize database with admin and sample data:
   ```bash
   cd backend
   npm run init
   ```

   This creates:
   - Admin user: `admin@fitness.com` / `admin123`
   - 15 Nepal locations
   - Sample exercises

### 3. Frontend Configuration

1. Configure API URL in `frontend/src/config/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';
   ```
   (Use your local IP address, not localhost, for Android emulator/device)

2. For Google OAuth (optional):
   - Get Google Client ID from Google Cloud Console
   - Update in `frontend/src/screens/auth/LoginScreen.tsx`
   - Update in `backend/.env`

### 4. Admin Panel Configuration

The admin panel uses a proxy to the backend API. No additional configuration needed if backend runs on port 5000.

## Running the Application

### Option 1: Run Everything Together

```bash
# From root directory
npm run dev
```

This runs:
- Backend on `http://localhost:5000`
- React Native Metro bundler

### Option 2: Run Separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend (React Native):**
```bash
cd frontend
npm run android
```

**Admin Panel:**
```bash
cd admin
npm run dev
# Access at http://localhost:3000
```

## Default Credentials

### Admin Panel
- Email: `admin@fitness.com`
- Password: `admin123`

## API Endpoints

Backend API runs on `http://localhost:5000/api`

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/workouts` - Get workouts
- `POST /api/workouts` - Create workout
- `GET /api/admin/dashboard` - Admin dashboard (requires admin role)

See `backend/README.md` for complete API documentation.

## Troubleshooting

### React Native Connection Issues

If the mobile app can't connect to the backend:
1. Make sure backend is running
2. Use your computer's local IP address (not `localhost`) in API config
3. Check Android emulator network settings
4. Ensure both devices are on the same network

### Database Connection Issues

1. Verify MySQL is running
2. Check database credentials in `backend/.env`
3. Ensure database exists: `CREATE DATABASE fitness_db;`

### Port Conflicts

- Backend: Change `PORT` in `backend/.env`
- Admin: Change port in `admin/vite.config.ts`

## Project Structure

```
.
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   └── prisma/       # Database schema
├── frontend/         # React Native mobile app
│   └── src/
│       ├── screens/
│       ├── navigation/
│       └── context/
├── admin/            # React web admin panel
│   └── src/
│       ├── pages/
│       └── components/
└── package.json      # Root package with concurrently
```

## Next Steps

1. Set up Google OAuth credentials (optional)
2. Configure payment gateway (when ready)
3. Set up wearable device integrations (when ready)
4. Customize branding and styling
5. Deploy to production

## Support

For issues or questions, refer to:
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation
- `admin/README.md` - Admin panel documentation
