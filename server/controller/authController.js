import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    console.log('--- SIGNUP ATTEMPT ---');
    console.log('Request Body:', { name, email, role, department, password: '***' });

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Result: Email already registered.');
      return res.status(400).json({ message: 'Email already registered' });
    }

    // For clubs: generate OTP and store password in plain text
    let generatedPassword = null;
    let userPayload = { name, email, role, department };
    if (role === 'club') {
      generatedPassword = Math.random().toString(36).slice(-8); // simple 8-char OTP
      userPayload.password = generatedPassword;
      console.log('Club signup: generated OTP for club:', { email, generatedPassword });
    } else {
      userPayload.password = password;
    }

    const user = await User.create(userPayload);
    console.log('Result: User created successfully.', { id: user._id, email: user.email, role: user.role, department: user.department });

    const token = jwt.sign({ id: user._id, role: user.role, department: user.department }, JWT_SECRET, { expiresIn: '7d' });
    const responseBody = { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } };
    if (role === 'club') {
      responseBody.generatedPassword = generatedPassword; // return OTP for clubs
    }
    res.status(201).json(responseBody);

  } catch (err) {
    console.error('!!! SIGNUP ERROR !!!', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Request Body:', { email, password: '***' }); // Don't log plaintext password

    // DEBUG: Check environment variables
    console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
    console.log('JWT_SECRET value:', process.env.JWT_SECRET);
    console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'YES' : 'NO');

    // Find user by email
    console.log('Email being searched (original):', email);
    console.log('Email being searched (lowercase):', email.toLowerCase());
    const user = await User.findOne({ email });
    console.log('User found in DB:', !!user, user ? { id: user._id, role: user.role, department: user.department } : null);

    if (!user) {
      console.log('Result: User not found in database.');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Stored password (as-is):', user.password);

    // Compare password
    let isMatch = false;
    if (user.role === 'club') {
      // Clubs use plain-text comparison
      isMatch = password === user.password;
      console.log('Club login: plain-text compare result:', isMatch);
    } else {
      // Admins can be hashed or plain
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        isMatch = false;
      }
      if (!isMatch) {
        // Fallback to plain-text equality (in case admin was stored as plain text)
        isMatch = password === user.password;
      }
      console.log('Admin/Other login: compare result:', isMatch);
    }

    if (!isMatch) {
      console.log('Result: Invalid credentials.');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Result: Login successful.');
    const token = jwt.sign({ id: user._id, role: user.role, department: user.department }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });

  } catch (err) {
    console.error('!!! LOGIN ERROR !!!', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const verify = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
