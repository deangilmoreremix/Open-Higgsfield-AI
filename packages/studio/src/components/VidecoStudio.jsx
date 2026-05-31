"use client";

import { useState, useRef } from "react";
import { generateVideo, generateI2V, uploadFile } from "../muapi.js";

const VIDEO_TEMPLATES = [
  { id: 'outreach-1', name: 'Cold Outreach', prompt: 'professional personalized video message for sales outreach, clean background, confident speaker, corporate style' },
  { id: 'outreach-2', name: 'Warm Follow-up', prompt: 'friendly follow-up video message, approachable tone, professional setting, inviting' },
  { id: 'intro-1', name: 'Introduction', prompt: 'brief professional introduction video, casual yet polished, well-lit office, confident smile' },
  { id: 'intro-2', name: 'Team Intro', prompt: 'team introduction video, collaborative office setting, group of professionals, energetic' },
  { id: 'demo-1', name: 'Product Demo', prompt: 'product demonstration style video, clean presentation screen, engaging demo, modern UI' },
  { id: 'demo-2', name: 'Feature Walk-through', prompt: 'feature walk-through video, animated UI elements, smooth transitions, tech-savvy' },
  { id: 'thank-you-1', name: 'Thank You', prompt: 'genuine thank you message video, warm smile, professional gesture, appreciative' },
  { id: 'thank-you-2', name: 'Client Appreciation', prompt: 'client appreciation video, sincere expression, elegant background, grateful tone' },
];

function VidecoStudio({ apiKey, onGenerationComplete }) {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'generate' | 'analytics'
  const [selectedTemplate, setSelectedTemplate] = useState(VIDEO_TEMPLATES[0]);
  const [personalization, setPersonalization] = useState('');
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [referenceImage, setReferenceImage] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image exceeds 10MB limit.");
      return;
    }
    try {
      const url = await uploadFile(apiKey, file);
      setReferenceImage(url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleGenerateVideo = async () => {
    setGenerating(true);
    try {
      const result = await generateVideo(apiKey, {
        model: 'seedance-lite-t2v',
        prompt: `${selectedTemplate.prompt}. Personalization: ${personalization}. Professional quality, smooth delivery.`,
        duration: 15,
        aspect_ratio: '16:9',
        image_url: referenceImage
      });
      
      setHistory(prev => [{ 
        id: result.id || Date.now().toString(),
        url: result.url, 
        prompt: personalization, 
        template: selectedTemplate.name,
        timestamp: new Date().toISOString() 
      }, ...prev].slice(0, 30));
      
      onGenerationComplete?.({ url: result.url, type: 'video' });
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-app-bg text-white">
      {/* Header Tabs */}
      <div className="h-14 border-b border-white/10 flex items-center px-6 gap-6">
        {['templates', 'generate', 'analytics'].map(tab => (
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
        {activeTab === 'templates' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Video Templates</h2>
            <p className="text-white/60">Choose a template for personalized outreach videos</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {VIDEO_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg text-left border transition-all ${
                    selectedTemplate.id === template.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-white text-sm">{template.name}</div>
                  <div className="text-white/40 text-xs mt-1 line-clamp-2">{template.prompt.substring(0, 80)}...</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Generate Video</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Selected Template</label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-primary">
                  {selectedTemplate.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Personalization Details</label>
                <textarea
                  value={personalization}
                  onChange={(e) => setPersonalization(e.target.value)}
                  placeholder="Add personalization details (name, company, context, etc.)..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Reference Image (Optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10"
                  >
                    {referenceImage ? 'Change Image' : 'Upload Reference Image'}
                  </button>
                  {referenceImage && (
                    <img src={referenceImage} alt="Reference" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={generating || !personalization.trim()}
                className="w-full py-3 bg-primary text-black font-bold rounded-lg uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
              >
                {generating ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /> : "Generate Video"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Video Analytics</h2>
            <p className="text-white/60">Track performance of your personalized videos</p>
            
            {history.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Recent Videos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {history.map(entry => (
                    <div key={entry.id} className="relative group">
                      <video
                        src={entry.url}
                        className="w-full aspect-video object-cover rounded-lg border border-white/10"
                        muted
                        loop
                        onMouseOver={(e) => e.target.play()}
                        onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-[10px] text-white/80 truncate">
                        {entry.template}
                      </div>
                      <button
                        onClick={() => downloadFile(entry.url, `videco-${entry.id}.mp4`)}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-white/40">
                No videos generated yet. Go to Generate tab to create your first personalized video.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VidecoStudio;