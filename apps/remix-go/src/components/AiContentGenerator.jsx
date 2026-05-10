import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreProvider';
import { Loader2, FileText, MousePointer, Eye, Coins, Trash, Save, BookMark, Rocket, Search, Video, Headlines, BullHorn, ShoppingCart, FileEdit } from 'lucide-react';
import clsx from 'clsx';

const contentTypes = [
  { id: 'blog-post', name: 'Blog Post', icon: FileText, description: 'Complete blog article with introduction, body, and conclusion' },
  { id: 'social-media', name: 'Social Media Post', icon: MousePointer, description: 'Engaging posts for platforms like Twitter, Facebook, LinkedIn' },
  { id: 'email', name: 'Email Campaign', icon: Mail, description: 'Marketing emails, newsletters, and promotional content' },
  { id: 'product-description', name: 'Product Description', icon: ShoppingCart, description: 'Detailed product descriptions with features and benefits' },
  { id: 'headline', name: 'Headlines & Titles', icon: Headlines, description: 'Attention-grabbing headlines and titles' },
  { id: 'ad-copy', name: 'Ad Copy', icon: BullHorn, description: 'Persuasive advertising copy for campaigns' },
  { id: 'landing-page', name: 'Landing Page Copy', icon: Rocket, description: 'Conversion-focused landing page content' },
  { id: 'seo-content', name: 'SEO Content', icon: Search, description: 'Search engine optimized content with keywords' },
  { id: 'video-script', name: 'Video Script', icon: Video, description: 'Scripts for videos, tutorials, and presentations' },
  { id: 'faq', name: 'FAQ Content', icon: FileEdit, description: 'Frequently asked questions and answers' }
];

