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
  await prisma.$transaction(async (tx) => {
    // Serialize local seed runs so the second one sees any newly created fixtures.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(3342201)`;
    const [requester, , reviewer] = await Promise.all(accounts.map((account) => tx.user.upsert(account)));
    const fixtures = [
      { state: 'PENDING', title: 'Demo: replace lab equipment', category: 'PURCHASE' },
      { state: 'IN_REVIEW', title: 'Demo: conference travel', category: 'TRAVEL' },
      { state: 'APPROVED', title: 'Demo: student workshop', category: 'FUNDING', reason: 'Within budget' },
      { state: 'REJECTED', title: 'Demo: taxi reimbursement', category: 'REIMBURSEMENT', reason: 'Receipt missing' },
    ];

    for (const fixture of fixtures) {
      const requesterId = requester.id;
      const { title, category, state } = fixture;
      const existing = await tx.request.findFirst({ where: { requesterId, title }, select: { id: true } });
      if (existing) continue;

      const claimed = state !== 'PENDING';
      const decided = state === 'APPROVED' || state === 'REJECTED';
      const reason = fixture.reason ?? null;
      const now = Date.now();
      const createdAt = new Date(now - 2000);
      const history = [{ actorId: requesterId, toState: 'PENDING', createdAt }];
      if (claimed) {
        history.push({ actorId: reviewer.id, fromState: 'PENDING', toState: 'IN_REVIEW', createdAt: new Date(now - 1000) });
      }
      if (decided) {
        history.push({ actorId: reviewer.id, fromState: 'IN_REVIEW', toState: state, reason, createdAt: new Date(now) });
      }

      await tx.request.create({
        data: {
          title, category, state, requesterId, createdAt,
          justification: 'Synthetic request for the Sprint 1 demonstration.',
          amount: '1200.00',
          reviewerId: claimed ? reviewer.id : null,
          decisionReason: reason,
          decidedAt: decided ? new Date(now) : null,
          history: { create: history },
        },
      });
    }
  }, { timeout: 15000 });
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
