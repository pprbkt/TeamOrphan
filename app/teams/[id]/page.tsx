import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateCompatibility } from "@/lib/matching";
import { TeamDetailClient } from "./TeamDetailClient";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await getCurrentUser();

  const team = await db.team.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          college: true,
          location: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              bio: true,
              college: true,
              location: true,
              skills: true,
            },
          },
        },
      },
      joinRequests: {
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
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!team) {
    notFound();
  }

  let userMatch = null;
  if (currentUser) {
    userMatch = calculateCompatibility(
      {
        skills: currentUser.skills,
        interests: currentUser.interests,
        location: currentUser.location,
      },
      {
        requiredSkills: team.requiredSkills,
        preferredSkills: team.preferredSkills,
        category: team.event.category,
        location: team.event.location,
        mode: team.event.mode,
      }
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <TeamDetailClient
        team={team}
        currentUser={currentUser}
        userMatch={userMatch}
      />
    </div>
  );
}
