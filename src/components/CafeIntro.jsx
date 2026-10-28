import React, { useState, useEffect } from 'react';
import './CafeIntro.css';

const SESSION_STORAGE_KEY = 'mudbrew_intro_seen';
const INTRO_DURATION_MS = 2000;
const MAX_FALLBACK_TIMEOUT_MS = 2600;

export default function CafeIntro({ isPageReady = true, onFinish }) {
  // Check if intro has already been shown in this tab session
  const [shouldShow, setShouldShow] = useState(() => {
    try {
      return typeof window !== 'undefined' && !sessionStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (!shouldShow) return;

    // Detect prefers-reduced-motion
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
    } catch {
      setIsReducedMotion(false);
    }

    // Lock page scroll while the intro is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let exitTimeoutId;
    let unmountTimeoutId;
    let fallbackTimeoutId;

    const triggerExit = () => {
      setIsExiting(true);
      // Mark as seen in sessionStorage
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      } catch {
        // Ignore sessionStorage restrictions if any
      }

      // Allow exit transition animation to finish before unmounting
      unmountTimeoutId = setTimeout(() => {
        setIsUnmounted(true);
        document.body.style.overflow = originalOverflow || '';
        if (onFinish) onFinish();
      }, isReducedMotion ? 400 : 700);
    };

    // Trigger exit when timer completes AND page is ready
    if (isPageReady) {
      exitTimeoutId = setTimeout(triggerExit, isReducedMotion ? 1200 : INTRO_DURATION_MS);
    }

    // Safety fallback timeout: Never leave the intro permanently visible if any asset hangs
    fallbackTimeoutId = setTimeout(() => {
      triggerExit();
    }, MAX_FALLBACK_TIMEOUT_MS);

    return () => {
      clearTimeout(exitTimeoutId);
      clearTimeout(unmountTimeoutId);
      clearTimeout(fallbackTimeoutId);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [shouldShow, isPageReady, isReducedMotion, onFinish]);

  if (!shouldShow || isUnmounted) {
    return null;
  }

  return (
    <div
      className={`cafe-intro-overlay ${isExiting ? 'is-exiting' : ''} ${isReducedMotion ? 'reduced-motion' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="The MudBrew Cafe Loading"
    >
      <div className="cafe-intro-content">
        {/* Botanical Logo */}
        <div className="cafe-intro-logo-wrap">
          <img
            src="/logo.png"
            alt="The MudBrew Logo"
            className="cafe-intro-logo-img"
            onError={(e) => {
              // Safety fallback: if image fails, continue transition
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Brand Wordmark & Subtitle */}
        <div className="cafe-intro-brand">
          <h1 className="cafe-intro-title">MUD BREW</h1>
          <p className="cafe-intro-tagline">Studio • Arena • Dining</p>
        </div>

        {/* Understated Minimal Loading Indicator */}
        <div className="cafe-intro-loader" aria-hidden="true">
          <div className="cafe-intro-loader-bar"></div>
        </div>
      </div>
    </div>
  );
}
