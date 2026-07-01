import { summarizer } from './summarizer.js';
import { clipper } from './clipper.js';
import { dubbing } from './dubbing.js';
import { search } from './search.js';
import { scenes } from './scenes.js';
import { voiceover } from './voiceover.js';
import { voice_cloning } from './voice_cloning.js';
import { audio_overlays } from './audio_overlays.js';
import { ai_voiceovers } from './ai_voiceovers.js';
import { preview } from './preview.js';
import { thumbnail } from './thumbnail.js';
import { social } from './social.js';
import { comparison } from './comparison.js';
import { subtitler } from './subtitler.js';
import { subtitle_agent } from './subtitle_agent.js';
import { highlighter } from './highlighter.js';
import { story } from './story.js';
import { editor } from './editor.js';
import { compiler } from './compiler.js';
import { compilation } from './compilation.js';
import { montage } from './montage.js';
import { keyword_search } from './keyword_search.js';
import { musicvideo } from './musicvideo.js';
import { trailer } from './trailer.js';
import { text_to_movie } from './text_to_movie.js';
import { storyboarding } from './storyboarding.js';
import { broll } from './broll.js';
import { meme } from './meme.js';
import { speed } from './speed.js';
import { color } from './color.js';
import { auto_highlights } from './auto_highlights.js';
import { output_formatting } from './output_formatting.js';
import { year_in_frames } from './year_in_frames.js';
import { visual_search } from './visual_search.js';
import { enhancer } from './enhancer.js';
import { faceless_video_creator } from './faceless_video_creator.js';
import { ai_ad_films } from './ai_ad_films.js';
import { tiktok_lyric_video } from './tiktok_lyric_video.js';
import { trailer_narration } from './trailer_narration.js';
import { kids_storyteller } from './kids_storyteller.js';
import { slack_agent } from './slack_agent.js';
import { sales_assistant } from './sales_assistant.js';
import { profanity_remover } from './profanity_remover.js';
import { stabilize } from './ffmpeg/stabilize.js';
import { reverse } from './ffmpeg/reverse.js';

export const agents = {
  summarizer, clipper, dubbing, search, scenes, voiceover, voice_cloning, audio_overlays, ai_voiceovers,
  preview, thumbnail, social, comparison, subtitler, subtitle_agent, highlighter, story, editor,
  compiler, compilation, montage, keyword_search, musicvideo, trailer, text_to_movie, storyboarding,
  broll, meme, speed, color, auto_highlights, output_formatting, year_in_frames, visual_search,
  enhancer, faceless_video_creator, ai_ad_films, tiktok_lyric_video, trailer_narration, kids_storyteller,
  slack_agent, sales_assistant, profanity_remover, stabilize, reverse,
};

export const agentMetadata = {
  summarizer: { name: 'Video Summarizer', category: 'analysis', needsInput: 'video' },
  clipper: { name: 'Clip Creator', category: 'extract', needsInput: 'video' },
  dubbing: { name: 'Video Dubbing', category: 'translate', needsInput: 'video' },
  search: { name: 'Video Search', category: 'search', needsInput: 'video' },
  scenes: { name: 'Scene Detector', category: 'analysis', needsInput: 'video' },
  voiceover: { name: 'Voiceover', category: 'audio', needsInput: 'text' },
  voice_cloning: { name: 'Voice Cloning', category: 'audio', needsInput: 'text' },
  audio_overlays: { name: 'Gen AI Audio Overlays', category: 'audio', needsInput: 'prompt' },
  ai_voiceovers: { name: 'AI Voiceovers', category: 'audio', needsInput: 'text' },
  preview: { name: 'Preview Generator', category: 'create', needsInput: 'video' },
  thumbnail: { name: 'Thumbnail Agent', category: 'create', needsInput: 'video' },
  social: { name: 'Social Media Clip', category: 'social', needsInput: 'video' },
  comparison: { name: 'Comparison Agent', category: 'search', needsInput: 'videoIds' },
  subtitler: { name: 'Subtitle Generator', category: 'accessibility', needsInput: 'video' },
  subtitle_agent: { name: 'Subtitle Agent', category: 'accessibility', needsInput: 'video' },
  highlighter: { name: 'Highlight Extractor', category: 'extract', needsInput: 'video' },
  story: { name: 'Story Builder', category: 'create', needsInput: 'topic' },
  editor: { name: 'Video Editor', category: 'edit', needsInput: 'video' },
  compiler: { name: 'Content Compiler', category: 'create', needsInput: 'videoIds' },
  compilation: { name: 'Compilation Builder', category: 'create', needsInput: 'query' },
  montage: { name: 'Montage Builder', category: 'create', needsInput: 'videoIds' },
  keyword_search: { name: 'Keyword Search & Compilation', category: 'search', needsInput: 'video' },
  musicvideo: { name: 'Music Video Maker', category: 'create', needsInput: 'topic' },
  trailer: { name: 'Trailer Creator', category: 'create', needsInput: 'topic' },
  text_to_movie: { name: 'Text to Movie', category: 'create', needsInput: 'text' },
  storyboarding: { name: 'Storyboarding Agent', category: 'create', needsInput: 'video' },
  broll: { name: 'B-Roll Adder', category: 'enhance', needsInput: 'topic' },
  meme: { name: 'Meme Generator', category: 'create', needsInput: 'prompt' },
  speed: { name: 'Speed Control', category: 'edit', needsInput: 'video' },
  color: { name: 'Color Correction', category: 'enhance', needsInput: 'video' },
  auto_highlights: { name: 'Automated Video Highlights', category: 'extract', needsInput: 'video' },
  output_formatting: { name: 'Intelligent Output Formatting', category: 'create', needsInput: 'videoId' },
  year_in_frames: { name: 'Year in Frames', category: 'create', needsInput: 'imageIds' },
  visual_search: { name: 'Visual Search', category: 'search', needsInput: 'video' },
  enhancer: { name: 'Video Enhancer', category: 'enhance', needsInput: 'video' },
  faceless_video_creator: { name: 'Faceless Video Creator', category: 'create', needsInput: 'topic' },
  ai_ad_films: { name: 'AI Ad Films', category: 'create', needsInput: 'product' },
  tiktok_lyric_video: { name: 'TikTok Lyric Video', category: 'social', needsInput: 'topic' },
  trailer_narration: { name: 'Trailer Narration', category: 'create', needsInput: 'topic' },
  kids_storyteller: { name: 'Kids Storyteller', category: 'create', needsInput: 'topic' },
  slack_agent: { name: 'Slack Agent', category: 'integrations', needsInput: 'message', needsIntegration: 'slack' },
  sales_assistant: { name: 'Sales Assistant', category: 'integrations', needsInput: 'crm', needsIntegration: 'crm' },
  profanity_remover: { name: 'Profanity Remover', category: 'safety', needsInput: 'video' },
  stabilize: { name: 'Video Stabilize', category: 'enhance', needsInput: 'video', ffmpeg: true },
  reverse: { name: 'Reverse Video', category: 'edit', needsInput: 'video', ffmpeg: true },
};
