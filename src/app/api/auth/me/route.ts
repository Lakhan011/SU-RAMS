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
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { role: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const roleMap: Record<string, string> = {
      'SUPER_ADMIN': 'Administrator',
      'VC': 'Vice Chancellor',
      'RDC_ADMIN': 'RDC Member',
      'SUPERVISOR': 'Supervisor',
      'DEAN': 'Dean',
      'HOD': 'Head of Department',
      'COORDINATOR': 'Coordinator',
      'SCHOLAR': 'Ph.D. Scholar'
    };

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleMap[user.role.name] || user.role.name,
      rawRole: user.role.name,
      schoolId: user.schoolId,
      departmentId: user.departmentId,
      initials: user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}