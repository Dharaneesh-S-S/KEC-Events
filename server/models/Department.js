import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  description: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
