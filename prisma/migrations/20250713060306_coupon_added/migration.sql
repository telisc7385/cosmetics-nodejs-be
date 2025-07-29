/*
  Warnings:

  - You are about to drop the column `cartId` on the `CouponCode` table. All the data in the column will be lost.
  - You are about to drop the column `used` on the `CouponCode` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CouponCode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CouponCode" DROP CONSTRAINT "CouponCode_cartId_fkey";

-- DropForeignKey
ALTER TABLE "CouponCode" DROP CONSTRAINT "CouponCode_userId_fkey";

-- AlterTable
ALTER TABLE "CouponCode" DROP COLUMN "cartId",
DROP COLUMN "used",
DROP COLUMN "userId",
ADD COLUMN     "maxRedeemCount" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "redeemCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "show_on_homepage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "cartId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CouponRedemption_couponId_cartId_key" ON "CouponRedemption"("couponId", "cartId");

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "CouponCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
