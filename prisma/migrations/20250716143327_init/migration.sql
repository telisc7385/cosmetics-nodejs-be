-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "razorpayOrderId" TEXT;
