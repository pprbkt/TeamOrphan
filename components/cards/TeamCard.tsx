import React from "react";
import Link from "next/link";
import { BrutalCard } from "../ui/BrutalCard";
import { BrutalBadge } from "../ui/BrutalBadge";
import { Countdown } from "../ui/Countdown";
import { SkillTag } from "../ui/SkillTag";
import { MatchScore } from "../ui/MatchScore";
import { parseJsonArray, getCategoryColor } from "@/lib/utils";
import { MatchResult } from "@/lib/matching";
import { Users, MapPin } from "lucide-react";

export interface TeamCardData {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  requiredSkills: string | string[];
  status: string;
  event: {
    id: string;
    name: string;
    category: string;
    startDate: Date | string;
    location: string;
    mode: string;
  };
  members?: { id: string; user: { name: string; avatar?: string | null } }[];
  _count?: { members: number };
}

export interface TeamCardProps {
  team: TeamCardData;
  match?: MatchResult | null;
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, match, className }) => {
  const currentMembers = team.members ? team.members.length : (team._count?.members ?? 1);
  const neededMembers = Math.max(0, team.maxMembers - currentMembers);
  const skills = Array.isArray(team.requiredSkills)
    ? team.requiredSkills
    : parseJsonArray(team.requiredSkills);

  const catStyle = getCategoryColor(team.event.category);

  return (
    <BrutalCard
      variant="white"
      shadowSize="md"
      interactive
      className={`flex flex-col justify-between h-full group ${className || ""}`}
    >
      <div className="space-y-3">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider ${catStyle.bg} ${catStyle.text}`}
            >
              {team.event.category}
            </span>
            {team.event.mode && (
              <span className="border-2 border-black bg-white px-2 py-0.5 text-[11px] font-black uppercase">
                {team.event.mode}
              </span>
            )}
          </div>
          {match && <MatchScore match={match} size="sm" showBreakdown />}
        </div>

        {/* Team & Event Name */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-neutral-500">
            {team.event.name}
          </div>
          <h3 className="font-heading text-lg font-black uppercase text-black line-clamp-1 group-hover:text-brutal-pink transition-colors">
            {team.name}
          </h3>
        </div>

        {/* Member Count Box */}
        <div className="border-2 border-black bg-yellow-50 p-2.5 flex items-center justify-between shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 stroke-[2.5] text-black" />
            <span className="font-heading text-xs font-black uppercase">
              {currentMembers} / {team.maxMembers} MEMBERS
            </span>
          </div>
          <span className="border-2 border-black bg-brutal-pink px-2 py-0.5 text-[11px] font-black uppercase text-white">
            NEED {neededMembers} {neededMembers === 1 ? "PERSON" : "PEOPLE"}
          </span>
        </div>

        {/* Required Skills */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 mb-1.5">
            Required Skills:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((skill, idx) => (
              <SkillTag key={idx} skill={skill} size="sm" />
            ))}
            {skills.length > 4 && (
              <span className="text-[11px] font-bold self-center text-neutral-500">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Urgency Countdown & Action Button */}
      <div className="mt-4 pt-3 border-t-2 border-black space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-neutral-600">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{team.event.location}</span>
          </div>
          <Countdown startDate={team.event.startDate} variant="badge" />
        </div>

        <Link href={`/teams/${team.id}`} className="block">
          <button
            type="button"
            className="w-full border-3 border-black bg-brutal-yellow py-2 text-center font-heading text-xs font-black uppercase tracking-wider text-black shadow-brutal hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            VIEW TEAM →
          </button>
        </Link>
      </div>
    </BrutalCard>
  );
};
