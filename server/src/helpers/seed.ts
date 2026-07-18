import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import config from '../config';
import prisma from '../shared/prisma';

const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        email: config.super_admin_email,
        role: UserRole.ADMIN,
      },
    });

    if (isExistSuperAdmin) {
      console.log('Super admin already exists!');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.super_admin_password as string,
      Number(config.salt_round),
    );

    const superAdminData = await prisma.user.create({
      data: {
        email: config.super_admin_email as string,
        password: hashedPassword as string,
        role: UserRole.ADMIN,
        admin: {
          create: {
            name: 'Super Admin',
            contactNumber: '+8801234567890',
          },
        },
      },
    });

    console.log('Super Admin Created Successfully!', superAdminData);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
};

export default seedSuperAdmin;
