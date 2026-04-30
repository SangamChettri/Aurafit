const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma database connection successful');
    return true;
  } catch (error) {
    console.error('Prisma database connection failed:', error);
    return false;
  }
};

// Disconnect from database
const disconnect = async () => {
  try {
    await prisma.$disconnect();
    console.log('Prisma database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};

// Handle process shutdown
process.on('beforeExit', async () => {
  await disconnect();
});

process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnect();
  process.exit(0);
});

module.exports = {
  prisma,
  testConnection,
  disconnect,
};
