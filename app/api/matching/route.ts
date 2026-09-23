import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateCompatibility } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ matches: [] });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "teams"; // "teams" | "orphans"

    if (type === "teams") {
      // Find open teams not created by user and user not in them
      const teams = await db.team.findMany({
        where: {
          creatorId: { not: user.id },
          status: "OPEN",
          members: {
            none: { userId: user.id },
          },
        },
        include: {
          event: true,
          creator: {
            select: { id: true, name: true, username: true, avatar: true },
          },
          members: {
            include: { user: true },
          },
        },
      });

      const matchedTeams = teams.map((team) => {
        const matchResult = calculateCompatibility(
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

        return {
          team,
          match: matchResult,
        };
      });

      // Sort by highest match score
      matchedTeams.sort((a, b) => b.match.score - a.match.score);

      return NextResponse.json({ matches: matchedTeams });
    } else {
      // Type === "orphans" - for recruiters finding orphans
      const orphans = await db.orphanListing.findMany({
        where: {
          userId: { not: user.id },
          status: "ACTIVE",
        },
        include: {
          user: true,
          targetEvent: true,
        },
      });

      // Get user's created open teams to compare against
      const userTeams = await db.team.findMany({
        where: { creatorId: user.id, status: "OPEN" },
        include: { event: true },
      });

      const matchedOrphans = orphans.map((orphan) => {
        let bestScore = 0;
        let bestMatchResult: any = null;

        if (userTeams.length > 0) {
          userTeams.forEach((team) => {
            const res = calculateCompatibility(
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
            if (res.score > bestScore) {
              bestScore = res.score;
              bestMatchResult = res;
            }
          });
        } else {
          bestMatchResult = calculateCompatibility(
            {
              skills: orphan.skills,
              interests: orphan.user.interests,
              location: orphan.location || orphan.user.location,
            },
            {
              requiredSkills: user.skills,
              category: "Hackathon",
            }
          );
        }

        return {
          orphan,
          match: bestMatchResult,
        };
      });

      matchedOrphans.sort((a, b) => b.match.score - a.match.score);

      return NextResponse.json({ matches: matchedOrphans });
    }
  } catch (error: any) {
    console.error("Matching engine error:", error);
    return NextResponse.json({ error: "Failed to calculate matches" }, { status: 500 });
  }
}
