/*
  Warnings:

  - You are about to drop the column `frozen_wishes` on the `inventories` table. All the data in the column will be lost.
  - You are about to drop the column `nightmare_shards` on the `inventories` table. All the data in the column will be lost.
  - You are about to drop the column `oblivion_essence` on the `inventories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "inventories" DROP COLUMN "frozen_wishes",
DROP COLUMN "nightmare_shards",
DROP COLUMN "oblivion_essence",
ADD COLUMN     "crystallized_desires" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "essence_oblivion" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nightmare_fragments" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "pure_fear" SET DEFAULT 0,
ALTER COLUMN "pure_fear" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "moon_dust" SET DEFAULT 0,
ALTER COLUMN "moon_dust" SET DATA TYPE DOUBLE PRECISION;
