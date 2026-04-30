-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "graduationYear" INTEGER;
ALTER TABLE "Profile" ADD COLUMN "industrySector" TEXT;
ALTER TABLE "Profile" ADD COLUMN "programme" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "keyHash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiKey" ("createdAt", "id", "keyHash", "label", "lastUsedAt", "revokedAt", "userId") SELECT "createdAt", "id", "keyHash", "label", "lastUsedAt", "revokedAt", "userId" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
