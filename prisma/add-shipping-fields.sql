-- Migración manual: agregar campos de tracking y shippingStatus al Order
-- Ejecutar una sola vez en Railway usando psql o el panel de Neon

-- Crear el enum si no existe
DO $$ BEGIN
  CREATE TYPE "ShippingStatus" AS ENUM ('PENDIENTE', 'PREPARANDO', 'ENVIADO', 'EN_TRANSITO', 'ENTREGADO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agregar campos nuevos (IF NOT EXISTS para que sea idempotente)
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "trackingUrl"    TEXT,
  ADD COLUMN IF NOT EXISTS "shippingStatus" "ShippingStatus" NOT NULL DEFAULT 'PENDIENTE';
