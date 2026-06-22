"use client";

import { useState } from "react";
import { FiPlus, FiDollarSign, FiTrash2 } from "react-icons/fi";
import API from "../utils/api";
import { useCurrency } from "../context/CurrencyContext";
import ConfirmModal from "./ConfirmModal";

export default function ExpenseTracker({
  tripId,
  estimatedTotal,
  initialExpenses,
}) {
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [loading, setLoading] = useState(false);
  const { symbol, convert } = useCurrency();

  // Form State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");

  // Deletion Modal State
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentageSpent =
    estimatedTotal > 0 ? (totalSpent / estimatedTotal) * 100 : 0;

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
      setExpenses(data);
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error("Failed to add expense", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    // Assuming you add a standard DELETE endpoint for expenses later
    try {
      // await API.delete(`/trips/${tripId}/expenses/${expenseToDelete._id}`);
      setExpenses(expenses.filter((exp) => exp._id !== expenseToDelete._id));
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm mt-6">
      <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
        <FiDollarSign className="text-brand-accent" /> Actual Expenses
      </h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-brand-text">
            Spent: {symbol}
            {convert(totalSpent)}
          </span>
          <span className="text-brand-muted">
            Estimate: {symbol}
            {convert(estimatedTotal)}
          </span>
        </div>
        <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
          <div
            className={`h-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleAddExpense}
        className="space-y-3 mb-6 bg-brand-bg p-4 rounded-xl border border-brand-border"
      >
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-1/3 px-3 py-2 rounded-lg border border-brand-border text-sm outline-none bg-white text-brand-text"
          >
            <option value="Food">Food</option>
            <option value="Activities">Activity</option>
            <option value="Flights">Flight</option>
            <option value="Accommodation">Hotel</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-2/3 px-3 py-2 rounded-lg border border-brand-border text-sm outline-none bg-white text-brand-text"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            placeholder="Amount"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm outline-none bg-white text-brand-text"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "..." : "Add"}
          </button>
        </div>
      </form>

      {/* Expense List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {expenses.length === 0 ? (
          <p className="text-sm text-brand-muted text-center italic py-4">
            No expenses logged.
          </p>
        ) : (
          [...expenses].reverse().map((exp, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-lg border border-brand-border bg-white shadow-sm group"
            >
              <div>
                <p className="text-sm font-bold text-brand-text leading-tight">
                  {exp.description}
                </p>
                <p className="text-xs text-brand-muted">{exp.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand-text">
                  {symbol}
                  {convert(exp.amount)}
                </span>
                <button
                  onClick={() => setExpenseToDelete(exp)}
                  className="text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to remove "${expenseToDelete?.description}"? This will update your total spent.`}
      />
    </div>
  );
}
