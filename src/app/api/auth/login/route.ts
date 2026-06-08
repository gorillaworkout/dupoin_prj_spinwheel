import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getJwtSecretKey } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      "SELECT id, username, password_hash FROM spinwheel_users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    // Create JWT token
    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(getJwtSecretKey());

    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set("sw_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("sw_session");
  return response;
}
