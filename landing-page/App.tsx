import React from 'react';
import StarField from './components/StarField';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-brand-black text-white overflow-x-hidden selection:bg-brand-green selection:text-black">
      <StarField />
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Features />
        <HowItWorks />
        
        {/* CTA Section */}
        <section className="relative z-10 py-24 px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-brand-dark to-black border border-brand-green/30 p-12 rounded-3xl text-center relative overflow-hidden group">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">
                    Ready to Launch the Next <span className="text-brand-green">1000x?</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto relative z-10">
                    Join thousands of degens launching faster, smarter, and safer with Launch Ext.
                </p>
                <a href="https://github.com/launcherext/launcherext" target="_blank" rel="noopener noreferrer" className="inline-block relative z-10 bg-brand-green hover:bg-brand-greenDim text-brand-black text-xl font-bold px-10 py-4 rounded-xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                    Add to Chrome - It's Free
                </a>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;