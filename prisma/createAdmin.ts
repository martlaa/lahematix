import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Creates (or promotes) an ADMIN user. Admins can't be made from the invite UI
// on purpose, so use this for the first admin and any additional ones.
//
//   Local (DDEV):
//     ddev exec npm run admin:create -- someone@example.com "Full Name"
//   Production (Hetzner):
//     docker compose -f docker-compose.prod.yml run --rm migrate \
//       npm run admin:create -- someone@example.com "Full Name"
//
// Env vars ADMIN_EMAIL / ADMIN_NAME also work instead of positional args.
async function main() {
  const email = (process.env.ADMIN_EMAIL ?? process.argv[2] ?? '').trim().toLowerCase();
  const name = process.env.ADMIN_NAME ?? process.argv[3] ?? 'LAHEMATE admin';

  if (!email) {
    console.error('Usage: npm run admin:create -- <email> ["Full Name"]');
    process.exit(1);
  }

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: { email, name, role: 'ADMIN', status: 'ACTIVE' },
  });

  console.log(`Admin ready: ${admin.email} (${admin.name})`);
  console.log('They can now log in at /login via the emailed magic link.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
