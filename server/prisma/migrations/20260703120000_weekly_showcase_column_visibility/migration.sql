-- AlterTable
ALTER TABLE "weekly_showcase_column_headers" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "weekly_showcase_column_headers" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
