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

export async function GET(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let whereClause = {};
  if (auth.role === 'COORDINATOR' && auth.schoolId) {
    whereClause = { department: { schoolId: auth.schoolId } };
  } else if (auth.role === 'HOD' && auth.departmentId) {
    whereClause = { departmentId: auth.departmentId };
  }

  const courses = await prisma.course.findMany({
    where: whereClause,
    include: {
      department: true,
      _count: {
        select: { scholarCourses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const departments = await prisma.department.findMany({
    orderBy: { departmentName: 'asc' }
  });

  return NextResponse.json({ courses, departments });
}

export async function POST(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN', 'COORDINATOR', 'HOD'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { courseCode, courseName, status, departmentId } = data;

    if (!courseCode || !courseName || !departmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        status: status || 'ACTIVE',
        departmentId
      }
    });

    return NextResponse.json({ message: 'Course created', course: newCourse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}