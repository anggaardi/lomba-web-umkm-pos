/*
  Warnings:

  - You are about to drop the column `costPerUnit` on the `Ingredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "costPerUnit",
ADD COLUMN     "averageCostPerUnit" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lastPurchasePrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "purchasePrice" DECIMAL(10,2),
ADD COLUMN     "purchaseQty" DOUBLE PRECISION,
ADD COLUMN     "purchaseUnit" TEXT;

-- CreateTable
CREATE TABLE "IngredientPackaging" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conversionValue" DOUBLE PRECISION NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientPackaging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredientPackaging_name_ingredientId_key" ON "IngredientPackaging"("name", "ingredientId");

-- AddForeignKey
ALTER TABLE "IngredientPackaging" ADD CONSTRAINT "IngredientPackaging_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientPackaging" ADD CONSTRAINT "IngredientPackaging_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
