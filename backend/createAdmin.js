
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
  try {
    const email = (
      await ask('Admin email: ')
    ).trim().toLowerCase();

    const password = await ask('New admin password (minimum 8 characters): ');

    if (!email || password.length < 8) {
      throw new Error('Enter a valid email and a password of at least 8 characters.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingUser = await User.findOne({ email }).select('+password');

    if (existingUser) {
      console.log('An account with this email already exists.');
      console.log('No changes have been made.');
      return;
    }

    const name = await ask('Admin display name: ');
    const phone = await ask('Admin phone number: ');
    const address = await ask('Admin address: ');

    await User.create({
      name: name.trim(),
      email,
      password,
      phone: phone.trim(),
      address: address.trim(),
      role: 'admin',
      status: 'active',
    });

    console.log('Admin account created successfully.');
  } catch (error) {
    console.error('Admin setup failed:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
