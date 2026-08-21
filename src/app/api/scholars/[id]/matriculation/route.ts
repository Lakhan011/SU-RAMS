import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || "super-secret-fallback-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

const ALLOWED_ROLES = ["SUPER_ADMIN", "RDC_ADMIN", "COORDINATOR", "HOD", "DEAN", "SUPERVISOR", "VC"];

const DEFAULT_DOCUMENTS = [
  { documentNo: 1,  documentName: "10th (Mark-sheet)" },
  { documentNo: 2,  documentName: "10th (Passing Certificate)" },
  { documentNo: 3,  documentName: "12th (Mark-sheet)" },
  { documentNo: 4,  documentName: "12th (Passing Certificate)" },
  { documentNo: 5,  documentName: "Diploma marksheet/certificate" },
  { documentNo: 6,  documentName: "Graduation Mark-sheet (Final Year)" },
  { documentNo: 7,  documentName: "Graduation Degree" },
  { documentNo: 8,  documentName: "Post Graduate Mark-sheet (Final Year)" },
  { documentNo: 9,  documentName: "Post Graduate Degree" },
  { documentNo: 10, documentName: "M.Phill Mark-sheet (Final Year)" },
  { documentNo: 11, documentName: "M.Phill Degree" },
  { documentNo: 12, documentName: "NET / SLET / GATE (with valid score) / any other equivalent certificate with valid score / M.Phil. Certificate from UGC recognized university - if any" },
  { documentNo: 13, documentName: "NoC from the organization where currently working for Part-Time candidates." },
  { documentNo: 14, documentName: "School Leaving Certificate / Migration Certificate Original" },
  { documentNo: 15, documentName: "Change of name - if any" },
  { documentNo: 16, documentName: "Aadhar Card (Student)" },
  { documentNo: 17, documentName: "Filled in Admission Form with photo" },
  { documentNo: 18, documentName: "4 Passport size Photographs" },
];

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: scholarId } = await params;
  const matriculation = await prisma.matriculation.findUnique({
    where: { scholarId },
    include: { 
      documents: { orderBy: { documentNo: "asc" } },
      undertaking: true
    },
  });
  if (!matriculation) {
    return NextResponse.json({ matriculation: null, defaultDocuments: DEFAULT_DOCUMENTS });
  }
  return NextResponse.json({ matriculation });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(req);
  if (!auth || !ALLOWED_ROLES.includes(auth.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  const { id: scholarId } = await params;
  const data = await req.json();
  const { 
    mode, date, preparedBy, designation, verificationStatus, originalDocsProduced, 
    documents, undertaking 
  } = data;
  
  try {
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.id as string,
        action: "UPDATE_MATRICULATION",
        entity: "Matriculation",
        entityId: scholarId,
      }
    });

    const matriculation = await prisma.matriculation.upsert({
      where: { scholarId },
      create: { 
        scholarId, 
        mode, 
        date: date ? new Date(date) : null, 
        preparedBy, 
        designation, 
        verificationStatus, 
        originalDocsProduced: !!originalDocsProduced,
        status: "DRAFT" 
      },
      update: { 
        mode, 
        date: date ? new Date(date) : null, 
        preparedBy, 
        designation, 
        verificationStatus,
        originalDocsProduced: !!originalDocsProduced
      },
    });

    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        await prisma.matriculationDocument.upsert({
          where: { matriculationId_documentNo: { matriculationId: matriculation.id, documentNo: doc.documentNo } },
          create: { 
            matriculationId: matriculation.id, 
            documentNo: doc.documentNo, 
            documentName: doc.documentName, 
            isApplicable: doc.isApplicable ?? false, 
            isSubmitted: doc.isSubmitted ?? false, 
            isVerified: doc.isVerified ?? false, 
            remarks: doc.remarks ?? "",
            fileName: doc.fileName || null,
            filePath: doc.filePath || null,
            fileSize: doc.fileSize || null,
            mimeType: doc.mimeType || null,
            uploadedBy: doc.filePath ? (auth.id as string) : null,
            uploadedAt: doc.filePath ? new Date() : null,
          },
          update: { 
            isApplicable: doc.isApplicable ?? false, 
            isSubmitted: doc.isSubmitted ?? false, 
            isVerified: doc.isVerified ?? false, 
            remarks: doc.remarks ?? "",
            fileName: doc.fileName !== undefined ? doc.fileName : undefined,
            filePath: doc.filePath !== undefined ? doc.filePath : undefined,
            fileSize: doc.fileSize !== undefined ? doc.fileSize : undefined,
            mimeType: doc.mimeType !== undefined ? doc.mimeType : undefined,
            uploadedBy: (doc.filePath && !doc.uploadedBy) ? (auth.id as string) : doc.uploadedBy,
            uploadedAt: (doc.filePath && !doc.uploadedAt) ? new Date() : doc.uploadedAt,
          },
        });
      }
    }

    if (undertaking && undertaking.filePath) {
      await prisma.undertaking.upsert({
        where: { matriculationId: matriculation.id },
        create: {
          matriculationId: matriculation.id,
          fileName: undertaking.fileName,
          filePath: undertaking.filePath,
          remarks: undertaking.remarks,
          uploadedBy: auth.id as string,
        },
        update: {
          fileName: undertaking.fileName,
          filePath: undertaking.filePath,
          remarks: undertaking.remarks,
        }
      });
    }

    return NextResponse.json({ message: "Matriculation checklist saved", matriculation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}