import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket, Copy, Check } from 'lucide-react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const CA = "BtxUo1cxBVRY9kskusuMAF1ZoYAo2c5SJPHk4KKkpump";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand-black/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
      
      {/* CA Banner */}
      <div className="bg-brand-green/10 border-b border-brand-green/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-gray-300 hidden sm:inline">Contract Address:</span>
                <span className="text-brand-green font-mono font-bold tracking-wider truncate max-w-[200px] sm:max-w-none">
                    {CA}
                </span>
                <button 
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-brand-green/20 rounded-md transition-colors text-brand-green"
                    title="Copy CA"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-brand-black p-1 rounded-lg group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt="Launch Ext Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Launch Ext</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">How it Works</a>
            <a href="/docs.html" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Docs</a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white"
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-dark border-b border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800">Features</a>
                <a href="/docs.html" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800">Docs</a>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;