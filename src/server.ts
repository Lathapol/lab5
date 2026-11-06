import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app';

const db = new PrismaClient();
const port = Number(process.env.PORT ?? 3000);
const ttl = Number(process.env.SESSION_TTL_HOURS ?? 8);
const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

const server = createApp(db, ttl, rounds).listen(port, () => {
  console.log('API listening on port', port);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close(() => void db.$disconnect()));
}
