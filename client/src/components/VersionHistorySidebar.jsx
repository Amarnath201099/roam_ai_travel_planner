"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiClock, FiRotateCcw, FiGitMerge } from "react-icons/fi";

export default function VersionHistorySidebar({
  isOpen,
  onClose,
  history = [],
  onRestore,
  onMerge,
  isProcessing,
}) {
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [mergePrompt, setMergePrompt] = useState("");
  const [isMergeMode, setIsMergeMode] = useState(false);

  const toggleSelection = (versionId) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : [...prev, versionId],
    );
  };

  const handleMergeSubmit = () => {
    if (selectedVersions.length > 1 && mergePrompt) {
      onMerge(selectedVersions, mergePrompt);
      setSelectedVersions([]);
      setMergePrompt("");
      setIsMergeMode(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-card border-l border-brand-border shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg">
              <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
                <FiClock className="text-brand-accent" /> Version History
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-border rounded-lg transition-all"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-4 bg-brand-bg/50 border-b border-brand-border flex justify-between items-center">
              <span className="text-sm text-brand-muted font-medium">
                Select versions to merge, or restore a past state.
              </span>
              <button
                onClick={() => {
                  setIsMergeMode(!isMergeMode);
                  setSelectedVersions([]);
                }}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${isMergeMode ? "bg-brand-accent text-white" : "bg-brand-bg text-brand-text border border-brand-border"}`}
              >
                {isMergeMode ? "Cancel Merge" : "Merge Mode"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-brand-muted text-sm text-center italic mt-10">
                  No history available yet. Make an edit to save a version!
                </p>
              ) : (
                [...history].reverse().map((version) => (
                  <div
                    key={version.versionId}
                    className={`p-4 rounded-xl border transition-all ${selectedVersions.includes(version.versionId) ? "border-brand-accent bg-brand-accent/5" : "border-brand-border bg-brand-bg"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        {isMergeMode && (
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(
                              version.versionId,
                            )}
                            onChange={() => toggleSelection(version.versionId)}
                            className="mt-1 w-4 h-4 text-brand-accent rounded focus:ring-brand-accent cursor-pointer"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-brand-text text-sm leading-snug">
                            {version.title}
                          </h4>
                          <span className="text-xs text-brand-muted">
                            {new Date(version.savedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isMergeMode && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => onRestore(version.versionId)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-white border border-brand-border text-brand-text rounded-md hover:text-brand-accent hover:border-brand-accent transition-colors disabled:opacity-50"
                        >
                          <FiRotateCcw /> Restore
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Merge Action Panel */}
            <AnimatePresence>
              {isMergeMode && selectedVersions.length > 1 && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="p-6 bg-brand-bg border-t border-brand-border"
                >
                  <p className="text-xs font-bold text-brand-accent uppercase mb-2">
                    AI Merge ({selectedVersions.length} selected)
                  </p>
                  <input
                    type="text"
                    placeholder="How should AI combine these?"
                    value={mergePrompt}
                    onChange={(e) => setMergePrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-brand-border text-sm mb-3 outline-none focus:border-brand-accent"
                  />
                  <button
                    onClick={handleMergeSubmit}
                    disabled={isProcessing || !mergePrompt}
                    className="w-full flex items-center justify-center gap-2 bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-black transition-all shadow-sm disabled:opacity-50"
                  >
                    <FiGitMerge />{" "}
                    {isProcessing ? "Merging..." : "Combine with AI"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
