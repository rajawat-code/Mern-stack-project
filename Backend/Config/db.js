const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.NODE_ENV === 'test'
      ? (process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/linkedin_clone_test')
      : (process.env.MONGO_URI || 'mongodb://localhost:27017/linkedin_clone');
    const conn = await mongoose.connect(dbUri);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
