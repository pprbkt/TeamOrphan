import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateCompatibility } from "@/lib/matching";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const currentUser = await getCurrentUser();

  const profileUser = await db.user.findUnique({
    where: { username: params.username },
    include: {
      memberships: {
        include: {
          team: {
            include: { event: true },
          },
        },
      },
      createdTeams: {
        include: { event: true },
      },
    },
  });

  if (!profileUser) {
    notFound();
  }

  let userMatch = null;
  if (currentUser && currentUser.id !== profileUser.id) {
    userMatch = calculateCompatibility(
      {
        skills: profileUser.skills,
        interests: profileUser.interests,
        location: profileUser.location,
      },
      {
        requiredSkills: currentUser.skills,
        category: "Hackathon",
      }
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <ProfileClient
        profileUser={profileUser}
        currentUser={currentUser}
        userMatch={userMatch}
      />
    </div>
  );
}
