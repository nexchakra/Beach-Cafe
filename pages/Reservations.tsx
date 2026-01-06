
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// Always use the recommended initialization pattern for GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const Reservations: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: 2,
    specialRequests: ''
  });
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [loadingMessage, setLoadingMessage] = useState('Initiating Booking...');
  const [welcomeNote, setWelcomeNote] = useState('');
  
  // New states for pre-submission greeting
  const [preGreeting, setPreGreeting] = useState('');
  const [isGeneratingPreGreeting, setIsGeneratingPreGreeting] = useState(false);
  const lastGeneratedFor = useRef('');

  // Debounced effect for pre-submission greeting
  useEffect(() => {
    const identifier = `${formData.name}-${formData.date}-${formData.time}-${formData.guests}`;
    if (!formData.name || !formData.date || !formData.time || identifier === lastGeneratedFor.current) return;

    const timer = setTimeout(() => {
      generatePreGreeting();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.name, formData.date, formData.time, formData.guests]);

  const generatePreGreeting = async () => {
    const identifier = `${formData.name}-${formData.date}-${formData.time}-${formData.guests}`;
    setIsGeneratingPreGreeting(true);
    try {
      const prompt = `You are the Executive Chef of Wanderplate. A guest named ${formData.name} is currently filling out a reservation for ${formData.guests} people on ${formData.date} at ${formData.time}. 
      Give them a very short, evocative 1-sentence "whisper" or greeting that appears as they type. 
      Tone: Sophisticated, welcoming, and slightly mysterious. Use terms like "voyage", "palate", or "table is waiting". 
      Limit to 12 words maximum.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.9 }
      });
      
      setPreGreeting(response.text || "");
      lastGeneratedFor.current = identifier;
    } catch (e) {
      console.error("Pre-greeting error", e);
    } finally {
      setIsGeneratingPreGreeting(false);
    }
  };

  const generateChefWelcome = async (details: typeof formData) => {
    try {
      const prompt = `Write a very brief, 2-sentence sophisticated welcome note from the Executive Chef of Wanderplate to a guest named ${details.name} who just booked a table for ${details.guests} people on ${details.date} at ${details.time}. Mention their special request if they have one: "${details.specialRequests || 'none'}". Keep the tone adventurous and world-class.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      setWelcomeNote(response.text || "We look forward to hosting your next great adventure.");
    } catch (e) {
      setWelcomeNote("Our kitchen is already preparing for your arrival. We look forward to hosting you.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');

    const messages = [
      "Securing your coordinates...",
      "Syncing with floor plan...",
      "Informing the Executive Chef...",
      "Dispatching confirmation email..."
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length - 1) {
        msgIndex++;
        setLoadingMessage(messages[msgIndex]);
      }
    }, 800);

    // Generate the final personalized note while "sending email"
    await generateChefWelcome(formData);

    setTimeout(() => {
      clearInterval(interval);
      setStatus('success');
    }, 3500);
  };

  const times = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  if (status === 'success') {
    return (
      <div className="pt-48 pb-48 px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="container mx-auto max-w-2xl bg-neutral-900 p-12 rounded-3xl border border-gold/30 shadow-[0_0_100px_rgba(197,160,89,0.1)]">
          <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-10 relative">
             <div className="absolute inset-0 bg-gold/10 rounded-full animate-ping"></div>
            <svg className="w-12 h-12 text-gold relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-4xl serif mb-4 text-white">Invitation Dispatched</h2>
          <p className="text-gray-400 mb-10 leading-relaxed text-sm">
            We've sent your official confirmation to <span className="text-gold font-medium">{formData.email}</span>. 
            Your table is secured for your next culinary expedition.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-8 mb-10 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-24 h-24 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3 block font-bold">Chef's Welcome Note</span>
            <p className="text-gray-300 italic serif text-lg leading-relaxed relative z-10">
              "{welcomeNote}"
            </p>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
               <div className="text-[10px] text-gray-500 font-mono uppercase">REF: WP-RES-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
               <div className="text-[10px] text-gold uppercase tracking-widest font-bold">Wanderplate HQ</div>
            </div>
          </div>

          <button 
            onClick={() => window.location.hash = '#/'}
            className="px-12 py-5 bg-gold text-black uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-all transform hover:-translate-y-1"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 px-6 bg-black min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="flex flex-col justify-center">
            <span className="text-gold tracking-[0.4em] uppercase text-xs mb-6 block font-bold">Destination Booking</span>
            <h1 className="text-6xl md:text-8xl serif mb-10 leading-tight">Chart Your Arrival</h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-md">
              Secure your place at our global table. We invite you to experience the pinnacle of culinary exploration in our intimate dining room.
            </p>
            
            <div className="space-y-10">
              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 rounded-full border border-gold/20 flex items-center justify-center flex-shrink-0 transition-all group-hover:border-gold/60 group-hover:bg-gold/5">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Direct Line</h4>
                  <p className="text-gray-500 text-sm font-light">+1 (212) 555-0198</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 rounded-full border border-gold/20 flex items-center justify-center flex-shrink-0 transition-all group-hover:border-gold/60 group-hover:bg-gold/5">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Boarding Hours</h4>
                  <p className="text-gray-500 text-sm font-light">Daily Expeditions: 17:00 — 23:00</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-neutral-900 p-8 md:p-14 rounded-[2rem] border border-white/5 space-y-10 shadow-2xl relative">
            {status === 'processing' && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[2rem] animate-in fade-in duration-300">
                <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-8"></div>
                <p className="text-gold uppercase tracking-[0.3em] text-xs font-bold animate-pulse">{loadingMessage}</p>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block font-bold">Adventurer Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/50 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all text-sm font-light placeholder:text-gray-700"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block font-bold">Email for Dispatch</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/50 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all text-sm font-light placeholder:text-gray-700"
                    placeholder="explorer@global.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block font-bold">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-black/50 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all [color-scheme:dark] text-sm font-light"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block font-bold">Arrival</label>
                  <select 
                    required 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-black/50 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all text-sm font-light"
                  >
                    <option value="" className="bg-neutral-900">Time</option>
                    {times.map(t => <option key={t} value={t} className="bg-neutral-900">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block font-bold">Party Size</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12" 
                    value={formData.guests}
                    onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
                    className="w-full bg-black/50 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all text-sm font-light"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block font-bold">Special Coordination (Optional)</label>
                <textarea 
                  rows={2}
                  value={formData.specialRequests}
                  onChange={e => setFormData({...formData, specialRequests: e.target.value})}
                  className="w-full bg-black/50 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all resize-none text-sm font-light placeholder:text-gray-700"
                  placeholder="Allergies, milestones, or seating preferences..."
                />
              </div>
            </div>

            <div className="relative pt-6">
              {/* Dynamic Chef Whisper Greeting */}
              {(preGreeting || isGeneratingPreGreeting) && (
                <div className="absolute -top-6 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-gold/20 flex items-center space-x-2">
                    {isGeneratingPreGreeting ? (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gold rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gold/80 italic font-light tracking-wide">
                        " {preGreeting} "
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-6 bg-gold text-black font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all transform active:scale-95 shadow-xl"
              >
                Verify & Secure Table
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
