const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrovision_enterprise';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const users = await User.find({}, 'email name role password');
    console.log('Total Users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.name}) [${u.role}] | Pass length: ${u.password.length}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
