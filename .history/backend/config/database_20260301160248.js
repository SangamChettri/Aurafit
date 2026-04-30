const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Sequelize Database Configuration
 * Production-ready MySQL connection with proper error handling
 */

const sequelize = new Sequelize(
  process.env.DB_NAME || 'aurafit',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Connection pool configuration
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    
    // Security and performance settings
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: false,
      typeCast: true,
    },
    
    // Query optimization
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    
    // Transaction settings
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    
    // Retry configuration
    retry: {
      max: 3,
      timeout: 5000,
    },
  }
);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully via Sequelize');
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error.message);
    return false;
  }
};

/**
 * Initialize database and sync models
 */
const initializeDatabase = async () => {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Sync all models
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false 
    });
    
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Handle database disconnection
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

/**
 * Get transaction
 */
const getTransaction = async () => {
  return await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, closing database connection');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, closing database connection');
  await closeConnection();
  process.exit(0);
});

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  closeConnection,
  getTransaction,
};
