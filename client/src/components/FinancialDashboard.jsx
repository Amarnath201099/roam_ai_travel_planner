"use client";

import { useCurrency } from "../context/CurrencyContext";
import ExpenseTracker from "./ExpenseTracker";
import { FiPieChart } from "react-icons/fi";

export default function FinancialDashboard({ trip }) {
  const { symbol, convert } = useCurrency();
  const { flights, accommodation, food, activities, total } =
    trip.estimatedBudget || {};

  return (
    <div className="space-y-6">
      {/* AI Budget Breakdown Card */}
      <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm">
        <h3 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
          <FiPieChart className="text-brand-accent" /> AI Budget Breakdown
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-brand-border">
            <span className="text-brand-muted font-medium">Flights</span>
            <span className="font-bold text-brand-text">
              {symbol}
              {convert(flights || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-brand-border">
            <span className="text-brand-muted font-medium">Accommodation</span>
            <span className="font-bold text-brand-text">
              {symbol}
              {convert(accommodation || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-brand-border">
            <span className="text-brand-muted font-medium">Food</span>
            <span className="font-bold text-brand-text">
              {symbol}
              {convert(food || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-brand-border">
            <span className="text-brand-muted font-medium">Activities</span>
            <span className="font-bold text-brand-text">
              {symbol}
              {convert(activities || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-extrabold text-brand-text">
              Estimated Total
            </span>
            <span className="text-xl font-extrabold text-brand-accent">
              {symbol}
              {convert(total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Actual Expense Tracker Component */}
      <ExpenseTracker
        tripId={trip._id}
        estimatedTotal={total || 0}
        initialExpenses={trip.actualExpenses}
      />
    </div>
  );
}
