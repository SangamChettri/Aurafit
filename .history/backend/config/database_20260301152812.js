const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL Database Connection
 * Replaces MongoDB with MySQL for AuraFit backend
 */

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aurafit',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error.message);
    return false;
  }
};

/**
 * Execute query with error handling
 */
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Execute transaction
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Initialize database tables
 */
const initializeTables = async () => {
  try {
    console.log('🔧 Initializing MySQL database tables...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        fitness_goal VARCHAR(50) DEFAULT 'general_fitness',
        height DECIMAL(5,2),
        weight DECIMAL(5,2),
        age INT,
        gender VARCHAR(10),
        activity_level VARCHAR(20) DEFAULT 'moderate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Workouts table
    await query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        duration INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        INDEX idx_user_type (user_id, type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Exercises table
    await query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workout_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        sets INT,
        reps INT,
        weight DECIMAL(6,2),
        duration INT,
        distance DECIMAL(8,2),
        calories INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Progress table
    await query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        weight DECIMAL(5,2),
        body_fat DECIMAL(5,2),
        measurements JSON,
        photos JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        UNIQUE KEY unique_user_date (user_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Streaks table
    await query(`
      CREATE TABLE IF NOT EXISTS streaks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_workout_date DATE,
        freeze_days_used INT DEFAULT 0,
        freeze_days_available INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Personal records table
    await query(`
      CREATE TABLE IF NOT EXISTS personal_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exercise_name VARCHAR(255) NOT NULL,
        record_type ENUM('weight', 'reps', 'duration', 'distance') NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        workout_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
        INDEX idx_user_exercise (user_id, exercise_name),
        INDEX idx_user_type (user_id, record_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User settings table
    await query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        daily_reminder_time TIME DEFAULT '09:00:00',
        weekly_report_day VARCHAR(10) DEFAULT 'monday',
        units VARCHAR(10) DEFAULT 'metric',
        privacy_level VARCHAR(20) DEFAULT 'private',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  initializeTables,
};
