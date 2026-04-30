-- Migración segura: agregar trackingUrl y shippingStatus a la tabla Order
-- Es idempotente: puede ejecutarse múltiples veces sin error.
-- Ejecutar en el SQL Editor de Neon ANTES de hacer deploy del nuevo código.

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "trackingUrl"    TEXT,
  ADD COLUMN IF NOT EXISTS "shippingStatus" TEXT DEFAULT 'PENDIENTE';
