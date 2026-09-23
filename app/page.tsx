import Link from "next/link";
import { db } from "@/lib/db";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { OrphanCard } from "@/components/cards/OrphanCard";
import { Countdown } from "@/components/ui/Countdown";
import { parseJsonArray } from "@/lib/utils";
import {
  Users,
  Zap,
  Clock,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Code,
  Trophy,
  Gamepad2,
  Bot,
  Sparkles,
  PlusCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real counts from database
  const [totalMemberships, totalActiveTeams, totalEvents] = await Promise.all([
    db.teamMember.count(),
    db.team.count({ where: { status: "OPEN" } }),
    db.event.count(),
  ]);

  // Fetch active urgent and open teams
  const activeTeams = await db.team.findMany({
    where: { status: "OPEN" },
    include: {
      event: true,
      creator: { select: { id: true, name: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { name: true, avatar: true } } },
      },
      _count: { select: { members: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Featured urgent team for hero poster
  const featuredTeam = activeTeams[0] || null;
  const featuredSkills = featuredTeam ? parseJsonArray(featuredTeam.requiredSkills) : [];

  // Fetch active orphans looking for teams
  const activeOrphans = await db.orphanListing.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          college: true,
          location: true,
        },
      },
      targetEvent: true,
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const categories = [
    { name: "Hackathons", icon: Code, color: "bg-brutal-yellow" },
    { name: "Coding Contests", icon: Zap, color: "bg-brutal-cyan" },
    { name: "Sports", icon: Trophy, color: "bg-brutal-green" },
    { name: "Gaming", icon: Gamepad2, color: "bg-brutal-purple" },
    { name: "Robotics", icon: Bot, color: "bg-brutal-pink" },
    { name: "College Fest", icon: Sparkles, color: "bg-brutal-orange" },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              {/* Urgent Floating Pill */}
              <div className="inline-flex items-center gap-2 border-3 border-black bg-brutal-yellow px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wider shadow-brutal-sm">
                <Flame className="w-4 h-4 text-black animate-bounce fill-current" />
                <span>Last-Minute Teammate Matching Platform</span>
              </div>

              {/* Huge Neo-Brutalist Title */}
              <div className="space-y-2">
                <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-black leading-[0.9]">
                  YOUR TEAM IS <br />
                  <span className="bg-brutal-pink text-white px-2 py-0.5 border-4 border-black inline-block shadow-brutal rotate-[-1deg]">
                    SHORT A PERSON?
                  </span>
                  <br />
                  <span className="text-black underline decoration-wavy decoration-brutal-yellow">
                    FIND THEM.
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="font-medium text-lg sm:text-xl text-neutral-800 max-w-xl">
                Don&apos;t let your team compete one member short. Match with verified students and builders before the strict <strong className="bg-black text-white px-1">24-hour cutoff</strong>.
              </p>

              {/* Large Neo-Brutalist Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/discover?tab=teams">
                  <BrutalButton variant="yellow" size="xl" className="shadow-brutal-lg">
                    🔍 FIND A TEAM
                  </BrutalButton>
                </Link>
                <Link href="/discover?tab=orphans">
                  <BrutalButton variant="cyan" size="xl" className="shadow-brutal-lg">
                    ⚡ FIND A MEMBER
                  </BrutalButton>
                </Link>
                <Link href="/create/team" className="w-full sm:w-auto">
                  <BrutalButton variant="white" size="xl" className="w-full shadow-brutal-lg">
                    + POST NEED
                  </BrutalButton>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-black uppercase tracking-wider text-neutral-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3]" />
                  <span>24H Cutoff Enforced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3]" />
                  <span>Smart Match Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3]" />
                  <span>100% Free for Students</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic / Urgency Poster */}
            <div className="lg:col-span-5 relative">
              {featuredTeam ? (
                <div className="border-4 border-black bg-white p-6 shadow-brutal-xl rotate-1 hover:rotate-0 transition-transform">
                  <div className="border-b-3 border-black pb-3 mb-4 flex items-center justify-between">
                    <span className="font-heading text-xs font-black uppercase tracking-widest bg-brutal-pink text-white px-2 py-0.5 border-2 border-black">
                      🔥 RECRUITING NOW
                    </span>
                    <span className="text-xs font-black uppercase text-neutral-500">
                      LIVE OPPORTUNITY
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="border-2 border-black bg-brutal-yellow px-2 py-0.5 text-[11px] font-black uppercase">
                        {featuredTeam.event.name}
                      </span>
                      <h3 className="font-heading text-2xl font-black uppercase text-black mt-1">
                        {featuredTeam.name}
                      </h3>
                    </div>

                    <div className="border-3 border-black bg-yellow-50 p-3 shadow-[3px_3px_0px_#000] flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-black uppercase text-neutral-600">
                          ROSTER STATUS
                        </div>
                        <div className="font-heading text-base font-black text-black">
                          {featuredTeam.members.length} / {featuredTeam.maxMembers} MEMBERS
                        </div>
                      </div>
                      <span className="border-2 border-black bg-brutal-pink text-white px-2.5 py-1 text-xs font-black uppercase">
                        NEED {Math.max(0, featuredTeam.maxMembers - featuredTeam.members.length)} MORE
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase text-neutral-600">
                        MISSING ROLE / SKILLS:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {featuredSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="border-2 border-black bg-white px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t-2 border-black pt-3 flex items-center justify-between">
                      <Countdown startDate={featuredTeam.event.startDate} variant="badge" />
                      <Link href={`/teams/${featuredTeam.id}`}>
                        <button className="border-2 border-black bg-brutal-yellow px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-black hover:text-white transition-colors">
                          VIEW TEAM →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-4 border-black bg-white p-8 shadow-brutal-xl text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center border-3 border-black bg-brutal-yellow shadow-brutal">
                    <PlusCircle className="w-8 h-8 text-black stroke-[2.5]" />
                  </div>
                  <h3 className="font-heading text-2xl font-black uppercase text-black">
                    BE THE FIRST SQUAD
                  </h3>
                  <p className="text-xs font-bold text-neutral-600">
                    Post your event requirement and find missing members before the 24-hour cutoff window.
                  </p>
                  <Link href="/create/team" className="block pt-2">
                    <BrutalButton variant="yellow" size="md" className="w-full">
                      + Post Team Need Now
                    </BrutalButton>
                  </Link>
                </div>
              )}

              {/* Sticker Decor */}
              <div className="absolute -bottom-5 -left-5 border-3 border-black bg-brutal-green p-3 font-heading text-xs font-black uppercase shadow-brutal -rotate-6 hidden sm:block">
                ⚡ LIVE PROTOCOL ACTIVE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER (DYNAMIC FROM DB) */}
      <section className="border-y-4 border-black bg-brutal-yellow py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="border-3 border-black bg-white p-4 shadow-brutal">
              <div className="font-heading text-4xl sm:text-5xl font-black text-black">
                {totalMemberships}
              </div>
              <div className="font-heading text-xs font-black uppercase tracking-widest text-neutral-600 mt-1">
                TEAMMATES JOINED
              </div>
            </div>

            <div className="border-3 border-black bg-white p-4 shadow-brutal">
              <div className="font-heading text-4xl sm:text-5xl font-black text-black">
                {totalActiveTeams}
              </div>
              <div className="font-heading text-xs font-black uppercase tracking-widest text-neutral-600 mt-1">
                ACTIVE RECRUITING SQUADS
              </div>
            </div>

            <div className="border-3 border-black bg-white p-4 shadow-brutal">
              <div className="font-heading text-4xl sm:text-5xl font-black text-black">
                {totalEvents}
              </div>
              <div className="font-heading text-xs font-black uppercase tracking-widest text-neutral-600 mt-1">
                UPCOMING EVENTS & HACKATHONS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="text-center space-y-2">
            <span className="border-2 border-black bg-brutal-cyan px-3 py-1 font-heading text-xs font-black uppercase tracking-widest shadow-brutal-sm">
              SIMPLE 3-STEP PIPELINE
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
              HOW TEAMORPHAN WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <BrutalCard variant="white" shadowSize="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b-3 border-black pb-3">
                <span className="font-heading text-4xl font-black text-brutal-pink">01</span>
                <span className="border-2 border-black bg-yellow-100 px-2 py-0.5 text-xs font-black uppercase">
                  CREATE NEED
                </span>
              </div>
              <h3 className="font-heading text-2xl font-black uppercase text-black">
                POST YOUR SPOT
              </h3>
              <p className="text-sm font-medium text-neutral-700">
                Tell us your event, how many teammates you need (e.g. 3/4), and the specific skills (Python, React, Figma, Arduino) required.
              </p>
            </BrutalCard>

            {/* Step 2 */}
            <BrutalCard variant="white" shadowSize="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b-3 border-black pb-3">
                <span className="font-heading text-4xl font-black text-brutal-cyan">02</span>
                <span className="border-2 border-black bg-cyan-100 px-2 py-0.5 text-xs font-black uppercase">
                  MATCH & DISCOVER
                </span>
              </div>
              <h3 className="font-heading text-2xl font-black uppercase text-black">
                SMART COMPATIBILITY
              </h3>
              <p className="text-sm font-medium text-neutral-700">
                Our algorithm calculates instant compatibility scores across skills (40%), event category (20%), location (15%), and availability.
              </p>
            </BrutalCard>

            {/* Step 3 */}
            <BrutalCard variant="white" shadowSize="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b-3 border-black pb-3">
                <span className="font-heading text-4xl font-black text-brutal-green">03</span>
                <span className="border-2 border-black bg-lime-100 px-2 py-0.5 text-xs font-black uppercase">
                  TEAM UP
                </span>
              </div>
              <h3 className="font-heading text-2xl font-black uppercase text-black">
                LOCK YOUR SQUAD
              </h3>
              <p className="text-sm font-medium text-neutral-700">
                Send/accept join requests with 1-click. Squads lock in before the 24-hour cutoff so you are 100% prepared to win.
              </p>
            </BrutalCard>
          </div>
        </div>
      </section>

      {/* 4. THE 24-HOUR URGENCY BANNER */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="border-4 border-black bg-brutal-pink p-8 sm:p-12 text-white shadow-brutal-xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 border-2 border-black bg-black px-3 py-1 font-heading text-xs font-black uppercase text-white shadow-[3px_3px_0px_#fff]">
                  <Clock className="w-4 h-4 text-brutal-yellow animate-spin" />
                  <span>THE ZERO-HOUR PROTOCOL</span>
                </div>
                <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none">
                  24 HOURS. <br />
                  THAT&apos;S YOUR WINDOW.
                </h2>
                <p className="text-base sm:text-lg font-bold text-white/95 max-w-2xl">
                  When an event is less than 24 hours away, recruitment automatically freezes on server and client. No last-second scrambling on stage — match your squad now.
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <Link href="/discover?tab=teams">
                  <BrutalButton variant="yellow" size="xl" className="shadow-brutal-lg">
                    BROWSE ACTIVE TEAMS →
                  </BrutalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACTIVE TEAM OPENINGS */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="border-2 border-black bg-brutal-green px-2.5 py-1 font-heading text-xs font-black uppercase tracking-wider">
                LIVE MARKETPLACE
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
                TEAMS LOOKING FOR MEMBERS
              </h2>
            </div>
            <Link href="/discover?tab=teams">
              <BrutalButton variant="white" size="sm">
                VIEW ALL TEAMS ({activeTeams.length}) →
              </BrutalButton>
            </Link>
          </div>

          {activeTeams.length === 0 ? (
            <BrutalCard variant="muted" shadowSize="sm" className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-neutral-500 stroke-[2.5]" />
              <h3 className="font-heading text-lg font-black uppercase text-black">
                NO TEAMS CURRENTLY RECRUITING
              </h3>
              <p className="text-xs font-bold text-neutral-600">
                Be the first to post a team requirement.
              </p>
              <Link href="/create/team" className="inline-block pt-2">
                <BrutalButton variant="yellow" size="sm">
                  + Create Team Need
                </BrutalButton>
              </Link>
            </BrutalCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTeams.map((team) => (
                <TeamCard key={team.id} team={team as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. ORPHANS LOOKING FOR A TEAM */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="border-2 border-black bg-brutal-cyan px-2.5 py-1 font-heading text-xs font-black uppercase tracking-wider">
                AVAILABLE TALENT
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
                PEOPLE LOOKING FOR A TEAM
              </h2>
            </div>
            <Link href="/discover?tab=orphans">
              <BrutalButton variant="white" size="sm">
                VIEW ALL ORPHANS →
              </BrutalButton>
            </Link>
          </div>

          {activeOrphans.length === 0 ? (
            <BrutalCard variant="muted" shadowSize="sm" className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-neutral-500 stroke-[2.5]" />
              <h3 className="font-heading text-lg font-black uppercase text-black">
                NO ORPHAN PROFILES YET
              </h3>
              <p className="text-xs font-bold text-neutral-600">
                Post your availability so recruiters can invite you directly.
              </p>
              <Link href="/create/orphan" className="inline-block pt-2">
                <BrutalButton variant="green" size="sm">
                  + Post Availability
                </BrutalButton>
              </Link>
            </BrutalCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrphans.map((orphan) => (
                <OrphanCard key={orphan.id} listing={orphan as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. POPULAR CATEGORIES */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="text-center space-y-2">
            <span className="border-2 border-black bg-white px-3 py-1 font-heading text-xs font-black uppercase tracking-widest shadow-brutal-sm">
              EXPLORE BY DOMAIN
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
              POPULAR EVENT CATEGORIES
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/discover?category=${encodeURIComponent(cat.name)}`}
                  className={`border-3 border-black p-4 flex flex-col items-center justify-center text-center gap-2 shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-transform ${cat.color}`}
                >
                  <div className="border-2 border-black bg-white p-2 shadow-brutal-sm">
                    <IconComp className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                  <div className="font-heading text-xs font-black uppercase text-black">
                    {cat.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="border-4 border-black bg-brutal-yellow p-8 sm:p-14 text-center shadow-brutal-xl space-y-6">
            <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-none">
              STILL MISSING <br />
              A TEAMMATE?
            </h2>
            <p className="font-heading text-xl sm:text-2xl font-black uppercase text-black">
              DON&apos;T PANIC. FIND ONE RIGHT NOW.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/register">
                <BrutalButton variant="black" size="xl" className="shadow-brutal-lg">
                  ⚡ CREATE FREE ACCOUNT
                </BrutalButton>
              </Link>
              <Link href="/discover">
                <BrutalButton variant="white" size="xl" className="shadow-brutal-lg">
                  EXPLORE MARKETPLACE
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
