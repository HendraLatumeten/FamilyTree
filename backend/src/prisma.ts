import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const seedAdmin = async () => {
  const adminEmail = process.env.EMAIL;
  const adminPassword = process.env.PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("[PRISMA] No Admin credentials found in .env (EMAIL/PASSWORD)");
    return;
  }

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
      console.log(`[PRISMA] Admin user created: ${adminEmail}`);
    } else {
      // Ensure existing admin has ADMIN role
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN', isActive: true, password: hashedPassword }
      });
      console.log(`[PRISMA] Admin user updated/verified: ${adminEmail}`);
    }
  } catch (error) {
    console.error("[PRISMA] Error seeding admin:", error);
  }
};

export default prisma;
