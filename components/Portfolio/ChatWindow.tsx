"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowUp, ArrowUpRight, BriefcaseBusiness, Code2, Sparkles, X } from "lucide-react";
import { useModal } from "@/app/context/ModalContext";
import { useUIState } from "@/app/context/UIStateContext";
import { useAppActions } from "@/app/context/AppActionsContext";
import { fetchChatbotReplyClient } from "@/app/lib/chatbot/fetchReplyClient";
import { executeFunctionCall } from "@/app/lib/chatbot/functionHandlers";
import { MAX_CHAT_HISTORY_INSTANCE, REPLY_ERROR_FALLBACK_MSG } from "@/app/lib/chatbot/config";
import { ChatInstance } from "@/app/interfaces/Chatbot";
import type { ChatReply } from "@/app/lib/chatbot/types";
import { spring, useMotionPreference } from "./Motion";
import styles from "./chat.module.css";

const suggestions = [
  { icon: Code2, label: "Explore the projects", prompt: "What projects has Zi Shen been building?" },
  {
    icon: BriefcaseBusiness,
    label: "Get to know my experience",
    prompt: "Tell me about Zi Shen’s experience and skills.",
  },
  { icon: Sparkles, label: "Find out what drives me", prompt: "What interests Zi Shen about AI and software?" },
];

/** Shared chat presentation; shares the site's existing conversation and tools. */
export function ChatWindow() {
  const { chatHistory, setChatHistory } = useModal();
  const uiState = useUIState();
  const { isChatOpen, setChatOpen } = uiState;
  const appActions = useAppActions();
  const reduceMotion = useMotionPreference();
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [allowActions, setAllowActions] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const pending = useRef(false);
  const mounted = useRef(false);
  const messages: ChatInstance[] = chatHistory.filter((message) => message.role !== "system");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isChatOpen) return;
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    followLatest.current = true;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isChatOpen]);

  useEffect(() => {
    if (!isChatOpen || !followLatest.current) return;
    const element = transcript.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: "instant" });
  }, [chatHistory, thinking, isChatOpen]);

  useEffect(() => {
    const element = input.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [draft, isChatOpen]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || pending.current) return;
    pending.current = true;
    followLatest.current = true;
    setDraft("");
    setThinking(true);
    const history = [...chatHistory, { id: crypto.randomUUID(), role: "user", message: text }];
    setChatHistory(history);
    let reply: ChatReply;
    try {
      reply = await fetchChatbotReplyClient({
        chatHistory: history.slice(-MAX_CHAT_HISTORY_INSTANCE),
        enableFunctionCalling: allowActions,
      });
    } catch {
      reply = { message: REPLY_ERROR_FALLBACK_MSG, error: true };
    }
    setChatHistory((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "bot",
        message: reply.message,
        isError: reply.error,
      },
    ]);
    pending.current = false;
    if (!mounted.current) return;
    setThinking(false);
    if (!reply.error && reply.functionCall && allowActions) {
      if (reply.funcSysMsg) {
        const message = reply.funcSysMsg;
        setChatHistory((previous) => [...previous, { id: crypto.randomUUID(), role: "system", message }]);
      }
      await executeFunctionCall(reply.functionCall, appActions, uiState);
    }
  }

  const transition = reduceMotion ? { duration: 0.12 } : spring;

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="portfolio-chat-title"
      onCancel={(event) => {
        event.preventDefault();
        setChatOpen(false);
      }}
      onClose={() => setChatOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setChatOpen(false);
      }}
    >
      <motion.div
        className={styles.scrim}
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isChatOpen ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        onClick={() => setChatOpen(false)}
      />
      <motion.div
        className={styles.panel}
        initial={false}
        animate={{
          opacity: isChatOpen ? 1 : 0,
          y: reduceMotion ? 0 : isChatOpen ? 0 : 28,
          scale: reduceMotion ? 1 : isChatOpen ? 1 : 0.96,
        }}
        transition={transition}
        onAnimationComplete={() => {
          if (!isChatOpen) dialog.current?.close();
        }}
      >
        <header className={styles.header}>
          <span className={styles.avatar} aria-hidden="true">
            Z<span>AI</span>
          </span>
          <div>
            <h2 id="portfolio-chat-title">Zi Shen’s AI</h2>
            <p>Your guide to my work.</p>
          </div>
          <motion.button
            type="button"
            className={styles.close}
            aria-label="Close chat"
            autoFocus
            onClick={() => setChatOpen(false)}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            transition={transition}
          >
            <X size={19} aria-hidden="true" />
          </motion.button>
        </header>

        <div
          ref={transcript}
          className={styles.transcript}
          onScroll={(event) => {
            const element = event.currentTarget;
            followLatest.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
          }}
        >
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <span className={styles.eyebrow}>A CONVERSATION STARTER</span>
              <h3>
                A little curiosity.
                <br />
                <span>A lot to explore.</span>
              </h3>
              <p>Ask about my projects, experience, or the ideas behind the work.</p>
              <div className={styles.suggestions}>
                {suggestions.map(({ icon: Icon, label, prompt }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => {
                      setDraft(prompt);
                      input.current?.focus();
                    }}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    transition={transition}
                  >
                    <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                    <span>{label}</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          <div
            role="log"
            aria-label="Conversation"
            aria-live="polite"
            aria-relevant="additions"
            className={styles.messages}
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage} ${message.isError ? styles.error : ""}`}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
              >
                <span className={styles.messageAuthor}>{message.role === "user" ? "You" : "Zi Shen’s AI"}</span>
                <p>{message.message}</p>
              </motion.div>
            ))}
          </div>
          {thinking && (
            <div className={styles.thinking} role="status">
              <span aria-hidden="true">•••</span> Thinking
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <div className={styles.options}>
            <button
              type="button"
              role="switch"
              aria-checked={allowActions}
              aria-describedby="portfolio-actions-description"
              className={styles.actionToggle}
              disabled={thinking}
              onClick={() => setAllowActions(!allowActions)}
            >
              <span className={styles.switchTrack} aria-hidden="true">
                <motion.span animate={{ x: allowActions ? 12 : 0 }} transition={transition} />
              </span>
              Site actions
            </button>
            <span id="portfolio-actions-description" className={styles.optionDescription}>
              {allowActions ? "Navigation, demos & site tools enabled" : "Just a conversation"}
            </span>
          </div>
          <form className={styles.composer} onSubmit={sendMessage}>
            <textarea
              ref={input}
              aria-label="Message Zi Shen’s AI"
              placeholder="Ask me anything about my work…"
              rows={1}
              maxLength={4000}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <motion.button
              type="submit"
              className={styles.send}
              aria-label="Send message"
              disabled={!draft.trim() || thinking}
              whileTap={reduceMotion ? undefined : { scale: 0.92 }}
              transition={transition}
            >
              <ArrowUp size={19} strokeWidth={2} aria-hidden="true" />
            </motion.button>
          </form>
          <p className={styles.note}>AI can make mistakes. Stay curious, double-check details.</p>
        </footer>
      </motion.div>
    </dialog>
  );
}
