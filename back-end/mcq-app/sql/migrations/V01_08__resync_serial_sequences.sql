-- Align SERIAL sequences with MAX(id) after inserts that used explicit ids.
-- Empty tables: setval(..., 1, false) so the next INSERT gets id = 1 (setval(..., 0) is invalid).
SET search_path TO mcq, public;

DO $sync$
DECLARE
  t text;
  mx bigint;
  sq text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users',
    'classes',
    'subjects',
    'categories',
    'questions',
    'question_options',
    'sets',
    'test_templates',
    'test_attempts',
    'test_attempt_questions',
    'user_answers',
    'tags'
  ]
  LOOP
    sq := pg_get_serial_sequence('mcq.' || t, 'id');
    CONTINUE WHEN sq IS NULL;
    EXECUTE format('SELECT MAX(id) FROM mcq.%I', t) INTO mx;
    IF mx IS NULL THEN
      EXECUTE format('SELECT setval(%L, 1, false)', sq);
    ELSE
      EXECUTE format('SELECT setval(%L, %s, true)', sq, mx);
    END IF;
  END LOOP;
END
$sync$;
