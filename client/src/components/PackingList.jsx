import { FiCheckSquare, FiCalendar, FiPackage, FiSun } from "react-icons/fi";

export default function PackingList({ packingList }) {
  if (!packingList) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Essentials Section */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiPackage size={20} />
          </div>
          <h3 className="font-bold text-xl text-gray-900">Trip Essentials</h3>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {packingList.essentials.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium"
            >
              <span className="text-amber-500">✨</span> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Daily Gear Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiSun size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Daily Gear & Apparel
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packingList.dailySuggestions.map((d) => (
            <div
              key={d.day}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Day {d.day}
                </span>
              </div>

              <ul className="space-y-2.5">
                {d.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
