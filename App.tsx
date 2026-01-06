
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Reservations from './pages/Reservations';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Guestbook from './pages/Guestbook';
import AIChat from './components/AIChat';
import { CartItem, MenuItem, User } from './types';

const Logo = () => (
  <div className="flex items-center space-x-3 group">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 border border-gold/40 rounded-full group-hover:rotate-45 transition-transform duration-700"></div>
      <svg className="w-6 h-6 text-gold group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="M12 7l1.5 5H12l-1.5-5L12 7z" fill="currentColor" />
        <path d="M12 17l-1.5-5H12l1.5 5L12 17z" fill="currentColor" className="opacity-50" />
      </svg>
    </div>
    <span className="text-2xl font-bold serif text-gold tracking-widest uppercase">
      Wanderplate
    </span>
  </div>
);

const Navbar: React.FC<{ cartCount: number; tableNumber: number | null; user: User | null }> = ({ cartCount, tableNumber, user }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/guestbook', label: 'Reflections' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-md py-4 shadow-xl' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          {links.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors hover:text-gold ${location.pathname === link.path ? 'text-gold' : 'text-gray-300'}`}
            >
              {link.label}
            </Link>
          ))}
          {tableNumber && (
            <div className="flex items-center space-x-2 bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Table {tableNumber}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/cart" className="relative p-2 group">
            <svg className="w-6 h-6 text-gray-300 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/profile" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/30 group-hover:border-gold transition-all">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="px-6 py-2 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all rounded-full"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const ThemeSwitcher: React.FC<{ currentTheme: string; setTheme: (t: string) => void }> = ({ currentTheme, setTheme }) => {
  const themes = [
    { id: 'obsidian', color: '#050505', label: 'Obsidian' },
    { id: 'midnight', color: '#080c14', label: 'Midnight' },
    { id: 'emerald', color: '#06140c', label: 'Emerald' }
  ];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-4 items-center glass-panel p-2 rounded-full py-6 shadow-2xl">
      <span className="text-[7px] uppercase tracking-widest text-gray-500 font-bold vertical-text mb-2">Ambience</span>
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`w-6 h-6 rounded-full border transition-all ${currentTheme === t.id ? 'border-gold scale-125' : 'border-white/10 hover:border-white/30'}`}
          style={{ backgroundColor: t.color }}
          title={t.label}
        />
      ))}
    </div>
  );
};

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [theme, setTheme] = useState('obsidian');
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('wanderplate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const colors: Record<string, string> = {
      obsidian: '#050505',
      midnight: '#080c14',
      emerald: '#06140c'
    };
    document.documentElement.style.setProperty('--bg-color', colors[theme]);
  }, [theme]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };
  const clearCart = () => setCart([]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('wanderplate_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('wanderplate_user');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <div className="flex flex-col min-h-screen transition-colors duration-1000">
        <Navbar cartCount={cartCount} tableNumber={activeTable} user={user} />
        <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu onAddToCart={addToCart} activeTable={activeTable} />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/guestbook" element={<Guestbook user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login onLogin={handleLogin} />} />
            <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/cart" element={
              <Cart 
                cart={cart} 
                onRemove={removeFromCart} 
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
                activeTable={activeTable}
                setActiveTable={setActiveTable}
              />
            } />
          </Routes>
        </main>

        <footer className="bg-black/40 py-20 px-6 border-t border-white/5">
           <div className="container mx-auto text-center text-gray-700 text-[10px] uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} Wanderplate Gastronomy. Direct-to-table enabled.
          </div>
        </footer>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;
