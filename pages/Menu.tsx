
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MENU_DATA } from '../constants';
import { MenuItem } from '../types';
import { generateItemSpeech } from '../services/geminiService';

interface Review {
  id: string;
  itemId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userImage?: string;
}

interface MenuProps {
  onAddToCart: (item: MenuItem) => void;
  activeTable: number | null;
}

type ModalTheme = 'obsidian' | 'antique' | 'midnight';

// Audio decoding helpers for raw PCM data from Gemini TTS
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Menu: React.FC<MenuProps> = ({ onAddToCart, activeTable }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [viewGallery, setViewGallery] = useState(false);
  const [modalTheme, setModalTheme] = useState<ModalTheme>('obsidian');
  const [isNarrating, setIsNarrating] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const categories = ['All', 'Starter', 'Main', 'Dessert', 'Beverage'];

  useEffect(() => {
    const savedReviews = JSON.parse(localStorage.getItem('wanderplate_reviews') || '{}');
    setReviews(savedReviews);

    return () => {
      stopNarration();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopNarration = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsNarrating(false);
  };

  const handleNarrate = async () => {
    if (isNarrating) {
      stopNarration();
      return;
    }

    if (!selectedItem) return;

    setIsNarrating(true);
    const base64Audio = await generateItemSpeech(selectedItem.name, selectedItem.description);
    
    if (!base64Audio) {
      setIsNarrating(false);
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsNarrating(false);
      
      audioSourceRef.current = source;
      source.start();
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsNarrating(false);
    }
  };

  const filteredMenu = activeCategory === 'All' 
    ? MENU_DATA 
    : MENU_DATA.filter(item => item.category === activeCategory);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newComment.trim()) return;

    const review: Review = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: selectedItem.id,
      userName: "Fellow Voyager",
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString(),
      userImage: newImage || undefined
    };

    const updatedReviews = {
      ...reviews,
      [selectedItem.id]: [review, ...(reviews[selectedItem.id] || [])]
    };

    setReviews(updatedReviews);
    localStorage.setItem('wanderplate_reviews', JSON.stringify(updatedReviews));
    setNewComment('');
    setNewRating(5);
    setNewImage(null);
    setShowReviewForm(false);
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            onClick={() => interactive && setNewRating(star)}
            className={`w-4 h-4 transition-all duration-300 ${interactive ? 'cursor-pointer hover:scale-150' : ''} ${star <= (interactive ? newRating : rating) ? 'text-gold fill-gold' : 'text-gray-800'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  const getModalBgClass = () => {
    switch (modalTheme) {
      case 'antique': return 'bg-[#1a140a]/90';
      case 'midnight': return 'bg-[#0a0f1a]/90';
      default: return 'bg-neutral-900/90';
    }
  };

  return (
    <div className="pt-40 pb-40 px-6 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Active Table Status Indicator */}
        {activeTable && (
          <div className="flex justify-center mb-10 animate-fade-in-up">
            <div className="glass-panel px-6 py-2 rounded-full border border-gold/40 flex items-center space-x-3 shadow-[0_0_30px_rgba(197,160,89,0.1)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">Live Table Service Active: Table {activeTable}</span>
            </div>
          </div>
        )}

        <div className="text-center mb-40 relative">
          <span className="text-gold tracking-[0.6em] uppercase text-[10px] mb-8 block font-bold animate-pulse">Culinary Atlas</span>
          <h1 className="text-8xl md:text-[10rem] serif mb-16 leading-none select-none text-glimmer">The Menu</h1>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-bold tracking-[0.4em] uppercase px-10 py-4 rounded-full border transition-all duration-700 ${activeCategory === cat ? 'bg-gold text-black border-gold shadow-[0_15px_40px_rgba(197,160,89,0.3)]' : 'border-white/5 text-gray-600 hover:text-white hover:border-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {filteredMenu.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="group cursor-pointer glass-panel rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl flex flex-col sm:flex-row preserve-3d"
            >
              <div className="w-full sm:w-56 h-72 sm:h-auto overflow-hidden flex-shrink-0 relative">
                 <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-all duration-1000"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">View vision</span>
                </div>
              </div>
              <div className="p-10 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl serif text-white group-hover:text-gold transition-all duration-500">{item.name}</h3>
                    <span className="text-gold font-light tracking-tighter text-2xl font-mono">${item.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2 italic font-light">"{item.description}"</p>
                  <div className="flex space-x-3">
                    {item.dietary?.map(d => (
                      <span key={d} className="text-[8px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-sm text-gray-600 border border-white/5">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-10 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     {renderStars(4.8)}
                     <span className="text-[9px] text-gray-700 font-mono">(4.8)</span>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black group-hover:rotate-45 transition-all duration-1000">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal - Vision Gallery Enabled */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-700"
          onClick={() => { setSelectedItem(null); setShowReviewForm(false); setViewGallery(false); stopNarration(); setNewImage(null); }}
        >
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl"></div>
          
          <div 
            className={`relative border border-white/10 w-full max-w-6xl h-[90vh] md:h-[80vh] rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 flex flex-col md:flex-row transition-all duration-700 backdrop-blur-2xl ${getModalBgClass()} ${viewGallery ? 'scale-110 blur-xl opacity-0' : 'scale-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Ambience Controls */}
            <div className="absolute top-8 right-16 z-20 flex items-center space-x-4 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 hidden md:flex">
               <span className="text-[7px] uppercase tracking-[0.2em] text-gray-500 font-bold">Ambience</span>
               <div className="flex space-x-2">
                  <button onClick={() => setModalTheme('obsidian')} className={`w-3 h-3 rounded-full bg-neutral-800 border transition-all ${modalTheme === 'obsidian' ? 'border-gold scale-125' : 'border-white/10'}`}></button>
                  <button onClick={() => setModalTheme('antique')} className={`w-3 h-3 rounded-full bg-[#3d3019] border transition-all ${modalTheme === 'antique' ? 'border-gold scale-125' : 'border-white/10'}`}></button>
                  <button onClick={() => setModalTheme('midnight')} className={`w-3 h-3 rounded-full bg-[#111a3d] border transition-all ${modalTheme === 'midnight' ? 'border-gold scale-125' : 'border-white/10'}`}></button>
               </div>
            </div>

            {/* Left side: Image with Zoom Toggle */}
            <div className="md:w-1/2 h-80 md:h-full overflow-hidden relative group cursor-zoom-in" onClick={() => setViewGallery(true)}>
              <img src={selectedItem.imageUrl} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-125" alt={selectedItem.name} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
              <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center space-x-3">
                 <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                 </div>
                 <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white">Full Vision Gallery</span>
              </div>
            </div>

            {/* Right side: Information */}
            <div className="md:w-1/2 h-full overflow-y-auto p-12 md:p-20 space-y-16 custom-scrollbar">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-gold text-[10px] uppercase tracking-[0.6em] block font-bold">{selectedItem.category}</span>
                  <button 
                    onClick={handleNarrate}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-full border transition-all duration-500 ${isNarrating ? 'border-gold bg-gold/10 text-gold scale-110' : 'border-white/10 text-gray-500 hover:border-gold/50 hover:text-white'}`}
                  >
                    <div className="relative">
                      {isNarrating && <span className="absolute inset-0 animate-ping bg-gold/50 rounded-full"></span>}
                      <svg className={`w-4 h-4 relative z-10 ${isNarrating ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.2em] font-bold">
                      {isNarrating ? 'Pause Audio Log' : 'Narrate Experience'}
                    </span>
                  </button>
                </div>

                <h2 className="text-5xl md:text-7xl serif text-white mb-8 leading-tight">{selectedItem.name}</h2>
                <div className="text-3xl text-gold mb-12 font-light font-mono">${selectedItem.price}</div>
                
                <p className="text-gray-400 text-xl leading-relaxed mb-16 font-light italic opacity-80">
                  "{selectedItem.description}"
                </p>

                {/* Sourcing Provenance Section */}
                {selectedItem.sourcing && selectedItem.sourcing.length > 0 && (
                  <div className="mb-16 animate-in slide-in-from-left-4 duration-1000">
                    <div className="flex items-center space-x-4 mb-8">
                       <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Provenance Map</span>
                       <div className="h-[1px] flex-grow bg-white/5"></div>
                    </div>
                    <div className="space-y-6">
                      {selectedItem.sourcing.map((source, idx) => (
                        <div key={idx} className="flex space-x-6 group/source">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover/source:border-gold/60 transition-all">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                          </div>
                          <div>
                            <div className="flex items-baseline space-x-3 mb-1">
                               <h4 className="text-white text-sm font-bold uppercase tracking-widest">{source.ingredient}</h4>
                               <a href={source.link} target="_blank" rel="noopener noreferrer" className="text-[9px] text-gold/60 uppercase tracking-widest hover:text-gold transition-colors flex items-center space-x-1">
                                  <span>{source.location}</span>
                                  {source.link !== '#' && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/></svg>}
                               </a>
                            </div>
                            <p className="text-gray-500 text-xs font-light italic leading-relaxed">"{source.story}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-4">
                  {/* Primary 'Add to Journal' Action */}
                  <button 
                    onClick={() => { onAddToCart(selectedItem); setSelectedItem(null); stopNarration(); }}
                    className="w-full py-7 bg-gold text-black font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all rounded-xl shadow-2xl active:scale-95"
                  >
                    {activeTable ? 'Add to Journal Only' : 'Add to Journal'}
                  </button>

                  {/* Prominent 'Order for Table' Action */}
                  {activeTable && (
                    <button 
                      onClick={() => { onAddToCart(selectedItem); setSelectedItem(null); navigate('/cart'); stopNarration(); }}
                      className="w-full py-7 bg-white text-black font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-gold transition-all rounded-xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 border border-white/10"
                    >
                      Order for Table {activeTable}
                    </button>
                  )}
                  
                  <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest font-bold pt-4">Estimated preparation: 12-15 Minutes</p>
                </div>
              </div>

              {/* Impressions */}
              <div className="pt-20 border-t border-white/5 space-y-12">
                <div className="flex justify-between items-end">
                  <h3 className="text-3xl serif text-white">Guest Reflections</h3>
                  {!showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)} className="text-[10px] text-gold uppercase tracking-[0.3em] font-bold pb-2 border-b border-gold/30 hover:text-white transition-colors">Write log</button>
                  )}
                </div>

                {showReviewForm && (
                  <div className="bg-white/5 p-10 rounded-3xl animate-in slide-in-from-top-6 duration-700 border border-white/5">
                    <form onSubmit={handleSubmitReview} className="space-y-8">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-[0.3em] block mb-4 font-bold">Rating</label>
                        {renderStars(newRating, true)}
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[10px] text-gray-500 uppercase tracking-[0.3em] block font-bold">Share Your Vision (Optional)</label>
                        <div className="flex items-center space-x-6">
                           <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600 hover:border-gold/30 hover:text-gold transition-all"
                           >
                              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[7px] uppercase font-bold tracking-widest">Select File</span>
                           </button>
                           <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                           />
                           {newImage && (
                             <div className="relative group">
                               <img src={newImage} className="w-24 h-24 object-cover rounded-2xl border border-gold/20" alt="Selected" />
                               <button 
                                  onClick={() => setNewImage(null)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
                               </button>
                             </div>
                           )}
                        </div>
                      </div>

                      <textarea 
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-6 text-sm text-white focus:border-gold outline-none transition-all resize-none"
                        placeholder="Detail your sensory voyage..."
                      />
                      <div className="flex space-x-4">
                        <button type="submit" className="flex-grow py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-gold transition-colors shadow-2xl">Submit Log</button>
                        <button type="button" onClick={() => { setShowReviewForm(false); setNewImage(null); }} className="px-10 py-5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-12">
                  {(!reviews[selectedItem.id] || reviews[selectedItem.id].length === 0) ? (
                    <div className="text-center py-20 text-gray-700 italic font-light tracking-widest text-sm">
                      Be the first to chart this experience.
                    </div>
                  ) : (
                    reviews[selectedItem.id].map(review => (
                      <div key={review.id} className="border-b border-white/5 pb-12">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <span className="text-white text-[11px] font-bold uppercase tracking-[0.2em] block mb-1">{review.userName}</span>
                            <span className="text-[10px] text-gray-600 uppercase font-mono">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          {review.userImage && (
                            <div className="w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-2xl border border-white/5 group relative cursor-zoom-in" onClick={() => { /* Potential full image logic */ }}>
                              <img src={review.userImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Guest Vision" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                            </div>
                          )}
                          <p className="text-gray-400 text-base leading-relaxed font-light italic flex-grow">"{review.comment}"</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vision Gallery Overlay */}
          {viewGallery && (
            <div 
              className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-10 animate-in fade-in duration-1000"
              onClick={() => { setViewGallery(false); stopNarration(); }}
            >
               <button className="absolute top-10 right-10 text-white hover:text-gold transition-colors">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <div className="max-w-5xl w-full h-full flex flex-col justify-center space-y-10">
                  <img src={selectedItem.imageUrl} className="w-full h-[70vh] object-cover rounded-[3rem] shadow-[0_0_100px_rgba(197,160,89,0.2)] border border-white/5 animate-in zoom-in-110 duration-1000" />
                  <div className="text-center space-y-4">
                     <h2 className="text-5xl serif text-white">{selectedItem.name}</h2>
                     <p className="text-gold uppercase tracking-[0.6em] text-[10px] font-bold">Ultra Vision Photography • 8K Masterpiece</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
