"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext(null);

// Static exchange rates relative to USD (Base)
const RATES = {
  USD: { rate: 1, symbol: "$" },
  EUR: { rate: 0.92, symbol: "€" },
  GBP: { rate: 0.79, symbol: "£" },
  INR: { rate: 83.15, symbol: "₹" },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency");
    if (saved && RATES[saved]) setCurrency(saved);
  }, []);

  const changeCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem("preferred_currency", code);
  };

  // Helper function to be used inside components
  const convert = (amountInUSD) => {
    const converted = amountInUSD * RATES[currency].rate;
    // Format to 0 decimal places for large numbers, or 2 for exact
    return Math.round(converted).toLocaleString();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: RATES[currency].symbol,
        changeCurrency,
        convert,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
