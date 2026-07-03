-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "translations" JSONB,
ALTER COLUMN "definition" SET NOT NULL,
ALTER COLUMN "definition" SET DATA TYPE TEXT;
