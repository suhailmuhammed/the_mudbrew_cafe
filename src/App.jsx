import React, { useState, useEffect } from 'react';
import CafeIntro from './components/CafeIntro';
import HomePage from './components/HomePage';

export default function App() {
  const [isPageReady, setIsPageReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    // Check if initial page content & critical assets are ready
    if (document.readyState === 'complete') {
      setIsPageReady(true);
    } else {
      const handleLoad = () => setIsPageReady(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Premium Animated Loading Brand Intro */}
      <CafeIntro
        isPageReady={isPageReady}
        onFinish={() => setIntroFinished(true)}
      />

      {/* Existing Café Homepage (unchanged design & structure) */}
      <HomePage />
    </div>
  );
}
