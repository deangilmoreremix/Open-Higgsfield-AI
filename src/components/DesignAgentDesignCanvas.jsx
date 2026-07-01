/**
 * Design Agent Studio – Creative Canvas
 *
 * Vite-compatible port of the Design Agent Studio.
 * Strips all Next.js-specific imports (next/navigation, next/image, next/link,
 * next-themes, next/dynamic) and replaces them with standard React + browser APIs.
 *
 * Dependencies (all present in Higgsfield node_modules):
 *   react, react-dom  (peer: >=18)
 *   react-konva, konva
 *   react-hot-toast
 *   react-icons
 *   react-markdown, remark-gfm
 *   axios
 *   framer-motion
 */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import _CanvasArea from "./CanvasArea";
import _PlanVisualizer from "./components/PlanVisualizer";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  FiSend,
  FiImage,
  FiTerminal,
  FiZap,
  FiLayout,
  FiUpload,
  FiPlus,
  FiSun,
  FiMoon,
  FiCheck,
  FiX,
  FiEdit2,
  FiArrowLeft,
  FiAlertCircle,
  FiCopy,
  FiCommand,
} from "react-icons/fi";
import {
  BiLoaderAlt,
} from "react-icons/bi";
import {
  RiRobot2Fill,
  RiSparklingLine,
} from "react-icons/ri";
import {
  HiLightBulb,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
} from "react-icons/hi2";
import {
  MdClose,
  MdFullscreen,
  MdFileDownload,
  MdPerson,
} from "react-icons/md";
import {
  IoChevronBack,
  IoColorPalette,
  IoAdd,
  IoSend,
} from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

const CanvasArea = forwardRef((props, ref) => {
  const instanceRef = useRef(null);
  useImperativeHandle(ref, () => ({
    ...instanceRef.current,
    ...props,
  }), []);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return ready ? <_CanvasArea {...props} ref={instanceRef} /> : null;
});
CanvasArea.displayName = "CanvasArea";

const PlanVisualizer = _PlanVisualizer;

// ── Error Boundary ────────────────────────────────────────────────────────
class DesignAgentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-red-500/5 text-red-400 p-8 text-center">
          <div>
            <p className="text-sm font-bold mb-2">Design Agent Error</p>
            <p className="text-xs opacity-70">Something unexpected happened. Please refresh the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function useToggle(initial = false) {
  const [v, setV] = useState(initial);
  const toggle = useCallback(() => setV(s => !s), []);
  return [v, setV, toggle];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateHeader(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

const SKILLS = [
  {
    name: "Generate Image",
    description: "Create images from text prompts",
    inputs: ["prompt"],
  },
  {
    name: "Edit Image",
    description: "Edit an existing image with natural language",
    inputs: ["image", "prompt"],
  },
  {
    name: "Generate Video",
    description: "Generate a video from a text prompt",
    inputs: ["prompt"],
  },
  {
    name: "Image to Video",
    description: "Animate an image into a video",
    inputs: ["image", "prompt"],
  },
  {
    name: "Upscale Image",
    description: "Increase image resolution",
    inputs: ["image"],
  },
  {
    name: "Remove Background",
    description: "Remove the background from an image",
    inputs: ["image"],
  },
];

// ── Default colour themes ─────────────────────────────────────────────────
const THEMES = {
  dark: {
    id: "dark",
    name: "Dark",
    colors: {
      background: "#050505",
      foreground: "#ffffff",
      muted: "#767d88",
      border: "rgba(255,255,255,0.1)",
      componentBg: "#0a0a0a",
      componentHover: "#111111",
      headerBg: "#080808",
      userBubble: "#1a1a1a",
      userText: "#ffffff",
      agentBubble: "#0f0f0f",
      agentText: "#e5e5e5",
      inputBg: "#0a0a0a",
      accent: "#22d3ee",
      accentText: "#000000",
    },
  },
  light: {
    id: "light",
    name: "Light",
    colors: {
      background: "#f8f8f8",
      foreground: "#1a1a1a",
      muted: "#6b7280",
      border: "rgba(0,0,0,0.1)",
      componentBg: "#ffffff",
      componentHover: "#f0f0f0",
      headerBg: "#ffffff",
      userBubble: "#22d3ee",
      userText: "#000000",
      agentBubble: "#f0f0f0",
      agentText: "#1a1a1a",
      inputBg: "#ffffff",
      accent: "#22d3ee",
      accentText: "#000000",
    },
  },
};

function applyThemeCssVariables(theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([k, v]) => {
    root.style.setProperty(`--color-${k}`, v);
  });
}

// ── Copy Button ───────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded bg-bg-card border border-divider shadow-md hover:text-primary transition-all"
      title="Copy"
    >
      {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
    </button>
  );
};

