
import React, { useState } from 'react';
import { CartItem, OrderType, OrderHistoryItem } from '../types';
import { Link } from 'react-router-dom';

interface CartProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClear: () => void;
  activeTable: number | null;
  setActiveTable: (n: number | null) => void;
}

const Cart: React.FC<CartProps> = ({ cart, onRemove, onUpdateQuantity, onClear, activeTable, setActiveTable }) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(activeTable ? 'table' : 'takeaway');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localTable, setLocalTable] = useState<number | string>(activeTable || '');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08875;
  const deliveryFee = orderType === 'delivery' ? 5.00 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleCheckout = () => {
    if (orderType === 'delivery' && !address.trim()) {
      alert('Please provide a delivery address.');
      return;
    }
    if (orderType === 'table' && !localTable) {
      alert('Please enter your table number.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const tableNum = orderType === 'table' ? Number(localTable) : undefined;
      const newHistoryItem: OrderHistoryItem = {
        id: 'WP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: new Date().toISOString(),
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: total,
        type: orderType,
        address: orderType === 'delivery' ? address : undefined,
        tableNumber: tableNum,
        instructions: instructions.trim() || undefined
      };

      const existingHistory = JSON.parse(localStorage.getItem('wanderplate_order_history') || '[]');
      localStorage.setItem('wanderplate_order_history', JSON.stringify([newHistoryItem, ...existingHistory]));

      if (tableNum) setActiveTable(tableNum);
      setIsProcessing(false);
      setCheckoutComplete(true);
      onClear();
    }, 2500);
  };

  if (checkoutComplete) {
    return (
      <div className="pt-48 pb-48 px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="container mx-auto max-w-xl glass-panel p-12 rounded-[2rem] shadow-2xl border border-gold/20">
          <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-10 relative">
             <div className="absolute inset-0 bg-gold/5 rounded-full animate-ping"></div>
            <svg className="w-12 h-12 text-gold relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-4xl serif mb-6">Order Synchronized</h2>
          <p className="text-gray-400 mb-12 leading-relaxed font-light">
            {orderType === 'table' 
              ? `Our team is preparing your selection. It will be delivered directly to Table ${localTable} shortly.`
              : orderType === 'delivery'
              ? `Logistics confirmed. Your selection is en route to ${address}.`
              : "Your selection is being prepared for collection at the kitchen pass."}
          </p>
          <div className="flex flex-col space-y-4">
            <Link to="/profile" className="px-12 py-5 bg-gold text-black uppercase tracking-widest text-[10px] font-bold hover:bg-white transition-all transform active:scale-95 shadow-xl">
              Track Status
            </Link>
            <Link to="/" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold py-2">
              Continue Journey
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-48 pb-48 px-6 text-center">
        <h2 className="text-5xl serif mb-10 text-white/20">Your Journal is Empty</h2>
        <Link to="/menu" className="px-14 py-6 border border-gold/30 text-gold uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-gold hover:text-black transition-all inline-block">
          Explore the Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-40 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-7xl serif mb-24 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-20">
            <div className="glass-panel p-10 md:p-14 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center space-x-4 mb-12">
                <span className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold border-b border-gold/30 pb-2">01 — Distribution Mode</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { id: 'table', label: 'In-Restaurant', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                  { id: 'takeaway', label: 'Collection', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                  { id: 'delivery', label: 'Dispatch', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                ].map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setOrderType(type.id as OrderType)}
                    className={`relative p-8 rounded-2xl border text-left transition-all duration-500 group ${orderType === type.id ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className={`mb-6 transition-colors ${orderType === type.id ? 'text-gold' : 'text-gray-600 group-hover:text-white'}`}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d={type.icon} />
                      </svg>
                    </div>
                    <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${orderType === type.id ? 'text-gold' : 'text-white'}`}>{type.label}</h4>
                    {orderType === type.id && <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_10px_#c5a059]"></div>}
                  </button>
                ))}
              </div>

              <div className="space-y-10 animate-in fade-in duration-700">
                {orderType === 'table' && (
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-4 font-bold">Your Table Coordinates</label>
                    <input 
                      type="number"
                      placeholder="Enter Table Number (1-20)"
                      value={localTable}
                      onChange={(e) => setLocalTable(e.target.value)}
                      className="w-full bg-black/40 border-b border-white/10 px-0 py-5 text-white focus:border-gold outline-none transition-all text-xl font-light placeholder:text-gray-800"
                    />
                    <p className="mt-4 text-[10px] text-gold/50 uppercase tracking-widest italic">No waiter required. Your order will sync directly with our kitchen.</p>
                  </div>
                )}
                
                {orderType === 'delivery' && (
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-4 font-bold">Dispatch Location</label>
                    <input 
                      type="text"
                      placeholder="Enter Full Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-black/40 border-b border-white/10 px-0 py-5 text-white focus:border-gold outline-none transition-all text-xl font-light placeholder:text-gray-800"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-4 font-bold">Preparation Notes</label>
                  <textarea 
                    placeholder="Allergies or special requests..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-black/40 border-b border-white/10 px-0 py-5 text-white focus:border-gold outline-none transition-all text-sm font-light resize-none h-24 placeholder:text-gray-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-12">
               <span className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold border-b border-gold/30 pb-2">02 — Inventory Audit</span>
               <div className="space-y-8">
                {cart.map(item => (
                  <div key={item.id} className="flex space-x-8 items-center group">
                    <div className="relative w-24 h-24 overflow-hidden rounded-xl border border-white/5">
                      <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl serif text-white mb-1">{item.name}</h3>
                      <div className="flex items-center space-x-8 mt-4">
                        <div className="flex items-center space-x-4 border border-white/10 rounded-full px-4 py-1">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-gray-500 hover:text-gold">-</button>
                          <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-gray-500 hover:text-gold">+</button>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-[9px] text-gray-700 hover:text-red-500 uppercase tracking-widest font-bold transition-colors">Dismiss</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-xl font-light font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-panel p-10 rounded-[2rem] sticky top-40 border border-gold/10">
               <h3 className="text-3xl serif mb-10 pb-6 border-b border-white/5">Summary</h3>
               <div className="space-y-6 mb-12">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span className="font-light tracking-widest uppercase text-[10px]">Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span className="font-light tracking-widest uppercase text-[10px]">Tax & Fees</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-gold text-sm font-bold">
                    <span className="tracking-widest uppercase text-[10px]">Dispatch Fee</span>
                    <span className="font-mono">+$5.00</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-3xl serif pt-10 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-gold font-mono">${total.toFixed(2)}</span>
                </div>
               </div>

               <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full py-6 bg-gold text-black font-bold uppercase tracking-[0.4em] text-[10px] transition-all relative overflow-hidden group shadow-2xl ${isProcessing ? 'cursor-not-allowed opacity-50' : 'hover:bg-white hover:-translate-y-1 active:scale-95'}`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Syncing...
                  </span>
                ) : (
                  orderType === 'table' ? 'Send to Kitchen' : 'Confirm & Dispatch'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
