"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

export default function WarningModal({ isOpen, onClose, title, message }) {
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
            className="bg-brand-card w-full max-w-sm p-6 rounded-2xl border border-brand-border shadow-2xl"
          >
            <h3 className="text-xl font-bold text-brand-text mb-2 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-500" /> {title}
            </h3>
            <p className="text-brand-muted text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-brand-text text-white rounded-lg font-bold hover:bg-black transition-colors"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
