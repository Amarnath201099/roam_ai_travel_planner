const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

/**
 * Generates a signed stateless JWT token containing the user identity payload.
 * Configured to expire in 30 days to optimize user session persistence.
 */
const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Attach token to cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please include all required fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("A user with this email identity already exists");
    }

    // Instance creation triggers the pre-save password hashing hook in user.model.js
    const user = await User.create({ name, email, password });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user payload received");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Leverage instance method schema definition to compare unhashed body input with persisted hash
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password credentials");
    }
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
};

/**
 * @desc    Get current user profile data
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    // req.user state context is guaranteed populated by the protect middleware layer
    // Use .select('-password') to exclude the password field at the database level
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      // Send back the entire user object (minus the password)
      res.status(200).json(user);
    } else {
      res.status(404);
      throw new Error("User entity context not found");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile data (Name, Location, Diet, etc.)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.homeLocation =
        req.body.homeLocation !== undefined
          ? req.body.homeLocation
          : user.homeLocation;
      user.dietaryPreferences =
        req.body.dietaryPreferences || user.dietaryPreferences;
      user.travelPace = req.body.travelPace || user.travelPace;
      user.preferredCurrency =
        req.body.preferredCurrency || user.preferredCurrency;

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        homeLocation: updatedUser.homeLocation,
        dietaryPreferences: updatedUser.dietaryPreferences,
        travelPace: updatedUser.travelPace,
        preferredCurrency: updatedUser.preferredCurrency,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Securely update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updateUserPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    // Verify the user exists and the current password matches
    if (user && (await user.matchPassword(currentPassword))) {
      // The Mongoose pre-save middleware will automatically hash this new password
      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(401);
      throw new Error("Invalid current password");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};
