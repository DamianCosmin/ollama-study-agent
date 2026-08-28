import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotIcon, MenuIcon, XIcon, MessageSquarePlusIcon } from "lucide-react";

import { PageHeader } from "../components/PageHeader.tsx";
import ChatInput from "../components/ChatInput.tsx";
import ChatBubble from "../components/ChatBubble.tsx";
import TypingBubble from "../components/TypingBubble.tsx";
import { useStatus } from "../context/StatusContext.tsx";
import { API_BASE, IChatMessage, IChatSession, IUser } from "../utils/types.ts";
import { convertToIChatMessage, convertToIChatSession, convertToIUser } from "../utils/functions.ts";
import "../App.css";

const SUGGESTIONS: string[] = [
  "Explain a concept",
  "Clarify something from my notes",
  "Test my understanding",
];

export default function TutorPage() {
  const [user, setUser] = useState<IUser | null>(null);

  const [sessions, setSessions] = useState<IChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);

  const [value, setValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [pendingToken, setPendingToken] = useState<number | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestTokenRef = useRef(0);
  const { showStatus } = useStatus();

  const hasStarted = messages.length > 0;
  const isSending = pendingToken !== null && pendingToken === requestTokenRef.current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/user`, {
          method: "GET"
        });

        const data = await response.json();

        if (response.ok) {
          const rawData = data.user as Omit<IUser, "createdAt" | "lastActive"> & {createdAt: string, lastActive: string};
          const user: IUser = convertToIUser(rawData);
          setUser(user);
        } else {
          showStatus({text: "Failed to fetch user!", type: "error"});
          console.error("Error: Failed to fetch user!", data);
        }
      } catch (err) {
        showStatus({text: "Could not connect to the backend!", type: "error"});
        console.error("Error: Could not connect to backend!", err);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions(user.id);
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: "smooth"});
  }, [messages, isSending, streamingMessage]);

  const fetchSessions = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat/users/${userId}/sessions`, {
        method: "GET"
      });

      const data = await response.json();

      if (response.ok) {
        const rawData = data.sessions as Array<Omit<IChatSession, "createdAt"> & {createdAt: string}>;
        const sessions: IChatSession[] = rawData.map(convertToIChatSession);
        setSessions(sessions);
      } else {
        showStatus({text: "Failed to fetch chat sessions!", type: "error"});
        console.error("Error: Failed to fetch chat sessions!", data);
      }
    } catch (err) {
      showStatus({text: "Could not connect to the backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
    }
  };

  const loadSession = async (session: IChatSession) => {
    abortControllerRef.current?.abort();
    setIsSidebarOpen(false);

    setValue("");
    if (textareaRef.current)
      textareaRef.current.style.height = "auto";

    requestTokenRef.current++;
    setIsCreatingSession(false);
    setStreamingMessage(null);

    try {
      const response = await fetch(`${API_BASE}/chat/sessions/${session.id}/messages`, {
        method: "GET"
      });

      const data = await response.json();

      if (response.ok) {
        const rawData = data.messages as Array<Omit<IChatMessage, "createdAt"> & { createdAt: string }>;
        const messages: IChatMessage[] = rawData.map(convertToIChatMessage);
        
        setMessages(messages);
        setSessionId(session.id);
      } else {
        showStatus({text: "Failed to load this conversation.", type: "error"});
        console.error("Error: Failed to fetch session messages!", data);
      }
    } catch (err) {
      showStatus({text: "Could not connect to the backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
    }
  };

  const startNewChat = () => {
    abortControllerRef.current?.abort();
    setSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
    setStreamingMessage(null);

    setValue("");
    if (textareaRef.current)
      textareaRef.current.style.height = "auto";

    requestTokenRef.current++;
    setIsCreatingSession(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = textareaRef.current;

    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }
  }

  const fillSuggestion = (label: string) => {
    setValue(label);
    const el = textareaRef.current;

    if (el) {
      el.focus();
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }
  };

  const sendMessage = async (question: string) => {
    const trimmedQuestion: string = question.trim();

    if (!trimmedQuestion || isSending || !user)
      return;

    const isNewChat: boolean = !sessionId;

    if (isNewChat) {
      setIsCreatingSession(true);
    }

    // Create mock message to update the UI (real message is stored on the backend correctly)
    const randomId: string = crypto.randomUUID();
    const userMessage: IChatMessage = {
      id: randomId,
      sessionId: sessionId ?? "",
      createdAt: new Date(),
      role: "user",
      content: trimmedQuestion,
    };

    const removeRandomIdMessage = () => {
      setMessages((prev) => prev.filter((m) => m.id !== randomId));
    }

    setMessages((prev) => [...prev, userMessage]);
    setValue("");

    if (textareaRef.current)
      textareaRef.current.style.height = "auto";

    const currentToken = ++requestTokenRef.current;
    setPendingToken(currentToken);

    const isStale: boolean = requestTokenRef.current !== currentToken;

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const chatBody = {
        question: trimmedQuestion,
        sessionId: sessionId,
        userId: user.id,
      }

      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatBody),
        signal: controller.signal
      });

      if (isStale)
        return;

      if (!response.ok) {
        const data = await response.json();
        showStatus({text: "Failed to get a response from the tutor!", type: "error"});
        console.error("Error: Failed to send chat message!", data);
        removeRandomIdMessage();

        return;
      }

      if (!response.body) {
        showStatus({text: "Streaming not supported!", type: "error"});
        console.error("Error: Streaming not supported!");
        removeRandomIdMessage();

        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer: string = "";
      let streamedAnswer: string = "";
      setStreamingMessage("");
      
      while (true) {
        if (isStale) {
          reader.cancel();
          return;
        }

        const {value, done} = await reader.read();

        if (done)
          break;

        buffer += decoder.decode(value, {stream: true});

        // SSE events are separated by a blank line
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          if (isStale) {
            reader.cancel();
            return;
          }

          const eventTypeMatch = rawEvent.match(/^event: (.+)$/m);
          const dataMatch = rawEvent.match(/^data: (.+)$/m);
          const eventType = eventTypeMatch?.[1] ?? "message";
          const rawData = dataMatch?.[1] ?? "";

          if (eventType === "session") {
            // Update the session ID with the newly created one
            setSessionId(rawData);
            await fetchSessions(user.id);
          } else if (eventType === "error") {
            showStatus({text: "The tutor failed to generate a response!", type: "error"});
            console.error("Error: Failed to generate response!");
            setStreamingMessage(null);

            return;
          } else if (eventType === "done") {
            const rawMessage: Omit<IChatMessage, "createdAt"> & { createdAt: string } = JSON.parse(rawData);
            const finalMessage: IChatMessage = convertToIChatMessage(rawMessage);
            setMessages((prev) => [...prev, finalMessage]);
            setStreamingMessage(null);

            return;
          } else {
            const {token} = JSON.parse(rawData);
            streamedAnswer += token;
            
            setStreamingMessage(streamedAnswer);
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError")
        return;

      if (isStale)
        return;

      showStatus({text: "Could not connect to the backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
      removeRandomIdMessage();
    } finally {
      if (!isStale) {
        setPendingToken(null);
        setStreamingMessage(null);

        if (isNewChat)
          setIsCreatingSession(false);
      }
    }
  };

  const handleSubmit = () => sendMessage(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <PageHeader
        title="AI Tutor"
        subtitle="Ask questions and get explanations tailored to what you're studying."
      />

      <motion.div
        layout
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex flex-1 overflow-hidden rounded-xl bg-white/5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]"
      >
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 z-20 bg-neutral-950/70 backdrop-blur-sm sm:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sessions sidebar */}
        <div
          className={`absolute inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col gap-2 border-r border-white/10 bg-neutral-900/95 p-3 transition-transform duration-200 sm:relative sm:z-auto sm:bg-transparent sm:transition-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Chats</span>
            
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
              className="rounded-md p-1 text-neutral-400 hover:text-neutral-200 sm:hidden"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={startNewChat}
            className="flex items-center gap-2 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 outline outline-1 outline-offset-[-1px] outline-cyan-400/30 transition hover:bg-cyan-400/20"
          >
            <MessageSquarePlusIcon className="size-3.5" />
            New Chat
          </button>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {isCreatingSession && (
              <div className="mb-1 flex h-8 w-full animate-pulse items-center rounded-lg bg-black/40 px-3 outline outline-1 outline-white/5">
                <div className="h-2 w-2/3 rounded-full bg-white/10" />
              </div>
            )}

            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session)}
                className={`truncate rounded-lg px-3 py-2 text-left text-xs transition ${
                  session.id === sessionId && !isCreatingSession
                    ? "bg-white/10 text-zinc-100"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                }`}
              >
                {session.title || "Untitled chat"}
              </button>
            ))}
          </div>
        </div>

        {/* Main chat column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header used to open the chats sidebar*/}
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 sm:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open chat list"
              className="rounded-md p-1.5 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10"
            >
              <MenuIcon className="size-4" />
            </button>

            <span className="truncate text-xs font-medium text-neutral-300">
              {sessions.find((session) => session.id === sessionId)?.title || "New chat"}
            </span>
          </div>

          {!hasStarted ? (
            <motion.div
              layout
              className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-16 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <span className="relative flex size-16 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-cyan-400/20">
                  <span className="absolute inset-0 rounded-full outline outline-1 outline-cyan-400/20 motion-safe:animate-slow-pulse-ring" />
                  <BotIcon className="size-7 text-cyan-400" />
                </span>

                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-medium text-white">What are we studying today?</h2>
                  <p className="max-w-sm text-sm text-neutral-400">
                    Ask me to clarify anything from your study materials.
                  </p>
                </div>
              </div>

              <div className="w-full max-w-2xl">
                <ChatInput
                  value={value}
                  onChange={handleInput}
                  onSubmit={handleSubmit}
                  onKeyDown={handleKeyDown}
                  textareaRef={textareaRef}
                  disabled={isSending || !user}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-5">
                {SUGGESTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => fillSuggestion(label)}
                    className="rounded-full bg-white/5 px-5 py-1.5 text-xs text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition hover:bg-white/10 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Active conversation view */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}

                  {streamingMessage !== null && (
                    streamingMessage === "" ? (
                      <TypingBubble /> 
                    ) : (
                      // Create a temporary IChatMessage object to pass to ChatBubble */}
                      <ChatBubble 
                        message={{
                          id: "streaming-response",
                          sessionId: sessionId ?? "",
                          role: "assistant",
                          content: streamingMessage,
                          createdAt: new Date()
                        }} 
                      />
                    )
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 p-4 sm:p-6">
                <div className="mx-auto max-w-2xl">
                  <ChatInput
                    value={value}
                    onChange={handleInput}
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    textareaRef={textareaRef}
                    disabled={isSending || !user}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}