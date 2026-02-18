const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if the header exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token
      token = req.headers.authorization.split(' ')[1];
      console.log("🔹 [Auth] Token Received:", token.substring(0, 10) + "..."); // Print first 10 chars

      // 3. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔹 [Auth] Decoded ID:", decoded.id);

      // 4. Find the user in MongoDB
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Check if user actually exists
      if (!req.user) {
        console.log("❌ [Auth] Token valid, but User NOT found in DB!");
        return res.status(401).json({ success: false, message: 'User not found in database' });
      }

      console.log("✅ [Auth] User Found:", req.user.name);
      next();

    } catch (error) {
      console.error("❌ [Auth] Verification Failed:", error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log("❌ [Auth] No Token Provided in Header");
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};