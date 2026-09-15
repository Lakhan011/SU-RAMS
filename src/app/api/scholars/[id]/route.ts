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
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    console.log("PUT RECEIVED DATA: ", await req.clone().json());
    const data = await req.json();
    const { 
      scholarId, enrollmentNumber, firstName, lastName, email, phone, country,
      dateOfBirth, gender, address, schoolId, departmentId, program, status,
      supervisorId
    } = data;

    
    const updatedScholar = await prisma.scholar.update({
      where: { id },
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
        status
      }
    });

    if (supervisorId !== undefined) {
      if (supervisorId === "") {
        await prisma.supervisorAssignment.deleteMany({ where: { scholarId: id } });
      } else {
        await prisma.supervisorAssignment.upsert({
          where: { scholarId: id },
          create: { scholarId: id, supervisorId, assignedById: auth.id as string, status: 'ASSIGNED' },
          update: { supervisorId, assignedById: auth.id as string, status: 'ASSIGNED' }
        });
      }
    }

    if (data.courseIds !== undefined) {
      await prisma.scholarCourse.deleteMany({ where: { scholarId: id } });
      if (Array.isArray(data.courseIds) && data.courseIds.length > 0) {
        await prisma.scholarCourse.createMany({
          data: data.courseIds.map((courseId: string) => ({
            scholarId: id,
            courseId,
            allocatedById: auth.id as string
          }))
        });
        
        // Reset supervisor assignment status so the assignment block gets re-verified
        await prisma.supervisorAssignment.updateMany({
          where: { scholarId: id },
          data: { status: 'ASSIGNED' }
        });
      }
    }

    return NextResponse.json({ message: 'Scholar updated', scholar: updatedScholar });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.scholar.delete({ where: { id } });
    return NextResponse.json({ message: 'Scholar deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const scholar = await prisma.scholar.findUnique({
      where: { id },
      include: {
        school: true,
        department: true,
        verifications: true,
        supervisor: true,
        courses: { include: { course: true } }
      }
    });

    if (!scholar) {
      return NextResponse.json({ error: 'Scholar not found' }, { status: 404 });
    }

    return NextResponse.json({ scholar });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}