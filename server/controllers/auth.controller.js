import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant.js';

const generateToken = (tenantId) => {
  return jwt.sign({ tenantId }, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', {
    expiresIn: '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant with this email already exists' });
    }

    const tenant = new Tenant({ email, password, name });
    await tenant.save();

    const token = generateToken(tenant._id);
    res.status(201).json({
      message: 'Registration successful',
      token,
      tenant: {
        id: tenant._id,
        email: tenant.email,
        name: tenant.name
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const tenant = await Tenant.findOne({ email }).select('+password');
    if (!tenant) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await tenant.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(tenant._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      tenant: {
        id: tenant._id,
        email: tenant.email,
        name: tenant.name
      }
    });
  } catch (error) {
    next(error);
  }
};
