import { useState } from "react";
import { FiClock, FiMapPin, FiTrash2, FiPlus, FiMap } from "react-icons/fi";

// --- Helper function for dynamic tag colors ---
const getTagStyle = (tag) => {
  const t = tag.toLowerCase();

  if (
    t.includes("nature") ||
    t.includes("outdoor") ||
    t.includes("park") ||
    t.includes("hike")
  ) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (
    t.includes("historic") ||
    t.includes("history") ||
    t.includes("heritage") ||
    t.includes("architecture")
  ) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (
    t.includes("photo") ||
    t.includes("art") ||
    t.includes("museum") ||
    t.includes("culture")
  ) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }
  if (
    t.includes("food") ||
    t.includes("dining") ||
    t.includes("restaurant") ||
    t.includes("culinary")
  ) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }
  if (
    t.includes("adventure") ||
    t.includes("active") ||
    t.includes("sport") ||
    t.includes("explore")
  ) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (
    t.includes("relax") ||
    t.includes("leisure") ||
    t.includes("beach") ||
    t.includes("wellness")
  ) {
    return "bg-cyan-100 text-cyan-700 border-cyan-200";
  }
  if (t.includes("shopping") || t.includes("market")) {
    return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
  }

  // Default fallback color
  return "bg-gray-100 text-gray-600 border-gray-200";
};

export default function DailyItinerary({
  trip,
  activeDay,
  setActiveDay,
  actions,
  setActivityToDelete,
  isLocked, // NEW: Passed from TripViewPage
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIEdit, setShowAIEdit] = useState(false);
  const [newActivity, setNewActivity] = useState({
    time: "",
    title: "",
    description: "",
    location: "",
    tags: "", // We'll split this into an array on submit
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentDayData = trip.itinerary?.find((day) => day.day === activeDay);

  const handleAdd = async (e) => {
    e.preventDefault();
    const formattedActivity = {
      ...newActivity,
      tags: newActivity.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const success = await actions.updateDay("ADD", formattedActivity);
    if (success) {
      setShowAddForm(false);
      setNewActivity({
        time: "",
        title: "",
        description: "",
        location: "",
        tags: "",
      });
    }
  };

  const handleRegenerate = async () => {
    if (!aiPrompt) return;
    setIsProcessing(true);
    const success = await actions.updateDay("REGENERATE", {
      userPrompt: aiPrompt,
    });
    if (success) {
      setShowAIEdit(false);
      setAiPrompt("");
    }
    setIsProcessing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daily Itinerary</h2>

        {/* TASK 5: Hide actions when locked */}
        {!isLocked && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-sm bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <FiPlus /> Add
            </button>
            <button
              onClick={() => setShowAIEdit(!showAIEdit)}
              className="flex items-center gap-1 text-sm bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700 font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              ✨ AI Edit
            </button>
          </div>
        )}
      </div>

      {showAIEdit && !isLocked && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 animate-in fade-in">
          <input
            type="text"
            placeholder="e.g. Make this day more relaxing..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleRegenerate}
            disabled={isProcessing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-700"
          >
            {isProcessing ? "Thinking..." : "Regenerate"}
          </button>
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar scrollbar-hide">
        {trip.itinerary?.map((dayObj) => (
          <button
            key={dayObj.day}
            onClick={() => setActiveDay(dayObj.day)}
            className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
              activeDay === dayObj.day
                ? "bg-indigo-600 text-white shadow-md border-indigo-600"
                : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
            }`}
          >
            Day {dayObj.day}
          </button>
        ))}
      </div>

      {showAddForm && !isLocked && (
        <form
          onSubmit={handleAdd}
          className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200 border-dashed space-y-4 animate-in fade-in"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Time (e.g., 09:00 AM)"
              required
              value={newActivity.time}
              onChange={(e) =>
                setNewActivity({ ...newActivity, time: e.target.value })
              }
              className="px-4 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Activity Title"
              required
              value={newActivity.title}
              onChange={(e) =>
                setNewActivity({ ...newActivity, title: e.target.value })
              }
              className="px-4 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Location"
              required
              value={newActivity.location}
              onChange={(e) =>
                setNewActivity({ ...newActivity, location: e.target.value })
              }
              className="px-4 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 flex-col md:flex-row">
            <input
              type="text"
              placeholder="Tags (comma separated, e.g. Museum, Indoors)"
              value={newActivity.tags}
              onChange={(e) =>
                setNewActivity({ ...newActivity, tags: e.target.value })
              }
              className="w-full md:w-1/3 px-4 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Short Description"
              required
              value={newActivity.description}
              onChange={(e) =>
                setNewActivity({
                  ...newActivity,
                  description: e.target.value,
                })
              }
              className="w-full md:w-2/3 px-4 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors"
            >
              Save Activity
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {currentDayData?.activities?.map((activity, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-gray-100 bg-white group hover:border-indigo-200 hover:shadow-md transition-all relative"
          >
            {/* Time Column */}
            <div className="flex sm:flex-col items-center gap-2 w-32 shrink-0">
              <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-indigo-100 w-full text-center">
                <FiClock className="inline mr-1 mb-0.5" /> {activity.time}
              </div>
              <div className="hidden sm:block h-full w-px bg-gray-200 mt-2"></div>
            </div>

            {/* Content Column */}
            <div className="pb-2 w-full flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-2">
                {activity.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${getTagStyle(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h4 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                {activity.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {activity.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-auto">
                <p className="text-sm text-gray-500 font-medium flex items-center">
                  <FiMapPin className="mr-1.5 text-gray-400" />{" "}
                  {activity.location}
                </p>
                {/* Premium Map Button */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors ml-auto sm:ml-0"
                >
                  <FiMap size={14} /> View on Map
                </a>
              </div>
            </div>

            {/* Conditional Delete Button */}
            {!isLocked && (
              <button
                onClick={() => setActivityToDelete(activity)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 bg-white p-2 rounded-lg shadow-sm border border-gray-100 transition-all"
                title="Delete Activity"
              >
                <FiTrash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
