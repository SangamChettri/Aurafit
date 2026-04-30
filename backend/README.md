# AuraFit Backend API

A production-ready backend for the AuraFit fitness tracking mobile application, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication** - JWT-based secure authentication with password hashing
- **Workout Logging** - Complete CRUD operations for workout management
- **Progress Tracking** - Comprehensive analytics and progress monitoring
- **Personal Best Detection** - Automatic tracking of personal records
- **Streak System** - Motivational workout streak tracking with milestones
- **Notification System** - Daily reminders, milestone notifications, and preferences
- **Premium Features** - Streak freeze days and advanced analytics
- **Rate Limiting** - Built-in protection against API abuse
- **Scheduled Tasks** - Automated daily reminders and milestone notifications

## 📋 Prerequisites

- Node.js 16.0 or higher
- MongoDB Atlas or local MongoDB instance
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aurafit?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS Configuration
   FRONTEND_URL=http://localhost:8081

   # Notification Settings
   DAILY_REMINDER_ENABLED=true
   DEFAULT_REMINDER_TIME=09:00
   ```

4. **Connect to MongoDB Atlas**
   - Create a free MongoDB Atlas account at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update `MONGODB_URI` in `.env`
   - Add your IP address to the whitelist in Atlas
   - Create a database user with read/write permissions

5. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update user profile |
| PUT | `/auth/change-password` | Change password |
| DELETE | `/auth/me` | Delete user account |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Logout user |

### Workout Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workouts` | Create new workout |
| GET | `/workouts` | Get all workouts |
| GET | `/workouts/:id` | Get workout by ID |
| PUT | `/workouts/:id` | Update workout |
| DELETE | `/workouts/:id` | Delete workout |
| GET | `/workouts/stats` | Get workout statistics |
| GET | `/workouts/personal-bests` | Get personal bests |
| POST | `/workouts/:id/duplicate` | Duplicate workout |

### Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/summary` | Get progress summary |
| GET | `/progress/weekly` | Get weekly progress |
| GET | `/progress/monthly` | Get monthly progress |
| GET | `/progress/volume-trend` | Get volume trend |
| GET | `/progress/exercise/:exerciseName` | Get exercise progress |
| GET | `/progress/measurements` | Get body measurements |

### Streak Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/streak` | Get user streak information |
| GET | `/streak/history` | Get streak history |
| POST | `/streak/freeze` | Use streak freeze day (Premium) |
| GET | `/streak/leaderboard` | Get streak leaderboard |
| GET | `/streak/stats` | Get streak statistics |
| POST | `/streak/recalculate` | Recalculate streak |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/preferences` | Get notification preferences |
| PUT | `/notifications/preferences` | Update notification preferences |
| GET | `/notifications/history` | Get notification history |
| PUT | `/notifications/read` | Mark notifications as read |
| POST | `/notifications/device-token` | Add device token |
| DELETE | `/notifications/device-token` | Remove device token |
| POST | `/notifications/test` | Send test notification |
| GET | `/notifications/stats` | Get notification statistics |
| DELETE | `/notifications/clear` | Clear all notifications |

## 🔐 Authentication

All API endpoints (except register and login) require authentication using JWT tokens.

### Request Format
```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

### Example Login Request
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Example Response
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "user@example.com",
      "goal": "general_fitness",
      "subscriptionStatus": "FREE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

## 📊 Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  goal: String,
  subscriptionStatus: String,
  notificationPreferences: Object,
  createdAt: Date,
  lastLogin: Date
}
```

### Workout Model
```javascript
{
  user: ObjectId,
  name: String,
  type: String,
  date: Date,
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    volume: Number
  }],
  totalVolume: Number,
  duration: Number,
  calories: Number,
  notes: String,
  hasPersonalBest: Boolean,
  personalBestExercises: Array
}
```

### Streak Model
```javascript
{
  user: ObjectId,
  currentStreak: Number,
  longestStreak: Number,
  lastWorkoutDate: Date,
  workoutDates: Array,
  milestones: Array,
  freezeDaysUsed: Number,
  freezeDaysAvailable: Number
}
```

## 🕐 Scheduled Tasks

The backend includes automated scheduled tasks using `node-cron`:

1. **Daily Reminders** - Runs every hour to check and send daily workout reminders
2. **Streak Milestones** - Runs every 6 hours to check for streak achievements
3. **Weekly Summaries** - Runs every Sunday at 6 PM to send weekly progress summaries

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Rate Limiting** - Protection against API abuse
- **CORS Configuration** - Cross-origin resource sharing setup
- **Input Validation** - Express-validator for request validation
- **Security Headers** - Additional security headers for all responses

## 📈 Performance Features

- **Database Indexes** - Optimized queries with proper indexing
- **Pagination** - Efficient data retrieval for large datasets
- **Caching Ready** - Structure supports caching implementation
- **Connection Pooling** - MongoDB connection optimization
- **Error Handling** - Comprehensive error management

## 🧪 Testing

The API includes validation and error handling, but unit tests should be added:

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=your_production_frontend_url
```

### Deployment Steps
1. Set up production MongoDB database
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start server: `npm start`

## 📝 Error Handling

The API uses consistent error responses:

```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "errors": [] // Validation errors if applicable
  },
  "timestamp": "2023-09-01T12:00:00.000Z"
}
```

## 🔄 API Status

Check the health endpoint:
```bash
GET /health
```

## 📞 Support

For issues and questions:
1. Check the API documentation at `/api`
2. Review the error messages for troubleshooting
3. Check server logs for detailed error information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📋 TODO

- [ ] Add comprehensive unit tests
- [ ] Implement email notifications
- [ ] Add push notification support
- [ ] Implement file upload for profile pictures
- [ ] Add API versioning
- [ ] Implement caching layer
- [ ] Add monitoring and analytics
- [ ] Create API documentation with Swagger/OpenAPI
