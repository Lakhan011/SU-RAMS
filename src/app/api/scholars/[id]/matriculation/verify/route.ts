import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from "@/lib/jwt";

const prisma = new PrismaClient();

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;
  return await verifyToken(token);
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

    const { stage, status, remarks } = await req.json();

    if (stage !== "HOD" && stage !== "DEAN") {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    if (user.role.name !== stage) {
      return NextResponse.json({ error: `Only ${stage} can perform this verification` }, { status: 403 });
    }

    const { id: scholarId } = await params;

    const scholar = await prisma.scholar.findUnique({
      where: { id: scholarId },
    });

    if (!scholar) return NextResponse.json({ error: "Scholar not found" }, { status: 404 });
    
    // Check school/dept match
    if (stage === "HOD" && scholar.departmentId !== user.departmentId) {
      return NextResponse.json({ error: "Cannot verify scholar from another department" }, { status: 403 });
    }
    if (stage === "DEAN" && scholar.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Cannot verify scholar from another school" }, { status: 403 });
    }

    // Find existing
    const existing = await prisma.scholarVerification.findFirst({
      where: { scholarId, stage }
    });

    let verification;
    if (existing) {
      verification = await prisma.scholarVerification.update({
        where: { id: existing.id },
        data: {
          status,
          remarks,
          verifiedById: user.id,
          verifiedAt: new Date(),
        }
      });
    } else {
      verification = await prisma.scholarVerification.create({
        data: {
          scholarId,
          stage,
          status,
          remarks,
          verifiedById: user.id,
          verifiedAt: new Date(),
        }
      });
    }

    return NextResponse.json({ success: true, verification });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
