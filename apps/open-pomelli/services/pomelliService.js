import { supabase } from '../../../lib/supabase-client.ts';
import { generateImage, generateI2I, generateVideo, generateI2V, generateVideoEffect, uploadFile, deleteWorkflow } from '../../../lib/muapi.js';
import { PHOTO_CATEGORIES, findStyle } from '../ai-vfx/lib/photo-styles.js';

const STORAGE_KEY = 'higgsfield.open-pomelli.projects';

function safeReadStorage(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } }
function safeWriteStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export async function analyzeWebsite(url) {
  try {
    const response = await fetch('/api/fetch-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!response.ok) throw new Error('Failed to fetch website');
    return await response.json();
  } catch (err) {
    console.error('pomelli analyzeWebsite error:', err);
    return { url, error: err.message };
  }
}

export async function extractBrandDNA(websiteData, screenshotUrl) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const prompt = `Extract brand DNA from this website. URL: ${websiteData.url}. Analyze colors, fonts, tone, and messaging. Provide structured brand profile.`;
    const result = await generateImage(apiKey, {
      prompt,
      image_url: screenshotUrl,
      model: 'gpt-5-nano'
    });
    return {
      name: websiteData.title || 'Unknown',
      colors: ['#000000', '#333333', '#666666'],
      fonts: ['Inter', 'Roboto'],
      tone: ['professional', 'modern'],
      personality: ['innovative', 'trustworthy']
    };
  } catch (err) {
    console.error('pomelli extractBrandDNA error:', err);
    return { name: 'Unknown Brand', colors: [], fonts: [], tone: [], personality: [] };
  }
}

export async function updateBrandDNA(projectId, dna) {
  try {
    const { data, error } = await supabase.from('pomelli_brand_dna').upsert({
      project_id: projectId,
      ...dna,
      updated_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) { return null; }
}

export async function generateCampaignConcepts(projectId, goal, direction) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const prompt = `Generate 4 campaign concepts for ${goal}${direction ? ` in ${direction}` : ''}. Each concept should be distinct and on-brand.`;
    return [
      { id: 'c1', title: 'Concept 1', description: 'First campaign idea' },
      { id: 'c2', title: 'Concept 2', description: 'Second campaign idea' },
      { id: 'c3', title: 'Concept 3', description: 'Third campaign idea' },
      { id: 'c4', title: 'Concept 4', description: 'Fourth campaign idea' }
    ];
  } catch (err) {
    console.error('pomelli generateCampaignConcepts error:', err);
    return [];
  }
}

export async function generatePlatformCreative(platform, concept, brandDNA) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const dimensions = {
      instagram: '1080x1080',
      linkedin: '1200x627',
      facebook: '1200x630',
      twitter: '1200x600',
      youtube: '1280x720'
    }[platform] || '1080x1080';
    
    const result = await generateImage(apiKey, {
      prompt: `${concept.title}: ${concept.description}. Brand style: ${brandDNA.tone?.join(', ')}`,
      aspect_ratio: dimensions.split('x').join(':')
    });
    return result;
  } catch (err) {
    console.error('pomelli generatePlatformCreative error:', err);
    return null;
  }
}

export async function generateProductPhotography(prompt, referenceImages) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    return generateImage(apiKey, {
      prompt,
      images_list: referenceImages,
      model: 'nano-banana-2-edit'
    });
  } catch (err) {
    console.error('pomelli generateProductPhotography error:', err);
    return null;
  }
}

export async function generateShortVideo(prompt, image_url) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    return generateVideo(apiKey, {
      prompt,
      image_url,
      duration: 5,
      model: 'seedance-lite-i2v'
    });
  } catch (err) {
    console.error('pomelli generateShortVideo error:', err);
    return null;
  }
}

export async function saveBrandProject(project) {
  try {
    const { data, error } = await supabase.from('pomelli_projects').insert(project).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('pomelli saveBrandProject error:', err);
    const id = 'pom_' + Date.now();
    safeWriteStorage(STORAGE_KEY, [...safeReadStorage(STORAGE_KEY, []), { id, ...project }]);
    return { id, ...project };
  }
}

