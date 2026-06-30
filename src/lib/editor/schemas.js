/**
 * Zod validation schemas for the timeline editor.
 *
 * Every timeline object, clip, asset, upload, project, and MuAPI response
 * is validated against these schemas before entering state. This prevents
 * corrupted projects from causing runtime errors.
 *
 * Schemas are intentionally tolerant: most fields are optional or have
 * defaults so legacy demo data and partial states still validate. Strict
 * validation is applied only to fields that are critical for correctness
 * (ids, types, time values).
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

const idString = z.union([z.string(), z.number()]);

const finiteNumber = z.number().refine(n => Number.isFinite(n), {
  message: 'must be a finite number'
});

const nonNegativeNumber = finiteNumber.min(0);

// ============================================================================
// CLIP (a.k.a. item)
// ============================================================================

/**
 * Canonical clip schema. Clips live in track.items (and the compatibility
 * alias track.clips). This is the production timeline model.
 */
export const ClipSchema = z.object({
  id: idString.optional(),
  assetId: z.union([z.string(), z.number(), z.null()]).optional(),
  type: z.enum(['video', 'image', 'audio', 'text', 'effect', 'element']).default('video'),
  start: finiteNumber.default(0),
  end: finiteNumber.default(5),
  sourceStart: nonNegativeNumber.default(0),
  sourceEnd: nonNegativeNumber.default(5),
  trimIn: nonNegativeNumber.default(0),
  trimOut: nonNegativeNumber.default(5),
  volume: finiteNumber.min(0).max(2).default(1),
  playbackRate: finiteNumber.min(0.1).max(10).default(1),
  opacity: finiteNumber.min(0).max(1).default(1),
  effects: z.array(z.unknown()).default([]),
  transform: z.object({
    x: finiteNumber.default(0),
    y: finiteNumber.default(0),
    scale: finiteNumber.default(1),
    rotation: finiteNumber.default(0)
  }).default({ x: 0, y: 0, scale: 1, rotation: 0 }),
  name: z.string().default('Untitled'),
  lane: z.number().int().min(0).default(0),
  // Legacy/demo fields tolerated for backwards compatibility
  left: finiteNumber.optional(),
  width: finiteNumber.optional(),
  src: z.string().optional(),
  poster: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().optional(),
  fit: z.string().optional(),
  text: z.string().optional(),
  style: z.unknown().optional(),
  waveformData: z.array(z.number()).optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceType: z.string().optional(),
  startTime: finiteNumber.optional(),
  duration: finiteNumber.optional(),
  metadata: z.record(z.unknown()).optional()
}).passthrough();

/**
 * Legacy clip schema (left/width percentages). Accepts both formats.
 * Used for the compatibility adapter that reads track.clips.
 */
export const LegacyClipSchema = z.object({
  id: idString.optional(),
  left: finiteNumber.default(0),
  width: finiteNumber.default(10),
  type: z.string().default('video'),
  name: z.string().default('Untitled'),
  src: z.string().optional(),
  poster: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().optional(),
  fit: z.string().optional()
}).passthrough();

// ============================================================================
// TRACK
// ============================================================================

export const TrackSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.enum(['video', 'audio', 'text', 'broll', 'effect', 'overlay']).default('video'),
  name: z.string().default('Track'),
  locked: z.boolean().default(false),
  muted: z.boolean().default(false),
  solo: z.boolean().default(false),
  visible: z.boolean().default(true),
  height: nonNegativeNumber.default(60),
  color: z.string().optional(),
  items: z.array(z.unknown()).default([]),
  clips: z.array(z.unknown()).optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceType: z.string().optional(),
  fit: z.string().optional(),
  playbackRate: finiteNumber.default(1),
  items_duration: finiteNumber.optional(),
  effects: z.array(z.unknown()).default([])
}).passthrough();

// ============================================================================
// ASSET
// ============================================================================

export const AssetSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.enum(['video', 'image', 'audio', 'text', 'element', 'font', 'sticker', 'effect']).default('video'),
  name: z.string().default('Untitled'),
  url: z.union([z.string(), z.null()]).optional(),
  thumbnail: z.union([z.string(), z.null()]).optional(),
  duration: nonNegativeNumber.default(0),
  size: nonNegativeNumber.optional(),
  mimeType: z.string().optional(),
  source: z.string().optional(),
  sourceType: z.string().optional(),
  sourceUrl: z.string().optional(),
  width: nonNegativeNumber.optional(),
  height: nonNegativeNumber.optional(),
  poster: z.string().optional(),
  photographer: z.string().optional(),
  uploadedAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
}).passthrough();

// ============================================================================
// UPLOAD METADATA
// ============================================================================

export const UploadMetadataSchema = z.object({
  file: z.unknown(),
  type: z.enum(['video', 'image', 'audio', 'document', 'text', 'font']).optional(),
  publicUrl: z.string(),
  size: nonNegativeNumber.optional(),
  duration: nonNegativeNumber.optional(),
  width: nonNegativeNumber.optional(),
  height: nonNegativeNumber.optional(),
  mimeType: z.string().optional(),
  ext: z.string().optional()
}).passthrough();

// ============================================================================
// PROJECT
// ============================================================================

