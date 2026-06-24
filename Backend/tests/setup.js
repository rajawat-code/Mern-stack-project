const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testjwtsecret123!';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      console.warn('Failed to drop test database:', err.message);
    }
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
});
