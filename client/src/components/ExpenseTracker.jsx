"use client";

import { useState } from "react";
import { FiPlus, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import API from "../utils/api";

export default function ExpenseTracker({
  tripId,
  estimatedTotal,
  initialExpenses,
}) {
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [loading, setLoading] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentageSpent =
    estimatedTotal > 0 ? (totalSpent / estimatedTotal) * 100 : 0;

  // Dynamic color logic for engineering judgment (Visual Feedback)
  const isOverBudget = totalSpent > estimatedTotal;
  const isNearingBudget = percentageSpent > 85 && !isOverBudget;

  const progressBarColor = isOverBudget
    ? "bg-red-500"
    : isNearingBudget
      ? "bg-amber-500"
      : "bg-brand-accent";

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    try {
      const { data } = await API.post(`/trips/${tripId}/expenses`, {
        category,
        description,
        amount: Number(amount),
      });
      // The backend returns the completely updated array of expenses
      setExpenses(data);
      // Reset form fields
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error("Failed to add expense", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm">
      <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
        <FiDollarSign className="text-brand-accent" /> Budget Tracker
      </h3>

      {/* Progress Bar Section */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-brand-text">Spent: ${totalSpent}</span>
          <span className="text-brand-muted">
            AI Estimate: ${estimatedTotal}
          </span>
        </div>
        <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
          <div
            className={`h-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
        {isOverBudget && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
            <FiAlertCircle /> You have exceeded the AI's estimated budget!
          </p>
        )}
      </div>

      {/* Add New Expense Form */}
      <form
        onSubmit={handleAddExpense}
        className="space-y-3 mb-6 bg-brand-bg p-4 rounded-xl border border-brand-border"
      >
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-1/3 px-3 py-2 rounded-lg border border-brand-border text-sm outline-none focus:border-brand-accent bg-white text-brand-text"
          >
            <option value="Food">Food</option>
            <option value="Activities">Activity</option>
            <option value="Flights">Flight</option>
            <option value="Accommodation">Hotel</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="What did you buy?"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-2/3 px-3 py-2 rounded-lg border border-brand-border text-sm outline-none focus:border-brand-accent bg-white text-brand-text"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
              $
            </span>
            <input
              type="number"
              min="1"
              placeholder="Amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-brand-border text-sm outline-none focus:border-brand-accent bg-white text-brand-text"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-hover transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1 shadow-sm"
          >
            {loading ? (
              "..."
            ) : (
              <>
                <FiPlus /> Add
              </>
            )}
          </button>
        </div>
      </form>

      {/* Expense History List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {expenses.length === 0 ? (
          <p className="text-sm text-brand-muted text-center italic py-4">
            No expenses logged yet.
          </p>
        ) : (
          [...expenses].reverse().map((exp, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-lg border border-brand-border bg-white shadow-sm"
            >
              <div>
                <p className="text-sm font-bold text-brand-text leading-tight">
                  {exp.description}
                </p>
                <p className="text-xs text-brand-muted">{exp.category}</p>
              </div>
              <span className="font-bold text-brand-text">${exp.amount}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
