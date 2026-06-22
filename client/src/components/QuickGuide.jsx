import { FiInfo, FiLock, FiStar, FiClock } from "react-icons/fi";

export default function QuickGuide() {
  return (
    <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FiInfo className="text-indigo-600 text-xl" />
        <h3 className="text-lg font-bold text-indigo-900">
          How to use your Planner
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 p-4 rounded-xl border border-indigo-50">
          <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
            <FiStar className="text-amber-500" /> AI Edits
          </div>
          <p className="text-sm text-gray-600">
            Click <strong>✨ AI Edit</strong> on any day and type what you want
            changed (e.g., "Make this day more kid-friendly"). The AI will
            redesign that specific day for you.
          </p>
        </div>

        <div className="bg-white/60 p-4 rounded-xl border border-indigo-50">
          <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
            <FiLock className="text-indigo-500" /> Locking the Trip
          </div>
          <p className="text-sm text-gray-600">
            Use the <strong>Lock Trip</strong> button at the top to prevent
            accidental changes. Once locked, the trip becomes view-only, hiding
            the edit and delete buttons.
          </p>
        </div>

        <div className="bg-white/60 p-4 rounded-xl border border-indigo-50">
          <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
            <FiClock className="text-emerald-500" /> Past Edits
          </div>
          <p className="text-sm text-gray-600">
            Made a mistake? Click <strong>Past Edits</strong> in the top bar.
            Every time you use the AI or edit the rules, we save a version of
            your trip that you can restore instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