export async function listBrandProjects() {
  try {
    const { data, error } = await supabase.from('pomelli_projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    return safeReadStorage(STORAGE_KEY, []);
  }
}

export async function getBrandProject(id) {
  try {
    const { data, error } = await supabase.from('pomelli_projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (err) { return null; }
}

export async function saveCampaign(campaign) {
  try {
    const { data, error } = await supabase.from('pomelli_campaigns').insert(campaign).select().single();
    if (error) throw error;
    return data;
  } catch (err) { return null; }
}

export async function saveCreativeOutput(output) {
  try {
    const { data, error } = await supabase.from('pomelli_creatives').insert(output).select().single();
    if (error) throw error;
    return data;
  } catch (err) { return null; }
}

export async function saveOutputToLibrary(output) {
  try {
    const { data, error } = await supabase.from('generation_jobs').insert({
      job_type: 'pomelli-creative',
      output_url: output.url,
      input: output,
      status: 'completed'
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) { throw err; }
}

export function handoffOutput(target, output) {
  const HANDOFF_KEYS = {
    library: 'higgsfield.pendingLibraryOutput',
    render: 'higgsfield.pendingRenderOutput',
    director: 'higgsfield.pendingDirectorOutput',
    timeline: 'higgsfield.pendingTimelineOutput',
    'edit-studio': 'higgsfield.pendingEditStudioOutput'
  };
  if (HANDOFF_KEYS[target]) {
    sessionStorage.setItem(HANDOFF_KEYS[target], JSON.stringify({ content: output, app: 'open-pomelli' }));
  }
}


// ── PHOTO STUDIO ────────────────────────────────────────────────
export function getPhotoStudioCategories() { return PHOTO_CATEGORIES; }
export function findPhotoStyle(cat, st) { return findStyle(cat, st); }
export function buildBrandPhotoshootPrompt(style, brand, dir) { return style.prompt; }
export async function generatePhotoshoot(imgUrl, style, brand, dir, opts = {}) {
  const prompt = [style.label, style.prompt, 'Professional product photography using reference image as focal subject — preserve geometry, color, materials, proportions.'].join('\n');
  const refs = [imgUrl];
  if (brand?.logoUrl) refs.push(brand.logoUrl);
  return generateI2I(apiK(), { prompt, images_list: refs, aspect_ratio: opts.aspect || style.aspect, resolution: opts.resolution || '2k' });
}

// ── ANIMATION ───────────────────────────────────────────────────
const DEFAULT_PROMPTS = { asset:'Subtle hero motion: slow camera push-in, gentle parallax on background elements, ambient light shifts. Brand-consistent mood. Preserve typography and composition.', photoshoot:'Slow rotational camera move around the product, soft light play across the surface, premium reveal feel. Preserve product geometry, color and shadows.', upload:'Cinematic motion that suits the image. Subtle camera move, gentle ambient motion in environmental elements. Preserve subject geometry.' };
export async function generateAnimation(srcImg, promptOrOpts, opts = {}) {
  const srcType = typeof promptOrOpts === 'string' ? promptOrOpts : 'upload';
  const prompt = typeof promptOrOpts === 'string' ? (DEFAULT_PROMPTS[srcType] || promptOrOpts) : (promptOrOpts.prompt || DEFAULT_PROMPTS.upload);
  return generateVideo(apiK(), { prompt, image_url: srcImg, duration:opts.duration||5, resolution:opts.resolution||'720p' });
}
export async function generateImageToVideo(imgUrl, prompt, opts = {}) { return generateVideo(apiK(), { prompt, image_url:imgUrl, duration:opts.duration||5, resolution:opts.resolution||'480p' }); }
export async function generateTextToVideo(prompt, opts = {}) { return generateVideo(apiK(), { prompt, aspect_ratio:opts.aspectRatio||'9:16', duration:opts.duration||5, resolution:opts.resolution||'480p' }); }
export async function saveAnimationRecord(a) { try { const{data,error}=await supabase.from('animations').insert(a).select().single(); if(error)throw error; return data; } catch(err){console.error('pomelli saveAnimationRecord:',err); return null;} }

// ── CAMPAIGN GENERATOR ───────────────────────────────────────────
export const CAMPAIGN_GOALS = [ {value:'product_launch',label:'Product launch',description:'Announce a new product or feature'}, {value:'lead_generation',label:'Lead generation',description:'Capture qualified prospects'}, {value:'brand_awareness',label:'Brand awareness',description:'Reach new audiences'}, {value:'engagement',label:'Engagement',description:'Drive replies, shares, comments'}, {value:'thought_leadership',label:'Thought leadership',description:'Establish authority and POV'}, {value:'sales',label:'Direct sales',description:'Drive purchases or sign-ups'} ];
export function getCampaignGoals() { return CAMPAIGN_GOALS; }

export async function generateCampaignConceptsLLM(brand, goal, direction) {
  const t=JSON.parse(brand.toneOfVoice||brand.tone||'[]').join(', ')||'—', p=JSON.parse(brand.brandPersonality||brand.personality||'[]').join(', ')||'—', m=JSON.parse(brand.keyMessages||brand.messages||'[]').join(' • ')||'—';
  const goalLabel=CAMPAIGN_GOALS.find(g=>g.value===goal)?.label||goal;
  return generateVideoEffect(apiK(), { prompt:`Senior brand strategist. Return STRICT JSON: array of 4 campaign concept objects with keys title, theme, key_message, hook, cta, recommended_platforms[], tone_notes, visual_direction.\nBRAND: ${brand.brandName||'—'} | Goal: ${goalLabel}${direction?' | Direction: '+direction:''}` });
}

export const PLATFORM_PRESETS = [
  { id: 'instagram', name: 'Instagram', dimensions: '1080x1080', ratio: '1:1', color: '#E4405F' },
  { id: 'instagram-reels', name: 'Instagram Reels', dimensions: '1080x1920', ratio: '9:16', color: '#E4405F' },
  { id: 'instagram-stories', name: 'Instagram Stories', dimensions: '1080x1920', ratio: '9:16', color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', dimensions: '1200x630', ratio: '1.9:1', color: '#1877F2' },
  { id: 'facebook-feed', name: 'Facebook Feed', dimensions: '1200x630', ratio: '1.9:1', color: '#1877F2' },
  { id: 'twitter', name: 'Twitter/X', dimensions: '1600x900', ratio: '16:9', color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', dimensions: '1200x627', ratio: '1.9:1', color: '#0A66C2' },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', dimensions: '1280x720', ratio: '16:9', color: '#FF0000' },
  { id: 'youtube-shorts', name: 'YouTube Shorts', dimensions: '1080x1920', ratio: '9:16', color: '#FF0000' },
  { id: 'tiktok', name: 'TikTok', dimensions: '1080x1920', ratio: '9:16', color: '#000000' },
  { id: 'pinterest', name: 'Pinterest', dimensions: '1000x1500', ratio: '2:3', color: '#E60023' },
  { id: 'print', name: 'Print Materials', dimensions: '2550x3300', ratio: '8.5:11', color: '#333333' }
];

export const CAMPAIGN_TYPES = [
  { id: 'awareness', name: 'Brand Awareness', description: 'Increase visibility and reach new audiences' },
  { id: 'engagement', name: 'Engagement', description: 'Drive interactions, comments, shares, and likes' },
  { id: 'conversion', name: 'Conversion', description: 'Drive purchases, sign-ups, and specific actions' },
  { id: 'retention', name: 'Customer Retention', description: 'Keep existing customers engaged and loyal' },
  { id: 'launch', name: 'Product Launch', description: 'Introduce new products or services' },
  { id: 'seasonal', name: 'Seasonal/Holiday', description: 'Tie campaigns to seasons, holidays, or events' },
  { id: 'influencer', name: 'Influencer Partnership', description: 'Collaborate with influencers or creators' },
  { id: 'educational', name: 'Educational', description: 'Inform and teach your audience about topics' }
];

export const CREATIVE_STYLES = [
  { id: 'minimalist', name: 'Minimalist', prompt: 'clean design, ample white space, simple typography, modern aesthetic' },
  { id: 'bold', name: 'Bold Statement', prompt: 'large typography, high contrast, impactful visuals, attention-grabbing' },
  { id: 'playful', name: 'Playful & Fun', prompt: 'bright colors, friendly illustrations, casual tone, approachable' },
  { id: 'luxury', name: 'Luxury Premium', prompt: 'elegant design, sophisticated typography, premium feel, exclusivity' },
  { id: 'retro', name: 'Retro Vintage', prompt: 'vintage aesthetic, nostalgic colors, classic typography, throwback vibes' },
  { id: 'tech', name: 'Tech Forward', prompt: 'futuristic design, sleek lines, modern tech aesthetic, innovation' },
  { id: 'organic', name: 'Organic Natural', prompt: 'natural textures, earthy tones, environmental harmony, authenticity' },
  { id: 'editorial', name: 'Editorial Magazine', prompt: 'magazine-style layout, sophisticated, high-fashion, editorial quality' }
];

export async function generateBrandColors(brandDNA) {
  try {
    return {
      primary: brandDNA.colors?.[0] || '#2563EB',
      secondary: brandDNA.colors?.[1] || '#7C3AED',
      accent: brandDNA.colors?.[2] || '#EC4899',
      background: brandDNA.colors?.[3] || '#F8FAFC',
      text: brandDNA.colors?.[4] || '#1E293B'
    };
  } catch (err) {
    console.error('pomelli generateBrandColors error:', err);
    return null;
  }
}

export async function generateBrandVoice(brandDNA) {
  try {
    const tone = brandDNA.tone || [];
    const personality = brandDNA.personality || [];

    const voiceDescriptions = {
      professional: 'Professional and polished, yet approachable',
      casual: 'Casual and conversational, friendly and relaxed',
      bold: 'Bold and confident, making strong statements',
      playful: 'Playful and fun, bringing joy and humor',
      sophisticated: 'Sophisticated and refined, elegant and premium',
      innovative: 'Innovative and cutting-edge, forward-thinking',
      trustworthy: 'Trustworthy and reliable, dependable and secure',
      inspiring: 'Inspiring and motivating, uplifting audiences'
    };

    const voice = [...tone, ...personality].map(t => voiceDescriptions[t] || t).join('. ');
    return voice || 'Professional and approachable brand voice';
  } catch (err) {
    console.error('pomelli generateBrandVoice error:', err);
    return null;
  }
}

export async function generateContentCalendar(brandDNA, campaignType, duration = 4) {
  try {
    const calendar = [];
    const contentTypes = ['post', 'story', 'reel', 'video', 'carousel'];
    const frequency = Math.ceil(duration / 3);

    for (let week = 0; week < duration; week++) {
      calendar.push({
        week: week + 1,
        themes: [`Week ${week + 1} Theme`],
        content: Array.from({ length: frequency }, (_, i) => ({
          type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
          caption: `Week ${week + 1} post ${i + 1}`,
          hashtags: ['#brand', '#marketing', '#content']
        }))
      });
    }

    return calendar;
  } catch (err) {
    console.error('pomelli generateContentCalendar error:', err);
    return [];
  }
}

export async function generateHashtagSet(brandDNA, topic) {
  try {
    const baseHashtags = brandDNA.name
      ? ['#' + brandDNA.name.replace(/\s+/g, ''), '#brand', '#marketing']
      : ['#brand', '#marketing', '#creative'];

    const topicHashtags = topic
      ? topic.split(' ').map(w => '#' + w.replace(/[^a-zA-Z0-9]/g, ''))
      : [];

    return [...new Set([...baseHashtags, ...topicHashtags])].slice(0, 15);
  } catch (err) {
    console.error('pomelli generateHashtagSet error:', err);
    return [];
  }
}

export async function generateAdCopy(brandDNA, platform, objective) {
  try {
    const copyTemplates = {
      awareness: {
        headline: 'Discover What Makes [Brand] Different',
        body: 'Join thousands who trust [Brand] for innovative solutions. Experience the difference today.',
        cta: 'Learn More'
      },
      conversion: {
        headline: 'Ready to Get Started?',
        body: 'Take the next step with [Brand]. Limited time offer - get started now.',
        cta: 'Get Started'
      },
      engagement: {
        headline: 'We Want to Hear From You',
        body: 'Share your thoughts with [Brand] and join our community of engaged followers.',
        cta: 'Join the Conversation'
      }
    };

    const template = copyTemplates[objective] || copyTemplates.awareness;
    const brandName = brandDNA.name || 'Our Brand';

    return {
      headline: template.headline.replace('[Brand]', brandName),
      body: template.body.replace('[Brand]', brandName),
      cta: template.cta,
      platform
    };
  } catch (err) {
    console.error('pomelli generateAdCopy error:', err);
    return null;
  }
}

export async function analyzeCompetitor(competitorUrl) {
  try {
    return {
      url: competitorUrl,
      name: 'Competitor Brand',
      colors: ['#333333', '#666666', '#999999'],
      estimatedTone: 'professional',
      platforms: ['instagram', 'facebook', 'twitter'],
      contentFrequency: 'daily'
    };
  } catch (err) {
    console.error('pomelli analyzeCompetitor error:', err);
    return null;
  }
}

export async function generateAOBTest(brandDNA, variable) {
  try {
    const variants = {
      headline: [
        { id: 'A', text: 'Discover What Makes [Brand] Different', metric: 'reach' },
        { id: 'B', text: 'Join the [Brand] Movement Today', metric: 'engagement' }
      ],
      image: [
        { id: 'A', style: 'product-focused', metric: 'conversion' },
        { id: 'B', style: 'lifestyle', metric: 'engagement' }
      ],
      cta: [
        { id: 'A', text: 'Learn More', metric: 'click_rate' },
        { id: 'B', text: 'Get Started Now', metric: 'conversion' }
      ]
    };

    const brandName = brandDNA.name || 'Our Brand';
    return (variants[variable] || []).map(v => ({
      ...v,
      text: v.text?.replace('[Brand]', brandName) || v.style
    }));
  } catch (err) {
    console.error('pomelli generateAOBTest error:', err);
    return [];
  }
}