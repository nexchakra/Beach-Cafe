
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  // Ref for tracking mouse position target and the currently interpolated position
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const [displayPos, setDisplayPos] = useState({ x: 0, y: 0 });
  const requestRef = useRef<number | undefined>(undefined);

  // Smoothing (lerp) function
  const animate = () => {
    const lerpFactor = 0.08; // Control the "weight" of the movement
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * lerpFactor;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * lerpFactor;
    
    setDisplayPos({ 
      x: mouseCurrent.current.x, 
      y: mouseCurrent.current.y 
    });
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -0.5 to 0.5
      mouseTarget.current.x = (e.clientX / window.innerWidth) - 0.5;
      mouseTarget.current.y = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const specialOffers = [
    {
      id: 'offer-1',
      title: "The Captain's Table",
      subtitle: "Full 7-Course Voyage",
      description: "Experience the complete map of our kitchen with a curated tasting menu and sommelier selections.",
      price: "$140",
      originalPrice: "$185",
      tag: "Signature",
      image: "https://images.unsplash.com/photo-1550966842-2849a220047f?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 'offer-2',
      title: "Twilight Passage",
      subtitle: "Aperitivo Hours",
      description: "Join us between 17:00 and 19:00 for bespoke cocktails and complimentary global small plates.",
      price: "50% Off",
      tag: "Limited",
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 'offer-3',
      title: "Voyage for Two",
      subtitle: "Romance & Discovery",
      description: "A private booth experience including a bottle of vintage champagne and a shared dessert platter.",
      price: "$210",
      tag: "Exclusive",
      image: "https://images.unsplash.com/photo-1529692236671-f1f6e9460272?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-[#050505]">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-gold/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] bg-gold/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section with Enhanced 3D Parallax */}
      <section 
        className="relative h-screen flex items-center justify-center perspective-1000 overflow-hidden"
      >
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ 
            transform: `translate3d(${displayPos.x * 20}px, ${displayPos.y * 20}px, 0) scale(1.15) rotateX(${displayPos.y * -2}deg) rotateY(${displayPos.x * 2}deg)`,
            backgroundImage: 'url("https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
            willChange: 'transform'
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#050505]"></div>
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, black 100%)',
            transform: `translate3d(${displayPos.x * 40}px, ${displayPos.y * 40}px, 0)`,
            willChange: 'transform'
          }}
        ></div>

        <div 
          className="relative z-10 text-center px-6 max-w-5xl mx-auto preserve-3d"
          style={{ 
            transform: `translate3d(${displayPos.x * -60}px, ${displayPos.y * -60}px, 100px) rotateX(${displayPos.y * -5}deg) rotateY(${displayPos.x * 5}deg)`,
            willChange: 'transform'
          }}
        >
          <div className="space-y-4 mb-8">
            <h4 className="text-gold tracking-[0.6em] uppercase text-[10px] animate-fade-in-up font-bold">Wanderplate Gastronomy</h4>
            <div className="h-[2px] w-12 bg-gold/30 mx-auto rounded-full"></div>
          </div>
          
          <h1 className="text-7xl md:text-[11rem] serif mb-12 leading-none text-glimmer drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] select-none">
            Odyssey
          </h1>
          
          <p className="text-gray-300 text-lg md:text-2xl max-w-2xl mx-auto mb-16 font-light leading-relaxed tracking-wide opacity-90">
            A three-dimensional voyage through global flavors. Where every dish is a destination and every bite a discovery.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <Link 
              to="/menu" 
              className="px-16 py-6 bg-gold text-black font-bold tracking-[0.3em] uppercase text-[11px] hover:bg-white transition-all shadow-[0_20px_40px_rgba(197,160,89,0.3)] active:scale-95 rounded-sm"
            >
              Explore Menu
            </Link>
            <Link 
              to="/reservations" 
              className="px-16 py-6 border border-white/20 text-white font-bold tracking-[0.3em] uppercase text-[11px] hover:border-gold transition-all backdrop-blur-md glass-panel active:scale-95 rounded-sm"
            >
              Secure Table
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-30 animate-bounce">
          <span className="text-[8px] uppercase tracking-[0.4em] text-white">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent"></div>
        </div>
      </section>

      {/* 3D Showcase Section */}
      <section className="py-40 px-6 relative z-10">
        <div className="container mx-auto text-center mb-24">
          <span className="text-gold text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">The Chef's Rotation</span>
          <h2 className="text-5xl md:text-7xl serif">Masterpieces in Motion</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-12 items-center">
          {[
            { img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", title: "Prime Wagyu", price: "$24" },
            { img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", title: "Miso Cod", price: "$42" },
            { img: "https://images.unsplash.com/photo-1621213143723-29382b976f79?auto=format&fit=crop&w=800&q=80", title: "Roasted Duck", price: "$38" }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="group relative w-full md:w-[350px] aspect-[3/4] perspective-1000"
            >
              <div className="relative w-full h-full transition-transform duration-1000 preserve-3d group-hover:rotate-y-12 group-hover:rotate-x-6">
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 p-10 translate-z-50">
                    <span className="text-gold text-[10px] font-bold tracking-widest uppercase mb-2 block">Featured</span>
                    <h3 className="text-3xl serif text-white mb-2">{item.title}</h3>
                    <p className="text-gold text-lg font-light">{item.price}</p>
                  </div>
                </div>
                <div className="absolute -inset-4 border border-gold/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-z-10 blur-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Offers Section: Limited Expeditions */}
      <section className="py-40 px-6 relative overflow-hidden bg-black/30">
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 50 Q 25 40 50 50 T 100 50" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" />
           </svg>
        </div>

        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 space-y-8 md:space-y-0">
            <div className="max-w-2xl">
              <span className="text-gold text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Seasonal Passes</span>
              <h2 className="text-5xl md:text-8xl serif">Limited Expeditions</h2>
              <p className="text-gray-500 mt-6 text-xl font-light italic">
                Exclusive culinary narratives available for a short time. Secure your passage before the season turns.
              </p>
            </div>
            <Link to="/menu" className="group flex items-center space-x-4 text-gold text-[10px] font-bold uppercase tracking-[0.3em]">
               <span>View All Routes</span>
               <div className="w-10 h-10 border border-gold/30 rounded-full flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/></svg>
               </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {specialOffers.map((offer, idx) => (
              <div 
                key={offer.id} 
                className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 group hover:border-gold/30 transition-all duration-700 shadow-2xl flex flex-col h-full"
              >
                <div className="h-64 relative overflow-hidden">
                  <img src={offer.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt={offer.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 bg-gold/90 text-black text-[9px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                      {offer.tag}
                    </span>
                  </div>
                </div>
                
                <div className="p-10 flex flex-col flex-grow">
                  <div className="mb-8">
                    <span className="text-gold text-[9px] font-bold uppercase tracking-[0.3em] mb-2 block">{offer.subtitle}</span>
                    <h3 className="text-3xl serif text-white mb-4 group-hover:text-gold transition-colors">{offer.title}</h3>
                    <p className="text-gray-500 text-sm font-light leading-relaxed italic line-clamp-3">"{offer.description}"</p>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline space-x-2">
                         <span className="text-white text-2xl font-mono">{offer.price}</span>
                         {offer.originalPrice && <span className="text-gray-700 text-sm line-through font-mono">{offer.originalPrice}</span>}
                      </div>
                      <span className="text-[8px] text-gray-700 uppercase tracking-widest block mt-1 font-bold">Limited Availability</span>
                    </div>
                    <Link 
                      to="/reservations" 
                      className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-gold hover:text-black hover:border-gold transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive Narrative */}
      <section className="py-40 bg-black relative">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <h2 className="text-6xl md:text-8xl serif leading-tight">Beyond <br/>The Plate</h2>
            <p className="text-gray-400 text-xl font-light leading-relaxed max-w-xl">
              Architecture meets gastronomy. Our space is designed as a vessel for your travels, using geometry and light to enhance the narrative of our cuisine.
            </p>
            <div className="flex space-x-12">
               <div className="text-center">
                  <div className="text-4xl serif text-gold mb-2">320+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Global Spices</div>
               </div>
               <div className="text-center">
                  <div className="text-4xl serif text-gold mb-2">12</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Partner Farms</div>
               </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 h-[600px] perspective-1000">
             <div className="space-y-4 translate-y-20">
                <img src="https://images.unsplash.com/photo-1554679665-f5537f187268?auto=format&fit=crop&w=280&q=80" className="w-full h-[280px] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700 hover:-translate-z-10 shadow-2xl" />
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=200&q=80" className="w-full h-[200px] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" />
             </div>
             <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=200&q=80" className="w-full h-[200px] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" />
                <img src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=280&q=80" className="w-full h-[280px] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
