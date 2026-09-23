"use client";

import React, { useEffect, useState } from "react";
import { getRecruitmentStatus, RecruitmentStatus } from "@/lib/cutoff";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface CountdownProps {
  startDate: Date | string;
  variant?: "badge" | "card" | "banner";
  className?: string;
  showDetails?: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  startDate,
  variant = "badge",
  className,
  showDetails = false,
}) => {
  const [status, setStatus] = useState<RecruitmentStatus>(() =>
    getRecruitmentStatus(startDate)
  );

  useEffect(() => {
    // Initial check
    setStatus(getRecruitmentStatus(startDate));

    // Update every 10 seconds for live countdown
    const interval = setInterval(() => {
      setStatus(getRecruitmentStatus(startDate));
    }, 10000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (variant === "badge") {
    if (status.isClosed) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 border-2 border-black bg-neutral-200 px-2.5 py-1 text-xs font-black tracking-wider uppercase text-neutral-700 shadow-[2px_2px_0px_#000]",
            className
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-neutral-800" />
          {status.formattedRemaining}
        </span>
      );
    }

    if (status.isUrgent) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 border-2 border-black bg-brutal-pink px-2.5 py-1 text-xs font-black tracking-wider uppercase text-white shadow-[2px_2px_0px_#000] animate-pulse",
            className
          )}
        >
          <Clock className="w-3.5 h-3.5 text-white animate-spin" />
          ⏱ {status.formattedRemaining}
        </span>
      );
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border-2 border-black bg-brutal-yellow px-2.5 py-1 text-xs font-black tracking-wider uppercase text-black shadow-[2px_2px_0px_#000]",
          className
        )}
      >
        <Clock className="w-3.5 h-3.5 text-black" />
        ⏱ {status.formattedRemaining}
      </span>
    );
  }

  // Variant === "banner" or "card"
  return (
    <div
      className={cn(
        "border-3 border-black p-4 relative font-heading",
        status.isClosed
          ? "bg-neutral-200 text-neutral-800"
          : status.isUrgent
          ? "bg-brutal-pink text-white shadow-brutal"
          : "bg-brutal-yellow text-black shadow-brutal",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {status.isClosed ? (
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <Clock className="w-6 h-6 stroke-[2.5] animate-bounce" />
          )}
          <div>
            <div className="text-xs font-black uppercase tracking-wider">
              {status.isClosed
                ? "Recruitment Window Status"
                : "24-Hour Cutoff Countdown"}
            </div>
            <div className="text-xl font-black uppercase">
              {status.formattedRemaining}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="text-xs font-bold text-right">
            <div>
              Cutoff:{" "}
              <span className="underline">
                {new Date(status.cutoffDate).toLocaleDateString()} at{" "}
                {new Date(status.cutoffDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div>
              Event starts:{" "}
              {new Date(status.startDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {status.isClosed && (
        <p className="mt-2 text-xs font-bold bg-black text-white px-2 py-1 inline-block">
          Recruitment automatically closed 24h prior to event kickoff.
        </p>
      )}
    </div>
  );
};
