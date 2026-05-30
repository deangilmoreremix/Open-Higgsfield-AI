"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getDesignAgentSessions,
  createDesignAgentSession,
  getDesignAgentSessionAssets,
  getDesignAgentSessionMessages,
  sendDesignAgentMessage,
  getDesignAgentJobs,
  getDesignAgentJobEvents,
  approveDesignAgentJob,
  runDesignAgentSkill,
  getTemplateDesignAgents,
  getDesignAgentUploadUrl,
  createDesignAgentAsset,
  uploadFile
} from "../muapi.js";

const CheckSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function DesignAgentStudioFull({ apiKey, isHeaderVisible = true, onToggleHeader }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [assets, setAssets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Chat state
  const [prompt, setPrompt] = useState("");
  const [pollingJobs, setPollingJobs] = useState({}); // jobId -> { status, events }
  const pollingIntervalsRef = useRef({});

  // Load sessions and skills on mount
  useEffect(() => {
    if (!apiKey) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [sessionsData, skillsData] = await Promise.allSettled([
          getDesignAgentSessions(apiKey),
          getTemplateDesignAgents(apiKey)
        ]);

        if (sessionsData.status === "fulfilled") {
          setSessions(sessionsData.value);
          if (sessionsData.value.length > 0 && !selectedSession) {
            setSelectedSession(sessionsData.value[0]);
          }
        }

        if (skillsData.status === "fulfilled") {
          setSkills(skillsData.value);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load sessions and skills");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [apiKey]);

  // Load session details when selected
  useEffect(() => {
    if (!selectedSession?.id || !apiKey) return;

    const loadSessionDetails = async () => {
      try {
        const [assetsData, messagesData] = await Promise.allSettled([
          getDesignAgentSessionAssets(apiKey, selectedSession.id),
          getDesignAgentSessionMessages(apiKey, selectedSession.id)
        ]);

        if (assetsData.status === "fulfilled") {
          setAssets(assetsData.value);
        }
        if (messagesData.status === "fulfilled") {
          setMessages(messagesData.value);
        }
      } catch (err) {
        console.error("Failed to load session details:", err);
      }
    };

    loadSessionDetails();
  }, [selectedSession?.id, apiKey]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // Create new session
  const handleCreateSession = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const session = await createDesignAgentSession(apiKey, `Session ${sessions.length + 1}`);
      setSessions(prev => [session, ...prev]);
      setSelectedSession(session);
      setAssets([]);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create session:", err);
      setError("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  // Send message to agent
  const handleSendMessage = async () => {
    if (!prompt.trim() || !selectedSession?.id || !apiKey) return;

    const userMessage = { role: "user", content: prompt.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setGenerating(true);

    try {
      const jobResponse = await sendDesignAgentMessage(
        apiKey,
        selectedSession.id,
        prompt.trim(),
        "gpt-5-mini",
        messages
      );

      // Start polling for events
      startPolling(jobResponse.job_id);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message to agent");
      setGenerating(false);
    }
  };

  // Poll for job events
  const startPolling = useCallback((jobId) => {
    let cursor = 0;

    const poll = async () => {
      try {
        const pollResult = await getDesignAgentJobEvents(apiKey, jobId, cursor);
        cursor = pollResult.cursor;

        setPollingJobs(prev => ({
          ...prev,
          [jobId]: { status: pollResult.status, events: pollResult.events }
        }));

        // Process events
        pollResult.events?.forEach(event => {
          if (event.type === "tool_result" && event.payload?.asset) {
            setAssets(prev => [event.payload.asset, ...prev]);
          }
          if (event.type === "text") {
            // Append assistant text to messages
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.role === "assistant") {
                lastMsg.content += event.payload.content;
                return [...prev.slice(0, -1), lastMsg];
              }
              return [...prev, { role: "assistant", content: event.payload.content, timestamp: new Date().toISOString() }];
            });
          }
          if (event.type === "plan_propose") {
            // Auto-approve plans
            approveDesignAgentJob(apiKey, jobId).catch(console.error);
          }
        });

        if (pollResult.done) {
          setGenerating(false);
          clearInterval(pollingIntervalsRef.current[jobId]);
          delete pollingIntervalsRef.current[jobId];
          setPollingJobs(prev => {
            const { [jobId]: _, ...rest } = prev;
            return rest;
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollingIntervalsRef.current[jobId] = setInterval(poll, 2000);
    poll(); // Initial poll
  }, [apiKey]);

  // Run a skill
  const handleRunSkill = async (skillName, inputs) => {
    if (!selectedSession?.id || !apiKey) return;

    setGenerating(true);
    try {
      const jobResponse = await runDesignAgentSkill(
        apiKey,
        selectedSession.id,
        skillName,
        inputs || {}
      );

      // Add to messages
      setMessages(prev => [...prev, {
        role: "user",
        content: `Running skill: ${skillName}`,
        timestamp: new Date().toISOString(),
        skill_name: skillName
      }]);

      startPolling(jobResponse.job_id);
    } catch (err) {
      console.error("Failed to run skill:", err);
      setError(`Failed to run skill: ${skillName}`);
      setGenerating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!selectedSession?.id || !apiKey || !file) return;

    try {
      const url = await uploadFile(apiKey, file);
      const asset = await createDesignAgentAsset(
        apiKey,
        selectedSession.id,
        url,
        file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "audio",
        "upload",
        ""
      );
      setAssets(prev => [asset, ...prev]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload file");
    }
  };

  // Auto-scroll chat to bottom
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full w-full bg-[#030303] text-white">
      {/* Sidebar - Sessions & Skills */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        {/* Sessions */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black text-white/40 uppercase tracking-widest">Sessions</h2>
            <button
              onClick={handleCreateSession}
              className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[10px] font-bold transition-colors"
              disabled={loading}
            >
              + New
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`w-full text-left p-2 rounded text-xs transition-all ${
                  selectedSession?.id === session.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-white/5 hover:bg-white/10 text-white/70 border border-transparent"
                }`}
              >
                <div className="font-bold truncate">{session.name}</div>
                <div className="text-[9px] text-white/40">
                  {session.asset_count || 0} assets • {session.credits_spent || 0} credits
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Skills</h2>
          <div className="space-y-2">
            {skills.map(skill => (
              <button
                key={skill.name}
                onClick={() => handleRunSkill(skill.name, {})}
                disabled={generating}
                className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-left transition-all disabled:opacity-50"
              >
                <div className="font-bold text-xs text-white">{skill.name}</div>
                <div className="text-[9px] text-white/40 mt-1 line-clamp-2">
                  {skill.description}
                </div>
                <div className="text-[8px] text-primary/60 mt-1">
                  ~{skill.estimated_credits || 0} credits
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Chat & Assets */}
      <div className="flex-1 flex flex-col">
        {/* Assets Grid */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Assets</h2>
          {assets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {assets.map(asset => (
                <div
                  key={asset.asset_label}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5"
                >
                  {asset.kind === "image" ? (
                    <img src={asset.url} alt="" className="w-full h-full object-cover" />
                  ) : asset.kind === "video" ? (
                    <video src={asset.url} className="w-full h-full object-cover" muted loop />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 1v12l3-3M2 12a10 10 0 0020 0c0-5.52-4.48-10-10-10S2 6.48 2 12z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[9px] font-bold text-white truncate">
                      {asset.asset_label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
              <div className="text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-20">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M12 8v4l2 2" />
                </svg>
                <p>No assets yet. Upload files or use skills to generate content.</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-all flex items-center justify-center"
              title="Upload file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the design agent to create something..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={generating}
            />
            <button
              onClick={handleSendMessage}
              disabled={generating || !prompt.trim()}
              className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm hover:bg-white transition-all disabled:opacity-50"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M11 13L2 22l9-4 16-7-5-2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-3 py-2 border border-red-500/20">
              {error}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="h-64 border-t border-white/10 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg text-xs ${
                  msg.role === "user"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-white/5 text-white border border-white/10"
                }`}>
                  {msg.skill_name && (
                    <div className="text-[9px] text-primary/60 mb-1 font-bold">
                      Skill: {msg.skill_name}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}