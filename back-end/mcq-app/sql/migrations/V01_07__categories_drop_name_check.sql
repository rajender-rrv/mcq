-- Remove fixed vocabulary check on category names (allow any VARCHAR(20) value).
SET search_path TO mcq, public;

ALTER TABLE mcq.categories DROP CONSTRAINT IF EXISTS categories_name_check;
ALTER TABLE mcq.categories DROP CONSTRAINT IF EXISTS ck_categories_name;
