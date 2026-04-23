-- ══════════════════════════════════════════════════════
--  schema.sql  —  Meme Museum  —  Neon DB (PostgreSQL)
-- ══════════════════════════════════════════════════════
-- Incolla questo file nella SQL console di Neon oppure
-- esegui:  node src/db/migrate.js

-- Estensione UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(32) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ── MEMES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  src         TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);

-- ── TAGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL      PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ── MEME_TAGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meme_tags (
  meme_id UUID    NOT NULL REFERENCES memes(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (meme_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_meme_tags_meme_id ON meme_tags(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_tags_tag_id  ON meme_tags(tag_id);

-- ── VOTES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
  user_id  UUID       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meme_id  UUID       NOT NULL REFERENCES memes(id) ON DELETE CASCADE,
  type     VARCHAR(4) NOT NULL CHECK (type IN ('up', 'down')),
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, meme_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_meme_id ON votes(meme_id);

-- ── COMMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id    UUID        NOT NULL REFERENCES memes(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT        NOT NULL CHECK (char_length(text) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_meme_id    ON comments(meme_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- ── VIEW: memes_with_counts ──────────────────────────────
-- FIX: aggregazioni separate per votes e comments per evitare
-- il prodotto cartesiano che gonfiava i conteggi.
CREATE OR REPLACE VIEW memes_with_counts AS
SELECT
  m.id,
  m.src,
  m.description,
  m.created_at,
  m.uploaded_by,

  -- Voti aggregati con subquery correlata → nessun prodotto cartesiano
  COALESCE((
    SELECT COUNT(*) FROM votes v
    WHERE v.meme_id = m.id AND v.type = 'up'
  ), 0)::INT AS likes,

  COALESCE((
    SELECT COUNT(*) FROM votes v
    WHERE v.meme_id = m.id AND v.type = 'down'
  ), 0)::INT AS dislikes,

  -- Commenti
  COALESCE((
    SELECT COUNT(*) FROM comments c
    WHERE c.meme_id = m.id
  ), 0)::INT AS comment_count,

  -- Tags aggregati come array
  COALESCE((
    SELECT ARRAY_AGG(t.name ORDER BY t.name)
    FROM meme_tags mt
    JOIN tags t ON t.id = mt.tag_id
    WHERE mt.meme_id = m.id
  ), '{}') AS tags

FROM memes m;
