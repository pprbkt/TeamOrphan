"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrutalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const BrutalModal: React.FC<BrutalModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full border-4 border-black bg-white p-6 shadow-brutal-xl z-10 animate-in zoom-in-95 duration-150",
          maxWidthMap[maxWidth]
        )}
      >
        <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
          <h3 className="font-heading text-lg font-black uppercase tracking-tight text-black">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-brutal-pink p-1 text-white hover:bg-black transition-colors shadow-[2px_2px_0px_#000]"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
