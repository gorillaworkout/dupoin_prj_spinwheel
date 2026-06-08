import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifySessionToken } from "@/lib/auth";

const BACKGROUND_JSON_PATH = path.join(process.cwd(), "public", "uploads", "backgrounds", "current.json");
const BACKGROUND_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "backgrounds");
const DEFAULT_BACKGROUND = { type: "color", value: "#0f172a" };

async function ensureDir() {
  await fs.mkdir(BACKGROUND_UPLOAD_DIR, { recursive: true });
}

export async function GET() {
  try {
    await ensureDir();
    const raw = await fs.readFile(BACKGROUND_JSON_PATH, "utf8").catch(() => null);
    if (!raw) return NextResponse.json({ background: DEFAULT_BACKGROUND });

    const parsed = JSON.parse(raw);
    return NextResponse.json({ background: parsed });
  } catch (error) {
    console.error("GET background error:", error);
    return NextResponse.json({ background: DEFAULT_BACKGROUND });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("sw_session")?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureDir();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File wajib diupload" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
    const filename = `background-${Date.now()}.${ext}`;
    const filepath = path.join(BACKGROUND_UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filepath, buffer);

    const background = {
      type: "image",
      value: `/uploads/backgrounds/${filename}`,
    };

    await fs.writeFile(BACKGROUND_JSON_PATH, JSON.stringify(background, null, 2), "utf8");

    return NextResponse.json({ success: true, background });
  } catch (error) {
    console.error("POST background error:", error);
    return NextResponse.json({ error: "Gagal upload background" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("sw_session")?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureDir();
    const body = await req.json();
    const background = body?.background;

    if (!background || !["color", "image"].includes(background.type) || typeof background.value !== "string") {
      return NextResponse.json({ error: "Background tidak valid" }, { status: 400 });
    }

    await fs.writeFile(BACKGROUND_JSON_PATH, JSON.stringify(background, null, 2), "utf8");
    return NextResponse.json({ success: true, background });
  } catch (error) {
    console.error("PUT background error:", error);
    return NextResponse.json({ error: "Gagal simpan background" }, { status: 500 });
  }
}
