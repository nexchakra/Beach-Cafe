
import React, { useState, useRef, useEffect } from 'react';
import { getConciergeResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Greetings from Wanderplate. I am your global concierge. Shall I guide you through our international selections or assist with your arrival today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await getConciergeResponse(userMsg, messages);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-white text-black rotate-90' : 'bg-gold text-black hover:scale-110'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[550px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-black/50 p-6 border-b border-white/10 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Global Concierge</h3>
              <p className="text-[10px] text-gold tracking-wider font-bold">Wanderplate Assistant • Active</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-gold text-black rounded-tr-none font-medium' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/10'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex space-x-2">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-black/50 border-t border-white/10">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about global inspirations..."
                className="w-full bg-neutral-800 border border-white/10 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:border-gold pr-12"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gold hover:text-white transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
