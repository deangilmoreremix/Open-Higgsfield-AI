# Director Backend on Render with VideoDB Integration

**Date:** 2026-06-30
**Status:** Approved by user 2026-06-30 → ready for implementation plan
**Scope:** New Render-hosted Express backend that exposes 45 VideoDB-powered agent endpoints, wired to both the vanilla (`director/`) and React (`src/components/DirectorPage.js`) director frontends, with zero "coming soon" placeholders.

---

## 1. Problem Statement

The director page has two parallel implementations (vanilla JS at `director/main.js` and React at `src/components/DirectorPage.js`) that both ship **24 AI agents** to the user. Today:

- **Both frontends call the wrong backend.** Vanilla calls `/supabase/functions/videoagent` with fabricated `action`/`tool` parameters. React calls `supabase.functions.invoke('videoagent', ...)` with the same broken shape. Neither path returns real results.
- **The only real backend handler** (`netlify/functions/director-backend.js`) exposes 10 agents (faceless_video_creator, ai_ad_films, etc.) — only 3 of which overlap with the 24 the UI actually uses. The other 7 are dead handlers the UI never calls.
- **The "VideoDB integration" is fake.** It hits `https://api.videodb.io/voice/generate`, `/video/generate`, `/timeline/compose` — **none of these endpoints exist** in the real VideoDB API. The real API uses the 4-layer architecture (Asset → Clip → Track → Timeline) via the official Node.js/Python SDK.
- **The backend is not deployed anywhere.** `render.yaml` defines a frontend service + 2 Supabase edge function proxies, but no director backend service. `netlify.toml` is the only deployment config and it points at Netlify, not Render.

**Constraint from user:**
- Do NOT remove any features or functions. Wire real logic into existing stubs.
- Do NOT mark any agent as "coming soon" — every card must work.
- Match the existing vanilla `director/main.js` design system for all 45 agents.

---

## 2. Goals

1. New Render-hosted Express service (`director-backend/`) that exposes **all 45 unique agents** across the 3 source lists (10 Netlify + 24 UI + 15 Director framework, deduplicated).
2. Real VideoDB integration via the official `videodb` Node.js SDK (v0.2.x).
3. Both frontends (vanilla + React) wired to call the new backend via Supabase JWT auth.
4. Per-user credential storage for the integration-requiring agents (Slack, Sales Assistant, Profanity Remover).
5. ffmpeg sidecar for the 2 agents VideoDB cannot do natively (Stabilize, Reverse).
6. Zero "coming soon" placeholders. Agents without user credentials show an in-UI setup wizard.
7. Vanilla `director/main.js` design system applied to all 45 agent cards (Lucide icons, `rounded-2xl`, lime-300 primary, 6-color gradient cycle).
8. All existing code preserved: `backend/`, `netlify/functions/`, `supabase/functions/`, `src/` stay untouched.
9. **HARD CONSTRAINT — Use only the current director design.** No new design system, no new component library, no new theme. Every new card, modal, button, or UI element added must reuse the exact existing design tokens (vanilla: `bg-[#08090b]`, `white/[0.04]`, `rounded-2xl`, `lime-300`, Lucide icons, 6-color gradient cycle; React: `text-primary`, `text-secondary`, `bg-primary/10`, emoji icons, existing class names). If a design need is not covered by the current design, it is out of scope for this build.

---

## 3. Non-Goals

- No removal of the existing 10-agent `netlify/functions/director-backend.js`. It stays deployed; the new Render service is additive.
- No migration of the existing `backend/server.js` Express server. It stays runnable locally.
- No redesign of the React `DirectorPage.js` visual language (different design tokens). The React page gets wired to the new backend; its visual design is preserved.
- No real-time stream monitoring, alerts, or desktop capture SDK (separate VideoDB features, out of scope for this build).

---

## 4. The 45 Agents — Final Sign-Off

### 4.1 Fully Supported by VideoDB (40)

