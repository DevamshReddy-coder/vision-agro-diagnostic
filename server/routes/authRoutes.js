const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc Register User
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required registration fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.log('Registration attempt for:', normalizedEmail);

  try {
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      console.log('Registration failed: Email already exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });
    console.log('New user created successfully:', user._id);

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'agrovision_secret_key_2026', 
      { expiresIn: '30d' }
    );
    
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('SERVER REGISTRATION ERROR:', err);
    return res.status(500).json({ message: 'Failed to create user account' });
  }
});

// @desc Auth User & Get Token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.log('Login attempt for:', normalizedEmail);

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('Login failed: User not found in database');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match results:', isMatch);
    
    if (isMatch) {
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET || 'agrovision_secret_key_2026', 
        { expiresIn: '30d' }
      );
      
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('SERVER LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
});

module.exports = router;
