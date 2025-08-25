import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'club', 'student', 'labFaculty'], default: 'student' },
  department: { type: String },
  labName: { type: String },
  labPhoneNumber: { type: String },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // If password not modified, or role is 'club' (store plain text), skip hashing
  if (!this.isModified('password') || this.role === 'club') {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
export default User;

