import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        teams: {
          include: {
            creator: {
              select: { id: true, name: true, username: true, avatar: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, username: true, avatar: true, skills: true },
                },
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
        orphanListings: {
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
                skills: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error("Event fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
