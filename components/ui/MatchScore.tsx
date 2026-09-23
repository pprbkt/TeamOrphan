"use client";

import React, { useState } from "react";
import { MatchResult } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { Zap, ChevronDown, ChevronUp, Check, X } from "lucide-react";

export interface MatchScoreProps {
  match: MatchResult;
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  match,
  size = "md",
  showBreakdown = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-brutal-green text-black";
    if (score >= 50) return "bg-brutal-yellow text-black";
    return "bg-neutral-200 text-neutral-700";
  };

  return (
    <div className={cn("inline-flex flex-col gap-2 font-heading", className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "inline-flex items-center gap-1.5 border-2 border-black font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer transition-transform hover:-translate-y-0.5",
          getScoreColor(match.score),
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3.5 py-1.5 text-sm"
        )}
      >
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span>{match.score}% MATCH</span>
        {showBreakdown && (
          <span className="ml-0.5">
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
            )}
          </span>
        )}
      </button>

      {showBreakdown && expanded && (
        <div className="border-2 border-black bg-white p-3 shadow-brutal text-left text-xs max-w-xs space-y-2 z-10 animate-in fade-in slide-in-from-top-1">
          <div className="font-black uppercase tracking-wider text-neutral-800 border-b-2 border-black pb-1">
            Why this is a {match.score}% match:
          </div>
          <div className="space-y-1.5">
            {match.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1 font-bold">
                  {item.matched ? (
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[3] shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-neutral-400 stroke-[3] shrink-0" />
                  )}
                  <span>{item.category}:</span>
                </div>
                <span className="font-medium text-neutral-600 text-[11px] text-right">
                  {item.details}
                </span>
              </div>
            ))}
          </div>

          {match.highlightTags && match.highlightTags.length > 0 && (
            <div className="pt-2 border-t border-neutral-200 flex flex-wrap gap-1">
              {match.highlightTags.map((tag, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 border border-black",
                    tag.matched ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {tag.tag} {tag.matched ? "✓" : "✗"}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
