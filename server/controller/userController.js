import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, password, department } = req.body;
    const update = { name, department };
    if (password) {
      update.password = password;
    }
    const user = await User.findByIdAndUpdate(userId, update, { new: true, select: '-password' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
};

