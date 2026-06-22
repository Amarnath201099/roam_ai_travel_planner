const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },

    // --- NEW: Travel Context Fields ---
    homeLocation: { type: String, default: "" },
    dietaryPreferences: [{ type: String }],
    travelPace: {
      type: String,
      enum: ["Relaxed", "Moderate", "Fast-paced"],
      default: "Moderate",
    },
    preferredCurrency: { type: String, default: "USD" },
  },
  { timestamps: true },
);

// Hash password automatically before document persistence
userSchema.pre("save", async function () {
  // If the password hasn't been modified, just exit the function
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password validity securely during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
