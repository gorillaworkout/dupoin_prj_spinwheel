import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

const VALID_KEYS = ["background", "audio"];

// GET settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    const pool = getPool();

    if (key) {
      if (!VALID_KEYS.includes(key)) {
        return NextResponse.json({ error: "Key tidak valid" }, { status: 400 });
      }
      const result = await pool.query(
        "SELECT key, value FROM spinwheel_settings WHERE key = $1",
        [key]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ [key]: null });
      }
      return NextResponse.json({ [key]: result.rows[0].value });
    }

    // Return all settings
    const result = await pool.query("SELECT key, value FROM spinwheel_settings");
    const settings: Record<string, any> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Gagal ambil settings" }, { status: 500 });
  }
}

// PUT update setting
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || !VALID_KEYS.includes(key) || value === undefined) {
      return NextResponse.json({ error: "Key/value tidak valid" }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO spinwheel_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT settings error:", error);
    return NextResponse.json({ error: "Gagal update settings" }, { status: 500 });
  }
}
