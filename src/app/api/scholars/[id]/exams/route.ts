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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const exams = await prisma.exam.findMany({
      where: { scholarId: id },
      include: { course: true, results: true }
    });
    return NextResponse.json({ exams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { courseId, examDate, startTime, endTime, examType } = data;

    if (!courseId || !examDate || !startTime || !endTime || !examType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        scholarId: id,
        courseId,
        examDate: new Date(examDate),
        startTime,
        endTime,
        examType,
        createdById: auth.id as string
      }
    });

    return NextResponse.json({ message: "Exam scheduled", exam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
