-- AlterTable
ALTER TABLE "CompanySettings" ADD COLUMN     "company_state" TEXT,
ADD COLUMN     "is_tax_inclusive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "appliedTaxRate" DOUBLE PRECISION,
ADD COLUMN     "finalAmount" DOUBLE PRECISION,
ADD COLUMN     "isTaxInclusive" BOOLEAN,
ADD COLUMN     "taxAmount" DOUBLE PRECISION,
ADD COLUMN     "taxType" TEXT;

-- CreateTable
CREATE TABLE "PaymentService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "paypal_client_id" TEXT,
    "paypal_secret" TEXT,
    "razorpay_key_id" TEXT,
    "razorpay_key_secret" TEXT,
    "cashfree_client_id" TEXT,
    "cashfree_client_secret" TEXT,
    "authorize_net_login_id" TEXT,
    "authorize_net_transaction_key" TEXT,
    "stripe_publishable_key" TEXT,
    "stripe_secret_key" TEXT,
    "hyperpay_entity_id" TEXT,
    "hyperpay_access_token" TEXT,

    CONSTRAINT "PaymentService_pkey" PRIMARY KEY ("id")
);
