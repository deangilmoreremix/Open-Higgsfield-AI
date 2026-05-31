"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateImage, generateI2V, uploadFile, generateI2I } from "../muapi.js";

// Photo Studio presets (6 categories × 5 styles = 30 styles)
const PHOTO_STYLES = [
  // Product - 5 styles
  { id: 'studio-white', name: 'Studio White', category: 'Product', prompt: 'professional product photography on clean white background, studio lighting, crisp shadows, commercial quality' },
  { id: 'marble-clean', name: 'Marble Clean', category: 'Product', prompt: 'luxury product photography on white marble surface, soft natural lighting, elegant minimal style' },
  { id: 'urban-street', name: 'Urban Street', category: 'Product', prompt: 'street style product shot, gritty urban background, dramatic lighting, lifestyle context' },
  { id: 'golden-hour', name: 'Golden Hour', category: 'Product', prompt: 'golden hour product photography, warm natural light, outdoor setting, cinematic tones' },
  { id: 'dark-techy', name: 'Dark Techy', category: 'Product', prompt: 'modern tech product on dark background, rim lighting, contrast, futuristic' },
  // Lifestyle - 5 styles
  { id: 'scandi-living', name: 'Scandi Living', category: 'Lifestyle', prompt: 'Scandinavian interior product shot, bright natural light, minimalist aesthetic, cozy textures' },
  { id: 'tropical-vibe', name: 'Tropical Vibe', category: 'Lifestyle', prompt: 'tropical lifestyle product photography, palm leaves, bright colors, vacation aesthetic' },
  { id: 'vintage-retro', name: 'Vintage Retro', category: 'Lifestyle', prompt: 'vintage retro product styling, warm film tones, nostalgic atmosphere, 70s aesthetic' },
  { id: 'urban-fashion', name: 'Urban Fashion', category: 'Lifestyle', prompt: 'urban fashion product shot, city backdrop, editorial style, bold colors' },
  { id: 'bohemian-chic', name: 'Bohemian Chic', category: 'Lifestyle', prompt: 'bohemian lifestyle shot, earth tones, organic textures, natural lighting' },
  // Food - 5 styles
  { id: 'food-restaurant', name: 'Restaurant Plated', category: 'Food', prompt: 'professional food photography, restaurant setting, styled plating, overhead shot, natural lighting' },
  { id: 'food-flatlay', name: 'Flat Lay', category: 'Food', prompt: 'overhead flat lay food photography, props arranged around dish, bright natural light' },
  { id: 'food-macro', name: 'Close-up Macro', category: 'Food', prompt: 'macro close-up food photography, shallow depth of field, texture detail' },
  { id: 'food-dark', name: 'Dark Ambient', category: 'Food', prompt: 'moody restaurant lighting, dark background, spotlight on dish, dramatic shadows' },
  { id: 'food-bakery', name: 'Bakery Rustic', category: 'Food', prompt: 'rustic bakery photography, wooden table, artisanal bread, warm morning light' },
  // Interior - 5 styles
  { id: 'interior-loft', name: 'Modern Loft', category: 'Interior', prompt: 'modern loft interior, industrial elements, large windows, urban aesthetic' },
  { id: 'interior-cabin', name: 'Cozy Cabin', category: 'Interior', prompt: 'cozy cabin interior, warm wood textures, soft firelight, rustic charm' },
  { id: 'interior-luxury', name: 'Luxury Hotel', category: 'Interior', prompt: 'luxury hotel suite, marble floors, gold accents, editorial style' },
  { id: 'interior-coastal', name: 'Coastal Beach', category: 'Interior', prompt: 'coastal beach house interior, white and blue tones, natural light, airy feel' },
  { id: 'interior-industrial', name: 'Industrial Chic', category: 'Interior', prompt: 'industrial chic space, exposed brick, metal fixtures, urban loft aesthetic' },
  // Beauty - 5 styles
  { id: 'beauty-studio', name: 'Beauty Studio', category: 'Beauty', prompt: 'beauty product studio shot, clean background, soft diffused lighting' },
  { id: 'beauty-makeup', name: 'Makeup Closeup', category: 'Beauty', prompt: 'closeup beauty makeup shot, flawless skin, dramatic lighting, cosmetics focus' },
  { id: 'beauty-skincare', name: 'Skincare Serum', category: 'Beauty', prompt: 'skincare product photography, clean minimal setup, soft pastel background' },
  { id: 'beauty-perfume', name: 'Perfume Luxury', category: 'Beauty', prompt: 'luxury perfume bottle photography, dark elegant setting, spotlight effect' },
  { id: 'beauty-cosmetics', name: 'Cosmetics Flatlay', category: 'Beauty', prompt: 'cosmetics flat lay, makeup brushes arranged, soft pink background, studio lighting' },
  // Jewelry - 5 styles
  { id: 'jewelry-white', name: 'Jewelry White', category: 'Jewelry', prompt: 'luxury jewelry on clean white background, bright studio lighting, reflective surface' },
  { id: 'jewelry-black', name: 'Jewelry Black', category: 'Jewelry', prompt: 'jewelry on black velvet, dramatic lighting, high contrast, premium feel' },
  { id: 'jewelry-diamond', name: 'Diamond Closeup', category: 'Jewelry', prompt: 'diamond jewelry macro photography, sparkle detail, refracted light, high end' },
  { id: 'jewelry-gold', name: 'Gold Elegant', category: 'Jewelry', prompt: 'gold jewelry on marble, warm lighting, luxurious presentation' },
  { id: 'jewelry-silver', name: 'Silver Modern', category: 'Jewelry', prompt: 'silver jewelry on dark reflective surface, sharp focus, contemporary style' },
];

