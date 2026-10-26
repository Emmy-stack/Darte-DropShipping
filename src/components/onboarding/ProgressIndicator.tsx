"use client";

import React from "react";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  stepLabels: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps = 3,
  stepLabels,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-8 px-2">
      <div className="relative flex items-center justify-between">
        {/* Continuous connector line */}
        <div
          className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#E5E7EB] -translate-y-1/2 -z-0"
          aria-hidden="true"
        >
          {/* Active progress fill */}
          <div
            className="h-full bg-[#16A34A] transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>

        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
                  isCompleted
                    ? "bg-[#16A34A] text-white border-[#16A34A]"
                    : isActive
                    ? "bg-[#0B3D2E] text-white border-[#16A34A] shadow-md shadow-[#0B3D2E]/20 scale-105"
                    : "bg-white text-[#9CA3AF] border-[#E5E7EB]"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 whitespace-nowrap hidden sm:block ${
                  isActive
                    ? "text-[#0B3D2E]"
                    : isCompleted
                    ? "text-[#16A34A]"
                    : "text-[#9CA3AF]"
                }`}
              >
                {stepLabels[index] || `Step ${stepNum}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
