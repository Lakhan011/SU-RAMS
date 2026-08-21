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
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { departmentCode, departmentName, status, schoolId } = data;

    const updatedDept = await prisma.department.update({
      where: { id },
      data: {
        departmentCode,
        departmentName,
        status,
        schoolId
      }
    });

    return NextResponse.json({ message: 'Department updated', department: updatedDept });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || !['SUPER_ADMIN', 'RDC_ADMIN', 'VC', 'DEAN', 'COORDINATOR'].includes(auth.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: 'Department deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}