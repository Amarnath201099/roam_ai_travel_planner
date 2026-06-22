"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FiMapPin,
  FiCalendar,
  FiArrowLeft,
  FiCheckCircle,
  FiSettings,
  FiLock,
  FiUnlock,
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
import SuggestedHotels from "../../../components/SuggestedHotels"; // NEW
import PackingList from "../../../components/PackingList"; // NEW
import QuickGuide from "../../../components/QuickGuide"; // NEW

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

  // --- NEW STATES (Phase 2: Tasks 3 & 4) ---
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");

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

  console.log(trip);

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
        "Finishing planning will clear your version history to save space. Proceed?",
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
      <div className="flex flex-col lg:flex-row justify-between items:start gap-6 lg:items-center mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-accent font-medium"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Humanized History -> Past Edits */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold bg-white px-3 md:px-4 py-2 border rounded-lg hover:border-brand-accent shadow-sm relative"
          >
            <MdHistory size={16} className="shrink-0" />
            Past Edits
            {trip.versionHistory?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] md:text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {trip.versionHistory.length}
              </span>
            )}
          </button>

          {/*  Humanized Commit -> Finish Planning */}
          <button
            onClick={trip.versionHistory?.length === 0 ? null : handleFinalize}
            disabled={trip.versionHistory?.length === 0}
            className={`flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-lg shadow-sm transition-colors ${
              trip.versionHistory?.length === 0
                ? "bg-green-50 text-green-700 opacity-80 cursor-default"
                : "bg-brand-text text-white hover:bg-black"
            }`}
          >
            <FiCheckCircle size={16} className="shrink-0" />{" "}
            {trip.versionHistory?.length === 0
              ? "Planning Finished"
              : "Finish Planning"}
          </button>

          {/* Premium Lock/Unlock Toggle */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-lg transition-all duration-200 border ${
              isLocked
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            }`}
          >
            {isLocked ? (
              <FiLock size={16} className="shrink-0" />
            ) : (
              <FiUnlock size={16} className="shrink-0" />
            )}
            {isLocked ? "Unlock Trip" : "Lock Trip"}
          </button>
        </div>
      </div>

      {/* Title block */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold text-brand-text flex items-center gap-3">
              <FiMapPin className="text-brand-accent" /> {trip.destination}
            </h1>
            {/* Visual Indicator for Lock State */}
            {isLocked && (
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800">
                Locked
              </span>
            )}
          </div>
          <div className="flex gap-4 mt-1 text-brand-muted font-medium text-sm">
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
          disabled={isLocked}
          className={`flex items-center gap-2 font-medium text-xs lg:text-sm px-4 py-2 border rounded-lg shadow-sm transition-colors ${
            isLocked
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-brand-muted hover:text-brand-text"
          }`}
        >
          <FiSettings /> Edit Trip Rules
        </button>
      </div>

      {/* TASK 4: Tabbed Navigation */}
      <div className="flex justify-center mb-8">
        <nav className="bg-gray-100/80 p-1 rounded-full inline-flex gap-1 shadow-inner border border-gray-200/50 max-w-full overflow-x-auto custom-scrollbar scrollbar-hide">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={`whitespace-nowrap px-4 py-2 text-xs md:px-6 md:py-2.5 md:text-sm rounded-full font-semibold transition-all duration-300 ${
              activeTab === "itinerary"
                ? "bg-white text-brand-text shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Daily Itinerary
          </button>
          <button
            onClick={() => setActiveTab("hotels")}
            className={`whitespace-nowrap px-4 py-2 text-xs md:px-6 md:py-2.5 md:text-sm rounded-full font-semibold transition-all duration-300 ${
              activeTab === "hotels"
                ? "bg-white text-brand-text shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Suggested Hotels
          </button>
          <button
            onClick={() => setActiveTab("packing")}
            className={`whitespace-nowrap px-4 py-2 text-xs md:px-6 md:py-2.5 md:text-sm rounded-full font-semibold transition-all duration-300  ${
              activeTab === "packing"
                ? "bg-white text-brand-text shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Packing List
          </button>
        </nav>
      </div>

      {/* Main Grid - View Toggled by Tabs */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column (Dynamic based on Active Tab) */}
        <div className="w-full lg:w-2/3 space-y-8">
          {activeTab === "itinerary" && (
            <div className="animate-in fade-in duration-300">
              <DailyItinerary
                trip={trip}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                actions={actions}
                setActivityToDelete={setActivityToDelete}
                isLocked={isLocked}
              />
            </div>
          )}

          {activeTab === "hotels" && (
            <div className="animate-in fade-in duration-300">
              <SuggestedHotels hotels={trip.hotelSuggestions} />
            </div>
          )}

          {activeTab === "packing" && (
            <div className="animate-in fade-in duration-300">
              <PackingList packingList={trip.packingList} />
            </div>
          )}
        </div>

        {/* Right Column - Financial Dashboard (Sticky) */}
        <div className="w-full lg:w-1/3 sticky top-24">
          <FinancialDashboard trip={trip} />
        </div>
      </div>

      {/* TASK 8: Quick Guide displayed at the bottom */}
      <QuickGuide />

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
