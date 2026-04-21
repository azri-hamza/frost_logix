-- Add the column with a temporary default value
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '0000';
