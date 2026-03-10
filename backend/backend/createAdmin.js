/**
 * Create admin user script
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://keshavmehrotra2817_db_user:Divyansh%4026@kleoniverse.dpbemb7.mongodb.net/?appName=Kleoniverse';

const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@kleoniverse.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@kleoniverse.com');
    } else {
      // Create admin user
      const admin = new User({
        name: 'Admin',
        email: 'admin@kleoniverse.com',
        password: 'admin123', // Will be hashed by pre-save hook
        phone: '9876543210',
        role: 'admin'
      });
      
      await admin.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@kleoniverse.com');
      console.log('Password: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
