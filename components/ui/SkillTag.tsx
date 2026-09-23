import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export interface SkillTagProps {
  skill: string;
  matched?: boolean | null;
  size?: "sm" | "md";
  className?: string;
  onRemove?: () => void;
}

export const SkillTag: React.FC<SkillTagProps> = ({
  skill,
  matched = null,
  size = "md",
  className,
  onRemove,
}) => {
  const isMatch = matched === true;
  const isMismatch = matched === false;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-heading border-2 border-black font-bold uppercase transition-all",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        isMatch
          ? "bg-brutal-green text-black shadow-[2px_2px_0px_#000]"
          : isMismatch
          ? "bg-neutral-200 text-neutral-600 line-through border-neutral-400"
          : "bg-white text-black shadow-[2px_2px_0px_#000]",
        className
      )}
    >
      {isMatch && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
      <span>{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-sm hover:bg-black hover:text-white p-0.5 transition-colors"
        >
          <X className="w-3 h-3 stroke-[3]" />
        </button>
      )}
    </span>
  );
};
