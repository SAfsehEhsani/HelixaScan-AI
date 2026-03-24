import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatAssistant: React.FC<{ language: string }> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('skin_chat_messages');
    if (saved) return JSON.parse(saved);
    return [
      { role: 'model', text: language === 'English' ? "Hello! I'm your DermScan AI Assistant. How can I help you with your skin health today?" : "¡Hola! Soy tu asistente de DermScan AI. ¿Cómo puedo ayudarte con tu salud de la piel hoy?" }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('skin_chat_messages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are a professional dermatological AI assistant. Provide helpful, empathetic, and medically-grounded advice about skin health in ${language}. 
          Always include a disclaimer that you are an AI and not a doctor. If the user describes a high-urgency situation, strongly advise them to seek immediate medical attention.`,
        },
      });

      // We send the history to the model
      const response = await chat.sendMessage({ message: userMessage });
      const text = response.text;
      
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden border border-black/5 shadow-sm">
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent shadow-sm">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-medium text-wellness-ink">AI Health Assistant</h3>
            <p className="text-[10px] uppercase tracking-widest text-wellness-ink/40 font-bold">Personalized Skin Guidance</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2.5 text-wellness-ink/20 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-wellness-bg/30">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-wellness-soft text-wellness-ink/60' : 'bg-wellness-accent text-white'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-wellness-accent text-white rounded-tr-none shadow-lg shadow-wellness-accent/10' : 'bg-white text-wellness-ink rounded-tl-none shadow-sm border border-black/5'}`}>
                <div className="markdown-body text-inherit">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/5 p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3 shadow-sm">
              <Loader2 size={18} className="animate-spin text-wellness-accent" />
              <span className="text-xs text-wellness-ink/40 font-medium italic">Assistant is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-black/5 bg-white/50 backdrop-blur-md">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about ingredients, routines, or concerns..."
            className="flex-1 bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 focus:ring-4 focus:ring-wellness-ink/5 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-wellness-accent text-white p-4 rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-wellness-accent/20 active:scale-95"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
