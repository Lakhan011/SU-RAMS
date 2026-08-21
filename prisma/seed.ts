import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Complete system access' },
    { name: 'VC', description: 'University-wide read access' },
    { name: 'RDC_ADMIN', description: 'RDC level approval and verification' },
    { name: 'SUPERVISOR', description: 'Supervisor for PhD students' },
    { name: 'DEAN', description: 'Head of a School' },
    { name: 'HOD', description: 'Head of a Department' },
    { name: 'COORDINATOR', description: 'School Coordinator for operations' },
    { name: 'STUDENT', description: 'PhD Student' },
  ]

  const roleMap: Record<string, string> = {}
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    })
    roleMap[r.name] = role.id
  }

  // Super Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sharda.edu' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['SUPER_ADMIN'],
    },
  })

  // Schools
  const schoolA = await prisma.school.upsert({
    where: { schoolCode: 'SBT' },
    update: {},
    create: {
      schoolCode: 'SBT',
      schoolName: 'School of Business and Technology',
    },
  })

  const schoolB = await prisma.school.upsert({
    where: { schoolCode: 'SHS' },
    update: {},
    create: {
      schoolCode: 'SHS',
      schoolName: 'School of Health Sciences',
    },
  })

  // Departments
  const deptCSE = await prisma.department.upsert({
    where: { departmentCode: 'CSE' },
    update: {},
    create: {
      departmentCode: 'CSE',
      departmentName: 'Computer Science & Engineering',
      schoolId: schoolA.id,
    },
  })

  const deptNursing = await prisma.department.upsert({
    where: { departmentCode: 'NRS' },
    update: {},
    create: {
      departmentCode: 'NRS',
      departmentName: 'Nursing',
      schoolId: schoolB.id,
    },
  })

  // Courses
  const courseCS101 = await prisma.course.upsert({
    where: { courseCode: 'RM101' },
    update: {},
    create: {
      courseCode: 'RM101',
      courseName: 'Research Methodology',
      credits: 4,
      departmentId: deptCSE.id,
    },
  })

  // Dean and Coordinator for School A
  const deanUser = await prisma.user.upsert({
    where: { email: 'dean.sbt@sharda.edu' },
    update: {},
    create: {
      name: 'Dr. Dean SBT',
      email: 'dean.sbt@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['DEAN'],
      schoolId: schoolA.id,
    },
  })

  const coordUser = await prisma.user.upsert({
    where: { email: 'coord.sbt@sharda.edu' },
    update: {},
    create: {
      name: 'Coordinator SBT',
      email: 'coord.sbt@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['COORDINATOR'],
      schoolId: schoolA.id,
    },
  })

  // HOD for Dept CSE (School A) - testing School with HOD
  const hodUser = await prisma.user.upsert({
    where: { email: 'hod.cse@sharda.edu' },
    update: {},
    create: {
      name: 'Dr. HOD CSE',
      email: 'hod.cse@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['HOD'],
      schoolId: schoolA.id,
      departmentId: deptCSE.id,
    },
  })

  // Coordinator for School B (Testing School without HOD)
  const coordBUser = await prisma.user.upsert({
    where: { email: 'coord.shs@sharda.edu' },
    update: {},
    create: {
      name: 'Coordinator SHS',
      email: 'coord.shs@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['COORDINATOR'],
      schoolId: schoolB.id,
    },
  })

  const rdcUser = await prisma.user.upsert({
    where: { email: 'rdc@sharda.edu' },
    update: {},
    create: {
      name: 'RDC Admin',
      email: 'rdc@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['RDC_ADMIN'],
    },
  })

  const supervisorUser = await prisma.user.upsert({
    where: { email: 'supervisor@sharda.edu' },
    update: {},
    create: {
      name: 'Dr. Supervisor One',
      email: 'supervisor@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['SUPERVISOR'],
    },
  })
  
  const studentUser = await prisma.user.upsert({
    where: { email: 'student1@sharda.edu' },
    update: {},
    create: {
      name: 'Student One',
      email: 'student1@sharda.edu',
      passwordHash: hashedPassword,
      roleId: roleMap['STUDENT'],
    },
  })

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
