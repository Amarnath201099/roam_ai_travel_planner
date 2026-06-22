"use client";

import { useState, useEffect } from "react";
import { FiUser, FiLock, FiMapPin, FiSave, FiShield } from "react-icons/fi";
import API from "../../utils/api";
import WarningModal from "../../components/WarningModal";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "", // Read-only
    homeLocation: "",
    dietaryPreferences: "", // Handled as a comma-separated string for easy input
    travelPace: "Moderate",
    preferredCurrency: "USD",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [warningModal, setWarningModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Fetch full profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          homeLocation: data.homeLocation || "",
          dietaryPreferences: data.dietaryPreferences?.join(", ") || "",
          travelPace: data.travelPace || "Moderate",
          preferredCurrency: data.preferredCurrency || "USD",
        });
      } catch (err) {
        console.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileSuccess(false);

    try {
      const payload = {
        ...profileData,
        // Convert comma string back to array before sending
        dietaryPreferences: profileData.dietaryPreferences
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
      };

      await API.put("/auth/profile", payload);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setWarningModal({
        isOpen: true,
        title: "Update Failed",
        message: err.response?.data?.message || "Could not update profile.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setWarningModal({
        isOpen: true,
        title: "Validation Error",
        message: "New passwords do not match.",
      });
    }

    // Basic regex check before hitting the server
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*_=+-]).{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      return setWarningModal({
        isOpen: true,
        title: "Weak Password",
        message:
          "Password must be 8+ characters with 1 uppercase, 1 lowercase, and 1 number/symbol.",
      });
    }

    setLoadingPassword(true);
    setPasswordSuccess(false);

    try {
      await API.put("/auth/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setWarningModal({
        isOpen: true,
        title: "Security Error",
        message: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-text flex items-center gap-3">
          <FiUser className="text-brand-accent" /> Your Profile
        </h1>
        <p className="text-brand-muted mt-1">
          Manage your personal details, travel preferences, and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Travel Settings */}
        <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
            <FiMapPin className="text-brand-accent" /> Travel Settings
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Email Address
              </label>
              {/* Read-Only visual cue */}
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full px-4 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Home Location (Origin)
              </label>
              <input
                type="text"
                placeholder="e.g., New York, USA"
                value={profileData.homeLocation}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    homeLocation: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Travel Pace
                </label>
                <select
                  value={profileData.travelPace}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      travelPace: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent bg-white"
                >
                  <option value="Relaxed">Relaxed</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Fast-paced">Fast-paced</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Currency
                </label>
                <select
                  value={profileData.preferredCurrency}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      preferredCurrency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Dietary Preferences (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g., Vegan, Gluten-Free"
                value={profileData.dietaryPreferences}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    dietaryPreferences: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span
                className="text-sm font-bold text-green-600 transition-opacity duration-300"
                style={{ opacity: profileSuccess ? 1 : 0 }}
              >
                Profile saved!
              </span>
              <button
                type="submit"
                disabled={loadingProfile}
                className="flex items-center gap-2 bg-brand-text text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
              >
                <FiSave /> {loadingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Security */}
        <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
            <FiShield className="text-brand-accent" /> Security
          </h2>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <hr className="border-brand-border my-4" />

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span
                className="text-sm font-bold text-green-600 transition-opacity duration-300"
                style={{ opacity: passwordSuccess ? 1 : 0 }}
              >
                Password updated!
              </span>
              <button
                type="submit"
                disabled={loadingPassword}
                className="flex items-center gap-2 bg-brand-text text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
              >
                <FiLock /> {loadingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <WarningModal
        isOpen={warningModal.isOpen}
        title={warningModal.title}
        message={warningModal.message}
        onClose={() =>
          setWarningModal({ isOpen: false, title: "", message: "" })
        }
      />
    </div>
  );
}
