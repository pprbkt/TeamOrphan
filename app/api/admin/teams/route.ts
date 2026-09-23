import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const teams = await db.team.findMany({
      include: {
        event: true,
        creator: { select: { id: true, name: true, username: true } },
        _count: { select: { members: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error("Admin teams fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { teamId, status } = await req.json();

    const updated = await db.team.update({
      where: { id: teamId },
      data: { status },
    });

    return NextResponse.json({ success: true, team: updated });
  } catch (error: any) {
    console.error("Admin team update error:", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}
