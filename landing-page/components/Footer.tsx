import React from 'react';
import { Github, Twitter, Send } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-brand-dark border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                    <img src="/logo.png" alt="Launch Ext Logo" className="w-8 h-8 object-contain" />
                    <span className="text-2xl font-bold text-white">Launch Ext</span>
                </div>
                <p className="text-gray-400 max-w-sm">
                    The premier Chrome extension for Solana memecoin launches. 
                    Built for speed, security, and ease of use.
                </p>
            </div>
            
            <div>
                <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Product</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-brand-green transition-colors">Download Extension</a></li>
                    <li><a href="#" className="hover:text-brand-green transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-brand-green transition-colors">Changelog</a></li>
                    <li><a href="#" className="hover:text-brand-green transition-colors">Documentation</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Community</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-brand-green transition-colors flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</a></li>
                    <li><a href="#" className="hover:text-brand-green transition-colors flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</a></li>
                    <li><a href="#" className="hover:text-brand-green transition-colors flex items-center gap-2"><Send className="w-4 h-4" /> Telegram</a></li>
                </ul>
            </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Launch Ext. All rights reserved.</p>
            <p className="mt-2 md:mt-0 font-mono text-xs">Built with ❤️ for the Solana Community</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;