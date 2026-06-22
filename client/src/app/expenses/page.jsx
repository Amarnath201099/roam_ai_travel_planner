"use client";

import { useState, useEffect } from "react";
import { FiDollarSign } from "react-icons/fi";
import API from "../../utils/api";
import FinancialTripCard from "../../components/FinancialTripCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ExpenseDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // Utilizing your existing endpoint that grabs summary trip data
        const { data } = await API.get("/trips");
        setTrips(data);
      } catch (err) {
        console.error("Failed to fetch trips for expenses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <FiDollarSign size={24} />
            </div>
            Financial Dashboards
          </h1>
          <p className="text-gray-500">
            Select a trip to analyze your estimated vs. actual spending.
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">You haven't planned any trips yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <FinancialTripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
