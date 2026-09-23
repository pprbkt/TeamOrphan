import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MessageSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("otherUserId");

    if (otherUserId) {
      // Get conversation history with specific user
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, username: true, avatar: true } },
          receiver: { select: { id: true, name: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      // Mark received messages as read
      await db.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: user.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ messages });
    }

    // Get all conversations for current user
    const sent = await db.message.findMany({
      where: { senderId: user.id },
      include: { receiver: { select: { id: true, name: true, username: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    const received = await db.message.findMany({
      where: { receiverId: user.id },
      include: { sender: { select: { id: true, name: true, username: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Group by contact
    const contactsMap = new Map<string, any>();

    sent.forEach((msg) => {
      const contact = msg.receiver;
      if (!contactsMap.has(contact.id)) {
        contactsMap.set(contact.id, {
          contact,
          lastMessage: msg,
          unread: false,
        });
      }
    });

    received.forEach((msg) => {
      const contact = msg.sender;
      const existing = contactsMap.get(contact.id);
      if (!existing || new Date(msg.createdAt).getTime() > new Date(existing.lastMessage.createdAt).getTime()) {
        contactsMap.set(contact.id, {
          contact,
          lastMessage: msg,
          unread: !msg.read,
        });
      }
    });

    const conversations = Array.from(contactsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = MessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid message data" },
        { status: 400 }
      );
    }

    const { receiverId, content } = validated.data;

    if (receiverId === user.id) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    // Send notification to recipient
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE",
        title: `New message from ${user.name}`,
        message: content.length > 60 ? `${content.slice(0, 60)}...` : content,
        link: `/messages?chatWith=${user.id}`,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
