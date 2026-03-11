-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GroupMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroupMembership" ("createdAt", "groupId", "id", "personId", "updatedAt") SELECT "createdAt", "groupId", "id", "personId", "updatedAt" FROM "GroupMembership";
DROP TABLE "GroupMembership";
ALTER TABLE "new_GroupMembership" RENAME TO "GroupMembership";
CREATE TABLE "new_PersonServiceIds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceKey" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonServiceIds_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonServiceIds" ("createdAt", "id", "personId", "serviceId", "serviceKey", "updatedAt") SELECT "createdAt", "id", "personId", "serviceId", "serviceKey", "updatedAt" FROM "PersonServiceIds";
DROP TABLE "PersonServiceIds";
ALTER TABLE "new_PersonServiceIds" RENAME TO "PersonServiceIds";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
