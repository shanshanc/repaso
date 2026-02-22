-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- sentences
-- ============================================================
create table sentences (
  id         uuid primary key default uuid_generate_v4(),
  sentence   text not null,
  translation text not null,
  source     text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- tags (unique per name + category pair)
-- ============================================================
create table tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  category   text not null check (category in ('tense', 'grammar', 'verb', 'phrase')),
  created_at timestamptz not null default now(),
  unique (name, category)
);

-- ============================================================
-- sentence_tags (junction table)
-- ============================================================
create table sentence_tags (
  sentence_id uuid not null references sentences (id) on delete cascade,
  tag_id      uuid not null references tags (id) on delete cascade,
  primary key (sentence_id, tag_id)
);

-- Indexes for common query patterns
create index idx_sentence_tags_tag_id on sentence_tags (tag_id);

-- ============================================================
-- Row Level Security — single-user: allow all operations
-- ============================================================

-- sentences
alter table sentences enable row level security;

create policy "Allow all access to sentences"
  on sentences
  for all
  using (true)
  with check (true);

-- tags
alter table tags enable row level security;

create policy "Allow all access to tags"
  on tags
  for all
  using (true)
  with check (true);

-- sentence_tags
alter table sentence_tags enable row level security;

create policy "Allow all access to sentence_tags"
  on sentence_tags
  for all
  using (true)
  with check (true);
