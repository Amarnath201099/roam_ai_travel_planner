import { FiMapPin, FiStar, FiCoffee, FiMap } from "react-icons/fi";

export default function SuggestedHotels({ hotels }) {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-gray-500 p-4">No hotel suggestions available.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {hotels.map((hotel, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
        >
          <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 uppercase tracking-wide">
                {hotel.tier}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-md">
                <FiStar className="fill-current" /> {hotel.rating || "N/A"}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {hotel.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {hotel.description}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <FiCoffee className="mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">Dining: </span>
                  {hotel.dietaryOptions || "Standard options"}
                </div>
              </div>

              {hotel.specialDishes && hotel.specialDishes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hotel.specialDishes.map((dish, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200"
                    >
                      🍽️ {dish}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-2 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-sm font-bold text-gray-700 transition-colors shadow-sm"
            >
              <FiMap /> View on Map
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
