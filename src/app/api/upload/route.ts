import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { promises as fs } from "fs";
import path from "path";

const secretKey = process.env.JWT_SECRET || "super-secret-fallback-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, key);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and JPG/PNG are allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = uniqueSuffix + "-" + safeName;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ 
      message: "File uploaded successfully",
      fileName: file.name,
      filePath: "/uploads/" + filename,
      fileSize: file.size,
      mimeType: file.type
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}