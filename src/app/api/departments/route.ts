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
    whereClause = { schoolId: auth.schoolId };
  }

  const departments = await prisma.department.findMany({
    where: whereClause,
    include: {
      school: true,
      _count: {
        select: { scholars: true, courses: true, users: { where: { role: { name: 'HOD' } } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const schools = await prisma.school.findMany({
    orderBy: { schoolName: 'asc' }
  });

  return NextResponse.json({ departments, schools });
}

export async function POST(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { departmentCode, departmentName, status, schoolId } = data;

    if (!departmentCode || !departmentName || !schoolId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newDept = await prisma.department.create({
      data: {
        departmentCode,
        departmentName,
        status: status || 'ACTIVE',
        schoolId
      }
    });

    return NextResponse.json({ message: 'Department created', department: newDept });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}