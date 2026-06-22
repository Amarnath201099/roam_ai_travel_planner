"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import API from "../../../utils/api";
import FinancialAnalysisPage from "../../../components/FinancialAnalysisPage"; // The component from the previous step

export default function TripExpenseView() {
  const params = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const { data } = await API.get(`/trips/${params.id}`);
        setTrip(data);
      } catch (err) {
        console.error("Failed to fetch trip details", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchTripDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-20 text-red-500">
        Trip data could not be loaded.
      </div>
    );
  }

  // Render the highly detailed visual component
  return <FinancialAnalysisPage trip={trip} />;
}
