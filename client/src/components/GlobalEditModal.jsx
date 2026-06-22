import { FiAlertTriangle } from "react-icons/fi";

export default function GlobalEditModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  formData,
  setFormData,
}) {
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
          <div>
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
                  setFormData({ ...formData, days: Number(e.target.value) })
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
                  setFormData({ ...formData, budgetTier: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
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
