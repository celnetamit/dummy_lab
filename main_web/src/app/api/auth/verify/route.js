import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in Main Hub DB" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Don't send password hash back
    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role
    }, { status: 200 });

  } catch (error) {
    console.error("Auth Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
