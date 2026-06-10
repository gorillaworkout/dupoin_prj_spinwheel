import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET all logs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 500), 2000);
    const offset = Number(searchParams.get("offset") || 0);

    const pool = getPool();
    const result = await pool.query(
      "SELECT id, prize_id, prize_name, prize_color, created_at FROM spinwheel_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const totalResult = await pool.query("SELECT COUNT(*) AS total FROM spinwheel_logs");

    const logs = result.rows.map((r) => ({
      id: r.id,
      prizeId: r.prize_id,
      prizeName: r.prize_name,
      prizeColor: r.prize_color,
      timestamp: new Date(r.created_at).getTime(),
    }));

    return NextResponse.json({ logs, total: Number(totalResult.rows[0].total) });
  } catch (error) {
    console.error("GET logs error:", error);
    return NextResponse.json({ error: "Gagal ambil log" }, { status: 500 });
  }
}

// POST create log
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prizeId, prizeName, prizeColor } = body;

    if (!prizeId || !prizeName || !prizeColor) {
      return NextResponse.json({ error: "Semua field wajib" }, { status: 400 });
    }

    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const pool = getPool();

    await pool.query(
      "INSERT INTO spinwheel_logs (id, prize_id, prize_name, prize_color) VALUES ($1, $2, $3, $4)",
      [id, prizeId, prizeName, prizeColor]
    );

    return NextResponse.json({
      success: true,
      log: { id, prizeId, prizeName, prizeColor, timestamp: Date.now() },
    });
  } catch (error) {
    console.error("POST logs error:", error);
    return NextResponse.json({ error: "Gagal tambah log" }, { status: 500 });
  }
}

// DELETE all logs
export async function DELETE() {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM spinwheel_logs");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE logs error:", error);
    return NextResponse.json({ error: "Gagal hapus log" }, { status: 500 });
  }
}
