import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Pharmacy from '../models/pharmacy.model.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    if (role && !['customer', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid registration role' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer'
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check suspension
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const token = signToken(user._id);

    // If pharmacy owner, find their pharmacy
    let pharmacy = null;
    if (user.role === 'owner') {
      pharmacy = await Pharmacy.findOne({ owner: user._id });
    }

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      pharmacy: pharmacy ? {
        _id: pharmacy._id,
        pharmacyName: pharmacy.pharmacyName
      } : null
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let pharmacy = null;
    
    if (user.role === 'owner') {
      pharmacy = await Pharmacy.findOne({ owner: user._id });
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      pharmacy
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ message: 'Server error retrieving user data' });
  }
};
