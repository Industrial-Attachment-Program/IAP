/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding the database...');

    const hashedPassword = await bcrypt.hash('secretunlocked123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@rca.ac.rw' },
        update: {
            name: 'Mukama Louis',
            role: 'ADMIN',
            password: hashedPassword,
            isActive: true,
            loginAttempts: 0,
            lockUntil: null,
            tokenVersion: 0,
        },
        create: {
            email: 'admin@rca.ac.rw',
            name: 'Mukama Louis',
            role: 'ADMIN',
            password: hashedPassword,
            isActive: true,
        },
    });

    console.log(`Admin user created or updated: ${adminUser.email}`);
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
