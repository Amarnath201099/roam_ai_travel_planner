"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  // Helper function to update form state easily
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the specific error when the user starts typing again
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation: Must be at least 2 characters
    if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }

    // Email validation: Standard email regex format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    // Password validation: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number or symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*_=+-]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be 8+ characters with at least 1 uppercase, 1 lowercase, and 1 number/symbol.";
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(errors);
    // Returns true if there are no properties in the errors object
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return; // Stop submission if validation fails

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Failed to create account. Please try again.",
      );
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
        {/* Name Input */}
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
            className={`w-full px-4 py-3 rounded-xl bg-brand-bg border focus:outline-none focus:ring-1 text-brand-text text-sm transition-all ${formErrors.name ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-brand-border focus:border-brand-accent focus:ring-brand-accent"}`}
          />
          {formErrors.name && (
            <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
          )}
        </div>

        {/* Email Input */}
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
            className={`w-full px-4 py-3 rounded-xl bg-brand-bg border focus:outline-none focus:ring-1 text-brand-text text-sm transition-all ${formErrors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-brand-border focus:border-brand-accent focus:ring-brand-accent"}`}
          />
          {formErrors.email && (
            <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-brand-bg border focus:outline-none focus:ring-1 text-brand-text text-sm transition-all ${formErrors.password ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-brand-border focus:border-brand-accent focus:ring-brand-accent"}`}
          />
          {formErrors.password && (
            <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-brand-bg border focus:outline-none focus:ring-1 text-brand-text text-sm transition-all ${formErrors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-brand-border focus:border-brand-accent focus:ring-brand-accent"}`}
          />
          {formErrors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-hover transition-colors text-sm disabled:opacity-50 cursor-pointer shadow-sm"
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
          Log in here
        </Link>
      </p>
    </div>
  );
}
