import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const type = req.nextUrl.searchParams.get("type") || "DRC";
    const presentations = await prisma.presentation.findMany({
      where: { scholarId: id, type },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ presentations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    const presentation = await prisma.presentation.create({
      data: {
        scholarId: id,
        type: data.type || 'DRC',
        researchNominees: data.researchNominees,
        nomineesStatus: data.nomineesStatus || 'APPROVED_BY_VC',
        synopsisUrl: data.synopsisUrl,
        momUrl: data.momUrl,
        documentsUrl: data.documentsUrl,
        externalExperts: data.externalExperts,
        result: data.result,
        remarks: data.remarks
      }
    });

    return NextResponse.json({ message: "Presentation recorded successfully", presentation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
