import React from "react";
import Link from "next/link";
import { BrutalCard } from "../ui/BrutalCard";
import { Countdown } from "../ui/Countdown";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";

export interface EventCardData {
  id: string;
  name: string;
  description: string;
  category: string;
  startDate: Date | string;
  location: string;
  mode: string;
  _count?: { teams: number };
}

export interface EventCardProps {
  event: EventCardData;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const catStyle = getCategoryColor(event.category);

  return (
    <BrutalCard
      variant="white"
      shadowSize="md"
      interactive
      className={`flex flex-col justify-between h-full group ${className || ""}`}
    >
      <div className="space-y-3">
        {/* Category & Mode */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider ${catStyle.bg} ${catStyle.text}`}
          >
            {event.category}
          </span>
          <span className="border-2 border-black bg-neutral-100 px-2 py-0.5 text-[11px] font-black uppercase">
            {event.mode}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-heading text-lg font-black uppercase text-black line-clamp-1 group-hover:text-brutal-pink transition-colors">
            {event.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="space-y-1.5 border-t-2 border-black/20 pt-2 text-xs font-bold text-neutral-700">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-black shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-black shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-black shrink-0" />
            <span>{event._count?.teams ?? 0} Teams looking for members</span>
          </div>
        </div>
      </div>

      {/* Countdown & Action */}
      <div className="mt-4 pt-3 border-t-2 border-black space-y-2">
        <Countdown startDate={event.startDate} variant="badge" className="w-full justify-center" />

        <Link href={`/events/${event.id}`} className="block">
          <button
            type="button"
            className="w-full border-3 border-black bg-brutal-cyan py-2 text-center font-heading text-xs font-black uppercase tracking-wider text-black shadow-brutal hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            BROWSE TEAMS →
          </button>
        </Link>
      </div>
    </BrutalCard>
  );
};
