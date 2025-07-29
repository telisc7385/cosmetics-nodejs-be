-- CreateTable
CREATE TABLE "frontend_blog" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "image" VARCHAR(100),
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "product_tag_id" INTEGER,
    "author" VARCHAR(200) NOT NULL,
    "publish_date" DATE NOT NULL,
    "image_alternate_text" VARCHAR(100),
    "seo_metadata" TEXT,
    "seo_title" VARCHAR(100) NOT NULL,

    CONSTRAINT "frontend_blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frontend_blogandseofocuskeywordjoint" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "blog_id" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "keyword_id" INTEGER NOT NULL,

    CONSTRAINT "frontend_blogandseofocuskeywordjoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frontend_blogandtagjoint" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "blog_id" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "frontend_blogandtagjoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frontend_blogseofocuskeyword" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "frontend_blogseofocuskeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frontend_blogtag" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "frontend_blogtag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "frontend_blog" ADD CONSTRAINT "frontend_blog_product_tag_id_fkey" FOREIGN KEY ("product_tag_id") REFERENCES "ProductTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frontend_blogandseofocuskeywordjoint" ADD CONSTRAINT "frontend_blogandseofocuskeywordjoint_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "frontend_blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frontend_blogandseofocuskeywordjoint" ADD CONSTRAINT "frontend_blogandseofocuskeywordjoint_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "frontend_blogseofocuskeyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frontend_blogandtagjoint" ADD CONSTRAINT "frontend_blogandtagjoint_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "frontend_blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frontend_blogandtagjoint" ADD CONSTRAINT "frontend_blogandtagjoint_tag_id_e5497b49_fk_frontend_blogtag_id" FOREIGN KEY ("tag_id") REFERENCES "frontend_blogtag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
