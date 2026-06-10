import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET all prizes
export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT id, name, percentage, color, stock, sort_order FROM spinwheel_prizes ORDER BY sort_order ASC"
    );
    const prizes = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      percentage: r.percentage,
      color: r.color,
      stock: r.stock,
    }));
    return NextResponse.json({ prizes });
  } catch (error) {
    console.error("GET prizes error:", error);
    return NextResponse.json({ error: "Gagal ambil hadiah" }, { status: 500 });
  }
}

// POST create prize
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, percentage, color, stock } = body;

    if (!name || percentage == null || !color || stock == null) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const pool = getPool();
    const id = Date.now().toString();
    const maxOrder = await pool.query("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM spinwheel_prizes");
    const sortOrder = maxOrder.rows[0].next;

    await pool.query(
      "INSERT INTO spinwheel_prizes (id, name, percentage, color, stock, sort_order) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, name, percentage, color, stock, sortOrder]
    );

    return NextResponse.json({ success: true, prize: { id, name, percentage, color, stock } });
  } catch (error) {
    console.error("POST prizes error:", error);
    return NextResponse.json({ error: "Gagal tambah hadiah" }, { status: 500 });
  }
}

// PUT update prize (single or bulk)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const pool = getPool();

    // Bulk update: { prizes: [...] }
    if (Array.isArray(body.prizes)) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM spinwheel_prizes");
        for (let i = 0; i < body.prizes.length; i++) {
          const p = body.prizes[i];
          await client.query(
            "INSERT INTO spinwheel_prizes (id, name, percentage, color, stock, sort_order) VALUES ($1, $2, $3, $4, $5, $6)",
            [p.id, p.name, p.percentage, p.color, p.stock, i]
          );
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
      return NextResponse.json({ success: true });
    }

    // Single update: { id, ...fields }
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: "ID wajib" }, { status: 400 });
    }

    const allowedFields = ["name", "percentage", "color", "stock"];
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Tidak ada field yang diupdate" }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
      `UPDATE spinwheel_prizes SET ${updates.join(", ")} WHERE id = $${idx}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT prizes error:", error);
    return NextResponse.json({ error: "Gagal update hadiah" }, { status: 500 });
  }
}

// DELETE prize
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID wajib" }, { status: 400 });
    }

    const pool = getPool();
    await pool.query("DELETE FROM spinwheel_prizes WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE prizes error:", error);
    return NextResponse.json({ error: "Gagal hapus hadiah" }, { status: 500 });
  }
}