// ── Typing Dots ───────────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="typing-dots flex gap-1 py-1.5 px-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary"
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// Main CreativeCanvas component
// ────────────────────────────────────────────────────────────────────────────
export default function CreativeCanvas({
  user,
  theme: forcedTheme,
  creditConversionRate = 200,
  inEmbedMode = false,
  embedCode = null,
  isHeaderVisible: _propHeaderVisible,
  onToggleHeader: _onToggleHeader,
}) {
  const resolvedTheme = forcedTheme || "dark";
  const theme = THEMES[resolvedTheme] || THEMES.dark;

  useEffect(() => {
    applyThemeCssVariables(theme);
  }, [theme]);

  // ── State ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(generateId());
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const resizeRef = useRef(null);

  // ── Persist sessions from localStorage ───────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    try {
      const stored = localStorage.getItem("design_agent_sessions");
      if (stored) setSessions(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("design_agent_sessions", JSON.stringify(sessions));
    } catch { /* ignore */ }
  }, [sessions, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    document.body.style.setProperty("--color-bg-page", theme.colors.background);
    document.body.style.setProperty("--color-text-main", theme.colors.foreground);
    document.body.style.setProperty("--color-text-sub", theme.colors.muted);
    document.body.style.setProperty("--color-divider", theme.colors.border);
    document.body.className = resolvedTheme === "dark" ? "dark" : "";
  }, [resolvedTheme, theme.colors]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, busy]);

  // ── File Upload ──────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachments((prev) => [
            ...prev,
            { url: ev.target.result, kind: "image", asset_label: file.name },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [],
  );

  const handleFileUpload = useCallback(() => {
    const inp = fileInputRef.current;
    if (!inp?.files?.length) return;
    setUploading(true);
    let pct = 0;
    const timer = setInterval(() => {
      pct += 15;
      setUploadProgress(Math.min(pct, 95));
      if (pct >= 95) clearInterval(timer);
    }, 200);
    Array.from(inp.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments((prev) => [
          ...prev,
          { url: ev.target.result, kind: "image", asset_label: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
    setTimeout(() => {
      clearInterval(timer);
      setUploading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    }, 800);
  }, []);

  // ── Chat / Agent ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (busy) return;
    setBusy(true);
    setError(null);

    const userMsg = { role: "user", content: input, attachments, id: generateId() };
    const assistantMsg = { role: "assistant", content: "", status: [], id: generateId() };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setAttachments([]);
    setShowSkillsMenu(false);
    setShowAssetsMenu(false);

    try {
      const response = await axios.post(
        `${typeof window !== "undefined" && window.location.protocol.startsWith("http")
          ? "/api"
          : ""}/api/api/v1/predictions/`,
        {
          prompt: input,
          attachments: attachments.map((a) => a.url),
          session_id: activeSessionId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": user?.api_key || "",
          },
        },
      );

      const requestId = response.data?.request_id;
      if (!requestId) throw new Error("No Request ID returned");

      const pollInterval = 1500;
      let complete = false;
      let errors = 0;

      while (!complete && errors < 10) {
        try {
          await new Promise((r) => setTimeout(r, pollInterval));
          const pollRes = await axios.get(`/api/api/v1/predictions/${requestId}/result`);
          const data = pollRes.data;

          const newContent = data?.messages?.[data.messages.length - 1]?.content || "";
          const newStatus = data?.messages?.[0]?.events || [];
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: newContent, status: newStatus }
                : m
            )
          );

          if (data?.status === "completed" || data?.is_complete) complete = true;
          if (data?.status === "failed") throw new Error(data?.error || "Execution failed");
        } catch (pollErr) {
          errors++;
          if (errors >= 10) throw pollErr;
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `❌ Error: ${err.message}` }
            : m
        )
      );
    } finally {
      setBusy(false);
    }
  }, [input, attachments, busy, activeSessionId, user]);

  // ── Canvas not found in design-agent — show Vite-build error
  const handleSendMessage = useCallback(
    (e) => {
      e?.preventDefault();
      sendMessage();
    },
    [sendMessage],
  );

  const handleKey = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const selectMention = useCallback((asset, type) => {
    setShowAssetsMenu(false);
    if (type === "asset" && asset.url) {
      setInput((prev) => prev + (prev ? " " : "") + asset.asset_label);
    }
  }, []);

  // ── Download ─────────────────────────────────────────────────────────────
  const handleDownloadFile = useCallback(async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
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
  }, []);

  // ── Toolbar handlers (delegate to canvas) ─────────────────────────────────
  const handleZoomChange = useCallback((pct) => {
    canvasRef.current?.setZoom?.(pct / 100);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  if (!isMounted) return null;

  return (
    <DesignAgentErrorBoundary>
      <style>{`
        :root {
          --bg-page: ${theme.colors.background};
          --text-main: ${theme.colors.foreground};
          --text-sub: ${theme.colors.muted};
          --divider: ${theme.colors.border};
          --component-bg: ${theme.colors.componentBg};
          --component-hover: ${theme.colors.componentHover};
          --header-bg: ${theme.colors.headerBg};
          --user-bubble: ${theme.colors.userBubble};
          --user-text: ${theme.colors.userText};
          --agent-bubble: ${theme.colors.agentBubble};
          --agent-text: ${theme.colors.agentText};
          --input-bg: ${theme.colors.inputBg};
          --accent: ${theme.colors.accent};
          --accent-text: ${theme.colors.accentText};
        }
        .typing-dots span {
          animation: typingBounce 1.4s infinite ease-in-out both;
        }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .design-agent-chat-main * { font-family: 'Inter', sans-serif; }
      `}</style>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="design-agent-chat-main h-dvh w-full flex flex-col bg-bg-page overflow-hidden relative">
        {/* ── Top Toolbar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-divider bg-header-bg z-20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FiArrowLeft
              className="w-5 h-5 text-text-sub hover:text-text-main cursor-pointer transition-colors"
              onClick={() => window.history.back()}
            />
            <span className="text-sm font-bold text-text-main">Design Agent Studio</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-1.5 rounded-lg hover:bg-component-hover text-text-sub hover:text-accent transition-colors"
              title={showChat ? "Hide Chat" : "Show Chat"}
            >
              <FiLayout className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const next = resolvedTheme === "dark" ? "light" : "dark";
                window.location.search = `?theme=${next}`;
              }}
              className="p-1.5 rounded-lg hover:bg-component-hover text-text-sub hover:text-accent transition-colors"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* ── Canvas area ── */}
          <div className="flex-1 relative" style={{ background: theme.colors.background }}>
            <CanvasArea
              ref={canvasRef}
              theme={resolvedTheme}
              colors={theme.colors}
              activeTasks={[]}
              setActiveTasks={() => {}}
              onZoomChange={handleZoomChange}
            />
          </div>

          {/* ── Resizer ── */}
          {showChat && (
            <div
              className="w-1 cursor-col-resize bg-divider hover:bg-accent transition-colors relative"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startW = sidebarWidth;
                const move = (ev) => {
                  const delta = startX - ev.clientX;
                  setSidebarWidth(Math.max(280, Math.min(600, startW + delta)));
                };
                const up = () => {
                  document.removeEventListener("mousemove", move);
                  document.removeEventListener("mouseup", up);
                };
                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", up);
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-12 rounded-full bg-divider" />
            </div>
          )}

          {/* ── Chat Sidebar ── */}
          <AnimatePresence initial={false}>
            {showChat && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: sidebarWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col bg-component-bg border-l border-divider flex-shrink-0 overflow-hidden"
              >
                {/* ── Sidebar Header ── */}
                <div className="px-4 py-3 border-b border-divider flex items-center justify-between flex-shrink-0">
                  <div className="flex flex-col">
                    <h2 className="text-[13px] font-bold text-text-main uppercase tracking-widest flex items-center gap-2">
                      <RiSparklingLine className="text-accent" />
                      Creative Agent
                    </h2>
                    <span className="text-[10px] text-text-sub mt-0.5">
                      Generate &middot; Edit &middot; Refine
                    </span>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-1 rounded hover:bg-component-hover text-text-sub hover:text-text-main transition-colors"
                    title="Close sidebar"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>

                {/* ── Chat History ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-subtle">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-8 text-center opacity-60">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <RiSparklingLine className="w-6 h-6 text-accent" />
                      </div>
                      <p className="text-xs text-text-sub font-medium">
                        Describe what you want to create
                      </p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const prev = messages[idx - 1];
                    const showDate =
                      !prev ||
                      new Date(msg.timestamp || 0).toDateString() !==
                        new Date(prev.timestamp || 0).toDateString();

                    return (
                      <div key={msg.id || idx}>
                        {showDate && msg.timestamp && (
                          <div className="flex justify-center my-2">
                            <span className="px-2 py-0.5 bg-component-hover border border-divider rounded text-[10px] font-medium text-text-sub">
                              {formatDateHeader(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex flex-col gap-1.5 ${
                            msg.role === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === "assistant" && (
                              <RiRobot2Fill className="w-4 h-4 text-accent" />
                            )}
                            {msg.role === "assistant" && msg.timestamp && (
                              <span className="text-[10px] text-text-sub">
                                {formatTime(msg.timestamp)}
                              </span>
                            )}
                            {msg.role === "user" && msg.timestamp && (
                              <span className="text-[10px] text-text-sub">
                                {formatTime(msg.timestamp)}
                              </span>
                            )}
                          </div>

                          <div
                            className={`max-w-[90%] relative group ${
                              msg.role === "user" ? "ml-auto" : ""
                            }`}
                          >
                            <div
                              className={`px-3 py-2.5 rounded-lg text-[13px] leading-relaxed border ${
                                msg.role === "user"
                                  ? "bg-user-bubble text-user-text rounded-tr-none border-divider"
                                  : "bg-agent-bubble text-agent-text rounded-tl-none border-divider"
                              }`}
                            >
                              {msg.role === "assistant" ? (
                                <div className="prose prose-sm max-w-none" style={{ color: "var(--agent-text)" }}>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content || ""}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {msg.attachments?.length > 0
                                    ? msg.attachments.map((a, i) => (
                                        <div
                                          key={i}
                                          className="w-40 rounded border border-white/20 overflow-hidden shadow-sm"
                                        >
                                          {a.kind === "image" && (
                                            <img
                                              src={a.url}
                                              alt={a.asset_label}
                                              className="w-full aspect-square object-cover"
                                            />
                                          )}
                                        </div>
                                      ))
                                    : null}
                                  {msg.content && (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      className="prose prose-sm max-w-none"
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                  )}
                                </div>
                              )}
                              {msg.role === "assistant" && busy && idx === messages.length - 1 && (
                                <TypingDots />
                              )}
                            </div>
                            {msg.content && (
                              <div className="absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={msg.content} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* ── Suggestions ── */}
                {suggestions.length > 0 && messages.length > 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(s.label || s.prompt || "");
                          textareaRef.current?.focus();
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-medium border px-3 py-1.5 rounded-lg transition-all hover:bg-component-hover hover:border-accent"
                        style={{
                          background: theme.colors.componentBg,
                          borderColor: theme.colors.border,
                          color: theme.colors.foreground,
                        }}
                      >
                        <HiLightBulb className="w-3 h-3 text-yellow-500" />
                        {s.label || `Suggestion ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Input ── */}
                <div className="px-4 pb-4 flex-shrink-0">
                  <form
                    onSubmit={handleSendMessage}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-xl border flex items-end gap-2 p-2 transition-all ${
                      isDragging
                        ? "border-dashed border-accent bg-accent/5 ring-2 ring-accent/20"
                        : busy
                          ? "border-accent"
                          : "border-divider focus-within:border-accent"
                    }`}
                    style={{ background: theme.colors.inputBg }}
                  >
                    {isDragging && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-accent/5 rounded-xl pointer-events-none">
                        <div className="w-10 h-10 rounded-full border-2 border-accent flex items-center justify-center animate-pulse">
                          <FiUpload className="text-accent" />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || busy}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-component-hover text-text-sub hover:text-accent transition-all disabled:opacity-50"
                      title="Upload Image"
                    >
                      {uploading ? (
                        <BiLoaderAlt className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiUpload className="w-4 h-4" />
                      )}
                    </button>

                    {attachments.length > 0 && (
                      <div className="absolute bottom-full left-2 right-2 mb-1 flex flex-wrap gap-1.5">
                        {attachments.map((a, i) => (
                          <div key={i} className="relative group">
                            {a.kind === "image" && (
                              <img
                                src={a.url}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-divider"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setAttachments((prev) => prev.filter((_, j) => j !== i))
                              }
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Describe what to create…"
                      disabled={busy}
                      className="flex-1 bg-transparent px-2 py-2 text-sm resize-none focus:outline-none min-h-[40px] max-h-[150px]"
                      rows={1}
                    />

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowSkillsMenu(!showSkillsMenu)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-component-hover transition-all ${
                          showSkillsMenu ? "text-accent bg-component-hover" : "text-text-sub"
                        }`}
                        title="Skills"
                      >
                        <RiSparklingLine className="w-4 h-4" />
                      </button>
                      {showSkillsMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-component-bg border border-divider rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <div className="px-4 py-3 border-b border-divider">
                            <h3 className="text-[11px] font-bold text-text-main uppercase tracking-widest">
                              Skills
                            </h3>
                          </div>
                          <div className="p-1.5 max-h-60 overflow-y-auto">
                            {SKILLS.map((s) => (
                              <button
                                key={s.name}
                                onClick={() => {
                                  setActiveSkill(s);
                                  setShowSkillsMenu(false);
                                  textareaRef.current?.focus();
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-component-hover text-left group ${
                                  activeSkill?.name === s.name
                                    ? "bg-accent/5 border border-accent"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                    activeSkill?.name === s.name
                                      ? "bg-accent text-black"
                                      : "bg-component-hover text-accent"
                                  }`}
                                >
                                  <FiZap className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[12px] font-semibold text-text-main">
                                    {s.name}
                                  </div>
                                  <div className="text-[10px] text-text-sub line-clamp-1">
                                    {s.description}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="p-2 border-t border-divider">
                            <button
                              type="button"
                              onClick={() => setShowSkillsMenu(false)}
                              className="w-full text-center text-[10px] text-text-sub hover:text-text-main transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowAssetsMenu(!showAssetsMenu)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-component-hover transition-all ${
                          showAssetsMenu ? "text-accent bg-component-hover" : "text-text-sub"
                        }`}
                        title="Assets"
                      >
                        <FiImage className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={busy || (!input.trim() && attachments.length === 0)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      style={{ background: theme.colors.accent, color: theme.colors.accentText }}
                    >
                      {busy ? (
                        <BiLoaderAlt className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSend className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                  {error && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
                      <span className="text-[11px] text-red-400">{error}</span>
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DesignAgentErrorBoundary>
  );
}

export { CanvasArea, PlanVisualizer };
