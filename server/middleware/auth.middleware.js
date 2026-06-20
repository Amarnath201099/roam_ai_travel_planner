const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

/**
 * Intercepts incoming HTTP requests, validates the Bearer token in the
 * Authorization header, and attaches the authenticated user instance to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from 'Bearer <token>' structure
      token = req.headers.authorization.split(" ")[1];

      // Decode payload and verify signature against server secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user profile from database and attach to request context, omitting password hashes
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("Not authorized, token validation failed"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, token missing"));
  }
};

module.exports = { protect };
