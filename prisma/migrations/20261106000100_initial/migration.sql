-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FUNDING', 'PURCHASE', 'TRAVEL', 'REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "RequestState" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "justification" TEXT NOT NULL,
    "state" "RequestState" NOT NULL DEFAULT 'PENDING',
    "requesterId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "decisionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestHistory" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "fromState" "RequestState",
    "toState" "RequestState" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Request_requesterId_idx" ON "Request"("requesterId");

-- CreateIndex
CREATE INDEX "Request_reviewerId_idx" ON "Request"("reviewerId");

-- CreateIndex
CREATE INDEX "Request_state_idx" ON "Request"("state");

-- CreateIndex
CREATE INDEX "RequestHistory_requestId_idx" ON "RequestHistory"("requestId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestHistory" ADD CONSTRAINT "RequestHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestHistory" ADD CONSTRAINT "RequestHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "Request"
  ADD CONSTRAINT "request_positive_amount" CHECK ("amount" > 0),
  ADD CONSTRAINT "request_nonblank_text" CHECK ("title" ~ '[^[:space:]]' AND "justification" ~ '[^[:space:]]'),
  ADD CONSTRAINT "request_reviewer_matches_state" CHECK (("state" = 'PENDING') = ("reviewerId" IS NULL)),
  ADD CONSTRAINT "request_no_self_review" CHECK ("reviewerId" <> "requesterId"),
  ADD CONSTRAINT "request_rejection_reason" CHECK ("state" <> 'REJECTED' OR ("decisionReason" IS NOT NULL AND "decisionReason" ~ '[^[:space:]]'));
