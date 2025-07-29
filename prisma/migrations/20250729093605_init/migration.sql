-- AlterTable
ALTER TABLE "User" ADD COLUMN     "AdminRoleId" INTEGER;

-- CreateTable
CREATE TABLE "AdminRoles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAccesses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAccesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRolesAccessJoint" (
    "id" SERIAL NOT NULL,
    "RoleId" INTEGER NOT NULL,
    "AccessId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRolesAccessJoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminRoles_name_key" ON "AdminRoles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccesses_name_key" ON "AdminAccesses"("name");

-- AddForeignKey
ALTER TABLE "AdminRolesAccessJoint" ADD CONSTRAINT "AdminRolesAccessJoint_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "AdminRoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRolesAccessJoint" ADD CONSTRAINT "AdminRolesAccessJoint_AccessId_fkey" FOREIGN KEY ("AccessId") REFERENCES "AdminAccesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_AdminRoleId_fkey" FOREIGN KEY ("AdminRoleId") REFERENCES "AdminRoles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
