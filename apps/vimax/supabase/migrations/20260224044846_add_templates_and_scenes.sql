/*
  # Add Templates and Scenes Tables

  ## New Tables

  ### vimax_templates
  Pre-built video creation templates for the template library.
  Each template pre-fills pipeline type, style, quality, and a sample idea.

  ### vimax_scenes
  Per-scene storyboard data allowing users to review and approve individual
  scenes before final video synthesis begins.

  ## Notes
  - Templates have public read access since they are shared across all users
  - Scenes are scoped to a job_id (text string matching backend job IDs)
*/

-- ============================================================
-- TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vimax_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'General',
  pipeline_type text NOT NULL DEFAULT 'idea2video',
  style text DEFAULT 'Cinematic',
  quality text DEFAULT 'standard',
  sample_idea text DEFAULT '',
  thumbnail_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vimax_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vimax_templates_select" ON vimax_templates FOR SELECT USING (true);
CREATE POLICY "vimax_templates_insert" ON vimax_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "vimax_templates_update" ON vimax_templates FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- SCENES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vimax_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL,
  scene_index integer NOT NULL DEFAULT 0,
  script_line text DEFAULT '',
  image_url text DEFAULT '',
  camera_angle text DEFAULT '',
  duration_seconds integer DEFAULT 5,
  status text DEFAULT 'pending',
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vimax_scenes_job_id ON vimax_scenes(job_id);

ALTER TABLE vimax_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vimax_scenes_select" ON vimax_scenes FOR SELECT USING (true);
CREATE POLICY "vimax_scenes_insert" ON vimax_scenes FOR INSERT WITH CHECK (true);
CREATE POLICY "vimax_scenes_update" ON vimax_scenes FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- SEED TEMPLATE DATA
-- ============================================================
INSERT INTO vimax_templates (name, description, category, pipeline_type, style, quality, sample_idea, thumbnail_url, tags, is_featured)
VALUES
  (
    'Product Demo',
    'Showcase your product with a professional cinematic presentation',
    'Business',
    'idea2video',
    'Cinematic',
    'standard',
    'A sleek product reveal video showing a modern smartphone rotating on a glass surface with dramatic lighting. Close-up shots highlight the camera, screen, and build quality. Professional voiceover explains key features.',
    'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
    ARRAY['product', 'business', 'marketing'],
    true
  ),
  (
    'Social Media Short',
    'Eye-catching 30-second video optimized for Instagram and TikTok',
    'Social Media',
    'idea2video',
    'Cartoon',
    'fast',
    'A vibrant, fast-paced montage celebrating summer adventures: beach surfing, mountain hiking, city exploration, and rooftop sunsets. Upbeat energy with bold text overlays.',
    'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg',
    ARRAY['social', 'short-form', 'trending'],
    true
  ),
  (
    'Story Trailer',
    'Create a cinematic trailer from your story or novel',
    'Story',
    'novel2video',
    'Cinematic',
    'high',
    'A young archaeologist discovers an ancient map that leads to a lost civilization hidden beneath the Amazon rainforest. Action, mystery, and breathtaking landscapes combine in this epic adventure.',
    'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg',
    ARRAY['story', 'adventure', 'trailer'],
    true
  ),
  (
    'Explainer Video',
    'Clear and engaging educational or product explainer',
    'Education',
    'script2video',
    'Cartoon',
    'standard',
    'INT. MODERN OFFICE - DAY

ANIMATED DIAGRAMS show the concept of compound interest.

NARRATOR (V.O.)
Imagine your money working while you sleep...',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
    ARRAY['education', 'explainer', 'animation'],
    false
  ),
  (
    'Motivational Reel',
    'Inspirational video for personal branding or coaching',
    'Personal Brand',
    'idea2video',
    'Cinematic',
    'standard',
    'A powerful motivational video following an athlete from early morning training at 5am to championship victory. Dramatic slow-motion moments, sweat, determination, and triumph.',
    'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    ARRAY['motivation', 'fitness', 'inspiration'],
    false
  ),
  (
    'Real Estate Tour',
    'Virtual property walkthrough for listings',
    'Business',
    'idea2video',
    'Realistic',
    'high',
    'A luxury penthouse tour starting with an aerial drone approach over a modern city skyline. Interior shots showcase the open-plan living area, chef kitchen, master bedroom with city views, and rooftop terrace with pool.',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    ARRAY['real estate', 'property', 'luxury'],
    false
  ),
  (
    'Anime Short Film',
    'Animated short in Japanese anime style',
    'Entertainment',
    'idea2video',
    'Anime',
    'standard',
    'A young girl with telekinetic powers discovers a hidden world inside an enchanted library. Floating books, glowing portals between shelves, and a wise magical cat guide her on a journey of self-discovery.',
    'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    ARRAY['anime', 'fantasy', 'animation'],
    true
  ),
  (
    'Brand Origin Story',
    'Tell your brand founding story with emotional impact',
    'Business',
    'script2video',
    'Cinematic',
    'high',
    'EXT. GARAGE - NIGHT - 2015

Two friends hunched over a laptop, empty coffee cups around them.

NARRATOR (V.O.)
It started with a problem nobody had solved yet...',
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    ARRAY['brand', 'startup', 'story'],
    false
  );
