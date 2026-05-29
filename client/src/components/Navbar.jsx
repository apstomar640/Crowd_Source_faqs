import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Bot, Zap } from 'lucide-react';

const navLinks = [
  { to: '/',           label: 'Home' },
  { to: '/community',  label: 'Community' },
  { to: '/insights',   label: 'Crowd Insights' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/?q=${encodeURIComponent(searchVal.trim())}`);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-deep/90 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#00d4ff" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="16" cy="16" r="9" stroke="#00d4ff" strokeWidth="1.5" opacity="0.3"/>
              <circle cx="16" cy="16" r="4" fill="#00d4ff"/>
              <line x1="16" y1="1" x2="16" y2="7" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="16" y1="25" x2="16" y2="31" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="1" y1="16" x2="7" y2="16" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="25" y1="16" x2="31" y2="16" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8"/>
            </svg>
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10" />
          </div>
          <span className="font-outfit font-bold text-lg text-white hidden sm:block">
            CrowdSource<span className="text-primary">FAQs</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.04]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-full px-4 py-2">
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search FAQs…"
            className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-full"
          />
        </form>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link to="/community" className="btn-primary text-sm">
            <Zap size={14} />
            Ask Community
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-auto md:hidden p-2 text-gray-400 hover:text-white">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    location.pathname === link.to ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 mt-2">
                <Search size={14} className="text-gray-500" />
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search FAQs…"
                  className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-full"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}