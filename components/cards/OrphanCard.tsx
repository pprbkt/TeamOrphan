import React from "react";
import Link from "next/link";
import { BrutalCard } from "../ui/BrutalCard";
import { Avatar } from "../ui/Avatar";
import { SkillTag } from "../ui/SkillTag";
import { MatchScore } from "../ui/MatchScore";
import { parseJsonArray } from "@/lib/utils";
import { MatchResult } from "@/lib/matching";
import { MapPin, GraduationCap, CheckCircle2 } from "lucide-react";

export interface OrphanListingData {
  id: string;
  skills: string | string[];
  bio: string;
  availability: string | null;
  experience: string | null;
  location: string | null;
  mode: string;
  targetCategory?: string | null;
  targetEvent?: { id: string; name: string; category: string } | null;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
    college?: string | null;
    location?: string | null;
  };
}

export interface OrphanCardProps {
  listing: OrphanListingData;
  match?: MatchResult | null;
  className?: string;
}

export const OrphanCard: React.FC<OrphanCardProps> = ({ listing, match, className }) => {
  const skills = Array.isArray(listing.skills)
    ? listing.skills
    : parseJsonArray(listing.skills);

  return (
    <BrutalCard
      variant="white"
      shadowSize="md"
      interactive
      className={`flex flex-col justify-between h-full group ${className || ""}`}
    >
      <div className="space-y-3">
        {/* Header with Avatar & Match */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar name={listing.user.name} src={listing.user.avatar} size="md" />
            <div>
              <h4 className="font-heading text-base font-black uppercase text-black group-hover:text-brutal-pink transition-colors">
                {listing.user.name}
              </h4>
              <p className="text-xs font-bold text-neutral-500">@{listing.user.username}</p>
            </div>
          </div>
          {match && <MatchScore match={match} size="sm" showBreakdown />}
        </div>

        {/* Education & Location */}
        <div className="space-y-1 text-xs font-semibold text-neutral-700">
          {listing.user.college && (
            <div className="flex items-center gap-1.5 line-clamp-1">
              <GraduationCap className="w-4 h-4 text-black shrink-0" />
              <span>{listing.user.college}</span>
            </div>
          )}
          {(listing.location || listing.user.location) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-black shrink-0" />
              <span>{listing.location || listing.user.location} • {listing.mode}</span>
            </div>
          )}
        </div>

        {/* Availability Badge */}
        {listing.availability && (
          <div className="inline-flex items-center gap-1 border-2 border-black bg-green-100 px-2 py-0.5 text-[11px] font-black uppercase text-green-900">
            <CheckCircle2 className="w-3 h-3" />
            {listing.availability}
          </div>
        )}

        {/* Bio Quote */}
        <p className="border-l-3 border-black bg-neutral-50 p-2 text-xs italic text-neutral-800 line-clamp-2">
          &ldquo;{listing.bio}&rdquo;
        </p>

        {/* Skills */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 mb-1.5">
            Can help with:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill, idx) => (
              <SkillTag key={idx} skill={skill} size="sm" />
            ))}
            {skills.length > 5 && (
              <span className="text-[11px] font-bold self-center text-neutral-500">
                +{skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t-2 border-black">
        <Link href={`/profile/${listing.user.username}`} className="block">
          <button
            type="button"
            className="w-full border-3 border-black bg-brutal-green py-2 text-center font-heading text-xs font-black uppercase tracking-wider text-black shadow-brutal hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            VIEW PROFILE & CONTACT →
          </button>
        </Link>
      </div>
    </BrutalCard>
  );
};
