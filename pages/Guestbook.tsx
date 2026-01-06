
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { generateChefReflectionResponse } from '../services/geminiService';

interface Reflection {
  id: string;
  userName: string;
  avatar: string;
  thought: string;
  date: string;
  chefResponse?: string;
  rating: number;
}

interface GuestbookProps {
  user: User | null;
}

const Guestbook: React.FC<GuestbookProps> = ({ user }) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [newThought, setNewThought] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wanderplate_guestbook');
    if (saved) {
      setReflections(JSON.parse(saved));
    } else {
      // Default sample reflection
      const defaults: Reflection[] = [
        {
          id: '1',
          userName: 'Marco Polo',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
          thought: 'The Wagyu Carpaccio was like a map of Florence. Truly exceptional service.',
          date: new Date(Date.now() - 86400000).toISOString(),
          chefResponse: 'A traveler knows the heart of a dish. We are honored to have shared that Florentine vision with you.',
          rating: 5
        }
      ];
      setReflections(defaults);
      localStorage.setItem('wanderplate_guestbook', JSON.stringify(defaults));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    setIsSubmitting(true);
    const guestName = user?.name || 'Anonymous Voyager';
    const guestAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;

    // Generate AI response from the Chef
    const chefReply = await generateChefReflectionResponse(guestName, newThought);

    const entry: Reflection = {
      id: Math.random().toString(36).substr(2, 9),
      userName: guestName,
      avatar: guestAvatar,
      thought: newThought,
      date: new Date().toISOString(),
      chefResponse: chefReply,
      rating: rating
    };

    const updated = [entry, ...reflections];
    setReflections(updated);
    localStorage.setItem('wanderplate_guestbook', JSON.stringify(updated));
    setNewThought('');
    setRating(5);
    setIsSubmitting(false);
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            onClick={() => interactive && setRating(star)}
            className={`w-4 h-4 transition-all duration-300 ${interactive ? 'cursor-pointer hover:scale-125' : ''} ${star <= (interactive ? rating : count) ? 'text-gold fill-gold' : 'text-gray-800'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-40 pb-40 px-6 min-h-screen">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-24">
          <span className="text-gold tracking-[0.6em] uppercase text-[10px] mb-8 block font-bold animate-pulse">Voyager Logs</span>
          <h1 className="text-7xl md:text-9xl serif mb-10 text-glimmer">Reflections</h1>
          <p className="text-gray-500 font-light text-xl italic max-w-2xl mx-auto">
            "Every guest is a traveler. Every meal is a destination. Leave your mark on our map."
          </p>
        </div>

        {/* Input Section */}
        <div className="glass-panel p-10 md:p-14 rounded-[3rem] border border-white/5 mb-32 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <svg className="w-40 h-40 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          </div>
          
          <h2 className="text-3xl serif text-white mb-8">Share your Impression</h2>
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gold/30">
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`} className="w-full h-full object-cover" alt="User" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm uppercase tracking-widest block">{user?.name || 'Guest Voyager'}</span>
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Charting New Course</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 font-bold">Journey Rating</span>
                {renderStars(rating, true)}
              </div>
            </div>

            <textarea 
              required
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-3xl p-8 text-white focus:border-gold outline-none transition-all text-lg font-light italic resize-none h-40 placeholder:text-gray-800"
              placeholder="Describe your sensory discovery..."
            />

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-6 bg-gold text-black font-bold uppercase tracking-[0.4em] text-[10px] transition-all transform active:scale-95 shadow-xl flex items-center justify-center space-x-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Archiving Reflection...</span>
                </>
              ) : (
                'Place on Map'
              )}
            </button>
          </form>
        </div>

        {/* reflections Feed */}
        <div className="space-y-20">
          {reflections.map((r) => (
            <div key={r.id} className="relative group animate-in slide-in-from-bottom-12 duration-1000">
               <div className="flex flex-col md:flex-row gap-12">
                  <div className="w-20 h-20 flex-shrink-0 relative">
                     <img src={r.avatar} className="w-full h-full rounded-full border border-gold/20 shadow-xl" alt={r.userName} />
                     <div className="absolute -bottom-2 -right-2 bg-gold text-black p-1 rounded-full border-2 border-black">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                     </div>
                  </div>
                  
                  <div className="flex-grow space-y-8">
                     <div className="flex justify-between items-center">
                        <div>
                           <h4 className="text-2xl serif text-white group-hover:text-gold transition-colors">{r.userName}</h4>
                           <p className="text-[10px] text-gray-700 font-mono uppercase tracking-widest">{new Date(r.date).toLocaleDateString()}</p>
                        </div>
                        {renderStars(r.rating)}
                     </div>

                     <p className="text-gray-400 text-xl font-light italic leading-relaxed border-l-2 border-gold/20 pl-8">
                        "{r.thought}"
                     </p>

                     {r.chefResponse && (
                       <div className="bg-white/5 p-8 rounded-[2rem] border border-gold/10 ml-8 md:ml-20 relative animate-in fade-in duration-1000">
                          <div className="absolute -top-3 left-10 bg-[#050505] px-4 py-1 border border-gold/30 rounded-full">
                             <span className="text-[8px] text-gold uppercase tracking-[0.4em] font-bold">Chef's Reflection</span>
                          </div>
                          <p className="text-gray-300 text-sm font-light leading-relaxed italic">
                            "{r.chefResponse}"
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                             <span className="text-[7px] text-gray-700 uppercase tracking-widest font-mono">Authenticated Response • Executive Kitchen</span>
                             <div className="flex space-x-1">
                                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-gold rounded-full opacity-40"></div>)}
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guestbook;
