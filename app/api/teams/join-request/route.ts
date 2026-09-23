import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { JoinRequestSchema } from "@/lib/validation";
import { checkRecruitmentAllowed } from "@/lib/cutoff";

// POST: Submit a Join Request
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to join a team" }, { status: 401 });
    }

    const body = await req.json();
    const validated = JoinRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid join request" },
        { status: 400 }
      );
    }

    const { teamId, message } = validated.data;

    // Fetch team with event & members
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        event: true,
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // 1. Server-side 24-Hour Cutoff Rule Enforcement
    const cutoffCheck = checkRecruitmentAllowed(team.event.startDate);
    if (!cutoffCheck.allowed) {
      return NextResponse.json({ error: cutoffCheck.reason }, { status: 400 });
    }

    // 2. Prevent joining own team
    if (team.creatorId === user.id) {
      return NextResponse.json({ error: "You cannot request to join your own team." }, { status: 400 });
    }

    // 3. Prevent joining if already a member
    if (team.members.some((m) => m.userId === user.id)) {
      return NextResponse.json({ error: "You are already a member of this team." }, { status: 400 });
    }

    // 4. Check if team is full
    if (team.members.length >= team.maxMembers || team.status === "FULL" || team.status === "CLOSED") {
      return NextResponse.json({ error: "This team is already full." }, { status: 400 });
    }

    // 5. Check if duplicate request exists
    const existing = await db.joinRequest.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        return NextResponse.json({ error: "You already have a pending join request for this team." }, { status: 400 });
      }
      if (existing.status === "REJECTED") {
        // Allow updating rejected request to pending with new message
        const updated = await db.joinRequest.update({
          where: { id: existing.id },
          data: {
            message: message || null,
            status: "PENDING",
          },
        });

        // Notify team creator
        await db.notification.create({
          data: {
            userId: team.creatorId,
            type: "JOIN_REQUEST",
            title: `New Join Request: ${team.name}`,
            message: `${user.name} sent a join request for ${team.name}.`,
            link: `/teams/${team.id}`,
          },
        });

        return NextResponse.json({ success: true, joinRequest: updated });
      }
    }

    // Create new join request
    const joinRequest = await db.joinRequest.create({
      data: {
        teamId,
        userId: user.id,
        message: message || null,
        status: "PENDING",
      },
    });

    // Notify team creator
    await db.notification.create({
      data: {
        userId: team.creatorId,
        type: "JOIN_REQUEST",
        title: `New Join Request: ${team.name}`,
        message: `${user.name} sent a request to join ${team.name} for ${team.event.name}.`,
        link: `/teams/${team.id}`,
      },
    });

    return NextResponse.json({ success: true, joinRequest });
  } catch (error: any) {
    console.error("Join request error:", error);
    return NextResponse.json({ error: "Failed to submit join request" }, { status: 500 });
  }
}

// PATCH: Accept or Reject Join Request
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json(); // action: "ACCEPT" | "REJECT"

    if (!requestId || !["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action or request ID" }, { status: 400 });
    }

    const joinRequest = await db.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          include: {
            event: true,
            members: true,
          },
        },
        user: true,
      },
    });

    if (!joinRequest) {
      return NextResponse.json({ error: "Join request not found" }, { status: 404 });
    }

    // Verify user is team leader or admin
    if (joinRequest.team.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the team leader can manage join requests" }, { status: 403 });
    }

    if (action === "REJECT") {
      await db.joinRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      // Notify candidate
      await db.notification.create({
        data: {
          userId: joinRequest.userId,
          type: "REQUEST_REJECTED",
          title: "Join Request Update",
          message: `Your request to join ${joinRequest.team.name} was not accepted at this time.`,
          link: `/discover`,
        },
      });

      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    // Action === "ACCEPT"
    // Server-side cutoff check
    const cutoffCheck = checkRecruitmentAllowed(joinRequest.team.event.startDate);
    if (!cutoffCheck.allowed) {
      return NextResponse.json({ error: cutoffCheck.reason }, { status: 400 });
    }

    // Check capacity
    const currentMemberCount = joinRequest.team.members.length;
    if (currentMemberCount >= joinRequest.team.maxMembers) {
      return NextResponse.json({ error: "This team is already at maximum capacity." }, { status: 400 });
    }

    // Add member in transaction
    await db.$transaction(async (tx) => {
      // 1. Create team member
      await tx.teamMember.create({
        data: {
          teamId: joinRequest.teamId,
          userId: joinRequest.userId,
          role: "MEMBER",
        },
      });

      // 2. Mark request as ACCEPTED
      await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // 3. Update orphan listing if user had one
      await tx.orphanListing.updateMany({
        where: {
          userId: joinRequest.userId,
          status: "ACTIVE",
          targetEventId: joinRequest.team.eventId,
        },
        data: { status: "MATCHED" },
      });

      // 4. Check if team is now full
      const newCount = currentMemberCount + 1;
      if (newCount >= joinRequest.team.maxMembers) {
        await tx.team.update({
          where: { id: joinRequest.teamId },
          data: { status: "FULL" },
        });
      }

      // 5. Send acceptance notification
      await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          type: "REQUEST_ACCEPTED",
          title: "🎉 Request Accepted!",
          message: `Congratulations! You have joined team ${joinRequest.team.name} for ${joinRequest.team.event.name}.`,
          link: `/teams/${joinRequest.teamId}`,
        },
      });
    });

    return NextResponse.json({ success: true, status: "ACCEPTED" });
  } catch (error: any) {
    console.error("Accept/reject error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
