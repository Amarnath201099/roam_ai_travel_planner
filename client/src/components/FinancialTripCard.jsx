import Link from "next/link";
import { FiMapPin, FiCalendar, FiPieChart, FiArrowRight } from "react-icons/fi";

export default function FinancialTripCard({ trip }) {
  // Format the date nicely if it exists, otherwise just show the days
  const dateString = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : `${trip.days} Days`;

  return (
    <Link
      href={`/expenses/${trip._id}`}
      className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
          <FiPieChart size={24} />
        </div>
        <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-100">
          {trip.budgetTier} Budget
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <FiMapPin className="text-gray-400" /> {trip.destination}
      </h3>

      <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <FiCalendar /> {dateString}
      </p>

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-indigo-600 font-bold text-sm">
        View Expense Report
        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
