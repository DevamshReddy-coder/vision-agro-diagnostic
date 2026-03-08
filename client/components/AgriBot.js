import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, User, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AgriBot({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Namaste! I am your AgroVision AI assistant. Ask me anything about your crops, diseases, or the diagnostic report.' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true); // TTS auto-play by default
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        // Optionally add language support here based on a toggle
        // recognitionRef.current.lang = 'en-US'; 

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          handleSend(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [context]); // depend on context to use latest data

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (synthRef.current?.speaking) {
        synthRef.current.cancel(); // Stop speaking when listening starts
      }
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (!isSpeaking || !synthRef.current) return;
    
    // Stop any current speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to match voice to Indian English / Multilingual based on text if needed
    // Default handles it effectively on modern browsers
    synthRef.current.speak(utterance);
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${baseUrl}/inference/chat`, {
        message: textToSend,
        context: context // Send current diagnostic report to be context-aware
      });

      const replyText = res.data.reply;
      const botMessage = { role: 'assistant', text: replyText };
      setMessages((prev) => [...prev, botMessage]);
      speak(replyText);

    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage = { role: 'assistant', text: "I'm sorry, I'm having trouble connecting to the neural lab. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
      speak(errorMessage.text);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors group z-50 border-4 border-white"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></div>
            <Bot size={32} className="group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-white rounded-[2rem] shadow-[-10px_-10px_30px_#ffffff,10px_10px_30px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg relative">
                   <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40"></div>
                   <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black tracking-widest uppercase text-sm">Farm Voice</h3>
                  <p className="text-[10px] text-emerald-400 font-bold tracking-widest flex items-center gap-1 uppercase">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse block"></span>
                    Multilingual Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSpeaking(!isSpeaking)}
                  className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
                >
                  {isSpeaking ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-900 text-white'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm shadow-md' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-[1.5rem]">
                <button
                  onClick={toggleListen}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-red-500/30' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200'
                  }`}
                >
                  {isListening ? (
                    <div className="relative flex items-center justify-center">
                       <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-40"></span>
                       <MicOff size={20} />
                    </div>
                  ) : <Mic size={20} />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? 'Listening...' : "Ask about your crop..."}
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-slate-400 font-medium"
                  disabled={isListening}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isProcessing}
                  className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-emerald-600 transition-colors"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5 mt-0.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
