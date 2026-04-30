-- AuraFit Database Setup Script
-- Run this in MySQL to create the database

CREATE DATABASE IF NOT EXISTS aurafit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aurafit;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  fitness_goal ENUM('weight_loss', 'muscle_gain', 'endurance', 'general_fitness', 'strength') NOT NULL DEFAULT 'general_fitness',
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  age INT,
  gender ENUM('male', 'female', 'other'),
  activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') NOT NULL DEFAULT 'moderate',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(500),
  password_reset_token VARCHAR(500),
  password_reset_expires TIMESTAMP NULL,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_fitness_goal (fitness_goal),
  INDEX idx_created_at (created_at),
  INDEX idx_email_verified (email_verified),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'sports', 'other') NOT NULL,
  date DATE NOT NULL,
  duration INT,
  notes TEXT,
  calories_burned INT,
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_user_date (user_id, date),
  INDEX idx_user_type (user_id, type),
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create exercises table
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
  rest_time INT,
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_workout_id (workout_id),
  INDEX idx_name (name),
  INDEX idx_workout_name (workout_id, name),
  INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create progress table
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
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date),
  INDEX idx_user_id (user_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create streaks table
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
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_id (user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_current_streak (current_streak)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create personal_records table
CREATE TABLE IF NOT EXISTS personal_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_name VARCHAR(255) NOT NULL,
  weight DECIMAL(6,2),
  reps INT,
  duration INT,
  distance DECIMAL(8,2),
  date DATE NOT NULL,
  workout_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_user_exercise (user_id, exercise_name),
  INDEX idx_user_date (user_id, date),
  INDEX idx_exercise_name (exercise_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  daily_reminder_time TIME DEFAULT '09:00:00',
  weekly_report_day VARCHAR(10) DEFAULT 'monday',
  units VARCHAR(10) DEFAULT 'metric',
  privacy_level VARCHAR(20) DEFAULT 'private',
  achievement_notifications BOOLEAN DEFAULT TRUE,
  streak_notifications BOOLEAN DEFAULT TRUE,
  progress_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_id (user_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_user_type (user_id, type),
  INDEX idx_scheduled (scheduled_for, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default user settings for existing users
INSERT INTO user_settings (user_id) 
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_settings);

-- Insert default streaks for existing users
INSERT INTO streaks (user_id) 
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM streaks);

-- Success message
SELECT 'AuraFit database setup completed successfully!' as message;
