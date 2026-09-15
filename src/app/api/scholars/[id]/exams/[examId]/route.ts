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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, examId: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, examId } = await params;
    const data = await req.json();
    const { courseId, examDate, startTime, endTime, examType } = data;

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        courseId,
        examDate: new Date(examDate),
        startTime,
        endTime,
        examType
      }
    });

    return NextResponse.json({ message: "Exam updated", exam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, examId: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { examId } = await params;
    await prisma.exam.delete({ where: { id: examId } });
    return NextResponse.json({ message: "Exam deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
