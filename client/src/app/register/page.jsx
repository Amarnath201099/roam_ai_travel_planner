"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters long.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      errors.email = "Please enter a valid email address.";
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*_=+-]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be 8+ characters with uppercase, lowercase, and a symbol/number.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-brand-card rounded-2xl border border-brand-border shadow-lg">
      <h2 className="text-3xl font-extrabold text-brand-text tracking-tight mb-2">
        Create Account
      </h2>
      <p className="text-brand-muted text-sm mb-6">
        Start planning your perfect trips with AI.
      </p>

      {apiError && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <FiAlertCircle /> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Email Fields remain standard */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-brand-bg border ${formErrors.name ? "border-red-400" : "border-brand-border"} focus:outline-none focus:ring-1 focus:ring-brand-accent text-sm`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-brand-bg border ${formErrors.email ? "border-red-400" : "border-brand-border"} focus:outline-none focus:ring-1 focus:ring-brand-accent text-sm`}
          />
        </div>

        {/* Password Input with Toggle */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:ring-1 focus:ring-brand-accent pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-accent"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input with Toggle */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:ring-1 focus:ring-brand-accent pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-accent"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={18} />
              ) : (
                <FiEye size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-hover transition-colors text-sm shadow-sm"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-accent hover:underline font-medium"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