export default function PomelliStudio({ apiKey, onGenerationComplete }) {
  const [activeTab, setActiveTab] = useState("brand");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [brandDNA, setBrandDNA] = useState(null);
  const [photoImageUrl, setPhotoImageUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(PHOTO_STYLES[0]);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [photoHistory, setPhotoHistory] = useState([]);
  
  const [videoImageUrl, setVideoImageUrl] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [animateError, setAnimateError] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);

  // Campaign state
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignDirection, setCampaignDirection] = useState('');
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [campaignConcepts, setCampaignConcepts] = useState([]);

  // Creative state
  const [generatingCreative, setGeneratingCreative] = useState(null);
  const [creativeResults, setCreativeResults] = useState({});

  // Analyze website
  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl.trim()) return;
    setAnalyzing(true);
    setBrandDNA(null);
    
    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ url: websiteUrl })
      });
      const data = await response.json();
      setBrandDNA(data);
    } catch (err) {
      console.error("Website analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate campaign concepts
  const handleGenerateCampaign = async () => {
    if (!campaignGoal || !brandDNA) return;
    setGeneratingCampaign(true);
    setCampaignConcepts([]);
    
    try {
      const response = await fetch('/api/pomelli/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: campaignGoal, direction: campaignDirection, brandDNA })
      });
      const concepts = await response.json();
      setCampaignConcepts(concepts);
    } catch (err) {
      console.error("Campaign generation failed:", err);
    } finally {
      setGeneratingCampaign(false);
    }
  };

  // Generate platform creative
  const handleGenerateCreative = async (format, concept) => {
    setGeneratingCreative(format);
    
    try {
      const response = await fetch('/api/pomelli/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, concept, brandDNA })
      });
      const result = await response.json();
      setCreativeResults(prev => ({ ...prev, [format]: result }));
    } catch (err) {
      console.error("Creative generation failed:", err);
    } finally {
      setGeneratingCreative(null);
    }
  };

  // Generate product photo
  const handleGeneratePhoto = async () => {
    if (!photoImageUrl) {
      alert("Please upload a product image first.");
      return;
    }
    
    setGeneratingPhoto(true);
    setPhotoError(null);
    
    try {
      const result = await generateI2I(apiKey, {
        model: 'nano-banana-2-edit',
        prompt: selectedStyle.prompt,
        image_url: photoImageUrl,
        strength: 0.6
      });
      
      if (!result?.url) throw new Error("No image returned");
      
      const entry = {
        id: result.id || Date.now().toString(),
        url: result.url,
        style: selectedStyle.id,
        timestamp: new Date().toISOString()
      };
      setPhotoHistory(prev => [entry, ...prev].slice(0, 20));
      
      if (onGenerationComplete) {
        onGenerationComplete({ url: result.url, type: "image", source: "pomelli-photo-studio" });
      }
    } catch (err) {
      setPhotoError(err.message || "Generation failed");
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // Animate image
  const handleAnimate = async () => {
    if (!videoImageUrl) {
      alert("Please upload an image to animate.");
      return;
    }
    
    setAnimating(true);
    setAnimateError(null);
    
    try {
      const result = await generateI2V(apiKey, {
        model: 'seedance-lite-i2v',
        image_url: videoImageUrl,
        prompt: 'cinematic motion, smooth panning, high quality animation',
        duration: 5
      });
      
      if (!result?.url) throw new Error("No video returned");
      
      const entry = {
        id: result.id || Date.now().toString(),
        url: result.url,
        timestamp: new Date().toISOString()
      };
      setVideoHistory(prev => [entry, ...prev].slice(0, 20));
      
      if (onGenerationComplete) {
        onGenerationComplete({ url: result.url, type: "video", source: "pomelli-animate" });
      }
    } catch (err) {
      setAnimateError(err.message || "Animation failed");
    } finally {
      setAnimating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file, setUrl) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds 10MB limit.");
      return;
    }
    try {
      const url = await uploadFile(apiKey, file);
      setUrl(url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-app-bg text-white">
      
      {/* Header Tabs */}
      <div className="h-14 border-b border-white/10 flex items-center px-6 gap-6">
        {['brand', 'campaign', 'photo-studio', 'animate'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab ? 'text-primary' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.split('-').join(' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'brand' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Brand DNA Extractor</h2>
            <p className="text-white/60">Paste a website URL to analyze its brand elements</p>
            
            <div className="flex gap-3">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleAnalyzeWebsite}
                disabled={analyzing || !websiteUrl.trim()}
                className="px-6 py-3 bg-primary text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
              >
                {analyzing ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Analyze"}
              </button>
            </div>
            
            {brandDNA && (
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4">
                <h3 className="text-lg font-bold">Extracted Brand DNA</h3>
                <div>
                  <span className="text-xs font-bold text-primary uppercase">Colors</span>
                  <div className="flex gap-2 mt-2">
                    {brandDNA.colors?.map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-primary uppercase">Fonts</span>
                  <div className="text-white/80 mt-1">{brandDNA.fonts?.join(', ')}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-primary uppercase">Tone</span>
                  <div className="text-white/80 mt-1">{brandDNA.tone?.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'photo-studio' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Photo Studio (30 Styles)</h2>
            
            {/* Style selector */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PHOTO_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-3 rounded-lg text-xs font-bold border transition-all ${
                    selectedStyle.id === style.id 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <div className="text-[9px] text-white/40 mb-1">{style.category}</div>
                  {style.name}
                </button>
              ))}
            </div>

            {/* Upload and generate */}
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], setPhotoImageUrl)}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Upload Product Image
              </label>
              <button
                onClick={handleGeneratePhoto}
                disabled={generatingPhoto || !photoImageUrl}
                className="px-6 py-2 bg-primary text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
              >
                {generatingPhoto ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Generate"}
              </button>
            </div>

            {/* Photo gallery */}
            {photoHistory.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                {photoHistory.map(entry => (
                  <img key={entry.id} src={entry.url} alt="Generated" className="w-full aspect-square object-cover rounded-lg border border-white/10" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'animate' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Animate (Image-to-Video)</h2>
            
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], setVideoImageUrl)}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Upload Image
              </label>
              <button
                onClick={handleAnimate}
                disabled={animating || !videoImageUrl}
                className="px-6 py-2 bg-primary text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
              >
                {animating ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Animate"}
              </button>
            </div>

            {videoHistory.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {videoHistory.map(entry => (
                  <video key={entry.id} src={entry.url} controls className="w-full aspect-video object-cover rounded-lg border border-white/10" />
                ))}
              </div>
            )}
          </div>
        )}

{activeTab === 'campaign' && (
           <div className="max-w-7xl mx-auto space-y-6">
             <h2 className="text-2xl font-bold">Campaign Generator</h2>
             <p className="text-white/60">Generate on-brand marketing campaigns using extracted brand DNA</p>
             
             {brandDNA ? (
               <div className="space-y-6">
                 {/* Campaign Goal Selection */}
                 <div>
                   <h3 className="text-xs font-bold text-primary uppercase mb-2">Campaign Goal</h3>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {[
                       { id: 'product-launch', name: 'Product Launch', desc: 'Introduce new products' },
                       { id: 'lead-gen', name: 'Lead Generation', desc: 'Capture potential customers' },
                       { id: 'awareness', name: 'Awareness', desc: 'Build brand recognition' },
                       { id: 'engagement', name: 'Engagement', desc: 'Drive interaction' },
                       { id: 'thought-leadership', name: 'Thought Leadership', desc: 'Establish expertise' },
                       { id: 'sales', name: 'Sales', desc: 'Direct selling' }
                     ].map(goal => (
                       <button
                         key={goal.id}
                         onClick={() => setCampaignGoal(goal.id)}
                         className={`p-4 rounded-lg border transition-all ${
                           campaignGoal === goal.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
                         }`}
                       >
                         <div className="font-bold text-sm">{goal.name}</div>
                         <div className="text-xs text-white/40">{goal.desc}</div>
                       </button>
                     ))}
                   </div>
                 </div>

                 <textarea
                   value={campaignDirection}
                   onChange={(e) => setCampaignDirection(e.target.value)}
                   placeholder="Optional: Add campaign direction..."
                   className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                 />

                 <button
                   onClick={handleGenerateCampaign}
                   disabled={generatingCampaign || !campaignGoal}
                   className="px-6 py-3 bg-primary text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white disabled:opacity-50"
                 >
                   {generatingCampaign ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /> : 'Generate Campaign Concepts'}
                 </button>

                 {campaignConcepts.length > 0 && (
                   <div>
                     <h3 className="text-lg font-bold mb-4">Generated Concepts</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {campaignConcepts.map((concept, idx) => (
                         <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                           <div className="font-bold text-sm">{concept.title || `Concept ${idx + 1}`}</div>
                           <div className="text-xs text-white/60 mt-1">{concept.angle}</div>
                         </div>
                       ))}
                     </div>
                     
                     {/* Platform Creative Generation - using first concept */}
                     <div className="mt-8">
                       <h3 className="text-lg font-bold mb-4">Platform Creatives</h3>
                       <div className="space-y-4">
                         <div className="text-xs font-bold text-white/60">
                           Generate creatives for: {campaignConcepts[0]?.title || 'Selected Concept'}
                         </div>
                         
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {[
                             { id: 'instagram', name: 'Instagram Post', ar: '1:1' },
                             { id: 'linkedin', name: 'LinkedIn', ar: '16:9' },
                             { id: 'facebook', name: 'Facebook', ar: '16:9' },
                             { id: 'twitter', name: 'X/Twitter', ar: '16:9' },
                             { id: 'youtube', name: 'YouTube', ar: '16:9' },
                             { id: 'tiktok', name: 'TikTok', ar: '9:16' },
                             { id: 'email', name: 'Email Header', ar: '2:1' },
                             { id: 'web', name: 'Web Banner', ar: '728:90' },
                           ].map(platform => (
                             <div key={platform.id} className="space-y-2">
                               <div className="aspect-square bg-white/5 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
                                 {creativeResults[platform.id] ? (
                                   <img
                                     src={creativeResults[platform.id].url}
                                     alt={platform.name}
                                     className="w-full h-full object-cover"
                                   />
                                 ) : (
                                   <div className="text-center p-2">
                                     <div className="text-xs font-bold text-white/60">{platform.name}</div>
                                     <div className="text-[10px] text-white/40">{platform.ar}</div>
                                   </div>
                                 )}
                               </div>
                               
                               <button
                                 onClick={() => handleGenerateCreative(platform.id, campaignConcepts[0])}
                                 disabled={generatingCreative === platform.id || !campaignConcepts[0]}
                                 className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                               >
                                 {generatingCreative === platform.id ? (
                                   <div className="flex items-center justify-center">
                                     <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                   </div>
                                 ) : creativeResults[platform.id] ? (
                                   'Regenerate'
                                 ) : (
                                   'Generate'
                                 )}
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <p className="text-white/40">Analyze a website first to enable campaign generation.</p>
             )}
           </div>
         )}
      </div>
    </div>
  );
}