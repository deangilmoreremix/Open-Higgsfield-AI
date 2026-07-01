/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import './IntakeStep.css';

const AI_RESPONSES = {
  greeting: "Hi! I'm your AI video creation assistant. What kind of video do you want to make today?",
  idea: "That sounds like a great concept! A few quick questions to help me set things up perfectly for you — who is this video for? (e.g., customers, social media followers, personal use)",
  audience: "Got it! And what tone are you going for? Something serious and polished, fun and energetic, or somewhere in between?",
  tone: "Perfect. One last thing — do you have existing content like a script or a novel, or would you like me to generate everything from your idea? You can also star in the video yourself using AutoCameo!",
  hasContent: "Great, you can paste or upload your content on the next screen. Based on what you've told me, I'd recommend using the {pipeline} pipeline with a {style} style. Ready to continue?",
  noContent: "No problem! I'll help build the full story from your idea. I'd suggest the {pipeline} pipeline with a {style} style — it's perfect for what you're describing. Ready to start?",
  cameo: "How exciting! AutoCameo will transform you into a guest star across any cinematic scene. Upload your photo on the next screen and we'll do the rest. Ready to become the star?",
};

const PIPELINE_SUGGESTIONS = {
  customers: { pipeline: 'idea2video', style: 'Cinematic' },
  social: { pipeline: 'idea2video', style: 'Cartoon' },
  personal: { pipeline: 'idea2video', style: 'Realistic' },
  script: { pipeline: 'script2video', style: 'Cinematic' },
  novel: { pipeline: 'novel2video', style: 'Cinematic' },
  cameo: { pipeline: 'cameo', style: 'Cinematic' },
  default: { pipeline: 'idea2video', style: 'Cinematic' },
};

const PIPELINE_DISPLAY_NAMES = {
  idea2video: 'Idea2Video',
  script2video: 'Script2Video',
  novel2video: 'Novel2Video',
  cameo: 'AutoCameo',
};

function detectCameoIntent(text) {
  const t = text.toLowerCase();
  return t.includes('myself') || t.includes('my photo') || t.includes('my pet') || t.includes('appear in') || t.includes('star in') || t.includes('cameo') || t.includes('autocameo') || t.includes('my face') || t.includes('my picture');
}

function detectSuggestion(answers) {
  if (answers.hasContent === 'cameo') return PIPELINE_SUGGESTIONS.cameo;
  if (answers.hasContent === 'script') return PIPELINE_SUGGESTIONS.script;
  if (answers.hasContent === 'novel') return PIPELINE_SUGGESTIONS.novel;
  if (answers.audience && answers.audience.toLowerCase().includes('social')) return PIPELINE_SUGGESTIONS.social;
  if (answers.audience && answers.audience.toLowerCase().includes('customer')) return PIPELINE_SUGGESTIONS.customers;
  return PIPELINE_SUGGESTIONS.default;
}

