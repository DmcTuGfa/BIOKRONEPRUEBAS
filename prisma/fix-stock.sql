-- Corregir stock de productos que quedaron en 0 por pruebas de checkout
-- Solo actualiza productos que tengan stock = 0 actualmente
-- IMPORTANTE: ajusta los valores según tus productos reales

-- Opción A: Restablecer todo el stock a un valor base (recomendado para inicio)
UPDATE "Product" SET stock = 200 WHERE stock = 0 AND active = true;

-- Opción B (alternativa): Ver cuáles tienen stock 0
-- SELECT id, slug, name, stock FROM "Product" WHERE stock = 0;

-- También corregir AK-Neem que tiene priceMxn = 0 en el seed
-- (sin precio no puede venderse)
-- UPDATE "Product" SET "priceMxn" = 45000 WHERE slug = 'ak-neem' AND "priceMxn" = 0;
