-- CAPSÉRA skin quiz results, saved for signed-in customers only. Anonymous visitors can take the quiz, but their
-- answers stay in their own browser tab and are never stored here, so user_id is required.
-- Every completed attempt is kept (newest first in the account), so customers can compare retakes.
-- Safe to run more than once.

create table if not exists public.skin_quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_version smallint not null default 1,
  -- The six answers, exactly as validated by lib/skin-quiz.ts (parseQuizAnswers).
  answers jsonb not null,
  -- Derived by lib/skin-quiz.ts (analyzeSkinQuiz) when saved; null skin_type = the answers were inconclusive.
  skin_type text,
  confidence text not null,
  primary_concern text not null,
  concerns jsonb not null,
  sensitivity text not null,
  -- Catalogue products (lib/product.ts ids) and the kit steps with their relevance, from lib/quiz-record.ts.
  recommendations jsonb not null,
  created_at timestamptz not null default now()
);

-- Value checks mirror the quiz options in lib/skin-quiz.ts (tests/supabase-migrations.test.ts keeps them in sync).
alter table public.skin_quiz_results drop constraint if exists skin_quiz_results_answers_valid;
alter table public.skin_quiz_results add constraint skin_quiz_results_answers_valid check (
  jsonb_typeof(answers) = 'object'
  -- All six keys required (a missing key would make the IN checks below NULL, which a CHECK lets through).
  and answers ?& array['skinType', 'afterCleansing', 'concerns', 'breakouts', 'reaction', 'goal']
  and (answers - array['skinType', 'afterCleansing', 'concerns', 'breakouts', 'reaction', 'goal']) = '{}'::jsonb
  and answers ->> 'skinType' in ('normal', 'oily', 'dry', 'combination', 'sensitive', 'not_sure')
  and answers ->> 'afterCleansing' in ('tight_dry', 'oily_quickly', 'balanced', 'mixed', 'irritated', 'not_sure')
  and answers ->> 'breakouts' in ('rarely', 'occasionally', 'frequently', 'constantly')
  and answers ->> 'reaction' in ('rarely', 'sometimes', 'often', 'not_sure')
  and answers ->> 'goal' in ('acne_oil', 'dark_spots', 'tone_glow', 'hydration', 'sensitive', 'maintain', 'complete')
  and jsonb_typeof(answers -> 'concerns') = 'array'
  and jsonb_array_length(answers -> 'concerns') between 1 and 8
  and (answers -> 'concerns') <@ '["acne", "dark_spots", "uneven_tone", "dullness", "oiliness_pores", "dryness", "redness_sensitivity", "maintenance"]'::jsonb
);
alter table public.skin_quiz_results drop constraint if exists skin_quiz_results_derived_valid;
alter table public.skin_quiz_results add constraint skin_quiz_results_derived_valid check (
  (skin_type is null or skin_type in ('normal', 'oily', 'dry', 'combination'))
  and confidence in ('high', 'medium', 'low')
  and primary_concern in ('acne', 'dark_spots', 'uneven_tone', 'dullness', 'oiliness_pores', 'dryness', 'redness_sensitivity', 'maintenance')
  and sensitivity in ('frequent', 'some', 'none_reported', 'unknown')
  and jsonb_typeof(concerns) = 'array'
  and jsonb_typeof(recommendations) = 'object'
);

create index if not exists skin_quiz_results_user_created_idx
  on public.skin_quiz_results (user_id, created_at desc);

-- Row Level Security: customers can save and read only their own results, and can't save under another id.
alter table public.skin_quiz_results enable row level security;

drop policy if exists "Customers can read their own quiz results" on public.skin_quiz_results;
create policy "Customers can read their own quiz results"
  on public.skin_quiz_results for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can save their own quiz results" on public.skin_quiz_results;
create policy "Customers can save their own quiz results"
  on public.skin_quiz_results for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Results are a history: no updates or deletes through the API (they go with the account, via ON DELETE CASCADE).
revoke all on table public.skin_quiz_results from anon, authenticated;
grant select, insert on table public.skin_quiz_results to authenticated;
