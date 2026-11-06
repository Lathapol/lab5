const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { test } = require('node:test');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const { createApp } = require('../dist/app');

test('request ownership, concurrent claim and final decision', async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Set TEST_DATABASE_URL to a migrated test database.');
  const db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
  const api = request(createApp(db, 8, 10));
  const userIds = [];
  t.after(async () => {
    try {
      const owned = { requesterId: { in: userIds } };
      await db.requestHistory.deleteMany({ where: { request: owned } });
      await db.request.deleteMany({ where: owned });
      await db.session.deleteMany({ where: { userId: { in: userIds } } });
      await db.user.deleteMany({ where: { id: { in: userIds } } });
    } finally {
      await db.$disconnect();
    }
  });

  async function actor(role) {
    const { id } = await db.user.create({
      data: { username: randomUUID(), passwordHash: 'unused', role },
    });
    userIds.push(id);
    const token = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
    await db.session.create({
      data: { id: token, userId: id, expiresAt: new Date(Date.now() + 60_000) },
    });
    return { id, cookie: 'session=' + token };
  }

  const owner = await actor('REQUESTER');
  const other = await actor('REQUESTER');
  const reviewers = [await actor('REVIEWER'), await actor('REVIEWER')];
  const submit = { title: 'Lab equipment', category: 'PURCHASE', amount: '99.50', justification: 'Sprint demo' };
  await api.post('/api/requests').send(submit).expect(401);
  await api.post('/api/requests').set('Cookie', owner.cookie).send({ ...submit, amount: '0' }).expect(400);
  const created = await api.post('/api/requests').set('Cookie', owner.cookie).send(submit).expect(201);
  const id = created.body.data.id;
  const path = '/api/requests/' + id;
  assert.equal(created.body.data.state, 'PENDING');
  assert.equal(created.body.data.reviewerId, null);
  await api.get(path).set('Cookie', other.cookie).expect(404);
  await api.post(path + '/claim').set('Cookie', owner.cookie).send({}).expect(403);
  await api.post(path + '/approve').set('Cookie', reviewers[0].cookie).send({}).expect(403);

  const claims = await Promise.all(reviewers.map(({ cookie }) =>
    api.post(path + '/claim').set('Cookie', cookie).send({}),
  ));
  assert.deepEqual(claims.map(({ status }) => status).sort(), [200, 409]);
  const winnerIndex = claims.findIndex(({ status }) => status === 200);
  const winner = reviewers[winnerIndex];
  const loser = reviewers[1 - winnerIndex];
  assert.equal(await db.requestHistory.count({ where: { requestId: id, toState: 'IN_REVIEW' } }), 1);
  await api.post(path + '/approve').set('Cookie', loser.cookie).send({}).expect(403);
  await api.post(path + '/reject').set('Cookie', winner.cookie).send({ reason: ' ' }).expect(400);
  await api.post(path + '/reject').set('Cookie', winner.cookie).send({ reason: 'Budget limit' }).expect(200);
  await api.post(path + '/approve').set('Cookie', winner.cookie).send({}).expect(409);

  const saved = await api.get(path).set('Cookie', owner.cookie).expect(200);
  assert.equal(saved.body.data.state, 'REJECTED');
  assert.equal(saved.body.data.reviewerId, winner.id);
  assert.equal(saved.body.data.decisionReason, 'Budget limit');
  assert.equal(await db.requestHistory.count({ where: { requestId: id } }), 3);
});
