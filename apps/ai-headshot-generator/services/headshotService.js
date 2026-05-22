import { supabase } from '../../../lib/supabase-client.ts';
import { generateI2I, uploadFile } from '../../../lib/muapi.js';

const STORAGE_KEY = 'higgsfield.ai-headshot.projects';

function safeReadStorage(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } }
function safeWriteStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

const HEADSHOT_CATEGORIES = [
  { id: 'linkedin', name: 'LinkedIn', prompt: 'Professional LinkedIn profile photo, crisp business attire, friendly yet authoritative expression, studio lighting with natural background' },
  { id: 'tinder', name: 'Tinder', prompt: 'Confident dating profile photo, warm smile, stylish casual-chic outfit, soft natural lighting, approachable vibe' },
  { id: 'bumble', name: 'Bumble', prompt: 'Bumble dating profile photo, genuine smile, fashion-forward casual style, natural lighting, welcoming atmosphere' },
  { id: 'oldmoney', name: 'OldMoney', prompt: 'Old money aesthetic portrait, tailored blazer, pearl accessories, classic styling, sophisticated and timeless' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'Cyberpunk aesthetic portrait, neon lighting, futuristic fashion, bold makeup, dystopian atmosphere' },
  { id: 'ceo', name: 'CEO', prompt: 'Executive CEO headshot, power suit, confident stance, boardroom ready, authoritative presence' },
  { id: 'cleangirl', name: 'CleanGirl', prompt: 'Clean girl aesthetic, minimal makeup, slicked hair, natural glow, effortless elegance' },
  { id: 'darkacademia', name: 'DarkAcademia', prompt: 'Dark academia style portrait, tweed layers, vintage books, intellectual atmosphere, autumn tones' },
  { id: 'anime', name: 'Anime', prompt: 'Anime-inspired portrait, big expressive eyes, colorful hair, Japanese animation style aesthetic' },
  { id: 'doctor', name: 'Doctor', prompt: 'Medical professional headshot, white coat, confident stance, trustworthy and competent appearance' },
  { id: 'lawyer', name: 'Lawyer', prompt: 'Attorney portrait, sophisticated suit, boardroom setting, trustworthy and accomplished presence' },
  { id: 'mobwife', name: 'MobWife', prompt: 'Mob wife aesthetic, bold glamour, statement jewelry, dramatic makeup, unapologetic confidence' },
  { id: 'bali', name: 'Bali', prompt: 'Bali vacation aesthetic, flowy maxi dress, tropical paradise background, serene and relaxed' },
  { id: '90s', name: '90s', prompt: '90s throwback portrait, grunge fashion, vintage denim, nostalgic film grain effect' },
  { id: 'fitness', name: 'Fitness', prompt: 'Fitness influencer headshot, athletic build, sporty crop top, energetic and motivating presence' },
  { id: 'christmas', name: 'Christmas', prompt: 'Christmas holiday portrait, festive sweater, twinkling lights, warm holiday spirit' },
  { id: 'halloween', name: 'Halloween', prompt: 'Halloween costume portrait, creative makeup, spooky themed outfit, dramatic atmosphere' },
  { id: 'europeanelegance', name: 'EuropeanElegance', prompt: 'European elegance portrait, designer fashion, cobblestone background, refined sophistication' },
  { id: 'championsportsmoment', name: 'ChampionSportsMoment', prompt: 'Sports champion portrait, championship jersey, trophy, celebration moment' },
  { id: 'jobswapdaydream', name: 'JobSwapDaydream', prompt: 'Dream career portrait, creative workspace, aspirational professional setting' },
  { id: 'traveltheworld', name: 'TravelTheWorld', prompt: 'Travel influencer portrait, passport stamps, world map background, adventurous spirit' },
  { id: 'datingpack', name: 'DatingPack', prompt: 'Complete dating profile set, multiple poses, warm and approachable, diverse backgrounds' },
  { id: 'flashposeperfection', name: 'FlashPosePerfection', prompt: 'Fashion photography pose, dramatic lighting, editorial quality, magazine cover ready' },
  { id: 'capandgown', name: 'CapAndGown', prompt: 'Graduation portrait, doctoral cap and gown, proud achievement celebration' },
  { id: 'corporateboss', name: 'CorporateBoss', prompt: 'Corporate boss portrait, corner office setting, power dressing, executive presence' },
  { id: 'rocknrollluxury', name: 'RocknRollLuxury', prompt: 'Rock n roll luxury aesthetic, leather jacket, gold accessories, backstage glamour' },
  { id: 'bigweddingday', name: 'TheBigWeddingDay', prompt: 'Wedding day portrait, bridal elegance, floral arrangements, celebration of love' },
  { id: 'rusticcharm', name: 'RusticCharm', prompt: 'Rustic charm portrait, barn wedding setting, country elegance, warm natural tones' },
  { id: 'dressedtoimpress', name: 'DressedToImpress', prompt: 'Red carpet ready portrait, designer gown, statement jewelry, Hollywood glamour' },
  { id: 'identificationphoto', name: 'IdentificationPhoto', prompt: 'Official ID photo style, plain background, neutral expression, passport quality' },
  { id: 'dontmissyourprom', name: 'DontMissYourProm', prompt: 'Prom night portrait, stunning prom dress, corsage, magical evening atmosphere' },
  { id: 'goddessofnature', name: 'GoddessOfNature', prompt: 'Nature goddess portrait, floral crown, ethereal dress, enchanted forest setting' },
  { id: 'blackandwhitemagic', name: 'BlackAndWhiteMagic', prompt: 'Black and white portrait, classic photography, dramatic lighting, timeless elegance' },
  { id: 'homelycomforts', name: 'HomelyComforts', prompt: 'Cozy home portrait, soft sweater, warm blanket, comfortable and inviting atmosphere' },
  { id: 'balloonsballoonsballoons', name: 'BalloonsBalloonsBalloons', prompt: 'Birthday celebration portrait, colorful balloons, festive decorations, joy and celebration' },
  { id: 'beautyblooms', name: 'BeautyBlooms', prompt: 'Beauty editorial portrait, floral elements, soft makeup, elegant and feminine' },
  { id: 'superheroadventure', name: 'SuperheroAdventure', prompt: 'Superhero portrait, comic book style, caped crusader costume, action hero pose' },
  { id: 'boldfashionstatements', name: 'BoldFashionStatements', prompt: 'Bold fashion editorial, avant-garde outfit, runway ready, fashion week vibe' },
  { id: 'fantasyoutfits', name: 'FantasyOutfits', prompt: 'Fantasy costume portrait, magical realm attire, fairy tale elements, whimsical charm' },
  { id: 'onthecatwalk', name: 'OnTheCatwalk', prompt: 'Fashion week catwalk pose, haute couture outfit, runway confidence, model stance' },
  { id: 'halloweenhorror', name: 'HalloweenHorror', prompt: 'Halloween horror portrait, scary costume makeup, spooky mansion background, terrifying vibes' },
  { id: 'cosplaygalore', name: 'CosplayGalore', prompt: 'Cosplay costume portrait, character-accurate outfit, convention floor style, fandom pride' },
  { id: 'ghibli', name: 'Ghibli', prompt: 'Studio Ghibli animation style portrait, magical creature companion, whimsical fantasy world' },
  { id: 'pixar', name: 'Pixar', prompt: 'Pixar animation style portrait, toy story inspired, vibrant colors, lovable character aesthetic' },
  { id: 'spiderverse', name: 'SpiderVerse', prompt: 'Spider-Verse comic book style portrait, spider suit, comic halftone dots, dynamic action pose' }
];

