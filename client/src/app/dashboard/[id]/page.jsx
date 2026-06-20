"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiMapPin,
  FiCalendar,
  FiArrowLeft,
  FiClock,
  FiStar,
  FiSettings,
  FiAlertTriangle,
} from "react-icons/fi";
import Link from "next/link";
import API from "../../../utils/api";
import ExpenseTracker from "../../../components/ExpenseTracker";

export default function TripViewPage() {
  const params = useParams(); // Retrieves the [id] from the URL router
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const { data } = await API.get(`/trips/${params.id}`);
        setTrip(data);
      } catch (err) {
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchTripDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        {error || "Trip not found"}
      </div>
    );
  }

  // Find the specific day array based on user's tab selection
  const currentItineraryDay = trip.itinerary?.find(
    (day) => day.day === activeDay,
  );

  const handleGlobalEdit = async () => {
    setRegenerating(true);
    try {
      // In a full build, you'd bind these to inputs in the modal.
      // For now, we simulate sending the payload.
      const { data } = await API.put(`/trips/${trip._id}`, {
        destination: trip.destination, // e.g., updated via state
        days: trip.days + 1, // e.g., added a day
        budgetTier: trip.budgetTier,
        interests: trip.interests,
      });
      setTrip(data);
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to regenerate trip");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header Navigation */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-accent transition-colors mb-6 font-medium"
      >
        <FiArrowLeft /> Back to Dashboard
      </Link>
      <button
        onClick={() => setShowEditModal(true)}
        className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-accent transition-colors mb-6 font-medium ml-4"
      >
        <FiSettings /> Edit Trip Settings
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-brand-text flex items-center gap-3">
          <FiMapPin className="text-brand-accent" /> {trip.destination}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-brand-muted font-medium">
          <span className="flex items-center gap-1 bg-brand-bg px-3 py-1 rounded-md border border-brand-border">
            <FiCalendar /> {trip.days} Days
          </span>
          <span className="bg-brand-bg px-3 py-1 rounded-md border border-brand-border">
            {trip.budgetTier} Budget
          </span>
          <span className="bg-brand-bg px-3 py-1 rounded-md border border-brand-border text-sm">
            Interests: {trip.interests?.join(", ") || "General"}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Left side Itinerary, Right side Tracker */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Itinerary & Hotels */}
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Day Navigation Tabs */}
          <div className="bg-brand-card rounded-2xl p-6 border border-brand-border shadow-sm">
            <h2 className="text-2xl font-bold text-brand-text mb-4">
              Daily Itinerary
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {trip.itinerary?.map((dayObj) => (
                <button
                  key={dayObj.day}
                  onClick={() => setActiveDay(dayObj.day)}
                  className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    activeDay === dayObj.day
                      ? "bg-brand-accent text-white border-brand-accent shadow-md"
                      : "bg-brand-bg text-brand-muted border-brand-border hover:border-brand-muted hover:text-brand-text"
                  }`}
                >
                  Day {dayObj.day}
                </button>
              ))}
            </div>

            {/* Active Day Activities */}
            <div className="mt-6 space-y-4">
              {currentItineraryDay?.activities?.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 rounded-xl border border-brand-border bg-brand-bg/50 group hover:border-brand-accent/30 transition-all"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white text-brand-accent font-bold px-3 py-1 rounded-md text-xs border border-brand-border shadow-sm whitespace-nowrap">
                      <FiClock className="inline mr-1" /> {activity.time}
                    </div>
                    <div className="h-full w-px bg-brand-border group-hover:bg-brand-accent/30 transition-colors"></div>
                  </div>
                  <div className="pb-4">
                    <h4 className="text-lg font-bold text-brand-text">
                      {activity.description}
                    </h4>
                    <p className="text-sm text-brand-muted mt-1 flex items-center gap-1">
                      <FiMapPin className="text-xs" /> {activity.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Hotel Suggestions (Bonus Feature Requirement) */}
          <div className="bg-brand-card rounded-2xl p-6 border border-brand-border shadow-sm">
            <h2 className="text-2xl font-bold text-brand-text mb-4">
              AI Recommended Hotels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trip.hotelSuggestions?.map((hotel, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-brand-border bg-brand-bg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-brand-text leading-tight">
                      {hotel.name}
                    </h4>
                    <span className="text-xs font-bold bg-brand-accent/10 text-brand-accent px-2 py-1 rounded flex items-center gap-1">
                      <FiStar /> {hotel.tier}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted">
                    {hotel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Expense Tracker Feature */}
        <div className="w-full lg:w-1/3 sticky top-24">
          <ExpenseTracker
            tripId={trip._id}
            estimatedTotal={trip.estimatedBudget?.total || 0}
            initialExpenses={trip.actualExpenses}
          />
        </div>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card p-6 rounded-2xl max-w-md w-full border border-brand-border shadow-2xl">
            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2 mb-2">
              <FiAlertTriangle className="text-amber-500" /> Destructive Action
            </h3>
            <p className="text-brand-muted text-sm mb-6">
              Changing your destination, days, or budget will force the AI to
              completely regenerate your daily itinerary. Any custom activities
              you added will be overwritten. Your expense tracking history will
              remain.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg font-medium text-brand-muted hover:bg-brand-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGlobalEdit}
                disabled={regenerating}
                className="px-4 py-2 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
              >
                {regenerating
                  ? "Regenerating AI Plan..."
                  : "Confirm & Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
