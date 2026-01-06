
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Mock authentication delay
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || 'Valued Guest',
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Guest')}`,
        tier: 'Explorer'
      };
      onLogin(mockUser);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="pt-40 pb-40 px-6 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-gold/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto max-w-md relative z-10">
        <div className="text-center mb-12">
          <span className="text-gold tracking-[0.5em] uppercase text-[10px] mb-4 block font-bold">Embarking Sequence</span>
          <h1 className="text-5xl serif mb-6">Manifest</h1>
          <p className="text-gray-500 font-light text-sm italic">"Your passport to a world beyond the plate."</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-10 md:p-14 rounded-[2.5rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="relative w-16 h-16 mb-6">
                 <div className="absolute inset-0 border-2 border-gold/20 rounded-full"></div>
                 <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin"></div>
               </div>
               <p className="text-gold uppercase tracking-[0.3em] text-[10px] font-bold animate-pulse">Verifying Credentials...</p>
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block font-bold">Full Identity</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/40 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all text-sm font-light placeholder:text-gray-800"
                placeholder="Name as it appears on passport"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block font-bold">Digital Coordinate</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/40 border-b border-white/10 px-0 py-4 text-white focus:border-gold outline-none transition-all text-sm font-light placeholder:text-gray-800"
                placeholder="voyager@wanderplate.com"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-6 bg-gold text-black font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all transform active:scale-95 shadow-[0_15px_40px_rgba(197,160,89,0.3)]"
          >
            Authorize Voyage
          </button>

          <div className="pt-6 text-center">
            <p className="text-[9px] text-gray-700 uppercase tracking-widest font-bold">
              By embarking, you agree to our Gastronomic Charter.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
