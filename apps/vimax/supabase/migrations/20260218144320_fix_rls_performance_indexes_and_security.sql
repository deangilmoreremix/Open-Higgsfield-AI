/*
  # Fix RLS Performance, Remove Unused Indexes, and Harden Security Policies

  ## Summary
  This migration resolves all reported security and performance issues:

  ## 1. RLS Initialization Plan Fixes
  Replace `auth.uid()` with `(select auth.uid())` in all affected policies so
  Postgres evaluates the function once per query instead of once per row,
  improving performance at scale. Affected tables:
  - public.job_progress
  - public.video_jobs
  - public.vimax_batches
  - public.vimax_feedback
  - public.vimax_generation_history
  - public.vimax_jobs
  - public.vimax_users

  ## 2. Remove Unused Indexes
  Drops 14 indexes that have never been used, reducing write overhead and storage.

  ## 3. Fix Mutable Search Path on Function
  Recreates `update_updated_at_column` with a fixed `search_path` to prevent
  search-path injection attacks.

  ## 4. Remove Always-True RLS Policies
  Drops overly permissive policies that bypass row-level security entirely.
  Backend operations should use the service_role key, which bypasses RLS
  automatically and does not require these policies.

  ## 5. Restrict "Anyone can create video jobs"
  Limits job creation to authenticated users who can only set their own user_id.
*/

-- ============================================================
-- SECTION 1: Fix RLS policies on job_progress
-- ============================================================

DROP POLICY IF EXISTS "Users can view progress for their own jobs" ON public.job_progress;
CREATE POLICY "Users can view progress for their own jobs"
  ON public.job_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.video_jobs
      WHERE video_jobs.id = job_progress.job_id
        AND video_jobs.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Service role can insert progress" ON public.job_progress;
DROP POLICY IF EXISTS "Service role can update progress" ON public.job_progress;

-- ============================================================
-- SECTION 2: Fix RLS policies on video_jobs
-- ============================================================

DROP POLICY IF EXISTS "Users can view own jobs" ON public.video_jobs;
CREATE POLICY "Users can view own jobs"
  ON public.video_jobs
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own jobs" ON public.video_jobs;
CREATE POLICY "Users can update own jobs"
  ON public.video_jobs
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Anyone can create video jobs" ON public.video_jobs;
CREATE POLICY "Authenticated users can create own jobs"
  ON public.video_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================
-- SECTION 3: Fix RLS policies on vimax_batches
-- ============================================================

DROP POLICY IF EXISTS "Auth users can read own batches" ON public.vimax_batches;
CREATE POLICY "Auth users can read own batches"
  ON public.vimax_batches
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid())::text) = user_id);

DROP POLICY IF EXISTS "Backend can insert batches" ON public.vimax_batches;
DROP POLICY IF EXISTS "Backend can update batches" ON public.vimax_batches;

-- ============================================================
-- SECTION 4: Fix RLS policies on vimax_feedback
-- ============================================================

DROP POLICY IF EXISTS "Auth users can read own feedback" ON public.vimax_feedback;
CREATE POLICY "Auth users can read own feedback"
  ON public.vimax_feedback
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid())::text) = user_id);

DROP POLICY IF EXISTS "Auth users can insert own feedback" ON public.vimax_feedback;
CREATE POLICY "Auth users can insert own feedback"
  ON public.vimax_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (((SELECT auth.uid())::text) = user_id);

DROP POLICY IF EXISTS "Backend can insert feedback" ON public.vimax_feedback;

-- ============================================================
-- SECTION 5: Fix RLS policies on vimax_generation_history
-- ============================================================

DROP POLICY IF EXISTS "Auth users can read own history" ON public.vimax_generation_history;
CREATE POLICY "Auth users can read own history"
  ON public.vimax_generation_history
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid())::text) = user_id);

DROP POLICY IF EXISTS "Backend can delete history" ON public.vimax_generation_history;
DROP POLICY IF EXISTS "Backend can insert history" ON public.vimax_generation_history;

-- ============================================================
-- SECTION 6: Fix RLS policies on vimax_jobs
-- ============================================================

DROP POLICY IF EXISTS "Auth users can read own jobs" ON public.vimax_jobs;
CREATE POLICY "Auth users can read own jobs"
  ON public.vimax_jobs
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid())::text) = user_id);

DROP POLICY IF EXISTS "Backend can delete jobs" ON public.vimax_jobs;
DROP POLICY IF EXISTS "Backend can insert jobs" ON public.vimax_jobs;
DROP POLICY IF EXISTS "Backend can update jobs" ON public.vimax_jobs;

-- ============================================================
-- SECTION 7: Fix RLS policies on vimax_users
-- ============================================================

DROP POLICY IF EXISTS "Auth users can read own profile" ON public.vimax_users;
CREATE POLICY "Auth users can read own profile"
  ON public.vimax_users
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid())::text) = id);

DROP POLICY IF EXISTS "Auth users can update own profile" ON public.vimax_users;
CREATE POLICY "Auth users can update own profile"
  ON public.vimax_users
  FOR UPDATE
  TO authenticated
  USING (((SELECT auth.uid())::text) = id)
  WITH CHECK (((SELECT auth.uid())::text) = id);

DROP POLICY IF EXISTS "Auth users can insert own profile" ON public.vimax_users;
CREATE POLICY "Auth users can insert own profile"
  ON public.vimax_users
  FOR INSERT
  TO authenticated
  WITH CHECK (((SELECT auth.uid())::text) = id);

DROP POLICY IF EXISTS "Backend can insert users" ON public.vimax_users;
DROP POLICY IF EXISTS "Backend can update users" ON public.vimax_users;

-- ============================================================
-- SECTION 8: Drop unused indexes
-- ============================================================

DROP INDEX IF EXISTS public.idx_video_jobs_user_id;
DROP INDEX IF EXISTS public.idx_video_jobs_status;
DROP INDEX IF EXISTS public.idx_video_jobs_created_at;
DROP INDEX IF EXISTS public.idx_video_jobs_worker_id;
DROP INDEX IF EXISTS public.idx_job_progress_job_id_timestamp;
DROP INDEX IF EXISTS public.vimax_batches_user_id_idx;
DROP INDEX IF EXISTS public.vimax_batches_status_idx;
DROP INDEX IF EXISTS public.vimax_jobs_user_id_idx;
DROP INDEX IF EXISTS public.vimax_jobs_status_idx;
DROP INDEX IF EXISTS public.vimax_jobs_created_at_idx;
DROP INDEX IF EXISTS public.vimax_history_user_id_idx;
DROP INDEX IF EXISTS public.vimax_history_created_at_idx;
DROP INDEX IF EXISTS public.vimax_feedback_user_id_idx;
DROP INDEX IF EXISTS public.vimax_feedback_job_id_idx;

-- ============================================================
-- SECTION 9: Fix mutable search_path on update_updated_at_column
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
