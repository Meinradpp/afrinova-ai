/*
# Create designs and chat_messages tables

1. New Tables
- `designs`: stores user-created design projects (flyers, business cards, logos).
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to authenticated user)
  - `title` (text, name of the design)
  - `template_type` (text: flyer | business_card | logo | custom)
  - `canvas_data` (jsonb, full editable state: text elements, colors, shapes)
  - `thumbnail` (text, optional data URL preview)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- `chat_messages`: stores AI assistant conversation history per user.
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner)
  - `role` (text: user | assistant)
  - `content` (text, message body)
  - `created_at` (timestamp)

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: authenticated users can only access their own rows.
- `user_id` defaults to `auth.uid()` so inserts omitting it still pass the WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Design',
  template_type text NOT NULL DEFAULT 'custom',
  canvas_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_designs" ON designs;
CREATE POLICY "select_own_designs" ON designs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_designs" ON designs;
CREATE POLICY "insert_own_designs" ON designs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_designs" ON designs;
CREATE POLICY "update_own_designs" ON designs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_designs" ON designs;
CREATE POLICY "delete_own_designs" ON designs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chats" ON chat_messages;
CREATE POLICY "select_own_chats" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chats" ON chat_messages;
CREATE POLICY "insert_own_chats" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chats" ON chat_messages;
CREATE POLICY "delete_own_chats" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
