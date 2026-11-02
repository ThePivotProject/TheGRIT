
# GRIT - Supabase Cloud Sync - https://thepivotproject.github.io/TheGRIT/

This deployable includes Supabase instant publishing.

## Includes
- index.html with Supabase sync injected, includes https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 and https://thepivotproject.github.io/TheGRIT/
- GRIT_good2.JPG background fully zoomed out
- manifest.json, sw.js, 404.html, .nojekyll

## Setup Supabase (1 time, 2 min)
1. Go to supabase.com -> New Project (free)
2. SQL Editor -> paste:
```
create table grit_trainings (
  athlete_slug text primary key,
  athlete_name text,
  profile jsonb,
  homework jsonb,
  workout text,
  checkin jsonb,
  updated_at timestamp default now(),
  is_published boolean default true
);
alter table grit_trainings enable row level security;
create policy "Allow all" on grit_trainings for all using (true) with check (true);
```
3. Copy URL and anon key from Settings -> API
4. Deploy site to https://thepivotproject.github.io/TheGRIT/ then open https://thepivotproject.github.io/TheGRIT/?coach=1
5. Click ⚙️ Coach Setup bottom right, paste URL + key, Save & Connect

Now when you SAVE any athlete's training, it auto-publishes to cloud. Athlete opening https://thepivotproject.github.io/TheGRIT/#grit-training-cole sees latest instantly.

## Deploy to GitHub
Upload all files to thepivotproject/TheGRIT repo main branch root, enable Pages: main / root.
Live at https://thepivotproject.github.io/TheGRIT/
