-- Add external_job_id column to render_jobs
-- Required by rendiv-render Edge Function to store the external (worker) job id
-- so render-callback can later correlate a worker callback back to the render_jobs row.
-- Idempotent: safe to run multiple times.

ALTER TABLE public.render_jobs
  ADD COLUMN IF NOT EXISTS external_job_id TEXT;

COMMENT ON COLUMN public.render_jobs.external_job_id IS
  'Identifier of the job in the external render worker (Render.com FFmpeg service). Set by rendiv-render on submission; read by render-callback to match callbacks.';
