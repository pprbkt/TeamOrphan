import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Please enter email/username and password" }, { status: 400 });
    }

    const { login, password } = validated.data;
    const loginLower = login.toLowerCase();

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: loginLower }, { username: loginLower }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "This account has been suspended by administration." },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
