"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiDollarSign,
  FiArrowLeft,
  FiGlobe,
} from "react-icons/fi";
// Import the hook from wherever your context file is located
import { useCurrency } from "../context/CurrencyContext";

export default function FinancialAnalysisPage({ trip }) {
  // Pull currency tools from context
  const { currency, symbol, changeCurrency, convert } = useCurrency();

  // 1. Core Calculation Engine
  // We keep all internal math in the BASE currency (USD) to ensure accuracy.
  const analysis = useMemo(() => {
    if (!trip || !trip.estimatedBudget || !trip.actualExpenses) return null;

    const { estimatedBudget, actualExpenses } = trip;
    const categories = [
      "flights",
      "accommodation",
      "food",
      "activities",
      "other",
    ];

    const breakdown = categories.reduce((acc, cat) => {
      acc[cat] = {
        estimated: estimatedBudget[cat] || 0,
        actual: 0,
        variance: 0,
        percentageUsed: 0,
        status: "on-track",
      };
      return acc;
    }, {});

    let totalActual = 0;
    actualExpenses.forEach((expense) => {
      const normalizedCategory = expense.category.toLowerCase();
      if (breakdown[normalizedCategory]) {
        breakdown[normalizedCategory].actual += expense.amount;
        totalActual += expense.amount;
      }
    });

    let totalEstimated = estimatedBudget.total || 0;

    Object.keys(breakdown).forEach((cat) => {
      const data = breakdown[cat];
      data.variance = data.estimated - data.actual;

      if (data.estimated > 0) {
        data.percentageUsed = Math.min(
          (data.actual / data.estimated) * 100,
          100,
        );
      } else if (data.actual > 0) {
        data.percentageUsed = 100;
      }

      if (data.actual > data.estimated) data.status = "over";
      else if (data.actual < data.estimated * 0.8) data.status = "under";
    });

    const totalVariance = totalEstimated - totalActual;

    return {
      totalEstimated,
      totalActual,
      totalVariance,
      breakdown,
    };
  }, [trip]);

  if (!analysis) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading financial data...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 p-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between mb-2">
        <Link
          href={`/expenses`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <FiArrowLeft /> Back to Itinerary
        </Link>

        {/* Currency Selector */}
        <div className="flex lg:hidden items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
          <FiGlobe className="text-gray-400" />
          <select
            value={currency}
            onChange={(e) => changeCurrency(e.target.value)}
            className="text-sm font-bold text-gray-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>

      {/* Title block */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-6">
          <FiPieChart className="text-indigo-600" /> Budget Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Estimated Budget
            </p>
            {/* Replaced raw number with context conversion */}
            <p className="text-3xl font-black text-gray-900">
              {symbol}
              {convert(analysis.totalEstimated)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Actual Spend
            </p>
            <p className="text-3xl font-black text-gray-900">
              {symbol}
              {convert(analysis.totalActual)}
            </p>
          </div>
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              analysis.totalVariance >= 0
                ? "bg-emerald-50 border-emerald-100"
                : "bg-red-50 border-red-100"
            }`}
          >
            <p
              className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                analysis.totalVariance >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {analysis.totalVariance >= 0 ? "Total Savings" : "Over Budget"}
            </p>
            <p
              className={`text-3xl font-black flex items-center gap-2 ${
                analysis.totalVariance >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {analysis.totalVariance >= 0 ? (
                <FiTrendingDown />
              ) : (
                <FiTrendingUp />
              )}
              {symbol}
              {convert(Math.abs(analysis.totalVariance))}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiDollarSign className="text-gray-400" /> Spend by Category
        </h3>

        <div className="space-y-6">
          {Object.entries(analysis.breakdown).map(([category, data]) => {
            if (
              category === "other" &&
              data.estimated === 0 &&
              data.actual === 0
            )
              return null;

            return (
              <div key={category}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-gray-800 capitalize">
                      {category}
                    </p>
                    <p className="text-xs text-gray-500">
                      Est: {symbol}
                      {convert(data.estimated)} | Act: {symbol}
                      {convert(data.actual)}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      data.status === "over"
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {data.status === "over" ? "Over by " : "Saved "}
                    {symbol}
                    {convert(Math.abs(data.variance))}
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      data.status === "over"
                        ? "bg-red-500"
                        : data.status === "under"
                          ? "bg-emerald-400"
                          : "bg-indigo-500"
                    }`}
                    style={{ width: `${data.percentageUsed}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights Placeholder */}
      {/* <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 mb-1">
            Want deeper insights?
          </h3>
          <p className="text-sm text-gray-600">
            Have our AI analyze your spending patterns and suggest adjustments.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap">
          Generate AI Report ✨
        </button>
      </div> */}
    </div>
  );
}
