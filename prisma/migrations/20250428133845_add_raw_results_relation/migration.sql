-- CreateTable
CREATE TABLE "RawResult" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "platform" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawResult" ADD CONSTRAINT "RawResult_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
