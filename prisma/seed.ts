// prisma/seed.ts
import prisma from '../src/db/prisma';
import bcrypt from 'bcryptjs';

// async function main() {
//   const email = process.env.ADMIN_EMAIL;
//   const password = process.env.ADMIN_PASS;

//   if (!email || !password) {
//     throw new Error('Missing ADMIN_EMAIL or ADMIN_PASS in environment variables');
//   }

//   const superAdmin = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (!superAdmin) {
//     await prisma.user.create({
//       data: {
//         email,
//         password: await bcrypt.hash(password, 10),
//         role: 'ADMIN',
//       },
//     });

//     console.log('✅ Admin user seeded');
//   } else {
//     console.log('ℹ️ Admin user already exists');
//   }
// }

async function main() {
  const admins = [
    {
      email: process.env.ADMIN1_EMAIL,
      password: process.env.ADMIN1_PASS,
    },
    {
      email: process.env.ADMIN2_EMAIL,
      password: process.env.ADMIN2_PASS,
    },
  ];

  for (const admin of admins) {
    if (!admin.email || !admin.password) {
      console.warn(`⚠️ Missing credentials for admin: ${admin.email || 'unknown'}`);
      continue;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: admin.email,
          password: await bcrypt.hash(admin.password, 10),
          role: 'ADMIN',
        },
      });

      console.log(`✅ Admin user created: ${admin.email}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${admin.email}`);
    }
  }
}


main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
