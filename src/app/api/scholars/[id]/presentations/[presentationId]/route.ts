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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, presentationId: string }> }) {
  const auth = await checkAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { presentationId } = await params;
    const data = await req.json();

    const presentation = await prisma.presentation.update({
      where: { id: presentationId },
      data: {
        synopsisUrl: data.synopsisUrl !== undefined ? data.synopsisUrl : undefined,
        momUrl: data.momUrl !== undefined ? data.momUrl : undefined,
        documentsUrl: data.documentsUrl !== undefined ? data.documentsUrl : undefined,
        externalExperts: data.externalExperts !== undefined ? data.externalExperts : undefined,
        researchNominees: data.researchNominees !== undefined ? data.researchNominees : undefined,
        nomineesStatus: data.nomineesStatus !== undefined ? data.nomineesStatus : undefined,
        vcExperts: data.vcExperts !== undefined ? data.vcExperts : undefined,
        presentationDate: data.presentationDate !== undefined ? data.presentationDate : undefined,
        presentationTime: data.presentationTime !== undefined ? data.presentationTime : undefined,
        result: data.result !== undefined ? data.result : undefined,
        remarks: data.remarks !== undefined ? data.remarks : undefined
      }
    });

    return NextResponse.json({ message: "Presentation updated", presentation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, presentationId: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { presentationId } = await params;
    await prisma.presentation.delete({ where: { id: presentationId } });
    return NextResponse.json({ message: "Presentation deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