const tones = [
  { id: 'professional', name: 'Professional', description: 'Business-like, formal, and authoritative' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, conversational, and approachable' },
  { id: 'friendly', name: 'Friendly', description: 'Warm, welcoming, and personable' },
  { id: 'formal', name: 'Formal', description: 'Traditional, proper, and structured' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic, excited, and motivational' },
  { id: 'serious', name: 'Serious', description: 'Solemn, thoughtful, and analytical' },
  { id: 'humorous', name: 'Humorous', description: 'Funny, light-hearted, and entertaining' },
  { id: 'persuasive', name: 'Persuasive', description: 'Convincing, compelling, and influential' }
];

const lengths = [
  { id: 'short', name: 'Short', description: '50-150 words', words: '50-150' },
  { id: 'medium', name: 'Medium', description: '200-500 words', words: '200-500' },
  { id: 'long', name: 'Long', description: '600-1000 words', words: '600-1000' },
  { id: 'extra-long', name: 'Extra Long', description: '1000+ words', words: '1000+' }
];

const audiences = [
  { id: 'general', name: 'General Public', description: 'Broad audience with varied interests' },
  { id: 'business', name: 'Business Professionals', description: 'Corporate executives, managers, entrepreneurs' },
  { id: 'students', name: 'Students', description: 'College/university students and researchers' },
  { id: 'seniors', name: 'Seniors', description: 'Older adults, retirees, senior citizens' },
  { id: 'tech-savvy', name: 'Tech Enthusiasts', description: 'Technology professionals and hobbyists' },
  { id: 'parents', name: 'Parents', description: 'Families with children, parenting community' },
  { id: 'millennials', name: 'Millennials', description: 'Young adults aged 25-40' },
  { id: 'gen-z', name: 'Gen Z', description: 'Young people aged 18-24' }
];

const templates = [
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    type: 'blog-post',
    prompt: 'Write a comprehensive guide on [TOPIC] that includes step-by-step instructions, tips, and common mistakes to avoid.',
    keywords: ['tutorial', 'guide', 'how-to', 'step-by-step']
  },
  {
    id: 'product-review',
    name: 'Product Review',
    type: 'blog-post',
    prompt: 'Create an honest review of [PRODUCT] covering its features, pros and cons, pricing, and who it\'s best suited for.',
    keywords: ['review', 'product', 'features', 'comparison']
  },
  {
    id: 'industry-trends',
    name: 'Industry Trends',
    type: 'blog-post',
    prompt: 'Analyze the latest trends in [INDUSTRY] including emerging technologies, market changes, and future predictions.',
    keywords: ['trends', 'industry', 'analysis', 'future']
  },
  {
    id: 'social-post',
    name: 'Engaging Social Post',
    type: 'social-media',
    prompt: 'Create an engaging social media post about [TOPIC] that encourages interaction and shares.',
    keywords: ['social media', 'engagement', 'viral', 'share']
  },
  {
    id: 'email-newsletter',
    name: 'Newsletter Campaign',
    type: 'email',
    prompt: 'Write a compelling newsletter about [TOPIC] with engaging content, calls-to-action, and value for subscribers.',
    keywords: ['newsletter', 'email', 'campaign', 'subscribers']
  },
  {
    id: 'product-launch',
    name: 'Product Launch Copy',
    type: 'ad-copy',
    prompt: 'Create persuasive advertising copy for launching [PRODUCT] that highlights unique features and creates urgency.',
    keywords: ['launch', 'product', 'advertising', 'urgency']
  }
];

export const AiContentGenerator = observer(() => {
  const store = useStore();
  const [contentType, setContentType] = useState('blog-post');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [audience, setAudience] = useState('general');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentHistory, setContentHistory] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const generateMockContent = () => {
    const contentTypeData = contentTypes.find(ct => ct.id === contentType);

    switch (contentType) {
      case 'blog-post':
        return `# ${prompt}\n\n## Introduction\n\nIn today's fast-paced digital landscape, understanding ${prompt.toLowerCase()} has become crucial for success. This comprehensive guide will walk you through everything you need to know.\n\n## Key Benefits\n\n1. **Improved Efficiency**: Streamline your workflow\n2. **Cost Reduction**: Save time and resources\n3. **Better Results**: Achieve higher quality outcomes\n4. **Competitive Advantage**: Stay ahead of the curve\n\n## Step-by-Step Implementation\n\n### Step 1: Planning Phase\nBegin by assessing your current situation and defining clear objectives.\n\n### Step 2: Execution\nImplement the strategies discussed with careful attention to detail.\n\n### Step 3: Monitoring\nTrack your progress and make adjustments as needed.\n\n### Step 4: Optimization\nRefine your approach based on real-world results.\n\n## Conclusion\n\nMastering ${prompt.toLowerCase()} requires commitment and continuous learning. Start small, measure your progress, and scale what works. The investment in knowledge will pay dividends in the long run.\n\n*Keywords: ${keywords || 'content generation, AI, automation'}*`;

      case 'social-media':
        return `🚀 Exciting News! Just discovered an amazing approach to ${prompt.toLowerCase()} that could transform your workflow!\n\n💡 Key insights:\n• Streamlined processes\n• Better results\n• Time-saving techniques\n\nWhat are your thoughts on this? Have you tried something similar?\n\n#${keywords.split(',').map(k => k.trim().replace(/\s+/g, '')).join(' #')}\n\nLink in bio 👆`;

      case 'email':
        return `Subject: Transform Your ${prompt} Strategy Today\n\nDear [Recipient Name],\n\nI hope this email finds you well. I'm reaching out because I believe you might be interested in revolutionizing your approach to ${prompt.toLowerCase()}.\n\n**Why Change Matters Now**\n\nThe digital landscape is evolving rapidly, and staying ahead requires innovative solutions. Here's what you can achieve:\n\n✓ Improved efficiency by 40%\n✓ Cost reduction of up to 30%\n✓ Enhanced user experience\n✓ Competitive advantage\n\n**Our Solution**\n\nWe offer a comprehensive platform that addresses all your ${prompt.toLowerCase()} needs. Our AI-powered system provides:\n\n- Real-time analytics and insights\n- Automated optimization\n- Seamless integration\n- 24/7 support\n\n**Ready to Get Started?**\n\n[CTA Button: Start Free Trial]\n\nDon't miss this opportunity to transform your business.\n\nBest regards,\n[Your Name]\n[Your Position]\n[Contact Information]\n\nP.S. This offer is available for a limited time. Contact us today to learn more.`;

      case 'product-description':
        return `# ${prompt}\n\n## Overview\n\nIntroducing our revolutionary ${prompt.toLowerCase()} solution designed to meet the evolving needs of modern businesses. Built with cutting-edge technology and user-centric design.\n\n## Key Features\n\n### Advanced Functionality\n- **Smart Automation**: AI-powered workflow optimization\n- **Real-time Analytics**: Comprehensive insights and reporting\n- **Seamless Integration**: Works with your existing tools\n- **Cloud-Based**: Access anywhere, anytime\n\n### User Experience\n- **Intuitive Interface**: Easy to learn and use\n- **Mobile Optimized**: Perfect on any device\n- **Customizable**: Adapt to your specific needs\n- **Secure**: Enterprise-grade security\n\n## Benefits\n\n**For Businesses:**\n- Increase productivity by 300%\n- Reduce operational costs by 40%\n- Improve customer satisfaction\n- Scale efficiently\n\n**For Users:**\n- Simplified workflow\n- Faster results\n- Better collaboration\n- Enhanced creativity\n\n## Technical Specifications\n\n- **Compatibility**: Windows, macOS, Linux, Web\n- **Storage**: Unlimited cloud storage\n- **Security**: SSL encryption, GDPR compliant\n- **Support**: 24/7 customer service\n- **Updates**: Automatic feature updates\n\n## Pricing\n\nStarting from $29/month with a 14-day free trial. Enterprise plans available.\n\n## Get Started Today\n\nTransform your ${prompt.toLowerCase()} experience with our innovative solution. Start your free trial now!\n\n*Keywords: ${keywords || 'product, solution, innovation, technology'}*`;

      case 'headline':
        return `10 Compelling Headlines About ${prompt}:\n\n1. "The Ultimate Guide to ${prompt}: Everything You Need to Know"\n2. "How ${prompt} Can Transform Your Business in 30 Days"\n3. "The Secret to Mastering ${prompt} That Experts Don't Want You to Know"\n4. "${prompt}: The Game-Changing Strategy Your Competitors Fear"\n5. "Why ${prompt} Is the Future of Digital Success"\n6. "From Zero to Hero: Your Complete ${prompt} Journey"\n7. "${prompt} Hacks That Will 10x Your Results"\n8. "The Definitive ${prompt} Framework for 2024"\n9. "Unlock the Power of ${prompt}: A Step-by-Step Approach"\n10. "${prompt}: The Missing Piece in Your Success Puzzle"`;

      case 'ad-copy':
        return `🎯 **STOP STRUGGLING WITH ${prompt.toUpperCase()}!**\n\nAre you tired of mediocre results? Frustrated with complicated solutions?\n\n**Introducing the ULTIMATE ${prompt} Solution!**\n\n✅ **Proven Results**: 300% improvement in just 30 days\n✅ **Easy to Use**: No technical skills required\n✅ **Money-Back Guarantee**: 100% satisfaction or your money back\n✅ **Expert Support**: 24/7 customer service\n\n**🔥 LIMITED TIME OFFER: 50% OFF FIRST MONTH!**\n\nDon't wait! Transform your ${prompt.toLowerCase()} today!\n\n👉 [CLAIM YOUR DISCOUNT NOW]\n\n*Offer ends in 24 hours. Terms and conditions apply.*`;

      default:
        return `Generated content for: ${prompt}\n\n[Tone: ${tone}, Length: ${length}, Audience: ${audience}]\n\nThis is placeholder content that would be generated by AI based on your specifications. The actual content would be tailored to your exact requirements and optimized for the selected content type.`;
    }
  };

  const generateContent = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const generated = generateMockContent();
      setGeneratedContent(generated);

      // Add to history
      const newItem = {
        id: Date.now(),
        type: contentType,
        prompt,
        content: generated,
        timestamp: new Date().toISOString(),
        settings: { tone, length, audience, keywords }
      };

      setContentHistory(prev => [newItem, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Content generation failed:', error);
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, contentType, tone, length, audience, keywords]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      // Show success message
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const loadFromHistory = (historyItem) => {
    setContentType(historyItem.type);
    setPrompt(historyItem.prompt);
    setGeneratedContent(historyItem.content);
    setTone(historyItem.settings.tone);
    setLength(historyItem.settings.length);
    setAudience(historyItem.settings.audience);
    setKeywords(historyItem.settings.keywords);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-5 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">AI Content Generator</h2>
          <div className="flex gap-4 items-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              <MousePointer size={14} /> Powered by AI
            </span>
            <span className="text-gray-600 text-sm flex items-center gap-2">
              <Coins size={14} /> 50 credits remaining
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r overflow-y-auto">
          <div className="p-5">
            <h3 className="text-base font-semibold mb-4">Content Types</h3>
            <div className="grid grid-cols-1 gap-3">
              {contentTypes.map(type => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    className={clsx(
                      'p-4 border-2 rounded-lg cursor-pointer transition-all',
                      contentType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                    )}
                    onClick={() => {
                      setContentType(type.id);
                      setGeneratedContent('');
                      setSelectedTemplate(null);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-md flex items-center justify-center flex-shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">{type.name}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{type.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {showTemplates && (
            <div className="p-5 border-t">
              <h3 className="text-base font-semibold mb-4">Templates</h3>
              <div className="space-y-3">
                {templates.filter(t => t.type === contentType).map(template => (
                  <div
                    key={template.id}
                    className="p-3 border border-gray-200 rounded-md cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setContentType(template.type);
                      setPrompt(template.prompt);
                      setShowTemplates(false);
                    }}
                  >
                    <h4 className="text-sm font-semibold mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{template.prompt.substring(0, 60)}...</p>
                    <div className="flex gap-1 flex-wrap">
                      {template.keywords.map(keyword => (
                        <span key={keyword} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 bg-white border-b">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                >
                  {tones.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                >
                  {lengths.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                >
                  {audiences.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <button
                className="px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-md cursor-pointer flex items-center gap-2 text-sm hover:bg-gray-500 transition-all"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <BookMark size={14} /> Templates
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Prompt or Topic</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe what you want to generate... (e.g., "Write about the benefits of remote work")`}
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm resize-vertical focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Keywords (Optional)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Custom Instructions (Optional)</label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Any specific requirements or style preferences..."
                rows={2}
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm resize-vertical focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div className="mt-4 text-center">
              <button
                className={clsx(
                  'px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-base cursor-pointer flex items-center gap-2 mx-auto transition-all shadow-lg',
                  isGenerating || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-xl'
                )}
                onClick={generateContent}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <MousePointer size={18} /> Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {generatedContent ? (
              <div className="bg-white rounded-lg p-5 shadow-sm font-mono">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Generated Content</h3>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 border border-gray-300 bg-white text-gray-600 rounded-md cursor-pointer text-xs flex items-center gap-1 hover:bg-gray-50"
                      onClick={copyToClipboard}
                    >
                      <MousePointer size={12} /> Copy
                    </button>
                    <button
                      className="px-3 py-1.5 border border-gray-300 bg-white text-gray-600 rounded-md cursor-pointer text-xs flex items-center gap-1 hover:bg-gray-50"
                      onClick={() => {}}
                    >
                      <Save size={12} /> Save
                    </button>
                    <button
                      className="px-3 py-1.5 border border-gray-300 bg-white text-gray-600 rounded-md cursor-pointer text-xs flex items-center gap-1 hover:bg-gray-50"
                      onClick={() => setGeneratedContent('')}
                    >
                      <Trash size={12} /> Clear
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap word-wrap-break-word font-mono text-sm leading-relaxed">
                  {generatedContent}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <FileText size={64} className="opacity-50 mb-4" />
                <h4 className="mb-2">Your generated content will appear here</h4>
                <p className="text-sm">Enter a prompt and click "Generate Content" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="w-64 bg-white border-l overflow-y-auto">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Generation History</h3>
              <button
                className="text-red-500 bg-none border-none cursor-pointer text-xs flex items-center gap-1"
                onClick={() => setContentHistory([])}
              >
                <Trash size={12} /> Clear
              </button>
            </div>

            <div className="space-y-2">
              {contentHistory.map(item => {
                const Icon = contentTypes.find(ct => ct.id === item.type)?.icon || FileText;
                return (
                  <div
                    key={item.id}
                    className="p-3 border border-gray-200 rounded-md cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center flex-shrink-0 text-xs">
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate mb-0.5">{item.prompt.substring(0, 40)}...</div>
                        <div className="text-xs text-gray-600">
                          {new Date(item.timestamp).toLocaleDateString()} • {item.settings.tone}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AiContentGenerator;
