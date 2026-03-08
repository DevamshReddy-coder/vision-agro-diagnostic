import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, User, X, Loader2, Globe, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
];

export default function AgriBot({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Namaste! I am your AgroVision AI assistant. Ask me anything about your crops, diseases, or the diagnostic report.' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLang, setSelectedLang] = useState('te-IN');

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const messagesEndRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Proactively preload TTS voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (synthRef.current?.speaking) {
      synthRef.current.cancel(); 
    }
    
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Capture one cohesive thought then stop
    recognition.interimResults = true; // Show text on screen dynamically
    recognition.lang = selectedLang;
    
    finalTranscriptRef.current = '';

    recognition.onstart = () => {
       setIsListening(true);
       setInput(''); // Clear input for fresh listening
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let localFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          localFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (localFinal) {
          finalTranscriptRef.current += localFinal;
      }
      
      const displayTxt = finalTranscriptRef.current + interimTranscript;
      setInput(displayTxt);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access blocked. Please enable it in browser settings.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      const readyTranscript = finalTranscriptRef.current.trim();
      
      if (readyTranscript.length > 0) {
          handleSend(readyTranscript);
      } else {
          // Fallback if the browser only registered interim results
          setInput((currentInput) => {
             if (currentInput.trim().length > 0) {
                 handleSend(currentInput.trim());
                 return '';
             }
             return currentInput;
          });
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Mic start error:", e);
      setIsListening(false);
    }
  };

  const speak = (text) => {
    if (!isSpeaking || !synthRef.current) return;
    
    synthRef.current.cancel();
    
    const cleanText = text.replace(/[*#]/g, ''); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const languageScripts = {
      'te-IN': /[\u0C00-\u0C7F]/,
      'hi-IN': /[\u0900-\u097F]/,
      'ta-IN': /[\u0B80-\u0BFF]/,
      'kn-IN': /[\u0C80-\u0CFF]/,
      'ml-IN': /[\u0D00-\u0D7F]/,
      'bn-IN': /[\u0980-\u09FF]/,
    };
    
    let detectedLang = 'en-US';
    for (const [lang, regex] of Object.entries(languageScripts)) {
      if (regex.test(text)) {
          detectedLang = lang;
          setSelectedLang(lang); // Auto-sync UI language
          break;
      }
    }
    
    utterance.lang = detectedLang;
    
    // CRITICAL FIX: 
    // We MUST NOT force a mismatching engine (like Hindi) onto Telugu characters which silences modern TTS.
    // Use an exact matching voice packet if present. 
    // Otherwise, leave utterance.voice = undefined to let the OS fallback natively over Google Cloud TTS.
    const voices = synthRef.current.getVoices();
    const primaryLang = detectedLang.split('-')[0];
    
    // Find the exact voice match by sweeping metadata languages
    let selectedVoice = voices.find(v => {
       const vLang = v.lang.replace('_', '-').toLowerCase();
       return vLang.includes(detectedLang.toLowerCase()) || vLang === primaryLang.toLowerCase();
    });
    
    if (selectedVoice) {
      // Prioritize Google Cloud voices from Chrome for higher quality Indian accents
      const googleVoice = voices.find(v => v.lang.includes(detectedLang) && v.name.includes('Google'));
      utterance.voice = googleVoice || selectedVoice;
    }

    utterance.rate = 0.9; 
    
    // Add micro-delay to ensure Chrome TTS queue executes
    setTimeout(() => {
        synthRef.current.speak(utterance);
    }, 100);
  };

  const handleSend = async (textOverride = null) => {
    // We support passing the transcription string directly via parameter, or picking from input box state.
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    
    // Immediately clear state safely
    setInput('');
    finalTranscriptRef.current = '';
    
    setIsProcessing(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${baseUrl}/inference/chat`, {
        message: textToSend,
        // Optional directive forcing AI to output matching the user's select element
        context: { ...context, __USER_PREF_LANG: selectedLang }
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show image preview in chat
    const imageUrl = URL.createObjectURL(file);
    const userMessage = { role: 'user', text: `📸 Uploaded: ${file.name}`, image: imageUrl };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      // 1. Send image to pipeline
      const formData = new FormData();
      formData.append('image', file);
      formData.append('cropType', 'Auto-Detect');
      
      const token = localStorage.getItem('token');
      const analyzeRes = await axios.post(`${baseUrl}/inference/analyze`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const diagnosisData = analyzeRes.data.fullResult || analyzeRes.data;

      // 2. Fetch conversational context and treatment
      const systemPromptPayload = `I just uploaded an image of my crop. Here is the raw AI diagnostic lab report: ${JSON.stringify(diagnosisData)}. Please explain this to me clearly. Mention the crop name, disease name, severity, confidence, causes, and step-by-step treatment recommendations (chemical and organic) in my selected language strictly.`;

      const chatRes = await axios.post(`${baseUrl}/inference/chat`, {
        message: systemPromptPayload,
        context: { ...context, latestScan: diagnosisData, __USER_PREF_LANG: selectedLang }
      });

      const replyText = chatRes.data.reply;
      const botMessage = { role: 'assistant', text: replyText };
      setMessages((prev) => [...prev, botMessage]);
      speak(replyText);

    } catch (error) {
      console.error("Image upload failed:", error);
      const errorMessage = { role: 'assistant', text: "I'm sorry, I couldn't process the image right now. Please try a clearer image." };
      setMessages((prev) => [...prev, errorMessage]);
      speak(errorMessage.text);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
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
            className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors group z-[9999] border-4 border-white"
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
            className="fixed bottom-8 right-8 w-[400px] h-[650px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden z-[9999]"
          >
            {/* Header Module with Integrated Language Selector */}
            <div className="bg-slate-900 p-6 flex flex-col gap-4 text-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg relative">
                     <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40"></div>
                     <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-black tracking-widest uppercase text-sm">Farm Voice</h3>
                    <p className="text-[10px] text-emerald-400 font-bold tracking-widest flex items-center gap-1 uppercase">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse block"></span>
                      Voice Matrix Online
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

              {/* Explicit Language Routing Bar */}
              <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-2 rounded-xl">
                 <Globe size={16} className="text-emerald-400 ml-1" />
                 <select 
                   value={selectedLang} 
                   onChange={(e) => setSelectedLang(e.target.value)}
                   className="flex-1 bg-transparent text-xs font-bold uppercase tracking-widest text-slate-300 outline-none appearance-none cursor-pointer"
                 >
                    {SUPPORTED_LANGUAGES.map(lang => (
                       <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
                         {lang.name}
                       </option>
                    ))}
                 </select>
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
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed font-medium ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm shadow-md' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                    }`} style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.image && (
                         <img src={msg.image} alt="Upload" className="w-full h-auto max-w-[200px] rounded-lg mb-2 object-cover border border-slate-200/50 shadow-sm" />
                      )}
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
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-[1.5rem] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-inner">
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all bg-white border border-slate-200 text-slate-600 shadow-sm hover:text-primary hover:border-primary/30"
                  title="Upload Crop Image"
                >
                   <Camera size={18} />
                </button>
                <button
                  onClick={toggleListen}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-white border border-slate-200 text-slate-600 shadow-sm hover:text-emerald-600 hover:border-emerald-200'
                  }`}
                >
                  {isListening ? (
                    <div className="relative flex items-center justify-center">
                       <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-40"></span>
                       <MicOff size={18} />
                    </div>
                  ) : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                     // Check if enter is pressed and we aren't using an IME processor (like typing directly in regional keyboards)
                     if (e.key === 'Enter' && !isProcessing) handleSend();
                  }}
                  placeholder={isListening ? 'Listening (in selected language)...' : "Ask about your crop..."}
                  className="flex-1 bg-transparent px-2 py-2 outline-none text-[13px] placeholder:text-slate-400 font-medium"
                  disabled={isListening}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isProcessing}
                  className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-emerald-600 transition-colors shadow-sm"
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
