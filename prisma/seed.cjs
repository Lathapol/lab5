const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const password = process.env.SEED_PASSWORD;
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  if (!password || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set SEED_PASSWORD to a synthetic password of at most 72 UTF-8 bytes.');
  }
  if (!Number.isInteger(rounds) || rounds < 10 || rounds > 15) {
    throw new Error('BCRYPT_ROUNDS must be an integer from 10 to 15.');
  }

  const accounts = await Promise.all(
    ['requester1', 'requester2', 'reviewer1', 'reviewer2'].map(async (username) => {
      const passwordHash = await hash(password, rounds);
      const role = username.startsWith('requester') ? 'REQUESTER' : 'REVIEWER';
      return {
        where: { username },
        create: { username, role, passwordHash },
        update: { role, passwordHash },
      };
    }),
  );
  await prisma.$transaction(accounts.map((account) => prisma.user.upsert(account)));
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
