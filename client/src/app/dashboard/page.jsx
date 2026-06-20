"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "../../utils/api";
import { FiPlus, FiMapPin, FiCalendar, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <div className="flex justify-center items-center h-64 text-brand-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text">
            Your Travel Plans
          </h1>
          <p className="text-brand-muted mt-1">
            Manage and view your AI-generated itineraries.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 bg-brand-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <FiPlus className="text-xl" /> Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-brand-card rounded-2xl border border-brand-border shadow-sm">
          <FiMapPin className="text-6xl text-brand-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-brand-text mb-2">
            No trips planned yet
          </h3>
          <p className="text-brand-muted">
            Let AI craft your perfect getaway in seconds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={trip._id}
            >
              <Link
                href={`/dashboard/${trip._id}`}
                className="block h-full group"
              >
                <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm hover:shadow-md hover:border-brand-accent/50 transition-all h-full flex flex-col">
                  <h2 className="text-xl font-bold text-brand-text group-hover:text-brand-accent transition-colors mb-4 line-clamp-1">
                    {trip.destination}
                  </h2>
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-brand-muted">
                      <FiCalendar className="text-brand-accent" />
                      <span>{trip.days} Days</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-brand-muted">
                      <FiDollarSign className="text-brand-accent" />
                      <span>{trip.budgetTier} Budget</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
