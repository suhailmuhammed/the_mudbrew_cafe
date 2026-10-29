import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CafeIntro from './components/CafeIntro';
import HomePage from './components/HomePage';
import BookingPage from './components/BookingPage';
import BookingConfirmationPage from './components/BookingConfirmationPage';
import AdminDashboard from './components/AdminDashboard';
import ClientPresentation from './components/ClientPresentation';

export default function App() {
  const [isPageReady, setIsPageReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const location = useLocation();

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

  // Play animated brand intro on home page visit
  const isHomePage = location.pathname === '/';

  return (
    <div className="relative w-full min-h-screen">
      {/* Animated Brand Intro on first session homepage visit */}
      {isHomePage && (
        <CafeIntro
          isPageReady={isPageReady}
          onFinish={() => setIntroFinished(true)}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/booking/:ref" element={<BookingConfirmationPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/presentation" element={<ClientPresentation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
