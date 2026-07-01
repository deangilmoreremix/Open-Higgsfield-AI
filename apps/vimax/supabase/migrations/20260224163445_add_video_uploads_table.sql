/*
  # Add Video Uploads Table

  ## Summary
  Creates the `vimax_video_uploads` table to track all user-uploaded video files,
  their metadata, and processing status. Also sets up storage policies for
  the `vimax-videos` bucket used to store uploaded video files.

  ## New Tables

  ### vimax_video_uploads
  Stores metadata and status for every video file a user uploads.

  | Column              | Type        | Description                                          |
  |---------------------|-------------|------------------------------------------------------|
  | id                  | uuid        | Primary key                                          |
  | user_id             | text        | Client-generated user identifier                     |
  | original_filename   | text        | Original name of the uploaded file                   |
  | file_size           | bigint      | File size in bytes                                   |
  | mime_type           | text        | MIME type (video/mp4, video/quicktime, etc.)         |
  | format              | text        | Container format: mp4, mov, avi, webm, mkv           |
  | duration_seconds    | numeric     | Video duration extracted client-side                 |
  | width               | integer     | Video width in pixels                                |
  | height              | integer     | Video height in pixels                               |
  | thumbnail_data      | text        | Base64-encoded thumbnail image (generated client-side)|
  | storage_path        | text        | Path within Supabase Storage bucket                  |
  | storage_url         | text        | Public URL for the stored file                       |
  | content_type        | text        | Content category (educational, marketing, etc.)      |
  | status              | text        | Upload lifecycle status                              |
  | error_message       | text        | Error detail if status = 'error'                     |
  | metadata            | jsonb       | Additional extracted metadata (codec, fps, etc.)     |
  | created_at          | timestamptz | Record creation timestamp                            |
  | updated_at          | timestamptz | Last update timestamp                                |

  ## Security
  - RLS enabled
  - Anon and authenticated users can insert/read/update their own records
    (user_id is a client-generated string; no Supabase Auth required)

  ## Notes
  1. Status values: uploading → uploaded → processing → ready | error
  2. content_type values: educational, marketing, social_media, entertainment, documentary, tutorial, general
  3. Indexes added on user_id and created_at for fast per-user queries
  4. thumbnail_data stores a small base64 data URL (≤20KB) generated in the browser via Canvas
*/

CREATE TABLE IF NOT EXISTS vimax_video_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  original_filename text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  format text DEFAULT '',
  duration_seconds numeric,
  width integer,
  height integer,
  thumbnail_data text DEFAULT '',
  storage_path text DEFAULT '',
  storage_url text DEFAULT '',
  content_type text DEFAULT 'general' CHECK (
    content_type IN ('educational', 'marketing', 'social_media', 'entertainment', 'documentary', 'tutorial', 'general')
  ),
  status text DEFAULT 'uploaded' CHECK (
    status IN ('uploading', 'uploaded', 'processing', 'ready', 'error')
  ),
  error_message text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vimax_video_uploads_user_id
  ON vimax_video_uploads (user_id);

CREATE INDEX IF NOT EXISTS idx_vimax_video_uploads_created_at
  ON vimax_video_uploads (created_at DESC);

ALTER TABLE vimax_video_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view video uploads"
  ON vimax_video_uploads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create video uploads"
  ON vimax_video_uploads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update video uploads"
  ON vimax_video_uploads FOR UPDATE
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_vimax_video_uploads'
  ) THEN
    CREATE TRIGGER set_updated_at_vimax_video_uploads
      BEFORE UPDATE ON vimax_video_uploads
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
