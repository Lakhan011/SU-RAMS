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

  // Get the full user to know their role and school/dept
  const user = await prisma.user.findUnique({
    where: { id: auth.id as string },
    include: { role: true }
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let whereClause = {};

  if (user.role.name === 'COORDINATOR' || user.role.name === 'DEAN') {
    if (user.schoolId) whereClause = { schoolId: user.schoolId };
    else whereClause = { id: 'none' }; // Prevent fetching all if schoolId is unexpectedly missing
  } else if (user.role.name === 'HOD') {
    if (user.departmentId) whereClause = { departmentId: user.departmentId };
    else whereClause = { id: 'none' };
  } else if (user.role.name === 'SUPERVISOR') {
    // Optionally supervisors only see their own scholars
    // whereClause = { supervisor: { supervisorId: user.id } }; // Example for future
    whereClause = {}; 
  } else {
    whereClause = {};
  }

  const scholars = await prisma.scholar.findMany({
    where: whereClause,
    select: {
      id: true,
      scholarId: true,
      enrollmentNumber: true,
      firstName: true,
      lastName: true,
      program: true,
      createdAt: true,
      verificationStatus: true,
      status: true,
      school: { select: { schoolName: true } },
      department: { select: { departmentName: true } },
      supervisor: { select: { status: true } },
      verifications: { select: { stage: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json({ scholars });
}
export async function POST(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { 
      scholarId, enrollmentNumber, firstName, lastName, email, phone, country,
      dateOfBirth, gender, address, schoolId, departmentId, program, status 
    } = data;

    if (!scholarId || !enrollmentNumber || !firstName || !lastName || !email || !schoolId || !departmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.id as string }, include: { role: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.role.name === 'COORDINATOR' && user.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Forbidden: Coordinators can only create scholars for their own school.' }, { status: 403 });
    }

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept || dept.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Invalid department for the selected school.' }, { status: 400 });
    }

    const newScholar = await prisma.scholar.create({
      data: {
        scholarId,
        enrollmentNumber,
        firstName,
        lastName,
        email,
        phone,
        country,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        schoolId,
        departmentId,
        program,
        status: status || 'ACTIVE',
      }
    });

    return NextResponse.json({ message: 'Scholar created', scholar: newScholar });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
