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
  if (!auth || !['SUPER_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, examId } = await params;
    const data = await req.json();
    const { marksObtained, maximumMarks, result, remarks } = data;

    if (marksObtained === undefined || maximumMarks === undefined || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const existingResult = await prisma.result.findFirst({
      where: { examId }
    });

    let savedResult;
    if (existingResult) {
      savedResult = await prisma.result.update({
        where: { id: existingResult.id },
        data: { marksObtained: parseFloat(marksObtained), maximumMarks: parseFloat(maximumMarks), result, remarks }
      });
    } else {
      savedResult = await prisma.result.create({
        data: {
          scholarId: id,
          courseId: exam.courseId,
          examId,
          marksObtained: parseFloat(marksObtained),
          maximumMarks: parseFloat(maximumMarks),
          result,
          remarks,
          enteredById: auth.id as string
        }
      });
    }

    // Update exam status to COMPLETED
    await prisma.exam.update({
      where: { id: examId },
      data: { status: "COMPLETED" }
    });

    return NextResponse.json({ message: "Result updated successfully", result: savedResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
