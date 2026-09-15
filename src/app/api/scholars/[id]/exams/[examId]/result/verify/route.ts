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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string, examId: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'ADMIN', 'VC'].includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden. RDC member access required." }, { status: 403 });
  }

  try {
    const { id, examId } = await params;

    const existingResult = await prisma.result.findFirst({
      where: { examId }
    });

    if (!existingResult) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const savedResult = await prisma.result.update({
      where: { id: existingResult.id },
      data: { 
        verificationStatus: "VERIFIED_RDC",
        verifiedById: auth.id as string,
        verifiedAt: new Date()
      }
    });

    return NextResponse.json({ message: "Result verified successfully", result: savedResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
