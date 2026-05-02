-- Add product_name to PurchaseInvoiceItem
ALTER TABLE "PurchaseInvoiceItem" ADD COLUMN "product_name" TEXT NOT NULL DEFAULT '';

-- Add product_name to GRNItem
ALTER TABLE "GRNItem" ADD COLUMN "product_name" TEXT NOT NULL DEFAULT '';

-- Add product_name to DeliveryNoteItem
ALTER TABLE "DeliveryNoteItem" ADD COLUMN "product_name" TEXT NOT NULL DEFAULT '';

-- Add product_name to SalesInvoiceItem
ALTER TABLE "SalesInvoiceItem" ADD COLUMN "product_name" TEXT NOT NULL DEFAULT '';