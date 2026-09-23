import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { TeamCard } from "@/components/cards/TeamCard";
import { OrphanCard } from "@/components/cards/OrphanCard";
import { EventCard } from "@/components/cards/EventCard";
import { Avatar } from "@/components/ui/Avatar";
import { SkillTag } from "@/components/ui/SkillTag";
import { calculateCompatibility } from "@/lib/matching";
import { parseJsonArray } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Users,
  Compass,
  Zap,
  Flame,
  Clock,
  Sparkles,
  Inbox,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const userSkills = parseJsonArray(user.skills);
  const userInterests = parseJsonArray(user.interests);

  // 1. Fetch user's created teams with join requests
  const myTeams = await db.team.findMany({
    where: { creatorId: user.id },
    include: {
      event: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      joinRequests: {
        where: { status: "PENDING" },
        include: { user: true },
      },
      _count: { select: { members: true, joinRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch teams where user is a member (but not leader)
  const memberTeams = await db.team.findMany({
    where: {
      creatorId: { not: user.id },
      members: { some: { userId: user.id } },
    },
    include: {
      event: true,
      creator: { select: { name: true, avatar: true } },
      members: { include: { user: true } },
      _count: { select: { members: true } },
    },
  });

  // 3. Fetch user's orphan listings
  const myOrphanListings = await db.orphanListing.findMany({
    where: { userId: user.id },
    include: { targetEvent: true },
    orderBy: { createdAt: "desc" },
  });

  // 4. Fetch user's submitted join requests
  const mySentRequests = await db.joinRequest.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          event: true,
          creator: { select: { name: true, username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 5. Calculate Recommended Teams for this user
  const openOtherTeams = await db.team.findMany({
    where: {
      creatorId: { not: user.id },
      status: "OPEN",
      members: { none: { userId: user.id } },
    },
    include: {
      event: true,
      creator: { select: { id: true, name: true, username: true, avatar: true } },
      members: { include: { user: true } },
      _count: { select: { members: true } },
    },
    take: 10,
  });

  const recommendedTeams = openOtherTeams
    .map((team) => {
      const match = calculateCompatibility(
        {
          skills: user.skills,
          interests: user.interests,
          location: user.location,
        },
        {
          requiredSkills: team.requiredSkills,
          preferredSkills: team.preferredSkills,
          category: team.event.category,
          location: team.event.location,
          mode: team.event.mode,
        }
      );
      return { team, match };
    })
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);

  // 6. Calculate Recommended Members for user's teams
  const activeOrphans = await db.orphanListing.findMany({
    where: {
      userId: { not: user.id },
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          college: true,
          location: true,
          skills: true,
          interests: true,
        },
      },
      targetEvent: true,
    },
    take: 6,
  });

  const recommendedOrphans = activeOrphans
    .map((orphan) => {
      let bestMatch: any = null;
      let highestScore = 0;

      if (myTeams.length > 0) {
        myTeams.forEach((team) => {
          const match = calculateCompatibility(
            {
              skills: orphan.skills,
              interests: orphan.user.interests,
              location: orphan.location || orphan.user.location,
              mode: orphan.mode,
              availability: orphan.availability,
              categoryPreference: orphan.targetCategory,
            },
            {
              requiredSkills: team.requiredSkills,
              preferredSkills: team.preferredSkills,
              category: team.event.category,
              location: team.event.location,
              mode: team.event.mode,
            }
          );
          if (match.score > highestScore) {
            highestScore = match.score;
            bestMatch = match;
          }
        });
      } else {
        bestMatch = calculateCompatibility(
          {
            skills: orphan.skills,
            interests: orphan.user.interests,
            location: orphan.location,
          },
          {
            requiredSkills: user.skills,
            category: "Hackathon",
          }
        );
      }

      return { orphan, match: bestMatch };
    })
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
    .slice(0, 3);

  // Total pending requests on my teams
  const totalPendingOnMyTeams = myTeams.reduce(
    (acc, t) => acc + (t.joinRequests ? t.joinRequests.length : 0),
    0
  );

  return (
    <div className="py-8 px-4 sm:px-6 space-y-10 max-w-7xl mx-auto">
      {/* 1. WELCOME HEADER */}
      <div className="border-4 border-black bg-brutal-yellow p-6 sm:p-8 shadow-brutal-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatar} size="lg" />
            <div>
              <div className="font-heading text-xs font-black uppercase tracking-widest text-neutral-800">
                COMMAND CENTER
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl font-black uppercase text-black">
                HELLO, {user.name.toUpperCase()}!
              </h1>
              <p className="text-xs font-bold text-neutral-700 mt-0.5">
                @{user.username} • {user.college || user.location || "Student Builder"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/profile/${user.username}`}>
              <BrutalButton variant="white" size="sm">
                View My Profile
              </BrutalButton>
            </Link>
            <Link href="/discover">
              <BrutalButton variant="black" size="sm">
                <Compass className="w-4 h-4" />
                Discover
              </BrutalButton>
            </Link>
          </div>
        </div>

        {/* User Skills Badges */}
        <div className="mt-4 pt-4 border-t-2 border-black flex flex-wrap items-center gap-2">
          <span className="font-heading text-xs font-black uppercase text-black mr-2">
            Your Match Stack:
          </span>
          {userSkills.map((s, idx) => (
            <SkillTag key={idx} skill={s} size="sm" />
          ))}
        </div>
      </div>

      {/* 2. QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/create/team" className="block">
          <button className="w-full border-4 border-black bg-brutal-yellow p-4 text-left font-heading shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-transform active:translate-x-0 active:translate-y-0">
            <div className="text-2xl font-black text-black">+ CREATE TEAM</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">
              Have an upcoming event? Post missing spots (e.g. 3/4).
            </div>
          </button>
        </Link>

        <Link href="/create/orphan" className="block">
          <button className="w-full border-4 border-black bg-brutal-green p-4 text-left font-heading shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-transform active:translate-x-0 active:translate-y-0">
            <div className="text-2xl font-black text-black">+ LOOKING FOR TEAM</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">
              Say you&apos;re available so teams can invite you.
            </div>
          </button>
        </Link>

        <Link href="/discover" className="block">
          <button className="w-full border-4 border-black bg-brutal-cyan p-4 text-left font-heading shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-transform active:translate-x-0 active:translate-y-0">
            <div className="text-2xl font-black text-black">🔍 BROWSE MARKET</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">
              Explore hackathons, contests, and sports listings.
            </div>
          </button>
        </Link>
      </div>

      {/* 3. YOUR CREATED TEAMS & INCOMING REQUESTS */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-black pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 stroke-[3] text-black" />
            <h2 className="font-heading text-2xl font-black uppercase text-black">
              YOUR CREATED TEAMS ({myTeams.length})
            </h2>
          </div>
          {totalPendingOnMyTeams > 0 && (
            <span className="border-2 border-black bg-brutal-pink text-white px-3 py-1 font-heading text-xs font-black uppercase animate-pulse shadow-[2px_2px_0px_#000]">
              🔥 {totalPendingOnMyTeams} PENDING JOIN REQUEST(S)
            </span>
          )}
        </div>

        {myTeams.length === 0 ? (
          <BrutalCard variant="muted" shadowSize="sm" className="text-center py-8 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-neutral-600 stroke-[2]" />
            <h3 className="font-heading text-lg font-black uppercase text-black">
              NO TEAMS CREATED YET
            </h3>
            <p className="text-xs font-bold text-neutral-600 max-w-sm mx-auto">
              If your squad is short a member for an upcoming event, create a listing now.
            </p>
            <Link href="/create/team" className="inline-block pt-2">
              <BrutalButton variant="yellow" size="sm">
                + Post Team Need
              </BrutalButton>
            </Link>
          </BrutalCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTeams.map((team) => (
              <TeamCard key={team.id} team={team as any} />
            ))}
          </div>
        )}
      </div>

      {/* 4. RECOMMENDED TEAMS MATCHED FOR YOU */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-3 border-black pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 stroke-[3] text-brutal-pink fill-current" />
            <h2 className="font-heading text-2xl font-black uppercase text-black">
              RECOMMENDED FOR YOUR SKILLS
            </h2>
          </div>
          <Link href="/discover?tab=teams">
            <span className="font-heading text-xs font-black uppercase text-neutral-700 hover:underline">
              See All Matches →
            </span>
          </Link>
        </div>

        {recommendedTeams.length === 0 ? (
          <p className="text-xs font-bold text-neutral-500">
            No recommended teams right now. Try updating your skills in profile!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedTeams.map(({ team, match }) => (
              <TeamCard key={team.id} team={team as any} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* 5. RECOMMENDED CANDIDATES / ORPHANS FOR YOU */}
      {myTeams.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-3 border-black pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 stroke-[3] text-brutal-green" />
              <h2 className="font-heading text-2xl font-black uppercase text-black">
                MATCHED ORPHANS FOR YOUR SQUADS
              </h2>
            </div>
            <Link href="/discover?tab=orphans">
              <span className="font-heading text-xs font-black uppercase text-neutral-700 hover:underline">
                Browse All Orphans →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedOrphans.map(({ orphan, match }) => (
              <OrphanCard key={orphan.id} listing={orphan as any} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* 6. YOUR SENT JOIN REQUESTS */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-black uppercase text-black border-b-2 border-black pb-2">
          Your Sent Join Requests ({mySentRequests.length})
        </h2>

        {mySentRequests.length === 0 ? (
          <p className="text-xs font-semibold text-neutral-500">
            You haven&apos;t requested to join any teams yet.
          </p>
        ) : (
          <div className="space-y-3">
            {mySentRequests.map((req) => (
              <div
                key={req.id}
                className="border-2 border-black bg-white p-3 flex flex-wrap items-center justify-between gap-4 shadow-brutal-sm"
              >
                <div>
                  <div className="text-[11px] font-bold text-neutral-500">
                    {req.team.event.name}
                  </div>
                  <div className="font-heading text-base font-black uppercase text-black">
                    {req.team.name}
                  </div>
                  {req.message && (
                    <div className="text-xs italic text-neutral-700 mt-0.5 line-clamp-1">
                      &ldquo;{req.message}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`border-2 border-black px-2.5 py-1 text-xs font-black uppercase ${
                      req.status === "PENDING"
                        ? "bg-brutal-yellow text-black"
                        : req.status === "ACCEPTED"
                        ? "bg-brutal-green text-black"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {req.status}
                  </span>
                  <Link href={`/teams/${req.team.id}`}>
                    <BrutalButton variant="white" size="sm">
                      View Team
                    </BrutalButton>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
