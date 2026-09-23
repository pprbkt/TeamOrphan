import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatDate(date: Date | string | number) {
  const d = new Date(date);
  return format(d, "MMM dd, yyyy • h:mm a");
}

export function formatTimeAgo(date: Date | string | number) {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Hackathon: { bg: "bg-brutal-yellow", text: "text-black", border: "border-black" },
  "Coding Contest": { bg: "bg-brutal-cyan", text: "text-black", border: "border-black" },
  Sports: { bg: "bg-brutal-green", text: "text-black", border: "border-black" },
  Gaming: { bg: "bg-brutal-purple", text: "text-black", border: "border-black" },
  Robotics: { bg: "bg-brutal-pink", text: "text-black", border: "border-black" },
  "College Fest": { bg: "bg-brutal-orange", text: "text-black", border: "border-black" },
  Debate: { bg: "bg-yellow-300", text: "text-black", border: "border-black" },
};

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || { bg: "bg-brutal-yellow", text: "text-black", border: "border-black" };
}
