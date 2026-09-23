import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const team = await db.team.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        creator: {
          select: { id: true, name: true, username: true, avatar: true, bio: true, college: true },
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
                bio: true,
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
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Determine permissions
    const isCreator = user?.id === team.creatorId;
    const isMember = team.members.some((m) => m.userId === user?.id);
    const userJoinRequest = user
      ? team.joinRequests.find((r) => r.userId === user.id)
      : null;

    // Filter join requests for non-creators
    const sanitizedTeam = {
      ...team,
      joinRequests: isCreator ? team.joinRequests : [],
      userJoinRequest: userJoinRequest || null,
      isCreator,
      isMember,
    };

    return NextResponse.json({ team: sanitizedTeam });
  } catch (error: any) {
    console.error("Team detail fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await db.team.findUnique({ where: { id: params.id } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only team leader or admin can delete this team" }, { status: 403 });
    }

    await db.team.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Team delete error:", error);
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
