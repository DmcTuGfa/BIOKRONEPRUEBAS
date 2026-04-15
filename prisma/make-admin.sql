-- =============================================================================
-- BIOKRONE — Crear primer usuario ADMIN
-- Ejecutar DESPUÉS del setup.sql, cambia el email por el tuyo
-- =============================================================================

-- Primero regístrate normalmente en la app en /auth/register
-- Luego ejecuta este SQL en Neon para darte rol ADMIN:

UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" = 'TU-CORREO@AQUI.COM';   -- ← cambia esto

-- Verificar:
SELECT "email", "name", "role", "emailVerified"
FROM "User"
WHERE "email" = 'TU-CORREO@AQUI.COM';
