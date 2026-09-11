import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || "super-secret-fallback-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

const DEFAULT_DOCUMENTS = [
  { documentNo: 1,  documentName: "High School Mark-sheet / Certificate" },
  { documentNo: 2,  documentName: "Intermediate Mark-sheet / Certificate" },
  { documentNo: 3,  documentName: "Diploma marksheet/certificate (If Applicable)" },
  { documentNo: 4,  documentName: "Diploma Degree (If Applicable)" },
  { documentNo: 5,  documentName: "Diploma marksheet/certificate" },
  { documentNo: 6,  documentName: "Graduation Mark-sheet (Final Year)" },
  { documentNo: 7,  documentName: "Graduation Degree" },
  { documentNo: 8,  documentName: "Post Graduate Mark-sheet (Final Year)" },
  { documentNo: 9,  documentName: "Post Graduate Degree" },
  { documentNo: 10, documentName: "M.Phill Mark-sheet (Final Year)" },
  { documentNo: 11, documentName: "M.Phill Degree" },
  { documentNo: 12, documentName: "NET / SLET / GATE (with valid score) / any other equivalent certificate with valid score / M.Phil. Certificate from UGC recognized university - if any" },
  { documentNo: 13, documentName: "NoC from the organization where currently working for Part-Time Ph.D Scholars." },
  { documentNo: 14, documentName: "School Leaving Certificate / Migration Certificate Original" },
  { documentNo: 15, documentName: "Change of name - if any" },
  { documentNo: 16, documentName: "Aadhar Card (Ph.D Scholar)" },
  { documentNo: 17, documentName: "Filled in Admission Form with photo" },
  { documentNo: 18, documentName: "4 Passport size Photographs" },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id: scholarId } = await params;
  
  const scholar = await prisma.scholar.findUnique({
    where: { id: scholarId },
    include: { 
      documents: { 
        where: { documentType: "MATRICULATION" },
        orderBy: { documentNo: "asc" } 
      },
      undertaking: true, 
      verifications: true
    },
  });

  if (!scholar) {
    return NextResponse.json({ error: "Scholar not found" }, { status: 404 });
  }

  // Construct matriculation payload to match frontend expectations seamlessly
  const matriculation = {
    id: scholar.id, // using scholar id
    scholarId: scholar.id,
    mode: scholar.mode || "",
    date: scholar.matriculationDate,
    preparedBy: scholar.preparedBy,
    designation: scholar.designation,
    verificationStatus: scholar.verificationStatus || "PENDING",
    originalDocsProduced: scholar.originalDocsProduced,
    status: scholar.matriculationStatus,
    submittedBy: scholar.submittedBy,
    submittedAt: scholar.submittedAt,
    approvedBy: scholar.approvedBy,
    approvedAt: scholar.approvedAt,
    remarks: scholar.matriculationRemarks,
    documents: scholar.documents,
    undertaking: scholar.undertaking,
    verifications: scholar.verifications,
  };

  return NextResponse.json({ matriculation, defaultDocuments: DEFAULT_DOCUMENTS });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(req);
  const ALLOWED_ROLES = ["SUPER_ADMIN", "RDC_ADMIN", "COORDINATOR", "HOD", "DEAN", "SUPERVISOR", "VC"];

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
        entity: "Scholar",
        entityId: scholarId,
      }
    });

    const updatedScholar = await prisma.scholar.update({
      where: { id: scholarId },
      data: {
        mode: mode || null,
        matriculationDate: date ? new Date(date) : null,
        preparedBy,
        designation,
        verificationStatus,
        originalDocsProduced: !!originalDocsProduced,
        matriculationStatus: "DRAFT"
      },
    });

    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        if (!doc.documentNo) continue;
        
        const existingDoc = await prisma.scholarDocument.findFirst({
          where: { scholarId, documentType: "MATRICULATION", documentNo: doc.documentNo }
        });

        if (existingDoc) {
          await prisma.scholarDocument.update({
            where: { id: existingDoc.id },
            data: {
              documentName: doc.documentName,
              isApplicable: doc.isApplicable ?? true,
              isSubmitted: doc.isSubmitted ?? false,
              fileName: doc.fileName || null,
              filePath: doc.filePath || "",
              fileSize: doc.fileSize || null,
              mimeType: doc.mimeType || null,
            }
          });
        } else {
          await prisma.scholarDocument.create({
            data: {
              scholarId,
              documentType: "MATRICULATION",
              documentNo: doc.documentNo,
              documentName: doc.documentName,
              isApplicable: doc.isApplicable ?? true,
              isSubmitted: doc.isSubmitted ?? false,
              fileName: doc.fileName || null,
              filePath: doc.filePath || "",
              fileSize: doc.fileSize || null,
              mimeType: doc.mimeType || null,
            }
          });
        }
      }
    }

    
    if (undertaking && undertaking.filePath) {
      await prisma.undertaking.upsert({
        where: { scholarId },
        create: {
          scholarId,
          fileName: undertaking.fileName || "",
          filePath: undertaking.filePath,
          remarks: undertaking.remarks || "",
        },
        update: {
          fileName: undertaking.fileName || "",
          filePath: undertaking.filePath,
          remarks: undertaking.remarks || "",
        }
      });
    }

    // Refresh mapped object

    const finalScholar = await prisma.scholar.findUnique({
      where: { id: scholarId },
      include: { 
        documents: { where: { documentType: "MATRICULATION" }, orderBy: { documentNo: "asc" } },
        undertaking: true, verifications: true
      },
    });

    if (!finalScholar) throw new Error("Scholar not found after update");

    const matriculation = {
      id: finalScholar.id,
      scholarId: finalScholar.id,
      mode: finalScholar.mode || "",
      date: finalScholar.matriculationDate,
      preparedBy: finalScholar.preparedBy,
      designation: finalScholar.designation,
      verificationStatus: finalScholar.verificationStatus || "PENDING",
      originalDocsProduced: finalScholar.originalDocsProduced,
      status: finalScholar.matriculationStatus,
      submittedBy: finalScholar.submittedBy,
      submittedAt: finalScholar.submittedAt,
      approvedBy: finalScholar.approvedBy,
      approvedAt: finalScholar.approvedAt,
      remarks: finalScholar.matriculationRemarks,
      documents: finalScholar.documents,
      undertaking: finalScholar.undertaking,
      verifications: finalScholar.verifications,
    };

    return NextResponse.json({ message: "Matriculation checklist saved", matriculation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save matriculation checklist" }, { status: 500 });
  }
}
