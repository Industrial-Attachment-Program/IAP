import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('secretunlocked123', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'mukamalouis1@gmail.com' },
    update: {},
    create: {
      email: 'mukamalouis1@gmail.com',
      name: 'Mukama Louis',
      role: UserRole.ADMIN,
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log('Admin user created:', adminUser);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });