import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant.js';

export const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const validApiKey = process.env.API_SECRET_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: Missing x-api-key header.' });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key.' });
  }

  next();
};

export const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');

      req.user = await Tenant.findById(decoded.tenantId).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, tenant not found' });
      }

      // Add tenantId to req for easier access in controllers
      req.user.tenantId = req.user._id;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
