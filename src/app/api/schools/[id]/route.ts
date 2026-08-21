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
  if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'RDC_ADMIN' && auth.role !== 'VC')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { schoolCode, schoolName, status } = data;

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        schoolCode,
        schoolName,
        status,
      }
    });

    return NextResponse.json({ message: 'School updated', school: updatedSchool });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'RDC_ADMIN' && auth.role !== 'VC')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.school.delete({ where: { id } });
    return NextResponse.json({ message: 'School deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}