| # | Agent ID | UI Name | VideoDB API |
|---|---|---|---|
| 1 | summarizer | Video Summarizer | create_video_transcription + generate_text |
| 2 | search | Video Search | create_video_index + search_video_index |
| 3 | clipper | Clip Creator | create_video_clip |
| 4 | dubbing | Video Dubbing | dub_video |
| 5 | subtitler | Subtitle Generator | index_spoken_words + CaptionAsset |
| 6 | highlighter | Highlight Extractor | extract_video_scenes + create_scene_index |
| 7 | scenes | Scene Detector | extract_video_scenes |
| 8 | broll | B-Roll Adder | generate_image/generate_video + overlay track |
| 9 | voiceover | Voiceover | collection.generate_voice |
| 10 | editor | Video Editor | Full 4-layer (Asset/Clip/Track/Timeline) |
| 11 | enhancer | Video Enhancer | start_transcode |
| 12 | compiler | Content Compiler | Multi-track create_timeline |
| 13 | meme | Meme Generator | generate_image + TextAsset |
| 14 | musicvideo | Music Video Maker | generate_audio + generate_video + Timeline |
| 15 | trailer | Trailer Creator | Script (LLM) + voice + visuals + Timeline |
| 16 | compilation | Compilation Builder | compile_search_results |
| 17 | social | Social Media Clip | reframe_video |
| 18 | preview | Preview Generator | create_video_thumbnail |
| 19 | montage | Montage Builder | Timeline with multiple clips + transitions |
| 20 | story | Story Builder | LLM narrative + multi-scene Timeline |
| 21 | speed | Speed Control | VideoAsset.start + duration + transcode speed |
| 22 | color | Color Correction | 8 preset filters (greyscale, blur, contrast, etc.) |
| 23 | voice_cloning | Voice Cloning | generate_voice with voice sample |
| 24 | comparison | Comparison Agent | Two videos → side-by-side Timeline |
| 25 | audio_overlays | Gen AI Audio Overlays | generate_audio (music/SFX) + AudioAsset |
| 26 | keyword_search | Keyword Search & Compilation | index_spoken_words + compile_search_results |
| 27 | output_formatting | Intelligent Output Formatting | Multi-format export wrapper |
| 28 | auto_highlights | Automated Video Highlights | Scene index + ranking + clip extraction |
| 29 | thumbnail | Thumbnail Agent | create_video_thumbnail |
| 30 | subtitle_agent | Subtitle Agent | index_spoken_words + CaptionAsset |
| 31 | visual_search | Visual Search | create_scene_index + search_video_index |
| 32 | text_to_movie | Text to Movie | generate_text + generate_video + Timeline |
| 33 | storyboarding | Storyboarding Agent | extract_video_scenes + generate_image + grid Timeline |
| 34 | faceless_video_creator | Faceless Video Creator | generate_voice + generate_image/video + Timeline |
| 35 | ai_ad_films | AI Ad Films | Same as faceless, ad-styled prompts |
| 36 | tiktok_lyric_video | TikTok Lyric Video | generate_audio + TextAsset lyrics + 9:16 Timeline |
| 37 | ai_voiceovers | AI Voiceovers | generate_voice |
| 38 | trailer_narration | Trailer Narration | Voice + cinematic B-roll + text + Timeline |
| 39 | kids_storyteller | Kids Storyteller | Same as faceless, kid-friendly prompts |
| 40 | year_in_frames | Year in Frames | Multiple ImageAsset on Timeline with transitions |

### 4.2 Partial — Needs User Integration (3)

| # | Agent ID | UI Name | User Needs | Backend Storage |
|---|---|---|---|---|
| 41 | slack_agent | Slack Agent | Slack webhook URL | user_integrations row, type=slack |
| 42 | sales_assistant | Sales Assistant | HubSpot or Salesforce API key | user_integrations row, type=hubspot or salesforce |
| 43 | profanity_remover | Profanity Remover | None (uses LLM) | N/A |

### 4.3 Needs ffmpeg (2)

| # | Agent ID | UI Name | Tool | Command |
|---|---|---|---|---|
| 44 | stabilize | Video Stabilize | ffmpeg-static | vidstabdetect + vidstabtransform |
| 45 | reverse | Reverse Video | ffmpeg-static | -vf reverse |

Total: 45. All 45 must work with no "coming soon" badges.

---

## 5. Architecture

```
[Vanilla UI]      ──►  [Director Backend]  ──►  [VideoDB API]
[director/]              (Render service)          (videodb.io)

[React UI]        ──►  Express + Node.js
[DirectorPage]          45 agent endpoints  ──►  [Supabase]
                        + auth + cred mgmt        (auth + DB)
                        + ffmpeg sidecar
                        
                       Uses: videodb SDK
                             + openai SDK
```

### 5.1 New Service: director-backend/

Node.js 22.12.0, Express 4.x, single web service on Render (Starter plan, Singapore region).

### 5.2 Reused Services

- Supabase (existing project bzxohkrxcwodllketcpz) — JWT auth + 2 new tables
- VideoDB — user account, API key in VIDEO_DB_API_KEY env var
- OpenAI — for LLM steps (script generation, profanity detection), key in OPENAI_API_KEY env var

### 5.3 Preserved (Untouched)

