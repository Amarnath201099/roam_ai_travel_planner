"use client";

import { useState, useEffect } from "react";
import {
  FiUser,
  FiLock,
  FiMapPin,
  FiSave,
  FiShield,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import API from "../../utils/api";
import WarningModal from "../../components/WarningModal";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  // --- States ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState(null); // Stores DB snapshot for canceling

  cconst[(profileData, setProfileData)] = useState({
    name: user?.name || "",
    email: user?.email || "",
    homeLocation: user?.homeLocation || "",
    dietaryPreferences: user?.dietaryPreferences?.join(", ") || "",
    travelPace: user?.travelPace || "Moderate",
    preferredCurrency: user?.preferredCurrency || "USD",
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

  // --- Handlers ---
  const handleCancelEdit = () => {
    setProfileData(originalProfileData); // Revert to snapshot
    setIsEditingProfile(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!isEditingProfile) return; // Prevent accidental submits

    setLoadingProfile(true);
    setProfileSuccess(false);

    try {
      const payload = {
        ...profileData,
        dietaryPreferences: profileData.dietaryPreferences
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
      };

      await API.put("/auth/profile", payload);

      // Update the global auth context so the Navbar and Modals know about the changes instantly!
      if (setUser) {
        setUser(data);
      }

      setOriginalProfileData(profileData); // Update snapshot to new truth
      setProfileSuccess(true);
      setIsEditingProfile(false); // Lock the form again
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

  // Helper class for inputs to style them dynamically based on edit state
  const inputStyle = `w-full transition-all outline-none rounded-lg ${
    isEditingProfile
      ? "px-4 py-2 border border-brand-border focus:border-brand-accent bg-white"
      : "px-0 py-2 border-transparent bg-transparent text-brand-text font-medium disabled:opacity-100"
  }`;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-text flex items-center gap-3">
          <FiUser className="text-brand-accent" /> Your Profile
        </h1>
        <p className="text-brand-muted mt-1">
          Manage your personal details, travel preferences, and security.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Card 1: Travel Settings */}
        <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <FiMapPin className="text-brand-accent" /> Travel Settings
            </h2>

            {/* The Edit Toggle Button */}
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-brand-bg text-brand-text border border-brand-border hover:border-brand-accent transition-colors shadow-sm"
              >
                <FiEdit2 /> Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={!isEditingProfile}
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full px-0 py-2 border-transparent bg-transparent text-brand-muted font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Home Location (Origin)
              </label>
              <input
                type="text"
                disabled={!isEditingProfile}
                placeholder={
                  isEditingProfile ? "e.g., New York, USA" : "Not set"
                }
                value={profileData.homeLocation}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    homeLocation: e.target.value,
                  })
                }
                className={inputStyle}
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Travel Pace
                </label>
                {isEditingProfile ? (
                  <select
                    value={profileData.travelPace}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        travelPace: e.target.value,
                      })
                    }
                    className={inputStyle}
                  >
                    <option value="Relaxed">Relaxed</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Fast-paced">Fast-paced</option>
                  </select>
                ) : (
                  <div className="py-2 text-brand-text font-medium">
                    {profileData.travelPace}
                  </div>
                )}
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Currency
                </label>
                {isEditingProfile ? (
                  <select
                    value={profileData.preferredCurrency}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        preferredCurrency: e.target.value,
                      })
                    }
                    className={inputStyle}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                ) : (
                  <div className="py-2 text-brand-text font-medium">
                    {profileData.preferredCurrency}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Dietary Preferences
              </label>
              <input
                type="text"
                disabled={!isEditingProfile}
                placeholder={
                  isEditingProfile ? "e.g., Vegan, Gluten-Free" : "None"
                }
                value={profileData.dietaryPreferences}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    dietaryPreferences: e.target.value,
                  })
                }
                className={inputStyle}
              />
            </div>

            {/* Save & Cancel Action Row */}
            <div className="pt-4 flex items-center justify-between border-t border-brand-border mt-2">
              <span
                className="text-sm font-bold text-green-600 transition-opacity duration-300"
                style={{ opacity: profileSuccess ? 1 : 0 }}
              >
                Profile saved!
              </span>

              {isEditingProfile && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loadingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-brand-muted hover:bg-brand-bg transition-colors disabled:opacity-50"
                  >
                    <FiX /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="flex items-center gap-2 bg-brand-text text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <FiSave /> {loadingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Card 2: Security (Always editable) */}
        <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
            <FiShield className="text-brand-accent" /> Change Password
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
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors bg-white"
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
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors bg-white"
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
                className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-accent transition-colors bg-white"
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
                <FiLock /> {loadingPassword ? "Updating..." : "Update Password"}
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
