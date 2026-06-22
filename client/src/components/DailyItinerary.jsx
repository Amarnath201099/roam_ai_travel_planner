import { useState } from "react";
import { FiClock, FiMapPin, FiTrash2, FiPlus } from "react-icons/fi";

export default function DailyItinerary({
  trip,
  activeDay,
  setActiveDay,
  actions,
  setActivityToDelete,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIEdit, setShowAIEdit] = useState(false);
  const [newActivity, setNewActivity] = useState({
    time: "",
    description: "",
    location: "",
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentDayData = trip.itinerary?.find((day) => day.day === activeDay);

  const handleAdd = async (e) => {
    e.preventDefault();
    const success = await actions.updateDay("ADD", newActivity);
    if (success) {
      setShowAddForm(false);
      setNewActivity({ time: "", description: "", location: "" });
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
    <div className="bg-brand-card rounded-2xl p-6 border border-brand-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-text">Daily Itinerary</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-sm bg-brand-bg px-3 py-1.5 rounded-lg text-brand-text hover:bg-brand-border"
          >
            <FiPlus /> Add
          </button>
          <button
            onClick={() => setShowAIEdit(!showAIEdit)}
            className="flex items-center gap-1 text-sm bg-brand-accent/10 px-3 py-1.5 rounded-lg text-brand-accent font-medium hover:bg-brand-accent/20"
          >
            ✨ AI Edit
          </button>
        </div>
      </div>

      {showAIEdit && (
        <div className="mb-6 p-4 bg-brand-bg rounded-xl border border-brand-border flex gap-3">
          <input
            type="text"
            placeholder="e.g. Make this day more relaxing..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border outline-none"
          />
          <button
            onClick={handleRegenerate}
            disabled={isProcessing}
            className="px-4 py-2 bg-brand-accent text-white rounded-lg font-bold disabled:opacity-50"
          >
            {isProcessing ? "Thinking..." : "Regenerate"}
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {trip.itinerary?.map((dayObj) => (
          <button
            key={dayObj.day}
            onClick={() => setActiveDay(dayObj.day)}
            className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border ${activeDay === dayObj.day ? "bg-brand-accent text-white shadow-md" : "bg-brand-bg text-brand-muted"}`}
          >
            Day {dayObj.day}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {currentDayData?.activities?.map((activity, idx) => (
          <div
            key={idx}
            className="flex gap-4 p-4 rounded-xl border border-brand-border bg-white group hover:border-brand-accent/30 relative"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="bg-brand-bg text-brand-accent font-bold px-3 py-1 rounded-md text-xs border border-brand-border">
                <FiClock className="inline mr-1" /> {activity.time}
              </div>
              <div className="h-full w-px bg-brand-border"></div>
            </div>
            <div className="pb-4 w-full">
              <h4 className="text-lg font-bold text-brand-text">
                {activity.description}
              </h4>
              <p className="text-sm text-brand-muted mt-1">
                <FiMapPin className="inline mr-1" /> {activity.location}
              </p>
            </div>
            <button
              onClick={() => setActivityToDelete(activity)}
              className="absolute top-4 right-4 text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 bg-white p-1 rounded shadow-sm border border-brand-border"
            >
              <FiTrash2 className="text-lg" />
            </button>
          </div>
        ))}

        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="p-4 bg-brand-bg rounded-xl border border-brand-border border-dashed space-y-3"
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Time"
                required
                value={newActivity.time}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, time: e.target.value })
                }
                className="w-1/3 px-3 py-2 rounded-lg border outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                required
                value={newActivity.location}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, location: e.target.value })
                }
                className="w-2/3 px-3 py-2 rounded-lg border outline-none"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Activity Description"
                required
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border outline-none"
              />
              <button
                type="submit"
                className="px-6 bg-brand-text text-white rounded-lg font-bold"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
