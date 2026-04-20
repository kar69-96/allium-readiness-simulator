"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Searching public filings…",
  "Analyzing payment corridors…",
  "Modeling cross-border exposure…",
  "Calculating revenue unlock…",
  "Generating your report…",
];

export default function LoadingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-2">
        {STEPS.map((step, i) => (
          <p
            key={step}
            className={`text-sm transition-all duration-500 ${
              i < currentStep
                ? "text-gray-600 line-through"
                : i === currentStep
                ? "text-emerald-400 font-medium"
                : "text-gray-700"
            }`}
          >
            {i < currentStep ? "✓ " : i === currentStep ? "→ " : "  "}
            {step}
          </p>
        ))}
      </div>
      <p className="text-xs text-gray-600">This takes 15–30 seconds</p>
    </div>
  );
}
