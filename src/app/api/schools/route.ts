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

  const schools = await prisma.school.findMany({
    include: {
      _count: {
        select: { scholars: true, departments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ schools });
}

export async function POST(req: NextRequest) {
  const auth = await checkAuth(req);
  if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'RDC_ADMIN' && auth.role !== 'VC')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { schoolCode, schoolName, status } = data;

    if (!schoolCode || !schoolName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSchool = await prisma.school.create({
      data: {
        schoolCode,
        schoolName,
        status: status || 'ACTIVE',
      }
    });

    return NextResponse.json({ message: 'School created', school: newSchool });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}