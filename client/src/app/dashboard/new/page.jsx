"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiArrowLeft,
  FiMap,
  FiCheckCircle,
} from "react-icons/fi";
import API from "../../../utils/api";

const INTEREST_OPTIONS = [
  "Food",
  "Culture",
  "Adventure",
  "Relaxation",
  "Shopping",
  "Nightlife",
  "Nature",
  "History",
];

export default function NewTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    destination: "",
    days: 3,
    budgetTier: "Medium",
    interests: [],
  });

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const submitTrip = async () => {
    setLoading(true);
    setError("");
    try {
      // Send payload to our Express backend -> Gemini LLM
      const { data } = await API.post("/trips", formData);
      router.push(`/dashboard/${data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate itinerary. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Progress Indicator */}
      <div className="mb-8 flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-border z-0"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-accent z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= num ? "bg-brand-accent text-white" : "bg-brand-border text-brand-muted"}`}
          >
            {num}
          </div>
        ))}
      </div>

      <div className="bg-brand-card rounded-3xl p-6 md:p-10 shadow-lg border border-brand-border relative overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-card/90 backdrop-blur-sm">
            <FiMap className="text-6xl text-brand-accent animate-bounce mb-6" />
            <h2 className="text-2xl font-bold text-brand-text mb-2">
              Crafting your itinerary...
            </h2>
            <p className="text-brand-muted text-center max-w-sm px-4">
              Our AI agent is analyzing flights, hotels, and local activities to
              build your perfect {formData.days}-day trip to{" "}
              {formData.destination}.
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-brand-text mb-6">
                Where are you going?
              </h2>
              <div>
                <label className="block text-sm font-bold text-brand-muted uppercase mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tokyo, Japan"
                  autoFocus
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  className="w-full text-lg px-4 py-4 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-brand-text transition-all"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-brand-text mb-6">
                Trip Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-brand-muted uppercase mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        days: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-4 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent outline-none text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-muted uppercase mb-2">
                    Budget Tier
                  </label>
                  <select
                    value={formData.budgetTier}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetTier: e.target.value })
                    }
                    className="w-full px-4 py-4 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent outline-none text-brand-text"
                  >
                    <option value="Low">Low (Backpacker)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Luxury)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-brand-text mb-2">
                What are your interests?
              </h2>
              <p className="text-brand-muted text-sm mb-6">
                Select a few to help the AI personalize your activities.
              </p>

              <div className="flex flex-wrap gap-3">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      formData.interests.includes(interest)
                        ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                        : "bg-brand-bg text-brand-muted border-brand-border hover:border-brand-muted"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Navigation */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-brand-border">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors font-medium"
            >
              <FiArrowLeft /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              disabled={step === 1 && !formData.destination.trim()}
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 bg-brand-accent text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-hover disabled:opacity-50 transition-all"
            >
              Next <FiArrowRight />
            </button>
          ) : (
            <button
              onClick={submitTrip}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-sm"
            >
              Generate Itinerary <FiCheckCircle />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
