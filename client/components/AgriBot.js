import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, User, X, Loader2, Globe, Camera, Activity } from 'lucide-react';
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
  const INTRO_MAP = {
      'te-IN': 'నమస్కారం! నేను మీ ఆగ్రోవిజన్ AI సహాయకుడిని. మీ పంటలు, వ్యాధులు किंवा రోగనిర్ధారణ నివేదిక గురించి ఏదైనా అడగండి.',
      'hi-IN': 'नमस्ते! मैं आपका AgroVision AI सहायक हूँ। मुझे अपनी फसलों, बीमारियों या नैदानिक रिपोर्ट के बारे में कुछ भी पूछें।',
      'ta-IN': 'வணக்கம்! நான் உங்கள் அக்ரோவிஷன் ஏஐ உதவியாளர். உங்கள் பயிர்கள், நோய்கள் அல்லது நோயறிதல் அறிக்கை பற்றி எதையும் கேளுங்கள்.',
      'kn-IN': 'ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ ಅಗ್ರೋವಿಷನ್ AI ಸಹಾಯಕ. ನಿಮ್ಮ ಬೆಳೆಗಳು, ರೋಗಗಳು ಅಥವಾ ರೋಗನಿರ್ಣಯದ ವರದಿಯ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.',
      'ml-IN': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ അഗ്രോവിഷൻ AI സഹായിയാണ്. നിങ്ങളുടെ വിളകൾ, രോഗങ്ങൾ അല്ലെങ്കിൽ രോഗനിർണയ റിപ്പോർട്ടിനെക്കുറിച്ച് എന്തും ചോദിക്കുക.',
      'mr-IN': 'नमस्कार! मी तुमचा ॲग्रोव्हिजन एआय सहाय्यक आहे. मला तुमचे पीक, रोग किंवा निदान अहवालाविषयी काहीही विचारा.',
      'bn-IN': 'নমস্কার! আমি আপনার এগ্রোভিশন এআই সহকারী। আপনার ফসল, রোগ বা রোগ নির্ণয়ের প্রতিবেদন সম্পর্কে আমাকে যেকোনো কিছু জিজ্ঞাসা করুন।',
      'en-US': 'Namaste! I am your AgroVision AI assistant. Ask me anything about your crops, diseases, or the diagnostic report.'
  };

  const [messages, setMessages] = useState([]); // Start empty, useEffect will push the initial intro
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
     const newIntro = INTRO_MAP[selectedLang] || INTRO_MAP['en-US'];
     // Replace existing intro if it's the only message, or just push if different
     setMessages((prev) => {
       if (prev.length <= 1) return [{ role: 'assistant', text: newIntro }];
       return [...prev, { role: 'assistant', text: newIntro }];
     });
     speak(newIntro);
  }, [selectedLang]);

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
      setIsListening(false);
      recognitionRef.current?.stop();
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
    recognition.continuous = true; // Allow user to continuously speak until they pause/stop naturally
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

    const playVoice = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = synthRef.current.getVoices();
      
      const targetLang = selectedLang.toLowerCase().replace('_', '-');
      const targetPrefix = targetLang.split('-')[0];

      // Find the language name for reference
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'the selected language';

      // 1. Rigorous search for Google Network Voices or High Quality voices
      let bestVoice = voices.find(v => 
        (v.lang.toLowerCase().replace('_', '-') === targetLang || 
         v.lang.toLowerCase().startsWith(targetPrefix)) && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
      );
      
      // 2. Fallback to any voice that mentions the language name in its descriptive name
      if (!bestVoice) {
        bestVoice = voices.find(v => 
          v.name.toLowerCase().includes(targetPrefix) || 
          (langName !== 'English' && v.name.toLowerCase().includes(langName.toLowerCase().split(' ')[0]))
        );
      }

      // 3. Fallback to any exact match OS Voice (e.g. te-IN)
      if (!bestVoice) {
        bestVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === targetLang);
      }
      
      // 4. Fallback to generic prefix match (e.g. 'te' matching 'te-IN')
      if (!bestVoice) {
         bestVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
      }
      
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = selectedLang;
      }

      utterance.rate = 0.95; 
      utterance.pitch = 1.0; 
      utterance.volume = 1.0;
      
      if (synthRef.current) {
        synthRef.current.speak(utterance);
      }
    };

    // Prime the voice engine on user gesture to bypass browser restrictions after async awaits
    if (synthRef.current && isSpeaking) {
      const primer = new SpeechSynthesisUtterance("");
      primer.volume = 0;
      synthRef.current.speak(primer);
    }

    // Chrome bug workaround: voices can be empty initially. Wait for them to load if so.
    if (synthRef.current.getVoices().length === 0) {
      const oldOnVoicesChanged = synthRef.current.onvoiceschanged;
      synthRef.current.onvoiceschanged = () => {
        if (oldOnVoicesChanged) oldOnVoicesChanged();
        playVoice();
        // Clear it so it doesn't double trigger later
        synthRef.current.onvoiceschanged = oldOnVoicesChanged;
      };
      // Trigger a load
      synthRef.current.getVoices();
    } else {
      setTimeout(playVoice, 50);
    }
  };

  const handleSend = async (textOverride = null) => {
    // Prime the voice engine on user gesture
    if (synthRef.current && isSpeaking) {
      const primer = new SpeechSynthesisUtterance("");
      primer.volume = 0;
      synthRef.current.speak(primer);
    }

    // We support passing the transcription string directly via parameter, or picking from input box state.
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    
    // Immediately clear state safely
    setInput('');
    finalTranscriptRef.current = '';
    
    setIsProcessing(true);

    let retries = 0;
    const maxRetries = 2;
    
    const attemptSend = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await axios.post(`${baseUrl}/inference/chat`, {
          message: textToSend,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          context: { ...context, __USER_PREF_LANG: selectedLang }
        });

        const replyText = res.data.reply;
        const botMessage = { role: 'assistant', text: replyText };
        setMessages((prev) => [...prev, botMessage]);
        speak(replyText);
        return true;
      } catch (error) {
        if (retries < maxRetries) {
          retries++;
          console.warn(`Reconnecting... Attempt ${retries}`);
          await new Promise(r => setTimeout(r, 1500));
          return attemptSend();
        }
        throw error;
      }
    };

    try {
      await attemptSend();
    } catch (error) {
      console.error("Chat API error:", error);
      
      const errorMap = {
          'te-IN': 'క్షమించండి, వ్యవస్థతో కనెక్ట్ కావడంలో సమస్య ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
          'hi-IN': 'क्षमा करें, सिस्टम से कनेक्ट होने में समस्या है। कृपया पुनः प्रयास करें।',
          'ta-IN': 'மன்னிக்கவும், கணினியுடன் இணைப்பதில் சிக்கல் உள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
          'kn-IN': 'ಕ್ಷಮಿಸಿ, ಸಿಸ್ಟಮ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
          'ml-IN': 'ക്ഷമിക്കണം, സിസ്റ്റത്തിലേക്ക് കണക്റ്റുചെയ്യുന്നതിൽ പ്രശ്‌നമുണ്ട്. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
          'mr-IN': 'क्षमस्व, सिस्टमशी कनेक्ट करण्यात समस्या आहे. कृपया पुन्हा प्रयत्न करा.',
          'bn-IN': 'দুঃখিত, সিস্টেমের সাথে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          'en-US': "I'm sorry, I'm having trouble connecting to the neural lab. Please try again."
      };
      
      const errorText = error.response?.data?.message || errorMap[selectedLang] || errorMap['en-US'];
      const errorMessage = { role: 'assistant', text: errorText };
      
      setMessages((prev) => [...prev, errorMessage]);
      speak(errorMessage.text);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    // Prime the voice engine on user gesture
    if (synthRef.current && isSpeaking) {
      const primer = new SpeechSynthesisUtterance("");
      primer.volume = 0;
      synthRef.current.speak(primer);
    }

    const file = e.target.files[0];
    if (!file) return;

    // Show image preview in chat
    const imageUrl = URL.createObjectURL(file);
    const userMessage = { role: 'user', text: `📸 Uploaded: ${file.name}`, image: imageUrl };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      let retries = 0;
      const maxRetries = 2;

      const attemptUpload = async () => {
        try {
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
          const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';
          const systemPromptPayload = `I just uploaded an image of my crop. Here is the raw AI diagnostic lab report: ${JSON.stringify(diagnosisData)}. 
          
          CRITICAL INSTRUCTION: You MUST explain this result to me only in ${targetLangName} (${selectedLang}). Do NOT use any other language.
          
          Provide a natural conversational explanation covering:
          1. Detected Crop and Disease names.
          2. Confidence and Severity levels.
          3. Possible environmental causes based on my context.
          4. Detailed step-by-step treatment (both chemical and organic/natural remedies).
          
          Speak directly to the farmer. Keep it professional but accessible.`;

          const chatRes = await axios.post(`${baseUrl}/inference/chat`, {
            message: systemPromptPayload,
            history: messages.map(m => ({ role: m.role, text: m.text })),
            context: { ...context, latestScan: diagnosisData, __USER_PREF_LANG: selectedLang }
          });

          const replyText = chatRes.data.reply;
          const botMessage = { role: 'assistant', text: replyText };
          setMessages((prev) => [...prev, botMessage]);
          speak(replyText);
          return true;
        } catch (error) {
          if (retries < maxRetries) {
            retries++;
            console.warn(`Reconnecting to Diagnostic Engine... Attempt ${retries}`);
            await new Promise(r => setTimeout(r, 2000));
            return attemptUpload();
          }
          throw error;
        }
      };

      await attemptUpload();

    } catch (error) {
      console.error("Image upload failed:", error);
      
      const errorMap = {
          'te-IN': 'క్షమించండి, నేను ప్రస్తుతం చిత్రాన్ని విశ్లేషించలేకపోతున్నాను. దయచేసి మరింత స్పష్టమైన చిత్రాన్ని అప్‌లోడ్ చేయండి.',
          'hi-IN': 'क्षमा करें, मैं अभी छवि को प्रोसेस नहीं कर सकता। कृपया एक स्पष्ट छवि आज़माएं।',
          'ta-IN': 'மன்னிக்கவும், என்னால் இப்போது படத்தைச் செயல்படுத்த முடியவில்லை. தெளிவான படத்தை முயற்சிக்கவும்.',
          'kn-IN': 'ಕ್ಷಮಿಸಿ, ನನಗೆ ಇದೀಗ ಚಿತ್ರವನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಚಿತ್ರವನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
          'ml-IN': 'ക്ഷമിക്കണം, എനിക്കിപ്പോൾ ചിത്രം പ്രോസസ്സ് ചെയ്യാൻ കഴിയില്ല. കൂടുതൽ വ്യക്തമായൊരു ചിത്രം ഉപയോഗിച്ച് ശ്രമിക്കുക.',
          'mr-IN': 'क्षमस्व, मी आत्ता प्रतिमेवर प्रक्रिया करू शकत नाही. कृपया स्पष्ट चित्र वापरून पहा.',
          'bn-IN': 'দুঃখিত, আমি বর্তমানে ছবিটি প্রক্রিয়া করতে পারছি না। অনুগ্রহ করে একটি পরিষ্কার ছবি চেষ্টা করুন।',
          'en-US': "I'm sorry, I couldn't process the image right now. Please try a clearer image."
      };
      
      const errorText = error.response?.data?.message || errorMap[selectedLang] || errorMap['en-US'];
      const errorMessage = { role: 'assistant', text: errorText };
      
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
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-10 right-10 w-20 h-20 bg-slate-950 text-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all group z-[9999] border border-white/10"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/20 animate-pulse transition-opacity group-hover:opacity-40"></div>
            <div className="absolute -top-12 right-0 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-premium pointer-events-none whitespace-nowrap">
               Neural Cloud Agent Online
            </div>
            <Bot size={36} className="text-emerald-400 group-hover:scale-110 transition-transform relative z-10" />
            <Activity size={12} className="absolute bottom-4 right-4 text-emerald-500 animate-pulse z-10" />
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
