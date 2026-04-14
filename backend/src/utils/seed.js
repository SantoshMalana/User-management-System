require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Jane Manager',
    email: 'manager@example.com',
    password: 'Manager@123',
    role: 'manager',
    status: 'active',
  },
  {
    name: 'John User',
    email: 'user@example.com',
    password: 'User@123',
    role: 'user',
    status: 'active',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const admin = await User.create(seedUsers[0]);
    await User.create({ ...seedUsers[1], createdBy: admin._id });
    await User.create({ ...seedUsers[2], createdBy: admin._id });

    console.log('Seed data created successfully!');
    console.log('');
    console.log('Test credentials:');
    console.log('  Admin:   admin@example.com   / Admin@123');
    console.log('  Manager: manager@example.com / Manager@123');
    console.log('  User:    user@example.com    / User@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
