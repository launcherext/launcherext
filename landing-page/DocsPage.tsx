import React from 'react';
import StarField from './components/StarField';
import Navbar from './components/Navbar';
import Docs from './components/Docs';
import Footer from './components/Footer';

function DocsPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white overflow-x-hidden selection:bg-brand-green selection:text-black">
      <StarField />
      <Navbar />
      <main>
        <Docs />
      </main>
      <Footer />
    </div>
  );
}

export default DocsPage;
