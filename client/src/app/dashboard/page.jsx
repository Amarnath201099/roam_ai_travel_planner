"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "../../utils/api";
import {
  FiPlus,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiArrowRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import NewTripModal from "../../components/NewTripModal";
import { useCurrency } from "../../context/CurrencyContext"; // Imported Currency
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bring in your global currency converter
  const { symbol, convert } = useCurrency();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await API.get("/trips");
        setTrips(data);
      } catch (error) {
        console.error("Failed to fetch trips", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64 text-brand-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-text">
              My Trips
            </h1>
            <p className="text-brand-muted mt-1 text-sm md:text-base">
              See all your planned trips and past adventures in one place.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors shadow-sm w-full md:w-auto justify-center"
          >
            <FiPlus className="text-xl" /> Plan a New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 bg-brand-card rounded-2xl border border-brand-border shadow-sm">
            <FiMapPin className="text-6xl text-brand-muted/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-text mb-2">
              No trips planned yet
            </h3>
            <p className="text-brand-muted mb-6">
              Let's build your perfect trip in seconds.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-brand-accent font-bold hover:underline px-6 py-2 bg-brand-accent/10 rounded-lg"
            >
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={trip._id}
                className="h-full"
              >
                <Link
                  href={`/dashboard/${trip._id}`}
                  className="block h-full group"
                >
                  <div className="bg-brand-card rounded-2xl border border-brand-border shadow-sm hover:shadow-xl hover:border-brand-accent/50 transition-all duration-300 h-full flex flex-col overflow-hidden">
                    {/* Premium Visual Header */}
                    <div className="h-16 bg-gradient-to-r from-brand-bg to-brand-accent/10 flex items-center px-6 border-b border-brand-border/50">
                      <h2 className="text-lg font-bold text-brand-text group-hover:text-brand-accent transition-colors truncate w-full">
                        {trip.destination}
                      </h2>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between text-sm text-brand-muted">
                          <span className="flex items-center gap-2">
                            <FiCalendar className="text-brand-accent" />{" "}
                            Duration
                          </span>
                          <span className="font-bold text-brand-text">
                            {trip.days} Days
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-brand-muted">
                          <span className="flex items-center gap-2">
                            <FiDollarSign className="text-brand-accent" /> Style
                          </span>
                          <span className="font-bold text-brand-text">
                            {trip.budgetTier}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Budget Section */}
                      <div className="mt-auto pt-4 border-t border-brand-border flex justify-between items-center group-hover:border-brand-accent/30 transition-colors">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-brand-muted mb-1">
                            Est. Total
                          </p>
                          <p className="font-extrabold text-brand-text text-lg">
                            {trip.estimatedBudget?.total
                              ? `${symbol}${convert(trip.estimatedBudget.total)}`
                              : "Calculating..."}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-muted group-hover:bg-brand-accent group-hover:text-white transition-colors">
                          <FiArrowRight />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <NewTripModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
