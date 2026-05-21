# Fitness Platform Frontend

React Native mobile application built with Expo for the fitness platform.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   - Preferred: set environment variable in `.env` at project root:
     - `EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api`
   - Fallbacks (auto):
     - Android emulator: `http://10.0.2.2:5000/api`
     - iOS simulator/Web: `http://localhost:5000/api`
   - For physical device: use your machine IP in `EXPO_PUBLIC_API_URL`

3. **Configure Google OAuth (Optional):**
   - Add the following in your `.env` if using Google login:
     - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...`
     - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...`
     - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...`
   - The Google button is hidden until these are set.

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Features

- User Authentication (Email/Password & Google OAuth)
- Workout Logging
- Progress Tracking
- Goal Setting
- Profile Management
- Premium Subscription Management

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React Navigation
- React Native StyleSheet (standard styling)
- React Hook Form + Yup
- Axios for API calls
- Expo Auth Session (Google OAuth)

## Project Structure

```
src/
├── config/          # API configuration
├── context/          # React Context providers
├── hooks/            # Custom hooks
├── navigation/       # Navigation setup
├── screens/          # Screen components
│   ├── auth/         # Authentication screens
│   ├── main/         # Main/home screens
│   ├── workout/      # Workout screens
│   ├── progress/     # Progress screens
│   ├── goals/        # Goals screens
│   └── profile/       # Profile screens
└── services/         # API services (if needed)
```

## Notes

- Uses React Native StyleSheet for styling
- Form validation with React Hook Form and Yup
- JWT token stored in AsyncStorage
- Google OAuth using Expo Auth Session
- Compatible with Expo Go app for development

## Running

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

## Environment

For Android emulator, use `http://10.0.2.2:5000/api` as API URL.
For physical device, use your computer's local IP address.
