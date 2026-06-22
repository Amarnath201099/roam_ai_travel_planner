"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDestructive = true,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-brand-card w-full max-w-md p-6 rounded-2xl border border-brand-border shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-full ${isDestructive ? "bg-red-50 text-red-600" : "bg-brand-bg text-brand-accent"}`}
              >
                <FiAlertTriangle className="text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-text">{title}</h3>
            </div>

            <p className="text-brand-muted mb-8 text-sm leading-relaxed">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-brand-text bg-brand-bg border border-brand-border hover:bg-brand-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-sm ${
                  isDestructive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-brand-accent hover:bg-brand-hover"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
