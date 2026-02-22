-- Seed tags across all four categories

insert into tags (name, category) values
  -- Tenses
  ('presente',          'tense'),
  ('pretérito',         'tense'),
  ('imperfecto',        'tense'),
  ('pluscuamperfecto',  'tense'),
  ('subjuntivo',        'tense'),
  ('futuro',            'tense'),
  ('condicional',       'tense'),

  -- Grammar
  ('ser vs estar',      'grammar'),
  ('por vs para',       'grammar'),
  ('pronombres',        'grammar'),

  -- Verbs
  ('llegar',            'verb'),
  ('hacer',             'verb'),
  ('tener',             'verb'),
  ('poner',             'verb'),

  -- Phrases
  ('antes de que',      'phrase'),
  ('a pesar de',        'phrase'),
  ('en cuanto',         'phrase');

-- Seed a few example sentences with tags

insert into sentences (id, sentence, translation, source) values
  ('a0000000-0000-0000-0000-000000000001',
   'Antes de que llegaras, ya habíamos comido.',
   'Before you arrived, we had already eaten.',
   'manual'),
  ('a0000000-0000-0000-0000-000000000002',
   'A pesar de la lluvia, salimos a caminar.',
   'Despite the rain, we went out for a walk.',
   'manual'),
  ('a0000000-0000-0000-0000-000000000003',
   'En cuanto tenga tiempo, haré la tarea.',
   'As soon as I have time, I will do the homework.',
   'manual');

-- Link sentences to tags
insert into sentence_tags (sentence_id, tag_id)
select 'a0000000-0000-0000-0000-000000000001', id from tags where (name, category) in (('pluscuamperfecto', 'tense'), ('llegar', 'verb'), ('antes de que', 'phrase'));

insert into sentence_tags (sentence_id, tag_id)
select 'a0000000-0000-0000-0000-000000000002', id from tags where (name, category) in (('pretérito', 'tense'), ('a pesar de', 'phrase'));

insert into sentence_tags (sentence_id, tag_id)
select 'a0000000-0000-0000-0000-000000000003', id from tags where (name, category) in (('subjuntivo', 'tense'), ('futuro', 'tense'), ('hacer', 'verb'), ('tener', 'verb'), ('en cuanto', 'phrase'));
