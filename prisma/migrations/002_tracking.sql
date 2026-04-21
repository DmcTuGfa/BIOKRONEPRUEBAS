-- Agrega campos de guía de envío al modelo Order
-- Ejecutar: psql $DATABASE_URL -f prisma/migrations/002_tracking.sql

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "trackingNumber"  TEXT,
  ADD COLUMN IF NOT EXISTS "shippingCarrier" TEXT;
