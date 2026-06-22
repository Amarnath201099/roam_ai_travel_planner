"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiMapPin, FiBriefcase } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function NewTripModal({ isOpen, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    origin: user?.homeLocation || "",
    days: 3,
    budgetTier: "Medium",
    interests: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert comma-separated interests into an array for the backend
      const payload = {
        ...formData,
        interests: formData.interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      };

      const { data } = await API.post("/trips", payload);

      // Close modal and instantly route to the brand new Trip View
      onClose();
      router.push(`/dashboard/${data._id}`);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to generate trip. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-brand-card p-6 md:p-8 rounded-2xl max-w-lg w-full border border-brand-border shadow-2xl relative">
        {/* Cancel/Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-muted hover:text-brand-text transition-colors"
        >
          <FiX className="text-2xl" />
        </button>

        <h2 className="text-2xl font-bold text-brand-text flex items-center gap-2 mb-2">
          <FiBriefcase className="text-brand-accent" /> Plan a New Trip
        </h2>
        <p className="text-brand-muted text-sm mb-6">
          Let AI craft your perfect itinerary in seconds.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Flying From (Optional)
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-brand-muted" />
                <input
                  type="text"
                  placeholder="e.g. New York"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Destination
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-brand-accent" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Paris"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                required
                value={formData.days}
                onChange={(e) =>
                  setFormData({ ...formData, days: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Budget
              </label>
              <select
                value={formData.budgetTier}
                onChange={(e) =>
                  setFormData({ ...formData, budgetTier: e.target.value })
                }
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent bg-white"
              >
                <option value="Low">Backpacker (Low)</option>
                <option value="Medium">Standard (Medium)</option>
                <option value="High">Luxury (High)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Interests (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Museums, Fine Dining, Hiking"
              value={formData.interests}
              onChange={(e) =>
                setFormData({ ...formData, interests: e.target.value })
              }
              className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-brand-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-medium text-brand-muted hover:bg-brand-bg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-text text-white rounded-xl font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Generating...
                </>
              ) : (
                "Generate Trip ✨"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
