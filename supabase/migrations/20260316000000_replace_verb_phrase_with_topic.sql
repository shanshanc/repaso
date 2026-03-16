-- Remove verb/phrase tags (cascades to sentence_tags via ON DELETE CASCADE)
DELETE FROM tags WHERE category IN ('verb', 'phrase');

-- Replace the CHECK constraint to allow topic instead of verb/phrase
ALTER TABLE tags DROP CONSTRAINT tags_category_check;
ALTER TABLE tags ADD CONSTRAINT tags_category_check
  CHECK (category IN ('tense', 'grammar', 'topic'));

-- Seed starter topic tags
INSERT INTO tags (name, category) VALUES
  ('weather',        'topic'),
  ('food & cooking', 'topic'),
  ('shopping',       'topic'),
  ('travel',         'topic'),
  ('health',         'topic'),
  ('work',           'topic'),
  ('family',         'topic'),
  ('daily routines', 'topic'),
  ('emotions',       'topic'),
  ('housing',        'topic'),
  ('numbers & time', 'topic'),
  ('nature',         'topic');
