import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Muuda see e-post enda omaks — sellega logid esimest korda admin-rollis sisse.
  const adminEmail = 'admin@lahemate.ee';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'LAHEMATE admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`Admin-kasutaja valmis: ${admin.email}`);
  console.log('Mine aadressile /login ja logi sisse selle e-postiga.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
