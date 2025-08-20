import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import venueRoutes from './routes/venues.js';
import bookingRoutes from './routes/bookings.js';
import ruleRoutes from './routes/rules.js';
import notificationRoutes from './routes/notifications.js';
import availabilityRoutes from './routes/availability.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kec-events';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
