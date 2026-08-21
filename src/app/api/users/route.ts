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

export async function GET(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    where: {
      role: {
        name: {
          notIn: ['SCHOLAR']
        }
      }
    },
    include: { role: true, school: true, department: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const schools = await prisma.school.findMany();
  const departments = await prisma.department.findMany();
  
  const roles = await prisma.role.findMany({
    where: {
      name: {
        notIn: ['SCHOLAR']
      }
    }
  });

  return NextResponse.json({ users, schools, departments, roles });
}

export async function POST(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'RDC_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { name, email, password, roleId, schoolId, departmentId } = data;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
          role: { name: 'DEAN' }
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
      finalSchoolId = dept?.schoolId; // implicitly link to school
    } else if (role.name === 'VC' || role.name === 'RDC_ADMIN' || role.name === 'SUPER_ADMIN' || role.name === 'SUPERVISOR') {
      finalSchoolId = null;
      finalDepartmentId = null;
    } else {
       finalSchoolId = schoolId || null;
       finalDepartmentId = departmentId || null;
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        roleId,
        schoolId: finalSchoolId,
        departmentId: finalDepartmentId
      },
      include: { role: true, school: true, department: true }
    });

    return NextResponse.json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}