- backend/server.js — runs locally, not deployed
- netlify/functions/director-backend.js — Netlify function with 10 agents, stays deployed
- All 35 supabase/functions/* edge functions
- src/lib/director/*, src/lib/videodb/* — frontend services
- src/components/DirectorPage.js and director/main.js — visual design preserved, only fetch URL changes

---

## 6. File Structure

```
director-backend/
├── package.json              # Express, videodb, @supabase/supabase-js, openai, ffmpeg-static
├── server.js                 # Express app: auth middleware, routes, error handling
├── .env.example              # All env vars documented
├── README.md                 # Local dev + Render deploy instructions
├── agents/
│   ├── _shared.js            # Common helpers: script generator, timeline composer
│   ├── index.js              # Auto-registers all 45 agents
│   ├── summarizer.js
│   ├── search.js
│   ├── ... (43 more)
│   └── ffmpeg/
│       ├── stabilize.js
│       └── reverse.js
├── services/
│   ├── videodb.js            # Wraps official videodb Node SDK
│   ├── supabase.js           # Auth + DB client
│   ├── credentials.js        # CRUD for user_integrations
│   ├── encryption.js         # AES-256-GCM helpers
│   ├── llm.js                # OpenAI wrapper
│   ├── ffmpeg.js             # ffmpeg-static executor
│   └── jobTracker.js         # Async job state
├── middleware/
│   ├── auth.js               # Supabase JWT validation
│   ├── rateLimit.js          # Per-user rate limit
│   └── errorHandler.js       # Standardized error response
├── routes/
│   ├── agents.js             # POST /api/agents/:agentId
│   ├── integrations.js       # GET/POST/DELETE /api/integrations
│   ├── jobs.js               # GET /api/jobs/:id
│   └── system.js             # GET /health, GET /api/agents
└── tests/
    ├── unit/                 # Vitest, mock VideoDB SDK
    └── integration/          # Real VideoDB sandbox
```

---

## 7. Data Model — Supabase Migration

```sql
-- migration: 20260630_director_backend_tables.sql

CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL
    CHECK (integration_type IN ('slack', 'hubspot', 'salesforce')),
  credentials_encrypted BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  auth_tag BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, integration_type)
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input JSONB,
  output JSONB,
  error_message TEXT,
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own integrations"
  ON user_integrations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own jobs"
  ON jobs FOR ALL USING (auth.uid() = user_id);
```

---

## 8. API Surface

### 8.1 Agent Endpoints (45)

```
POST /api/agents/:agentId
  Headers: Authorization: Bearer <supabase_access_token>
  Body: { input, videoUrl?, videoId?, options? }
  Response: { jobId, status, output?, streamUrl? }
```

### 8.2 Credential Management (4)

```
GET    /api/integrations
POST   /api/integrations                  → { type, credentials }
DELETE /api/integrations/:type
POST   /api/integrations/test/:type       → { credentials }
```

### 8.3 Job Management (2)

```
GET    /api/jobs/:id
GET    /api/jobs?limit=20
```

### 8.4 System (2)

```
GET    /health
GET    /api/agents                        → list 45 agents + metadata
```

---

## 9. Auth Flow

1. Frontend gets Supabase access token from supabase.auth.session().access_token
2. Sends Authorization: Bearer <token> to Render backend
3. middleware/auth.js calls supabase.auth.getUser(token) to validate
4. On success: req.user = { id, email } attached; DB queries scoped by user_id
5. On failure: 401 with WWW-Authenticate: Bearer realm="director-backend"

Service-to-service uses X-Service-Key header validated against DIRECTOR_SERVICE_KEY.

---

## 10. Frontend Wiring

### 10.1 Vanilla director/main.js (line 107)

```js
// Before:
const response = await fetch('/supabase/functions/videoagent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action, tool, prompt, videoUrl })
});

// After:
const response = await fetch(`${DIRECTOR_BACKEND_URL}/api/agents/${agentId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${getSupabaseAccessToken()}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ input, videoUrl, options })
});
```

Update leftAgents array to include the 21 agents not currently present in vanilla (it has 22 of 45). New entries follow the existing { name: '...', icon: '...' } shape.

### 10.2 React DirectorPage.js (line 695)

```js
// Before:
const { data, error } = await supabase.functions.invoke('videoagent', { body: { action, command, videoUrl } });

// After:
const response = await fetch(`${import.meta.env.VITE_DIRECTOR_BACKEND_URL}/api/agents/${agentId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ input: command, videoUrl, options })
});
const { jobId, status, output, streamUrl } = await response.json();
```

### 10.3 New Env Vars

- VITE_DIRECTOR_BACKEND_URL=https://director-backend.onrender.com
- Vanilla: DIRECTOR_BACKEND_URL (in config.js or index.html)

### 10.4 Credential Setup UI

When user clicks an integration-requiring agent without a stored credential:
- Show modal: "Connect [Slack/HubSpot/etc.]"
- Input field for webhook URL or API key
- "Test" button → POST /api/integrations/test/:type
- "Save" button → POST /api/integrations
- Modal closes, agent runs normally

UI: director/integrations-modal.js (vanilla) and src/components/IntegrationsModal.jsx (React).

---

## 11. Render Deployment

### 11.1 render.yaml Addition

```yaml
  - type: web
    name: director-backend
    runtime: node
    plan: starter
    region: singapore
    rootDir: director-backend
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: VIDEO_DB_API_KEY
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: ENCRYPTION_KEY
        sync: false
      - key: DIRECTOR_SERVICE_KEY
        sync: false
      - key: NODE_VERSION
        value: "22.12.0"
      - key: NODE_ENV
        value: production
      - key: ALLOWED_ORIGINS
        value: "https://higgsfield.ai,https://studio.higgsfield.ai,http://localhost:8080"
```

### 11.2 First Deploy Checklist

1. Generate ENCRYPTION_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
2. Generate DIRECTOR_SERVICE_KEY: openssl rand -hex 32
3. Run Supabase migration 20260630_director_backend_tables.sql via SQL Editor
4. Push to GitHub
5. Render dashboard: Blueprints → New → connect repo → select render.yaml
6. Set all sync: false env vars
7. Deploy; verify https://director-backend.onrender.com/health returns 200
8. Update frontend env vars
9. Redeploy frontend

---

## 12. Error Handling

| Failure | Response |
|---|---|
| Invalid JWT | 401 INVALID_AUTH |
| Missing integration | 400 INTEGRATION_REQUIRED with setup URL |
| VideoDB error | 502 VIDEODB_ERROR with retry hint |
| LLM timeout | 504 LLM_TIMEOUT after 3 retries |
| ffmpeg crash | 500 FFMPEG_ERROR with stderr |
| Rate limit | 429 RATE_LIMITED with Retry-After |
| Job not found | 404 JOB_NOT_FOUND |
| Invalid input | 400 INVALID_INPUT with field errors |

Standard error envelope:
```json
{ "error": { "code": "STRING_CODE", "message": "...", "details": {} } }
```

---

## 13. Testing Strategy

### 13.1 Unit Tests (Vitest)

- tests/unit/agents/<agentId>.test.js per agent
- Mock videodb SDK, openai, supabase
- Happy path + 2-3 error cases per agent
- Auth middleware valid/invalid/expired
- Credential encryption round-trip

### 13.2 Integration Tests (Vitest + real services)

- tests/integration/full-workflow.test.js — upload → summarize → clip → render
- tests/integration/auth.test.js — real Supabase JWT
- tests/integration/ffmpeg.test.js — stabilize + reverse
- Uses VideoDB sandbox and Supabase test project

### 13.3 Manual QA Checklist

- [ ] All 45 agent cards clickable, none show "coming soon"
- [ ] Credential modal opens for Slack/Sales/Profanity when no creds saved
- [ ] All 40 fully-supported agents return real VideoDB output
- [ ] Color Correction shows 8 filter options
- [ ] Stabilize and Reverse actually transform video
- [ ] Render cold start handled by frontend timeout + retry
- [ ] Health check returns 200
- [ ] Both vanilla and React frontends work

---

## 14. Build Order

1. Scaffold director-backend/, package.json, server.js stub
2. Supabase migration: user_integrations + jobs tables
3. Auth middleware: Supabase JWT validation
4. VideoDB client wrapper: services/videodb.js
5. Shared helpers: _shared.js
6. First 5 agents: summarizer, clipper, dubbing, search, scene_detector
7. Remaining 33 agents in batches of 5-7
8. 2 ffmpeg agents: stabilize, reverse
9. 3 integration agents: slack_agent, sales_assistant, profanity_remover
10. Credential endpoints
11. Job tracker
12. Vanilla frontend: update director/main.js + add 21 missing cards
13. React frontend: update DirectorPage.js fetch URL
14. Credential UI: integration setup modal
15. Tests: unit + integration
16. Deploy + manual QA

---

## 15. Open Questions

None — all decisions resolved. Awaiting sign-off.

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| VideoDB rate limits | Per-user rate limit; cache results |
| ffmpeg 70MB bloat | ffmpeg-static npm package, acceptable for Starter plan |
| 45 agents to test | Ship in 2 waves: first 5 smoke-tested, then remaining 40 |
| Single-tenant VideoDB account | Multi-tenant via per-user API keys can be added later |
| Render cold start | Frontend 30s timeout + 1 retry; health check keeps warm |
| Vanilla frontend lacks Supabase session | Add getSupabaseAccessToken() helper; or accept anon access for now |

---

End of spec. Awaiting user review.