export async function uploadSourcePhoto(file) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const url = await uploadFile(apiKey, file);
    return { id: 'img_' + Date.now(), url, name: file.name };
  } catch (err) {
    console.error('headshot uploadSourcePhoto error:', err);
    throw err;
  }
}

export async function listHeadshotPresets() {
  return HEADSHOT_CATEGORIES;
}

export async function generateHeadshotPrompt(sourcePhoto, preset) {
  const category = HEADSHOT_CATEGORIES.find(c => c.id === preset.id) || preset;
  const basePrompt = category.prompt || 'professional headshot';
  return `${basePrompt}. High quality photorealistic portrait using the uploaded photo as reference for face shape, features, and identity.`;
}

export async function generateHeadshot(apiKey, sourcePhoto, preset, options = {}) {
  try {
    const prompt = await generateHeadshotPrompt(sourcePhoto, preset);
    return generateI2I(apiKey, {
      prompt,
      image_url: sourcePhoto.url,
      strength: options.strength || 0.7,
      aspect_ratio: options.aspect_ratio || '3:4'
    });
  } catch (err) {
    console.error('headshot generateHeadshot error:', err);
    throw err;
  }
}

export async function generateHeadshotBatch(apiKey, sourcePhoto, presets) {
  const results = [];
  for (const preset of presets) {
    try {
      const result = await generateHeadshot(apiKey, sourcePhoto, preset);
      results.push({ preset: preset.id, ...result });
    } catch (err) {
      results.push({ preset: preset.id, error: err.message });
    }
  }
  return results;
}

