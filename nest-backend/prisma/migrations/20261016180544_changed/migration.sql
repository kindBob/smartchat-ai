-- DropIndex
DROP INDEX "Message_chatId_idx";

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");
