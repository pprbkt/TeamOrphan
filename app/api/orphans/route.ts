import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateOrphanListingSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const mode = searchParams.get("mode");
    const search = searchParams.get("search");
    const skill = searchParams.get("skill");

    const whereClause: any = {
      status: "ACTIVE",
    };

    if (category && category !== "ALL") {
      whereClause.OR = [
        { targetCategory: category },
        { targetEvent: { category } },
      ];
    }

    if (mode && mode !== "ALL") {
      whereClause.mode = mode;
    }

    if (search) {
      whereClause.OR = [
        { bio: { contains: search } },
        { skills: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { college: { contains: search } } },
        { user: { location: { contains: search } } },
      ];
    }

    if (skill) {
      whereClause.skills = { contains: skill };
    }

    const orphans = await db.orphanListing.findMany({
      where: whereClause,
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
        targetEvent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orphans });
  } catch (error: any) {
    console.error("Orphans fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orphan listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const validated = CreateOrphanListingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid orphan listing data" },
        { status: 400 }
      );
    }

    const { targetEventId, targetCategory, skills, experience, availability, location, mode, bio } =
      validated.data;

    // Check if user already has an active orphan listing for this event/general
    const existing = await db.orphanListing.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
        targetEventId: targetEventId || null,
      },
    });

    if (existing) {
      // Update existing
      const updated = await db.orphanListing.update({
        where: { id: existing.id },
        data: {
          targetCategory: targetCategory || null,
          skills: JSON.stringify(skills),
          experience: experience || null,
          availability,
          location: location || user.location,
          mode,
          bio,
        },
      });
      return NextResponse.json({ success: true, orphan: updated });
    }

    const orphan = await db.orphanListing.create({
      data: {
        userId: user.id,
        targetEventId: targetEventId || null,
        targetCategory: targetCategory || null,
        skills: JSON.stringify(skills),
        experience: experience || null,
        availability,
        location: location || user.location,
        mode,
        bio,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, orphan });
  } catch (error: any) {
    console.error("Create orphan listing error:", error);
    return NextResponse.json({ error: "Failed to create orphan listing" }, { status: 500 });
  }
}
