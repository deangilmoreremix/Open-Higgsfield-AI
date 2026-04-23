/**
 * LLM Chat Assistant - Context-aware AI for video editing
 * Integrated with timeline, assets, and project knowledge
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const LLM_MODES = [
  {
    id: 'ask',
    name: 'Ask',
    icon: '❓',
    description: 'General questions about your project'
  },
  {
    id: 'search',
    name: 'Search',
    icon: '🔍',
    description: 'Find assets, quotes, or timeline moments'
  },
  {
    id: 'cut',
    name: 'Cut',
    icon: '✂️',
    description: 'Get editing suggestions from transcripts'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: '🎬',
    description: 'Analyze clips, pacing, and structure'
  }
];

const LLM_PROVIDERS = [
  { id: 'fal', name: 'fal.ai', models: ['GPT-4', 'Claude', 'Gemini'] },
  { id: 'openai', name: 'OpenAI', models: ['GPT-4', 'GPT-3.5'] },
  { id: 'anthropic', name: 'Anthropic', models: ['Claude 3', 'Claude 2'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['Llama 3', 'Mistral'] }
];

export function LLMChat({ projectData, timelineState, onTimelineAction }) {
  const [mode, setMode] = useState('ask');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('fal');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [citations, setCitations] = useState([]);
  const [contextExpanded, setContextExpanded] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
      mode
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Build context based on mode
      const context = buildContext(mode, projectData, timelineState, currentMessage);

      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          mode,
          context,
          provider: selectedProvider,
          model: selectedModel,
          projectId: projectData?.id
        })
      });

      const result = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        citations: result.citations || [],
        suggestions: result.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);
      setCitations(result.citations || []);

    } catch (error) {
      console.error('LLM chat failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, mode, selectedProvider, selectedModel, projectData, timelineState]);

  const buildContext = (mode, projectData, timelineState, message) => {
    const baseContext = {
      project: {
        id: projectData?.id,
        title: projectData?.title,
        description: projectData?.description,
        duration: timelineState?.duration,
        tracks: timelineState?.tracks?.length || 0,
        clips: timelineState?.clips?.length || 0
      },
      assets: projectData?.assets || [],
      transcripts: projectData?.transcripts || [],
      elements: projectData?.elements || []
    };

    switch (mode) {
      case 'search':
        return {
          ...baseContext,
          searchMode: true,
          searchableContent: extractSearchableContent(projectData, timelineState)
        };

      case 'cut':
        return {
          ...baseContext,
          transcripts: projectData?.transcripts || [],
          currentTime: timelineState?.currentTime || 0
        };

      case 'timeline':
        return {
          ...baseContext,
          timeline: {
            tracks: timelineState?.tracks || [],
            clips: timelineState?.clips || [],
            currentTime: timelineState?.currentTime || 0,
            duration: timelineState?.duration || 0
          }
        };

      default: // ask
        return baseContext;
    }
  };

  const extractSearchableContent = (projectData, timelineState) => {
    const content = [];

    // Assets
    projectData?.assets?.forEach(asset => {
      content.push({
        type: 'asset',
        id: asset.id,
        title: asset.name,
        content: asset.description || asset.name,
        url: asset.url
      });
    });

    // Transcripts
    projectData?.transcripts?.forEach(transcript => {
      content.push({
        type: 'transcript',
        id: transcript.id,
        title: `Transcript ${transcript.id}`,
        content: transcript.text,
        timestamp: transcript.timestamp
      });
    });

    // Timeline clips
    timelineState?.clips?.forEach(clip => {
      if (clip.text) {
        content.push({
          type: 'clip',
          id: clip.id,
          title: `Clip ${clip.id}`,
          content: clip.text,
          startTime: clip.startTime,
          duration: clip.duration
        });
      }
    });

    return content;
  };

  const jumpToCitation = (citation) => {
    if (citation.type === 'timeline' && citation.timestamp) {
      // Jump to timeline position
      onTimelineAction?.('seek', citation.timestamp);
    } else if (citation.type === 'clip' && citation.clipId) {
      // Select clip in timeline
      onTimelineAction?.('selectClip', citation.clipId);
    } else if (citation.type === 'asset' && citation.assetId) {
      // Open asset in library
      onTimelineAction?.('openAsset', citation.assetId);
    }
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'cut') {
      // Apply timeline cuts
      onTimelineAction?.('applyCuts', suggestion.cuts);
    } else if (suggestion.type === 'trim') {
      // Apply trims
      onTimelineAction?.('applyTrims', suggestion.trims);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="llm-chat">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">🤖</span>
          <span>AI Assistant</span>
        </div>

        <div className="chat-controls">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="provider-select"
          >
            {LLM_PROVIDERS.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            {LLM_PROVIDERS.find(p => p.id === selectedProvider)?.models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mode-selector">
        {LLM_MODES.map(m => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
            title={m.description}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-name">{m.name}</span>
          </button>
        ))}
      </div>

      <div className="context-summary">
        <button
          className="context-toggle"
          onClick={() => setContextExpanded(!contextExpanded)}
        >
          📊 Context {contextExpanded ? '▼' : '▶'}
        </button>

        {contextExpanded && (
          <div className="context-details">
            <div className="context-item">
              <span className="context-label">Project:</span>
              <span className="context-value">{projectData?.title || 'Untitled'}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Duration:</span>
              <span className="context-value">{formatDuration(timelineState?.duration || 0)}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Assets:</span>
              <span className="context-value">{projectData?.assets?.length || 0}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Clips:</span>
              <span className="context-value">{timelineState?.clips?.length || 0}</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to AI Assistant!</h3>
            <p>I'm here to help with your video editing workflow. Choose a mode above and ask me anything about your project.</p>

            <div className="quick-prompts">
              <button onClick={() => setCurrentMessage("What clips need color correction?")}>
                🎨 Color correction suggestions
              </button>
              <button onClick={() => setCurrentMessage("Suggest cuts for this interview")}>
                ✂️ Interview editing suggestions
              </button>
              <button onClick={() => setCurrentMessage("Find all mentions of 'product'")}>
                🔍 Search for "product"
              </button>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-header">
              <span className="message-role">
                {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
              </span>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="message-content">
              {message.content}
            </div>

            {message.citations && message.citations.length > 0 && (
              <div className="message-citations">
                <h5>References:</h5>
                {message.citations.map((citation, index) => (
                  <button
                    key={index}
                    className="citation-btn"
                    onClick={() => jumpToCitation(citation)}
                  >
                    {citation.type}: {citation.title}
                  </button>
                ))}
              </div>
            )}

            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                <h5>Suggestions:</h5>
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion.icon} {suggestion.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me about your ${mode}...`}
            rows={1}
            disabled={isLoading}
          />
          <button
            className={`send-btn ${isLoading ? 'disabled' : ''}`}
            onClick={sendMessage}
            disabled={!currentMessage.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>

        <div className="input-hints">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>@mention clips, assets, or elements</span>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// CSS Styles
const llmChatStyles = `
.llm-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-left: 1px solid var(--border);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.chat-icon {
  font-size: 18px;
}

.chat-controls {
  display: flex;
  gap: 8px;
}

.provider-select,
.model-select {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
  font-size: 12px;
}

.mode-selector {
  display: flex;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  gap: 4px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.mode-btn:hover {
  background: var(--bg-secondary);
}

.mode-btn.active {
  background: var(--primary-alpha);
  border-color: var(--primary);
  color: var(--primary);
}

.mode-icon {
  font-size: 14px;
}

.context-summary {
  padding: 8px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.context-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  text-align: left;
}

.context-details {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.context-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.context-label {
  color: var(--text-secondary);
}

.context-value {
  color: var(--text);
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.welcome-message h3 {
  margin: 0 0 16px 0;
  color: var(--text);
  font-size: 18px;
}

.welcome-message p {
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.quick-prompts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-prompts button {
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.quick-prompts button:hover {
  border-color: var(--primary);
  background: var(--primary-alpha);
}

.message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
}

.message.user {
  background: var(--primary-alpha);
  border-color: var(--primary);
  margin-left: 40px;
}

.message.assistant {
  background: var(--bg-secondary);
  margin-right: 40px;
}

.message.loading .message-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.message-role {
  font-weight: 600;
}

.message-time {
  opacity: 0.7;
}

.message-content {
  color: var(--text);
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-citations,
.message-suggestions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.message-citations h5,
.message-suggestions h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.citation-btn,
.suggestion-btn {
  display: block;
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 4px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 11px;
  text-align: left;
  transition: all 0.15s ease;
}

.citation-btn:hover,
.suggestion-btn:hover {
  background: var(--primary-alpha);
  border-color: var(--primary);
  color: var(--primary);
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-container textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  outline: none;
  transition: border-color 0.15s ease;
}

.input-container textarea:focus {
  border-color: var(--primary);
}

.send-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.15s ease;
}

.send-btn:hover:not(.disabled) {
  background: var(--primary-hover);
}

.send-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hints {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}
`;

export default LLMChat;</content>
<parameter name="filePath">src/components/llm/LLMChat.js