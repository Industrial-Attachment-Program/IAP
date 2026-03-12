const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const students = await prisma.student.findMany();
    console.log("Students:", students.map(s => ({
        id: s.id,
        name: s.fullName,
        start: s.internshipStart,
        end: s.internshipEnd,
        profileCompleted: s.profileCompleted
    })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
