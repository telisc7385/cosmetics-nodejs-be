-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCourier" TEXT,
ADD COLUMN     "shippingETA" TEXT,
ADD COLUMN     "shippingRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "height" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "courierName" TEXT NOT NULL,
    "awbCode" TEXT NOT NULL,
    "trackingUrl" TEXT,
    "shipmentId" TEXT,
    "status" TEXT,
    "labelUrl" TEXT,
    "estimatedDelivery" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_awbCode_key" ON "Shipment"("awbCode");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
