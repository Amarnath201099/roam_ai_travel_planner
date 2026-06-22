import { useState, useEffect } from "react";
import API from "../utils/api";

export default function useTripManager(tripId) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [warningModal, setWarningModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await API.get(`/trips/${tripId}`);
        setTrip(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  const handleAIError = (err, fallbackMessage) => {
    const errorMsg = err.response?.data?.message || "";
    if (errorMsg.includes("AI_CAPACITY_ERROR")) {
      setWarningModal({
        isOpen: true,
        title: "AI Server Busy",
        message:
          "The AI is currently at capacity. Please wait a few moments and try your request again.",
      });
    } else if (errorMsg.includes("DAY_VIOLATION")) {
      setWarningModal({
        isOpen: true,
        title: "Invalid Request",
        message:
          "You can only change the number of days from the 'Edit Trip Rules' settings.",
      });
    } else {
      setWarningModal({
        isOpen: true,
        title: "Update Failed",
        message: fallbackMessage,
      });
    }
  };

  // API Actions
  const updateDay = async (action, payload, activityId = null) => {
    try {
      let response;
      if (action === "ADD")
        response = await API.post(
          `/trips/${trip._id}/itinerary/${activeDay}/activities`,
          payload,
        );
      if (action === "DELETE")
        response = await API.delete(
          `/trips/${trip._id}/itinerary/${activeDay}/activities/${activityId}`,
        );
      if (action === "REGENERATE")
        response = await API.post(
          `/trips/${trip._id}/itinerary/${activeDay}/regenerate`,
          payload,
        );

      // Because we fixed the backend, REGENERATE now returns the full trip!
      if (action === "REGENERATE") {
        setTrip(response.data);
      } else {
        // For basic add/delete, we just manually patch the local day to keep it fast
        setTrip((prev) => ({
          ...prev,
          itinerary: prev.itinerary.map((d) =>
            d.day === activeDay ? response.data : d,
          ),
        }));
      }
      return true; // Success
    } catch (err) {
      handleAIError(err, `Failed to ${action.toLowerCase()} activity.`);
      return false; // Failed
    }
  };

  const globalEdit = async (formData) => {
    try {
      const { data } = await API.put(`/trips/${trip._id}`, formData);
      setTrip(data);
      return true;
    } catch (err) {
      handleAIError(err, "Failed to regenerate trip rules.");
      return false;
    }
  };

  const versionControl = async (action, payload) => {
    try {
      let response;
      if (action === "RESTORE")
        response = await API.put(`/trips/${trip._id}/restore/${payload}`);
      if (action === "MERGE")
        response = await API.post(`/trips/${trip._id}/merge`, payload);
      if (action === "FINALIZE")
        response = await API.put(`/trips/${trip._id}/finalize`);

      if (action === "FINALIZE") {
        setTrip((prev) => ({ ...prev, isFinalized: true, versionHistory: [] }));
      } else {
        setTrip(response.data);
      }
      return true;
    } catch (err) {
      handleAIError(err, `Failed to process ${action.toLowerCase()} request.`);
      return false;
    }
  };

  return {
    trip,
    loading,
    activeDay,
    setActiveDay,
    warningModal,
    setWarningModal,
    actions: { updateDay, globalEdit, versionControl },
  };
}
