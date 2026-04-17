-- DODOHabit — Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 執行此檔案

CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  success_score INTEGER NOT NULL DEFAULT 3,
  bitterness_score INTEGER NOT NULL DEFAULT 3,
  success_moment TEXT DEFAULT '',
  bitterness_source TEXT DEFAULT 'none',
  emotional_state TEXT DEFAULT '',
  splenic JSONB DEFAULT '{}',
  investigation JSONB DEFAULT '{}',
  experiment JSONB DEFAULT '{}',
  dikw JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (user_id, date)
);

-- 啟用 Row Level Security（每個用戶只能存取自己的資料）
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own entries"
  ON public.daily_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