export default function IntakeStep({ onComplete, onSkip }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: AI_RESPONSES.greeting }
  ]);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState('idea');
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addAssistantMessage = (text, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    }, delay);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');

    if (stage === 'idea') {
      const newAnswers = { ...answers, idea: userMessage };
      setAnswers(newAnswers);
      setStage('audience');
      addAssistantMessage(AI_RESPONSES.idea);
    } else if (stage === 'audience') {
      const newAnswers = { ...answers, audience: userMessage };
      setAnswers(newAnswers);
      setStage('tone');
      addAssistantMessage(AI_RESPONSES.audience);
    } else if (stage === 'tone') {
      const newAnswers = { ...answers, tone: userMessage };
      setAnswers(newAnswers);
      setStage('content');
      addAssistantMessage(AI_RESPONSES.tone);
    } else if (stage === 'content') {
      const hasContent = detectCameoIntent(userMessage) ? 'cameo'
        : userMessage.toLowerCase().includes('script') ? 'script'
        : userMessage.toLowerCase().includes('novel') ? 'novel'
        : 'none';
      const newAnswers = { ...answers, hasContent };
      setAnswers(newAnswers);
      const suggestion = detectSuggestion(newAnswers);
      let responseText;
      if (hasContent === 'cameo') {
        responseText = AI_RESPONSES.cameo;
      } else {
        const responseTemplate = hasContent !== 'none' ? AI_RESPONSES.hasContent : AI_RESPONSES.noContent;
        responseText = responseTemplate
          .replace('{pipeline}', PIPELINE_DISPLAY_NAMES[suggestion.pipeline] || suggestion.pipeline)
          .replace('{style}', suggestion.style);
      }
      setStage('done');
      setIsDone(true);
      addAssistantMessage(responseText);
      setTimeout(() => {
        onComplete({
          idea: newAnswers.idea || '',
          pipeline: suggestion.pipeline,
          style: suggestion.style,
          hasExistingContent: hasContent !== 'none',
          contentType: hasContent,
        });
      }, 2200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickOption = (text) => {
    setInput(text);
    setTimeout(() => {
      const userMessage = text;
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      setInput('');

      if (stage === 'content') {
        const hasContent = text === 'I have a script' ? 'script'
          : text === 'I have a novel' ? 'novel'
          : text === 'I want to star in the video' ? 'cameo'
          : 'none';
        const newAnswers = { ...answers, hasContent };
        setAnswers(newAnswers);
        const suggestion = detectSuggestion(newAnswers);
        let responseText;
        if (hasContent === 'cameo') {
          responseText = AI_RESPONSES.cameo;
        } else {
          const responseTemplate = hasContent !== 'none' ? AI_RESPONSES.hasContent : AI_RESPONSES.noContent;
          responseText = responseTemplate
            .replace('{pipeline}', PIPELINE_DISPLAY_NAMES[suggestion.pipeline] || suggestion.pipeline)
            .replace('{style}', suggestion.style);
        }
        setStage('done');
        setIsDone(true);
        addAssistantMessage(responseText);
        setTimeout(() => {
          onComplete({
            idea: newAnswers.idea || '',
            pipeline: suggestion.pipeline,
            style: suggestion.style,
            hasExistingContent: hasContent !== 'none',
            contentType: hasContent,
          });
        }, 2200);
      }
    }, 50);
  };

  const QUICK_OPTIONS = {
    content: ['Generate everything from my idea', 'I have a script', 'I have a novel', 'I want to star in the video'],
  };

  return (
    <div className="intake-step">
      <div className="intake-header">
        <div className="intake-ai-avatar">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="14" fill="#2563eb" />
            <path d="M8 11h12M8 15h8M8 19h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="intake-title">AI Video Assistant</h2>
          <p className="intake-subtitle">Answer a few quick questions to get started</p>
        </div>
        <button className="intake-skip-btn" onClick={onSkip}>
          Skip to manual setup
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="intake-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`intake-message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="intake-message-avatar">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="8" fill="#2563eb" />
                  <path d="M4 6h8M4 9h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <div className="intake-message-bubble">{msg.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="intake-message assistant">
            <div className="intake-message-avatar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect width="16" height="16" rx="8" fill="#2563eb" />
                <path d="M4 6h8M4 9h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="intake-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {stage === 'content' && !isDone && (
        <div className="intake-quick-options">
          {QUICK_OPTIONS.content.map((opt) => (
            <button key={opt} className="intake-quick-option" onClick={() => handleQuickOption(opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {!isDone && (
        <div className="intake-input-row">
          <textarea
            className="intake-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              stage === 'idea' ? "Describe your video idea..." :
              stage === 'audience' ? "Who is this video for?" :
              stage === 'tone' ? "What tone are you going for?" :
              "Do you have a script or novel to use?"
            }
            rows={2}
            autoFocus
          />
          <button
            className="intake-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M16 9L2 2l3 7-3 7 14-7Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
