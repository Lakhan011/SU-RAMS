import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromHeader } from "@/lib/jwt";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromHeader(req);
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
      include: { matriculation: true }
    });

    if (!scholar) return NextResponse.json({ error: "Scholar not found" }, { status: 404 });
    
    // Check school/dept match
    if (stage === "HOD" && scholar.departmentId !== user.departmentId) {
      return NextResponse.json({ error: "Cannot verify scholar from another department" }, { status: 403 });
    }
    if (stage === "DEAN" && scholar.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Cannot verify scholar from another school" }, { status: 403 });
    }

    let matriculationId = scholar.matriculation?.id;
    if (!matriculationId) {
       const newMatriculation = await prisma.matriculation.create({
         data: { scholarId, status: "DRAFT" }
       });
       matriculationId = newMatriculation.id;
    }

    // Find existing
    const existing = await prisma.matriculationVerification.findFirst({
      where: { matriculationId, stage }
    });

    let verification;
    if (existing) {
      verification = await prisma.matriculationVerification.update({
        where: { id: existing.id },
        data: {
          status,
          remarks,
          verifiedById: user.id,
          verifiedAt: new Date(),
        }
      });
    } else {
      verification = await prisma.matriculationVerification.create({
        data: {
          matriculationId,
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
