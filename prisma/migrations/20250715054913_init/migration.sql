-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "aramex_username" TEXT,
    "aramex_password" TEXT,
    "aramex_account_number" TEXT,
    "aramex_account_pin" TEXT,
    "shiprocket_username" TEXT,
    "shiprocket_password" TEXT,
    "shiprocket_token" TEXT,
    "usps_client_id" TEXT,
    "usps_client_secret" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),

    CONSTRAINT "ShippingService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutUsSection" (
    "id" SERIAL NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "section_name" TEXT NOT NULL,
    "heading" TEXT,
    "sub_heading" TEXT,
    "description" TEXT,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutUsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutUsComponent" (
    "id" SERIAL NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "heading" TEXT,
    "sub_heading" TEXT,
    "description" TEXT,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "precentage" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutUsComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AboutUsComponent" ADD CONSTRAINT "AboutUsComponent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "AboutUsSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
