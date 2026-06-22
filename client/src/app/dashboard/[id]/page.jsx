"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FiMapPin,
  FiCalendar,
  FiArrowLeft,
  FiCheckCircle,
  FiSettings,
} from "react-icons/fi";
import { MdHistory } from "react-icons/md";
import Link from "next/link";
import useTripManager from "../../../hooks/useTripManager";

// Components
import FinancialDashboard from "../../../components/FinancialDashboard";
import ConfirmModal from "../../../components/ConfirmModal";
import VersionHistorySidebar from "../../../components/VersionHistorySidebar";
import WarningModal from "../../../components/WarningModal";
import GlobalEditModal from "../../../components/GlobalEditModal";
import DailyItinerary from "../../../components/DailyItinerary";

export default function TripViewPage() {
  const params = useParams();
  const {
    trip,
    loading,
    activeDay,
    setActiveDay,
    warningModal,
    setWarningModal,
    actions,
  } = useTripManager(params.id);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Global Edit Form State
  const [showGlobalEdit, setShowGlobalEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    destination: "",
    days: 3,
    budgetTier: "Medium",
    interests: [],
  });

  // Sync form data when trip loads
  useEffect(() => {
    if (trip)
      setEditFormData({
        destination: trip.destination,
        days: trip.days,
        budgetTier: trip.budgetTier,
        interests: trip.interests,
      });
  }, [trip]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
      </div>
    );
  if (!trip)
    return <div className="text-center py-20 text-red-500">Trip not found</div>;

  // Wrapped Handlers
  const handleGlobalEditSubmit = async () => {
    setIsProcessing(true);
    const success = await actions.globalEdit(editFormData);
    if (success) setShowGlobalEdit(false);
    setIsProcessing(false);
  };

  const handleFinalize = async () => {
    if (
      !window.confirm(
        "Finalizing will clear your version history to save space. Proceed?",
      )
    )
      return;
    await actions.versionControl("FINALIZE");
  };

  const executeDeleteActivity = async () => {
    const success = await actions.updateDay(
      "DELETE",
      null,
      activityToDelete._id,
    );
    if (success) setActivityToDelete(null);
  };

  return (
    <div className="w-full relative">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-accent font-medium"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 text-sm font-bold bg-white px-4 py-2 border rounded-lg hover:border-brand-accent shadow-sm relative"
          >
            <MdHistory /> History
            {trip.versionHistory?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {trip.versionHistory.length}
              </span>
            )}
          </button>
          <button
            onClick={trip.versionHistory?.length === 0 ? null : handleFinalize}
            disabled={trip.versionHistory?.length === 0}
            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg shadow-sm ${trip.versionHistory?.length === 0 ? "bg-green-50 text-green-700 opacity-80" : "bg-brand-text text-white hover:bg-black"}`}
          >
            <FiCheckCircle />{" "}
            {trip.versionHistory?.length === 0
              ? "Committed"
              : "Commit / Finalize"}
          </button>
        </div>
      </div>

      {/* Title block */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-text flex items-center gap-3">
            <FiMapPin className="text-brand-accent" /> {trip.destination}
          </h1>
          <div className="flex gap-4 mt-3 text-brand-muted font-medium text-sm">
            <span className="bg-brand-bg px-3 py-1 rounded-md border">
              <FiCalendar className="inline mr-1" /> {trip.days} Days
            </span>
            <span className="bg-brand-bg px-3 py-1 rounded-md border">
              {trip.budgetTier} Budget
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowGlobalEdit(true)}
          className="flex items-center gap-2 text-brand-muted hover:text-brand-text font-medium px-4 py-2 border bg-white rounded-lg shadow-sm"
        >
          <FiSettings /> Edit Trip Rules
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 space-y-8">
          <DailyItinerary
            trip={trip}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            actions={actions}
            setActivityToDelete={setActivityToDelete}
          />
        </div>
        <div className="w-full lg:w-1/3 sticky top-24">
          <FinancialDashboard trip={trip} />
        </div>
      </div>

      {/* Modals & Overlays */}
      <GlobalEditModal
        isOpen={showGlobalEdit}
        onClose={() => setShowGlobalEdit(false)}
        onSubmit={handleGlobalEditSubmit}
        isProcessing={isProcessing}
        formData={editFormData}
        setFormData={setEditFormData}
      />

      <VersionHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={trip.versionHistory}
        isProcessing={isProcessing}
        onRestore={async (id) => {
          setIsProcessing(true);
          await actions.versionControl("RESTORE", id);
          setIsProcessing(false);
          setIsSidebarOpen(false);
        }}
        onMerge={async (ids, prompt) => {
          setIsProcessing(true);
          await actions.versionControl("MERGE", {
            versionIds: ids,
            userPrompt: prompt,
          });
          setIsProcessing(false);
          setIsSidebarOpen(false);
        }}
      />

      <ConfirmModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={executeDeleteActivity}
        title="Delete Activity"
        message={`Remove activity from Day ${activeDay}?`}
      />
      <WarningModal
        isOpen={warningModal.isOpen}
        title={warningModal.title}
        message={warningModal.message}
        onClose={() =>
          setWarningModal({ isOpen: false, title: "", message: "" })
        }
      />
    </div>
  );
}
