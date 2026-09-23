"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { Avatar } from "@/components/ui/Avatar";
import { SkillTag } from "@/components/ui/SkillTag";
import { MatchScore } from "@/components/ui/MatchScore";
import { MessageModal } from "@/components/modals/MessageModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { parseJsonArray, formatDate } from "@/lib/utils";
import { MatchResult } from "@/lib/matching";
import {
  GraduationCap,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Users,
  Trophy,
  Calendar,
  Sparkles,
} from "lucide-react";

interface ProfileClientProps {
  profileUser: any;
  currentUser: any;
  userMatch: MatchResult | null;
}

export const ProfileClient: React.FC<ProfileClientProps> = ({
  profileUser,
  currentUser,
  userMatch,
}) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const skills = parseJsonArray(profileUser.skills);
  const interests = parseJsonArray(profileUser.interests);
  const isMe = currentUser && currentUser.id === profileUser.id;

  return (
    <div className="space-y-10">
      {/* Profile Header Box */}
      <div className="border-4 border-black bg-white p-6 sm:p-10 shadow-brutal-xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar name={profileUser.name} src={profileUser.avatar} size="xl" />
            <div className="space-y-1">
              <div className="inline-block border-2 border-black bg-brutal-yellow px-2 py-0.5 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000]">
                {profileUser.role === "ADMIN" ? "🛡️ PLATFORM MODERATOR" : "STUDENT BUILDER"}
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase text-black">
                {profileUser.name}
              </h1>
              <div className="text-sm font-bold text-neutral-600">
                @{profileUser.username}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {userMatch && <MatchScore match={userMatch} size="md" showBreakdown />}

            {!isMe && currentUser && (
              <>
                <BrutalButton
                  variant="yellow"
                  size="md"
                  onClick={() => setIsMessageOpen(true)}
                >
                  <MessageSquare className="w-4 h-4" />
                  MESSAGE
                </BrutalButton>
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="border-2 border-black bg-neutral-100 p-2.5 text-xs font-bold text-neutral-700 hover:bg-red-100 hover:text-red-700 transition-colors shadow-brutal-sm"
                  title="Report User"
                >
                  <ShieldAlert className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Education & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y-3 border-black py-4 text-xs font-bold text-neutral-800">
          {profileUser.college && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-black" />
              <span>{profileUser.college}</span>
            </div>
          )}
          {profileUser.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-black" />
              <span>{profileUser.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <div className="border-l-4 border-black bg-yellow-50 p-4">
            <p className="text-sm font-medium italic text-neutral-900">
              &ldquo;{profileUser.bio}&rdquo;
            </p>
          </div>
        )}

        {/* Skills */}
        <div className="space-y-2">
          <div className="font-heading text-xs font-black uppercase tracking-wider text-black">
            Verified Skills:
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s: string, idx: number) => (
              <SkillTag key={idx} skill={s} size="md" />
            ))}
          </div>
        </div>

        {/* Interests */}
        {interests.length > 0 && (
          <div className="space-y-2">
            <div className="font-heading text-xs font-black uppercase tracking-wider text-neutral-600">
              Event Interests:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((int: string, idx: number) => (
                <span
                  key={idx}
                  className="border-2 border-black bg-cyan-100 px-2.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]"
                >
                  {int}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Teams History */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b-3 border-black pb-3">
          <Trophy className="w-6 h-6 stroke-[3] text-black" />
          <h2 className="font-heading text-2xl font-black uppercase text-black">
            TEAMS & SQUADS ({profileUser.memberships?.length || 0})
          </h2>
        </div>

        {!profileUser.memberships || profileUser.memberships.length === 0 ? (
          <BrutalCard variant="muted" shadowSize="sm" className="py-8 text-center text-xs font-bold text-neutral-600">
            No team participations recorded yet.
          </BrutalCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileUser.memberships.map((m: any) => (
              <BrutalCard key={m.id} variant="white" shadowSize="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="border-2 border-black bg-brutal-yellow px-2 py-0.5 text-xs font-black uppercase">
                    {m.team.event.category}
                  </span>
                  <span className="text-xs font-bold text-neutral-500">
                    Role: {m.role}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-neutral-500">
                    {m.team.event.name}
                  </div>
                  <h4 className="font-heading text-lg font-black uppercase text-black">
                    {m.team.name}
                  </h4>
                </div>

                <div className="text-xs font-semibold text-neutral-600">
                  Joined {formatDate(m.joinedAt)}
                </div>

                <div className="pt-2 border-t border-black/20">
                  <Link href={`/teams/${m.team.id}`} className="block">
                    <BrutalButton variant="yellow" size="sm" className="w-full">
                      View Team →
                    </BrutalButton>
                  </Link>
                </div>
              </BrutalCard>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {!isMe && currentUser && (
        <>
          <MessageModal
            isOpen={isMessageOpen}
            onClose={() => setIsMessageOpen(false)}
            receiverId={profileUser.id}
            receiverName={profileUser.name}
          />
          <ReportModal
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            reportedUserId={profileUser.id}
            targetName={`User @${profileUser.username}`}
          />
        </>
      )}
    </div>
  );
};
