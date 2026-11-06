# CPE 334 Sprint 1 Group Work

Sprint 1 establishes the product baseline and releases one tested workflow through the UI, backend, and database. The assigned theme is Workflow and Approval System. See the [proposed Sprint 1 scope](docs/sprints/sprint-1/proposed-scope.md) and check it against the course group specification before finalizing the feature contracts.

## Engineering documents

- A: docs/srs.md
- B: docs/features.md and docs/traceability.md
- C: docs/system-sds.md
- D: docs/sprints/plan.md
- E: docs/sprints/sprint-1/ for feature contracts and test specifications
- F: Record release verification, demonstrations and review evidence for the submission PDF.

## Git workflow

1. Link the issue to its feature and contract. Commit the Sprint 1 contract and test design before implementing the feature.
2. Branch from sprint-1-staging. Open a pull request back into that branch and have the other teammate review it.
3. Verify the integrated increment and open a reviewed release pull request from sprint-1-staging into main. Record the released commit and its local build and test results.

## Local database setup

Install Node.js and PostgreSQL. Create an empty PostgreSQL database named
`approvals` and give your local database user permission to create tables in
it. Copy `.env.example` to `.env` and set `DATABASE_URL` and a synthetic
`SEED_PASSWORD`. URL-encode special characters in the database password.

Run these commands from the repository root.

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

The seed creates two Requesters (`requester1`, `requester2`) and two Reviewers
(`reviewer1`, `reviewer2`) using the configured synthetic password. Use a
disposable local database for demo data. Keep your `.env` out of Git.

## Run the authentication API

After database setup, run the following from the repository root.

```sh
npm run build
npm start
```

The API defaults to port 3000. Send JSON to POST /api/auth/login with username
and password. Send the issued cookie to GET /api/auth/me or to
POST /api/auth/logout with an empty JSON object. To run the integration test,
set TEST_DATABASE_URL to a separate PostgreSQL database with the migration
applied, then run npm test.
