
import React, { useEffect, useState } from 'react';
import { OrderHistoryItem, User } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('wanderplate_order_history') || '[]');
    setHistory(savedHistory);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-32 pb-32 px-6 min-h-screen">
      <div className="container mx-auto max-w-5xl">
        {/* User Identity Card */}
        <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] mb-20 flex flex-col md:flex-row items-center justify-between gap-10 border border-gold/10 relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-[30vw] h-[30vw] bg-gold/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-gold/10 transition-colors duration-1000"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 border border-gold/30 rounded-full animate-spin-slow"></div>
              <img src={user.avatar} className="w-full h-full rounded-full border-4 border-black/50 object-cover" alt={user.name} />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-gold rounded-full border-2 border-black flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
            </div>
            <div className="text-center md:text-left">
              <span className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-2 block">{user.tier} Member</span>
              <h1 className="text-4xl md:text-5xl serif text-white mb-2">{user.name}</h1>
              <p className="text-gray-500 text-sm font-mono">{user.email}</p>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="px-10 py-4 border border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold hover:border-red-500/30 hover:text-red-400 transition-all rounded-full bg-black/20"
          >
            Terminal Logout
          </button>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">Historical Log</h2>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">A record of your culinary explorations</p>
              </div>
              <div className="text-right">
                <span className="text-3xl serif text-gold">{history.length}</span>
                <span className="text-[9px] text-gray-700 uppercase tracking-widest block font-bold">Expeditions</span>
              </div>
            </div>
            
            {history.length === 0 ? (
              <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-20 text-center">
                <svg className="w-12 h-12 text-gray-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 italic">No historical log entries found. Your future culinary journeys will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {history.map((order) => (
                  <div key={order.id} className="glass-panel border border-white/5 rounded-2xl overflow-hidden group hover:border-gold/30 transition-all duration-500 shadow-xl">
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
                        <div>
                          <span className="text-[10px] text-gold uppercase tracking-[0.2em] mb-1 block">Log #{order.id}</span>
                          <p className="text-white text-xs font-mono opacity-60">{formatDate(order.date)}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-bold mb-2 inline-block ${order.type === 'delivery' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : order.type === 'table' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                            {order.type}
                          </div>
                          <p className="text-white font-bold text-xl font-mono">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-3">
                              <span className="text-gold font-mono text-[10px] opacity-40">{item.quantity}x</span>
                              <span className="text-gray-300 font-light">{item.name}</span>
                            </div>
                            <span className="text-gray-600 font-mono text-[10px]">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {(order.address || order.tableNumber) && (
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <div>
                              <span className="text-[9px] uppercase text-gray-600 tracking-widest block font-bold">Destination</span>
                              <p className="text-gray-400 text-[11px] font-light">
                                {order.tableNumber ? `Table ${order.tableNumber} (Dine-in)` : order.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