export const ProjectSchema = z.object({
  id: z.string().optional(),
  fps: finiteNumber.int().min(1).max(240).default(30),
  duration: nonNegativeNumber.default(60),
  aspectRatio: z.string().default('16:9'),
  tracks: z.array(z.unknown()).default([]),
  assets: z.array(z.unknown()).default([]),
  markers: z.array(z.unknown()).default([]),
  captions: z.array(z.unknown()).default([]),
  effects: z.array(z.unknown()).default([])
}).passthrough();

// ============================================================================
// TOP-LEVEL EDITOR STATE
// ============================================================================

export const EditorStateSchema = z.object({
  project: ProjectSchema.optional(),
  projectTitle: z.string().default('Untitled Project'),
  timelineSeconds: finiteNumber.min(1).max(36000).default(60),
  zoom: finiteNumber.min(0.1).max(10).default(1),
  pan: nonNegativeNumber.default(0),
  isTimelineOpen: z.boolean().default(true),
  timelineHeight: nonNegativeNumber.default(300),
  playheadPercent: finiteNumber.min(0).max(100).default(0),
  selectedTool: z.string().default('Select'),
  selectedClipId: z.union([z.string(), z.number(), z.null()]).optional(),
  selectedClipIds: z.array(z.union([z.string(), z.number()])).optional(),
  generateType: z.string().default('Text'),
  playing: z.boolean().default(false),
  snapEnabled: z.boolean().default(true),
  autoScrollEnabled: z.boolean().default(true),
  showRuler: z.boolean().default(true),
  showWaveforms: z.boolean().default(true),
  selectedRange: z.unknown().optional(),
  clipboard: z.unknown().optional(),
  multiCameraMode: z.boolean().default(false),
  pipMode: z.boolean().default(false),
  splitScreenMode: z.boolean().default(false),
  cameraAngles: z.array(z.unknown()).default([]),
  activeCameraAngle: z.union([z.string(), z.number(), z.null()]).optional(),
  compositingMode: z.string().default('normal'),
  // Page-level state (not in TimelineState, but in TimelineEditorPage.createState)
  tracks: z.array(z.unknown()).optional(),
  tools: z.array(z.unknown()).optional(),
  pills: z.array(z.string()).optional(),
  topIcons: z.array(z.string()).optional(),
  media: z.array(z.unknown()).optional(),
  generateTypes: z.array(z.unknown()).optional(),
  quickCommands: z.array(z.string()).optional(),
  railActions: z.array(z.unknown()).optional(),
  projectId: z.string().optional(),
  undoStack: z.array(z.unknown()).default([]),
  redoStack: z.array(z.unknown()).default([]),
  mediaLibrary: z.array(z.unknown()).default([]),
  generationQueue: z.array(z.unknown()).default([]),
  isProcessing: z.boolean().default(false),
  // Runtime singletons (stripped before persistence)
  keyframeSystem: z.unknown().optional(),
  transitionEditor: z.unknown().optional(),
  sceneDetector: z.unknown().optional(),
  cameraEffects: z.unknown().optional(),
  aiChatPanel: z.unknown().optional(),
  colorCorrectionSystem: z.unknown().optional()
}).passthrough();

// ============================================================================
// MuAPI RESPONSES
// ============================================================================

/**
 * Base response envelope for MuAPI calls.
 */
export const MuAPIResponseSchema = z.object({
  success: z.boolean().optional(),
  status: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  generationId: z.string().optional(),
  assetId: z.string().optional(),
  assetIds: z.array(z.string()).optional(),
  previewUrl: z.string().optional(),
  url: z.string().optional(),
  result: z.unknown().optional(),
  progress: finiteNumber.min(0).max(100).optional(),
  progressMessage: z.string().optional()
}).passthrough();

/**
 * Generation result schema (submit response).
 */
export const GenerationResultSchema = z.object({
  generationId: z.string().min(1),
  status: z.enum(['queued', 'processing', 'completed', 'failed']).default('queued'),
  previewUrl: z.union([z.string(), z.null()]).optional(),
  assetIds: z.array(z.string()).optional(),
  metadata: z.unknown().optional(),
  error: z.string().optional()
}).passthrough();

/**
 * Generation status (poll response).
 */
export const GenerationStatusSchema = z.object({
  generationId: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'cancelled']).default('processing'),
  progress: finiteNumber.min(0).max(100).optional(),
  progressMessage: z.string().optional(),
  result: z.unknown().optional(),
  error: z.string().optional()
}).passthrough();

// ============================================================================
// SAFE VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against a schema, returning a safe result.
 * Never throws. On failure, returns { success: false, errors }.
 * On success, returns { success: true, data } with defaults applied.
 */
export function safeValidate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map(i => ({
      path: i.path.join('.'),
      message: i.message,
      code: i.code
    }))
  };
}

/**
 * Validate and coerce. If validation fails, returns the original data
 * untouched (so legacy code keeps working) and logs a warning. This is
 * the "permissive" mode used for loading from storage and accepting
 * external data.
 */
export function validateOrPass(schema, data, context = 'unknown') {
  if (data === null || data === undefined) return data;
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[Validation:${context}] Using data as-is despite ${result.error.issues.length} issue(s):`,
      result.error.issues.slice(0, 3).map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  return data;
}

/**
 * Validate and return the parsed value. Throws on failure.
 * Use for strict boundaries (MuAPI responses, upload results).
 */
export function validateStrict(schema, data, context = 'unknown') {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`[Validation:${context}] ${msg}`);
  }
  return result.data;
}
