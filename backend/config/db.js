const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️ [MongoDB] MONGO_URI is not set. Database features will be unavailable.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ [MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`❌ [MongoDB] Connection error: ${err.message}`);
    return false;
  }
};

const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    connected: stateCode === 1,
  };
};

connectDB.connectDB = connectDB;
connectDB.getDbStatus = getDbStatus;

module.exports = connectDB;