export async function getGenerationStatus(requestId) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const response = await fetch(`https://api.muapi.ai/api/v1/predictions/${requestId}/result`, {
      headers: { 'x-api-key': apiKey }
    });
    if (!response.ok) throw new Error('Status check failed');
    return await response.json();
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

export async function saveHeadshot(headshot) {
  try {
    const { data, error } = await supabase.from('headshot_outputs').insert({
      ...headshot,
      created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('headshot saveHeadshot error:', err);
    return null;
  }
}

export async function saveOutputToLibrary(output) {
  try {
    const { data, error } = await supabase.from('generation_jobs').insert({
      job_type: 'ai-headshot',
      output_url: output.url,
      input: { prompt: output.prompt },
      status: 'completed'
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}

export function handoffHeadshotOutput(target, headshot) {
  const HANDOFF_KEYS = {
    library: 'higgsfield.pendingLibraryOutput',
    render: 'higgsfield.pendingRenderOutput',
    'edit-studio': 'higgsfield.pendingEditStudioOutput'
  };
  if (HANDOFF_KEYS[target]) {
    sessionStorage.setItem(HANDOFF_KEYS[target], JSON.stringify({ content: headshot, app: 'ai-headshot-generator' }));
  }
}

export const LIGHTING_PRESETS = [
  { id: 'studio', name: 'Studio Lighting', prompt: 'professional studio lighting, soft box lights, even illumination, clean background' },
  { id: 'natural', name: 'Natural Light', prompt: 'natural daylight photography, window light, soft shadows, organic feel' },
  { id: 'dramatic', name: 'Dramatic', prompt: 'dramatic lighting, high contrast, Rembrandt lighting, moody atmosphere' },
  { id: 'golden', name: 'Golden Hour', prompt: 'golden hour lighting, warm tones, sunset glow, romantic atmosphere' },
  { id: 'bluehour', name: 'Blue Hour', prompt: 'blue hour lighting, cool tones, twilight ambiance, serene mood' },
  { id: 'ringlight', name: 'Ring Light', prompt: 'ring light photography, circular catchlights, evenly lit, modern aesthetic' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'cinematic lighting, film noir style, volumetric lighting, dramatic shadows' }
];

export const POSE_PRESETS = [
  { id: 'confident', name: 'Confident', prompt: 'confident professional pose, slight shoulder angle, direct gaze, powerful stance' },
  { id: 'friendly', name: 'Friendly', prompt: 'friendly approachable pose, warm smile, open body language, welcoming energy' },
  { id: 'creative', name: 'Creative Angle', prompt: 'creative three-quarter pose, artistic angle, dynamic composition, editorial style' },
  { id: 'casual', name: 'Casual', prompt: 'casual relaxed pose, lean or sit, informal setting, laid-back confidence' },
  { id: 'fullbody', name: 'Full Body', prompt: 'full body portrait, complete outfit view, environmental context, lifestyle shot' }
];

export const BACKGROUNDS = [
  { id: 'studio-white', name: 'Studio White', prompt: 'pure white seamless background, professional studio setting' },
  { id: 'studio-gray', name: 'Studio Gray', prompt: 'medium gray seamless background, classic portrait backdrop' },
  { id: 'office', name: 'Modern Office', prompt: 'modern office environment, glass walls, contemporary workspace' },
  { id: 'brick', name: 'Industrial Brick', prompt: 'exposed brick wall background, urban industrial aesthetic' },
  { id: 'nature', name: 'Nature', prompt: 'natural outdoor setting, park background, greenery, organic environment' },
  { id: 'abstract', name: 'Abstract Gradient', prompt: 'abstract colorful gradient background, modern artistic backdrop' },
  { id: 'blur', name: 'Bokeh Blur', prompt: 'shallow depth of field, beautifully blurred background, subject focus' }
];

export const OUTFIT_PRESETS = [
  { id: 'suit', name: 'Business Suit', prompt: 'tailored business suit, dress shirt, conservative professional attire' },
  { id: 'casual-smart', name: 'Casual Smart', prompt: 'smart casual outfit, fitted polo or button-up, relaxed yet professional' },
  { id: 'creative-professional', name: 'Creative Professional', prompt: 'stylish creative professional, blazer with unique details, fashion-forward' },
  { id: 'tech-casual', name: 'Tech Casual', prompt: 'tech company casual, clean sneakers, quality t-shirt or sweater, approachable' },
  { id: 'formal', name: 'Formal', prompt: 'black tie formal, gown or tuxedo, elegant evening wear' },
  { id: 'athleisure', name: 'Athleisure', prompt: 'athleisure wear, sporty and active, healthy lifestyle representation' }
];

export async function enhanceFace(sourcePhotoUrl, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const { enhancement = 'high', detail = 'natural' } = options;
    const prompt = `Face enhancement: ${enhancement} quality, ${detail} detail preservation, professional retouching while maintaining natural appearance.`;
    return generateI2I(apiKey, {
      prompt,
      image_url: sourcePhotoUrl,
      strength: 0.3,
      aspect_ratio: '1:1'
    });
  } catch (err) {
    console.error('headshot enhanceFace error:', err);
    throw err;
  }
}

export async function applyLighting(sourcePhotoUrl, lightingPreset, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const lighting = LIGHTING_PRESETS.find(l => l.id === lightingPreset) || LIGHTING_PRESETS[0];
    const prompt = `${lighting.prompt}. Apply professional lighting setup to portrait.`;
    return generateI2I(apiKey, {
      prompt,
      image_url: sourcePhotoUrl,
      strength: options.strength || 0.5,
      aspect_ratio: options.aspect_ratio || '1:1'
    });
  } catch (err) {
    console.error('headshot applyLighting error:', err);
    throw err;
  }
}

export async function applyBackground(sourcePhotoUrl, backgroundPreset, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const bg = BACKGROUNDS.find(b => b.id === backgroundPreset) || BACKGROUNDS[0];
    const prompt = `Replace background with: ${bg.prompt}. Keep subject perfectly preserved with natural edge detection.`;
    return generateI2I(apiKey, {
      prompt,
      image_url: sourcePhotoUrl,
      strength: options.strength || 0.7,
      aspect_ratio: options.aspect_ratio || '3:4'
    });
  } catch (err) {
    console.error('headshot applyBackground error:', err);
    throw err;
  }
}

export async function applyOutfit(sourcePhotoUrl, outfitPreset, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const outfit = OUTFIT_PRESETS.find(o => o.id === outfitPreset) || OUTFIT_PRESETS[0];
    const prompt = `Transform outfit to: ${outfit.prompt}. Professional digital outfit change while maintaining face identity and natural pose.`;
    return generateI2I(apiKey, {
      prompt,
      image_url: sourcePhotoUrl,
      strength: options.strength || 0.6,
      aspect_ratio: options.aspect_ratio || '3:4'
    });
  } catch (err) {
    console.error('headshot applyOutfit error:', err);
    throw err;
  }
}

export async function applyPose(sourcePhotoUrl, posePreset, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const pose = POSE_PRESETS.find(p => p.id === posePreset) || POSE_PRESETS[0];
    const prompt = `Repose subject to: ${pose.prompt}. Maintain face identity while adjusting pose naturally.`;
    return generateI2I(apiKey, {
      prompt,
      image_url: sourcePhotoUrl,
      strength: options.strength || 0.5,
      aspect_ratio: options.aspect_ratio || '3:4'
    });
  } catch (err) {
    console.error('headshot applyPose error:', err);
    throw err;
  }
}

export async function batchGenerate(sourcePhoto, categories, options = {}) {
  const results = [];
  for (const category of categories) {
    try {
      const result = await generateHeadshot(sourcePhoto, category, options);
      results.push({ category: category.id, success: true, ...result });
    } catch (err) {
      results.push({ category: category.id, success: false, error: err.message });
    }
  }
  return results;
}