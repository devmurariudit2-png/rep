"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, Mic } from "lucide-react";
import { getAIChatResponse, ChatMessage } from "@/lib/ai-engine";
import { Button } from "@/components/ui/button";

interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
}

interface CustomWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  _activeSpeechRecFloating?: SpeechRecognitionInstance;
}

export function AiChatFloating() {
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Namaste! I am **REOP AI**, your real estate intelligence advisor. I can analyze capital appreciation rates, identify premium rental yields in GIFT City, or pull specifications for our active properties.\n\nTry asking me one of the options below, or write your own inquiry!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const clientWindow = window as unknown as CustomWindow;
    const SpeechRecognition =
      clientWindow.SpeechRecognition || clientWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      const activeRec = clientWindow._activeSpeechRecFloating;
      if (activeRec) {
        activeRec.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
        }
      };

      clientWindow._activeSpeechRecFloating = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      const clientWindow = window as unknown as CustomWindow;
      const activeRec = clientWindow._activeSpeechRecFloating;
      if (activeRec) {
        activeRec.stop();
      }
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    "Which properties have best ROI?",
    "Find a 3BHK under ₹1Cr near GIFT City",
    "Show investment opportunities",
    "Tell me about the Bodakdev villa"
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await getAIChatResponse([...messages, userMessage]);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "My connection is temporarily interrupted. Please re-trigger your query."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Convert markdown bolding (**text**) or links ([label](url)) to simple rendered elements
  const renderMessageContent = (content: string) => {
    // Basic Markdown Parser helper
    const parts = content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("[") && part.includes("](")) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, label, url] = match;
          return (
            <a key={idx} href={url} className="text-gold font-bold hover:underline inline-flex items-center gap-0.5">
              {label}
            </a>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-gold to-amber-600 text-white flex items-center justify-center shadow-xl shadow-gold/30 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gold/40 group"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] text-white font-black items-center justify-center">
              AI
            </span>
          </span>
          {/* Glowing Ring */}
          <span className="absolute inset-0 rounded-full border border-white/20 animate-pulse-slow pointer-events-none" />
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="glass-panel w-96 max-w-[calc(100vw-2rem)] h-[500px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-black/20 dark:bg-white/5 border-b border-border/10 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">REOP AI Advisor</span>
                <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time intelligence online</span>
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => {
              const isAI = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "self-end flex-row-reverse"}`}
                >
                  {/* Icon Avatar */}
                  <div
                    className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                      isAI
                        ? "bg-gold/10 border border-gold/30 text-gold"
                        : "bg-primary border border-border/10 text-primary-foreground"
                    }`}
                  >
                    {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      isAI
                        ? "glass-card border border-white/5 text-foreground/95 rounded-tl-none"
                        : "bg-gold text-white shadow-lg rounded-tr-none border border-gold/30"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 self-start max-w-[85%]">
                <div className="h-7 w-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="glass-card border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-gold animate-spin" />
                  <span>Synthesizing projection portfolio...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions panel (Only show when not typing and last message is AI) */}
          {!isTyping && messages[messages.length - 1]?.role === "assistant" && (
            <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 bg-black/5 dark:bg-white/2 max-h-[85px] overflow-y-auto shrink-0 border-t border-border/5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="bg-background hover:bg-gold/5 hover:border-gold/30 border border-border/40 text-[10px] text-muted-foreground hover:text-gold px-2.5 py-1 rounded-full transition-colors truncate max-w-full text-left font-semibold cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Form Input */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-border/10 bg-black/10 dark:bg-white/5 flex gap-2 shrink-0 items-center"
          >
            <input
              type="text"
              placeholder="Ask about GIFT City, yields, villa ROI..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="glass-input h-10 px-3 flex-1 rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:ring-1 focus:ring-gold/60"
              disabled={isTyping}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`h-10 w-10 p-0 rounded-lg shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                  : "bg-white/10 dark:bg-white/5 border-white/10 hover:border-gold/30 hover:text-gold text-muted-foreground"
              }`}
              title="Speak your inquiry"
              disabled={isTyping}
            >
              {isListening ? (
                <div className="relative flex items-center justify-center">
                  <Mic className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              className="h-10 w-10 p-0 rounded-lg shrink-0"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
