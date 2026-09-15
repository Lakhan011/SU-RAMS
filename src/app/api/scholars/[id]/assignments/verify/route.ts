import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await checkAuth(req);
    if (!payload || !payload.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { role: true }
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { stage } = await req.json();

    if (stage !== "RDC") {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const isRdcMember = ["RDC_ADMIN", "VC", "SUPER_ADMIN", "ADMIN"].includes(user.role.name);
    
    if (!isRdcMember) {
      return NextResponse.json({ error: `Forbidden: Must be an RDC member to verify` }, { status: 403 });
    }

    const { id: scholarId } = await params;
    
    const targetStatus = "VERIFIED_RDC";

    await prisma.supervisorAssignment.updateMany({
      where: { scholarId },
      data: { status: targetStatus as string }
    });

    await prisma.scholarCourse.updateMany({
      where: { scholarId },
      data: { status: targetStatus as string, verifiedById: user.id, verifiedAt: new Date() }
    });

    return NextResponse.json({ message: "Assignments verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
