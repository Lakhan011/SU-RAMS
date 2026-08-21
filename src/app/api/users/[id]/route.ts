import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

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
  if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'RDC_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { name, email, password, roleId, schoolId, departmentId } = data;

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    let finalSchoolId = null;
    let finalDepartmentId = null;

    if (role.name === 'DEAN') {
      if (!schoolId) return NextResponse.json({ error: 'School is required for this role' }, { status: 400 });
      
      const existingDean = await prisma.user.findFirst({
        where: {
          schoolId: schoolId,
          role: { name: 'DEAN' },
          id: { not: id }
        }
      });
      if (existingDean) {
        return NextResponse.json({ error: 'This School already has an assigned Dean' }, { status: 400 });
      }
      finalSchoolId = schoolId;
    } else if (role.name === 'COORDINATOR') {
      if (!schoolId) return NextResponse.json({ error: 'School is required for this role' }, { status: 400 });
      finalSchoolId = schoolId;
    } else if (role.name === 'HOD') {
      if (!departmentId) return NextResponse.json({ error: 'Department is required for this role' }, { status: 400 });
      const dept = await prisma.department.findUnique({ where: { id: departmentId } });
      finalDepartmentId = departmentId;
      finalSchoolId = dept?.schoolId;
    } else if (role.name === 'VC' || role.name === 'RDC_ADMIN' || role.name === 'SUPER_ADMIN' || role.name === 'SUPERVISOR') {
      finalSchoolId = null;
      finalDepartmentId = null;
    } else {
       finalSchoolId = schoolId || null;
       finalDepartmentId = departmentId || null;
    }

    const updateData: any = {
      name,
      email,
      roleId,
      schoolId: finalSchoolId,
      departmentId: finalDepartmentId
    };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true, school: true, department: true }
    });

    return NextResponse.json({ message: 'User updated', user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'RDC_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}