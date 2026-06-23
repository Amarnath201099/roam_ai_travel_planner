import { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiAlertTriangle } from "react-icons/fi";

export default function GlobalEditModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  formData,
  setFormData,
}) {
  useEffect(() => {
    if (formData.groupType === "Solo") {
      setFormData((prev) => ({ ...prev, groupSize: 1 }));
    }

    if (formData.groupType === "Couple") {
      setFormData((prev) => ({ ...prev, groupSize: 2 }));
    }
  }, [formData.groupType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-brand-card p-6 rounded-2xl max-w-md w-full border border-brand-border shadow-2xl">
        <h3 className="text-xl font-bold text-brand-text flex items-center gap-2 mb-2">
          <FiAlertTriangle className="text-amber-500" /> Regenerate Trip
        </h3>
        <p className="text-brand-muted text-sm mb-6">
          Updating these core parameters will force the AI to build a completely
          new itinerary. Your old version will be saved in History.
        </p>

        <div className="space-y-4 mb-6">
          {/* Row 1 */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Flying From
              </label>
              <input
                type="text"
                value={formData.origin || ""}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Destination
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Days
              </label>
              <input
                type="number"
                min="1"
                value={formData.days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    days: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Budget
              </label>
              <select
                value={formData.budgetTier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetTier: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Start Date
              </label>

              <DatePicker
                selected={
                  formData.startDate ? new Date(formData.startDate) : new Date()
                }
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    startDate: date,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none"
                wrapperClassName="w-full"
                dateFormat="MMM d, yyyy"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Travel With
              </label>

              <select
                value={formData.groupType || "Solo"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    groupType: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
              >
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Group Size
              </label>

              <input
                type="number"
                min="1"
                max="20"
                disabled={
                  formData.groupType === "Solo" ||
                  formData.groupType === "Couple"
                }
                value={formData.groupSize || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    groupSize: Number(e.target.value),
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg outline-none ${
                  formData.groupType === "Solo" ||
                  formData.groupType === "Couple"
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            <div className="w-1/2" />
          </div>

          {/* Row 5 */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Interests
            </label>

            <input
              type="text"
              value={formData.interests || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interests: e.target.value,
                })
              }
              placeholder="Museums, Hiking, Food"
              className="w-full px-3 py-2 border rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-brand-muted hover:bg-brand-bg"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isProcessing}
            className="px-4 py-2 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-hover disabled:opacity-50"
          >
            {isProcessing ? "Regenerating..." : "Confirm & Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}
