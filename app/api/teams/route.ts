import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateTeamSchema } from "@/lib/validation";
import { checkRecruitmentAllowed } from "@/lib/cutoff";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const mode = searchParams.get("mode");
    const search = searchParams.get("search");
    const urgency = searchParams.get("urgency"); // "urgent" | "open" | "all"
    const skill = searchParams.get("skill");

    const whereClause: any = {};

    if (category && category !== "ALL") {
      whereClause.event = { ...whereClause.event, category };
    }

    if (mode && mode !== "ALL") {
      whereClause.event = { ...whereClause.event, mode };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { requiredSkills: { contains: search } },
        { event: { name: { contains: search } } },
      ];
    }

    if (skill) {
      whereClause.requiredSkills = { contains: skill };
    }

    const teams = await db.team.findMany({
      where: whereClause,
      include: {
        event: true,
        creator: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Optional client filter for urgency
    let filteredTeams = teams;
    if (urgency === "urgent") {
      const now = new Date().getTime();
      filteredTeams = teams.filter((t) => {
        const start = new Date(t.event.startDate).getTime();
        const cutoff = start - 24 * 60 * 60 * 1000;
        const remaining = cutoff - now;
        return remaining > 0 && remaining <= 24 * 60 * 60 * 1000;
      });
    } else if (urgency === "open") {
      const now = new Date().getTime();
      filteredTeams = teams.filter((t) => {
        const start = new Date(t.event.startDate).getTime();
        const cutoff = start - 24 * 60 * 60 * 1000;
        return now < cutoff && t.status === "OPEN";
      });
    }

    return NextResponse.json({ teams: filteredTeams });
  } catch (error: any) {
    console.error("Teams fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const validated = CreateTeamSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid team details" },
        { status: 400 }
      );
    }

    const { name, eventId, maxMembers, description, requiredSkills, preferredSkills, contactInfo } =
      validated.data;

    // Verify event exists and recruitment cutoff hasn't passed
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const cutoffCheck = checkRecruitmentAllowed(event.startDate);
    if (!cutoffCheck.allowed) {
      return NextResponse.json({ error: cutoffCheck.reason }, { status: 400 });
    }

    // Create team and add creator as LEADER
    const team = await db.team.create({
      data: {
        name,
        eventId,
        creatorId: user.id,
        maxMembers,
        description,
        requiredSkills: JSON.stringify(requiredSkills),
        preferredSkills: JSON.stringify(preferredSkills || []),
        contactInfo: contactInfo || null,
        status: "OPEN",
        members: {
          create: {
            userId: user.id,
            role: "LEADER",
          },
        },
      },
      include: {
        event: true,
        members: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    console.error("Create team error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
