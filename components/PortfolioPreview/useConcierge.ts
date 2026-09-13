"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BotState } from "./state";

type Message = { role: "user" | "assistant"; message: string };
type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start: () => void; abort: () => void;
};
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function useConcierge() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<BotState>("idle");
  const [caption, setCaption] = useState("Ask about my work, or let me show you around.");
  const [voice, setVoice] = useState(false);
  const [muted, setMuted] = useState(false);
  const request = useRef<AbortController | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const speechToken = useRef(0);
  const busy = useRef(false);
  const audioPreferences = useRef({ voice, muted });
  useEffect(() => { audioPreferences.current = { voice, muted }; }, [voice, muted]);

  const silence = useCallback(() => {
    speechToken.current++;
    window.speechSynthesis?.cancel();
    setState((current) => current === "speaking" ? "idle" : current);
  }, []);

  const narrate = useCallback((text: string) => {
    silence();
    setCaption(text);
    if (!audioPreferences.current.voice || audioPreferences.current.muted || !window.speechSynthesis) return;
    const token = speechToken.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.onstart = () => { if (token === speechToken.current) setState("speaking"); };
    utterance.onend = utterance.onerror = () => { if (token === speechToken.current) setState("idle"); };
    window.speechSynthesis.speak(utterance);
  }, [silence]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || busy.current) return;
    busy.current = true;
    recognition.current?.abort();
    silence();
    const history: Message[] = [...messages, { role: "user" as const, message: text.trim().slice(0, 2000) }].slice(-19);
    setMessages(history);
    setState("thinking");
    setCaption("Thinking about your question…");
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The connection is unavailable. Please try again.");
      setMessages([...history, { role: "assistant" as const, message: result.message }].slice(-20));
      setState("idle");
      narrate(result.message);
    } catch (error) {
      if (request.current !== controller) return;
      setState("idle");
      setCaption(error instanceof Error && error.name !== "AbortError" ? error.message : "The response took too long. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) { busy.current = false; request.current = null; }
    }
  }, [messages, narrate, silence]);

  const listen = useCallback(() => {
    if (busy.current) return;
    if (recognition.current) { recognition.current.abort(); return; }
    const SpeechRecognition = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) { setCaption("Voice input isn’t supported in this browser. You can type your question below."); return; }
    silence();
    const session = new SpeechRecognition();
    recognition.current = session;
    session.lang = "en-US"; session.continuous = false; session.interimResults = false;
    session.onresult = (event) => { void send(event.results[0][0].transcript); };
    session.onerror = () => { setCaption("Microphone unavailable or no speech detected. Please try again or type your question."); };
    session.onend = () => { recognition.current = null; setState((current) => current === "listening" ? "idle" : current); };
    try { session.start(); setState("listening"); setCaption("Listening for one question. Tap the microphone again to cancel."); }
    catch { recognition.current = null; setState("idle"); setCaption("The microphone could not start. Please type your question."); }
  }, [send, silence]);

  const stopListening = useCallback(() => recognition.current?.abort(), []);
  const toggleMute = () => { audioPreferences.current.muted = !muted; silence(); setMuted(!muted); };
  useEffect(() => () => {
    request.current?.abort(); request.current = null;
    if (recognition.current) { recognition.current.onresult = null; recognition.current.onend = null; recognition.current.onerror = null; recognition.current.abort(); }
    speechToken.current++; window.speechSynthesis?.cancel();
  }, []);
  return { messages, state, caption, setCaption, voice, setVoice, muted, toggleMute, send, listen, stopListening, narrate, silence };
}
