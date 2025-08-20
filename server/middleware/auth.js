import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Admin authentication middleware
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader); // Debug log
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('Bearer token:', token); // Debug log
      
      // Check if it's the admin session token
      if (token === 'admin-session-token') {
        console.log('Admin session token detected'); // Debug log
        req.user = {
          id: 'admin-001',
          email: 'ADMIN_KEC',
          role: 'admin',
          name: 'KEC Admin'
        };
        return next();
      }
      
      // Try JWT verification for backend admin users
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }
        req.user = user;
        next();
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message); // Debug log
        res.status(401).json({ message: 'Invalid or expired token' });
      }
    } else {
      // Handle direct token (without Bearer prefix)
      if (authHeader === 'admin-session-token') {
        console.log('Direct admin token detected'); // Debug log
        req.user = {
          id: 'admin-001',
          email: 'ADMIN_KEC',
          role: 'admin',
          name: 'KEC Admin'
        };
        return next();
      }
      
      res.status(401).json({ message: 'Invalid authorization header format' });
    }
  } catch (err) {
    console.log('Auth middleware error:', err.message); // Debug log
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

