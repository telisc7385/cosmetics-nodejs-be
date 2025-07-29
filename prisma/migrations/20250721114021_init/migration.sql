/*
  Warnings:

  - You are about to drop the column `created_by` on the `frontend_blogandseofocuskeywordjoint` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `frontend_blogandseofocuskeywordjoint` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `frontend_blogandtagjoint` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `frontend_blogandtagjoint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "frontend_blogandseofocuskeywordjoint" DROP COLUMN "created_by",
DROP COLUMN "updated_by";

-- AlterTable
ALTER TABLE "frontend_blogandtagjoint" DROP COLUMN "created_by",
DROP COLUMN "updated_by";

-- RenameForeignKey
ALTER TABLE "frontend_blogandtagjoint" RENAME CONSTRAINT "frontend_blogandtagjoint_tag_id_e5497b49_fk_frontend_blogtag_id" TO "frontend_blogandtagjoint_tag_id_fkey";
