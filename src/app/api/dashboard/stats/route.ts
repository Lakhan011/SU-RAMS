import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, key);
    
    // Always trust DB as source of truth to avoid stale JWT bugs
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { name: true, role: true, schoolId: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const roleName = user.role.name;
    const schoolId = user.schoolId;

    let schools = await prisma.school.count();
    let departments = await prisma.department.count();
    let courses = await prisma.course.count();
    let supervisors = await prisma.user.count({ where: { role: { name: 'SUPERVISOR' } } });
    let scholars = await prisma.scholar.count();

    if (roleName === 'COORDINATOR' && schoolId) {
      departments = await prisma.department.count({ where: { schoolId: schoolId as string } });
      courses = await prisma.course.count({ where: { department: { schoolId: schoolId as string } } });
      scholars = await prisma.scholar.count({ where: { schoolId: schoolId as string } });
    }

    let stats = [];

    if (roleName === 'COORDINATOR') {
      stats = [
        { label: 'Total Departments', value: departments, change: 0, icon: 'Briefcase' },
        { label: 'Courses', value: courses, change: 0, icon: 'BookOpen' },
        { label: 'Ph.D. Scholars', value: scholars, change: 0, icon: 'GraduationCap' },
      ];
    } else {
      stats = [
        { label: 'Total Schools', value: schools, change: 0, icon: 'Building2' },
        { label: 'Departments', value: departments, change: 0, icon: 'Briefcase' },
        { label: 'Courses', value: courses, change: 0, icon: 'BookOpen' },
        { label: 'Supervisors', value: supervisors, change: 0, icon: 'UserCheck' },
        { label: 'Ph.D. Scholars', value: scholars, change: 0, icon: 'GraduationCap' },
      ];
    }

    return NextResponse.json({
      name: user.name || 'User',
      stats
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}