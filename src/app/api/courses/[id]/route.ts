import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN', 'COORDINATOR', 'HOD'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { courseCode, courseName, status, departmentId } = data;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        courseCode,
        courseName,
        status,
        departmentId
      }
    });

    return NextResponse.json({ message: 'Course updated', course: updatedCourse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN', 'COORDINATOR', 'HOD'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: 'Course deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}