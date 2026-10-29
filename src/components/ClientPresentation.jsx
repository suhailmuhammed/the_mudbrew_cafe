import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function ClientPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState(null);

  const totalSlides = 9;

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (activeLightbox) {
      if (e.key === 'Escape') setActiveLightbox(null);
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCurrentSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCurrentSlide(totalSlides - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  }, [activeLightbox, totalSlides]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));
  const restart = () => setCurrentSlide(0);

  const openLive = (path = '/') => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-linen text-charcoal flex flex-col justify-between selection:bg-terracotta-soft selection:text-terracotta relative overflow-hidden font-sans">
      {/* Subtle Botanical / Atmospheric Watermark Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#B85434_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* ========================================================================= */}
      {/* PRESENTATION HEADER */}
      {/* ========================================================================= */}
      <header className="relative z-20 bg-linen/90 backdrop-blur-md border-b border-stone-200/70 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img src="/logo.png" alt="The MudBrew" className="w-8 h-8 rounded-full object-cover shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-semibold tracking-tight text-charcoal">The MudBrew Café</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-terracotta-soft text-terracotta">
                Client Showcase
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-light -mt-0.5">Presented by Webinko Digital Agency</p>
          </div>
        </div>

        {/* Slide Tracker & Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-stone-500 hidden sm:inline">
            Slide {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>

          <button
            onClick={() => openLive('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 hover:border-terracotta text-stone-700 hover:text-terracotta text-xs font-medium transition-all shadow-sm"
            title="Open real homepage in a new tab"
          >
            <span>Open Live Website</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-charcoal hover:bg-white text-xs transition-colors"
            title="Toggle Fullscreen (F)"
          >
            <span className="material-symbols-outlined text-base">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>

          <Link
            to="/"
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-rose-700 hover:bg-white text-xs transition-colors"
            title="Exit Presentation"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SLIDE CANVAS (MAIN CONTENT) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 1: OPENING */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 0 && (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fadeIn">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-terracotta font-semibold">
                <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
                <span>Concept Presentation • Prepared for MudBrew</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-charcoal tracking-tight leading-[1.1]">
                The MudBrew <span className="italic text-terracotta">Café</span>
              </h1>

              <p className="font-serif text-xl sm:text-2xl text-stone-700 font-light leading-snug">
                A digital experience for the next chapter of your café.
              </p>

              <p className="text-stone-600 text-sm leading-relaxed max-w-xl font-light">
                An intentional showcase bridging handcrafted slow living, artisanal wheel ceramics, miniature RC terrain play, and a seamless reservation system crafted for your patrons and staff.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={nextSlide}
                  className="px-7 py-3.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors duration-300 text-xs uppercase tracking-wider font-medium flex items-center gap-2 shadow-sm"
                >
                  <span>Begin Walkthrough</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>

                <button
                  onClick={() => openLive('/')}
                  className="px-6 py-3.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 hover:text-charcoal transition-colors text-xs uppercase tracking-wider font-medium"
                >
                  Explore Live Demo
                </button>
              </div>

              <div className="pt-6 border-t border-stone-200/60 flex items-center gap-4 text-xs text-stone-400">
                <span className="font-serif italic text-stone-500 font-medium">Concept developed by Webinko</span>
                <span>•</span>
                <span>Independent Concept Showcase</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-hero.png', title: 'MudBrew Live Hero Experience', caption: 'The tactile and architectural entrance of the MudBrew digital platform.' })}
                className="group cursor-pointer rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-white aspect-[4/3] relative transform hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src="/presentation-assets/mudbrew-hero.png"
                  alt="MudBrew Hero Screenshot"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-charcoal text-xs font-medium shadow-md flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                    <span>Click to Expand</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 text-center mt-2.5 italic">
                Authentic capture of the running website hero
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 2: THE BRAND EXPERIENCE */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 1 && (
          <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">01 / Digital Identity</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">More than a café website.</h2>
              <p className="text-stone-600 text-sm font-light">
                An editorial platform that translates the tactile atmosphere of Courtyard 4 into a compelling digital presence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Dining */}
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-menu.png', title: 'Culinary Craft & Pantry', caption: 'Menu showcases pour-overs, cold brews, and seasonal pantry dishes.' })}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-terracotta/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border border-stone-100">
                    <img src="/presentation-assets/mudbrew-menu.png" alt="Dining Section" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-serif text-base font-medium text-charcoal">Atmosphere &amp; Dining</h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Celebrates your acoustic arches, garden patio seating, and specialty pour-over menu highlights with curated delivery integrations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-terracotta font-medium flex items-center justify-between">
                  <span>Dining Sanctuary</span>
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </div>
              </div>

              {/* Card 2: Pottery Studio */}
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-pottery.png', title: 'Artisanal Pottery Studio', caption: 'Shimpo whisper wheels, raw clay throwing, and kiln glaze schedules.' })}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-terracotta/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border border-stone-100">
                    <img src="/presentation-assets/mudbrew-pottery.png" alt="Pottery Studio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-serif text-base font-medium text-charcoal">The Mud Studio &amp; Kiln</h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Showcases 12 Japanese Shimpo wheels, raw terracotta centering, and glaze schedules. Gives visitors a reason to visit and create.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-terracotta font-medium flex items-center justify-between">
                  <span>Wheel Studio</span>
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </div>
              </div>

              {/* Card 3: RC Crawling Arena */}
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-rc-arena.png', title: 'Indoor Miniature RC Terrain', caption: '40ft micro rock crawling obstacle terrain for enthusiasts of all ages.' })}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-terracotta/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border border-stone-100">
                    <img src="/presentation-assets/mudbrew-rc-arena.png" alt="RC Arena" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-serif text-base font-medium text-charcoal">Miniature RC Terrain</h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Highlights the 40ft carved sandstone indoor crawler arena. A playful social hook that distinguishes MudBrew from standard coffee houses.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-terracotta font-medium flex items-center justify-between">
                  <span>Tactile Arena</span>
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 text-center text-xs text-stone-500">
              <strong className="text-charcoal font-medium">Customizable for your actual offerings:</strong> These proposed sections will be calibrated around the exact services, workshop schedules, and menu items MudBrew offers.
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 3: EXPLORE THE WEBSITE */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 2 && (
          <div className="w-full max-w-5xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">02 / Live Interface</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">Your brand, presented beautifully.</h2>
              </div>
              <button
                onClick={() => openLive('/')}
                className="px-5 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                <span>Launch Live Website in New Tab</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>

            {/* Large Authentic Showcase Frame */}
            <div
              onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-homepage.png', title: 'Complete Homepage Editorial Layout', caption: 'Architectural duo grid, brand story, craft wheel counter, and streamlined navigation.' })}
              className="group cursor-pointer rounded-3xl overflow-hidden border border-stone-200/80 shadow-lg bg-white relative aspect-[16/9] max-h-[500px]"
            >
              <img
                src="/presentation-assets/mudbrew-homepage.png"
                alt="MudBrew Full Homepage"
                className="w-full h-full object-cover object-top group-hover:scale-101 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-4 py-2 rounded-full bg-white text-charcoal text-xs font-medium shadow-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">zoom_in</span>
                  <span>Click for Full High-Resolution View</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
              <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                <strong className="text-charcoal block mb-0.5">Tactile Earthy Minimalism</strong>
                Warm bisque clay palette, raw sand linen canvas, and muted editorial serifs.
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                <strong className="text-charcoal block mb-0.5">Mobile-First Responsiveness</strong>
                Fluid layouts optimized for guests discovering the café on iOS and Android smartphones.
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                <strong className="text-charcoal block mb-0.5">Direct Action CTAs</strong>
                Prominent buttons guide guests smoothly from browsing menu items to booking reservations.
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 4: THE CUSTOMER BOOKING JOURNEY */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 3 && (
          <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">03 / Customer Journey</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">From discovery to reservation.</h2>
              <p className="text-stone-600 text-sm font-light">
                A frictionless 5-step booking flow designed to reduce phone back-and-forth and guarantee accurate reservations.
              </p>
            </div>

            {/* Visual Step-by-Step Sequence */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: '01', title: 'Choose Category', desc: 'Table dining or guided craft experience.', icon: 'category' },
                { step: '02', title: 'Select Date & Party', desc: 'Bounded by configured operating days.', icon: 'calendar_month' },
                { step: '03', title: 'Live Availability', desc: 'Real-time remaining seat capacity check.', icon: 'schedule' },
                { step: '04', title: 'Submit Request', desc: 'Guest contact & special requirements.', icon: 'send' },
                { step: '05', title: 'Clear Confirmation', desc: 'Branded reference & calendar export.', icon: 'verified' }
              ].map((s) => (
                <div key={s.step} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between text-left">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-terracotta-soft text-terracotta flex items-center justify-center font-bold text-xs">
                      {s.step}
                    </div>
                    <h3 className="font-serif text-sm font-medium text-charcoal">{s.title}</h3>
                    <p className="text-[11px] text-stone-500 font-light leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Screenshot Comparison: Availability & Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-booking-availability.png', title: 'Real-Time Time Slot Capacity', caption: 'Slot chips display live seat counts. Unavailable slots are cleanly disabled.' })}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-white aspect-[16/10] relative"
              >
                <img src="/presentation-assets/mudbrew-booking-availability.png" alt="Time Slots" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute bottom-2 left-2 right-2 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-[11px] flex justify-between items-center">
                  <span>Step 3: Live Seat Capacity</span>
                  <span className="material-symbols-outlined text-xs">zoom_in</span>
                </div>
              </div>

              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-booking-status.png', title: 'Customer Booking Confirmation Screen', caption: 'Transparent status badge, copyable reference code, calendar export, and concierge follow-up info.' })}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-white aspect-[16/10] relative"
              >
                <img src="/presentation-assets/mudbrew-booking-status.png" alt="Confirmation Screen" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute bottom-2 left-2 right-2 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-[11px] flex justify-between items-center">
                  <span>Step 5: Reference &amp; Status</span>
                  <span className="material-symbols-outlined text-xs">zoom_in</span>
                </div>
              </div>
            </div>

            {/* Important Honesty Callout */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">verified_user</span>
              <div>
                <strong className="font-semibold block mb-0.5">Clear "Pending Review" vs "Booking Confirmed" Transparency:</strong>
                Pending requests are explicitly labeled so guests know the host is checking table availability, avoiding arrival surprises.
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 5: TABLE RESERVATIONS */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 4 && (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">04 / Table Booking</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal leading-tight">
                  A simpler way to manage table requests.
                </h2>
                <p className="text-stone-600 text-sm font-light leading-relaxed">
                  Guests select party size, reservation date, and preferred time slot with real-time seat availability checks.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <strong className="text-charcoal font-medium block">Illustrative Scenario: Family Sunday Lunch</strong>
                  <p className="text-stone-500 font-light leading-relaxed">
                    A family of 4 selects Sunday at 13:00. The platform verifies dining sanctuary capacity, prevents conflicting bookings, collects dietary/high-chair requests, and issues reference <code className="text-terracotta font-mono font-semibold">MB-TAB-...</code>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                    <span className="text-stone-400 block text-[10px] uppercase">Capacity Checking</span>
                    <span className="text-charcoal font-medium">Slot limits prevent dining floor overcrowding</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                    <span className="text-stone-400 block text-[10px] uppercase">Special Requests</span>
                    <span className="text-charcoal font-medium">Patio arches, anniversaries, high chairs</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => openLive('/book?category=table')}
                  className="px-6 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <span>Test Table Booking Live</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-table-booking.png', title: 'Table Reservation Form Interface', caption: 'Customer booking interface showing party size selector, calendar date picker, and guest contact details.' })}
                className="group cursor-pointer rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-white aspect-[4/3] relative"
              >
                <img src="/presentation-assets/mudbrew-table-booking.png" alt="Table Booking Interface" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-charcoal text-xs font-medium shadow-md flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                    <span>Click to Inspect Interface</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 text-center mt-2 italic">
                Illustrative demonstration scenario captured from the live application
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 6: EXPERIENCES & WORKSHOPS */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 5 && (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-experience-booking.png', title: 'Studio & Experience Catalogue', caption: 'Selectable cards displaying pricing, duration, description, and participant capacity per session.' })}
                className="group cursor-pointer rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-white aspect-[4/3] relative"
              >
                <img src="/presentation-assets/mudbrew-experience-booking.png" alt="Experience Booking" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-charcoal text-xs font-medium shadow-md flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                    <span>Click to Expand</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 text-center mt-2 italic">
                Dynamic catalogue loaded straight from your database
              </p>
            </div>

            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">05 / Studio Monetization</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal leading-tight">
                  Make every experience bookable.
                </h2>
                <p className="text-stone-600 text-sm font-light leading-relaxed">
                  Transform studio workshops and masterclasses into structured, revenue-generating bookable experiences.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                  <strong className="text-charcoal font-medium block">Proposed Use Cases (To be calibrated with MudBrew):</strong>
                  <ul className="text-stone-600 space-y-1.5 list-disc pl-4 font-light">
                    <li><strong>Wheel Throwing &amp; Glazing:</strong> 6-seat masterclass, 90 mins, includes bisque firing.</li>
                    <li><strong>Specialty Pour-Over &amp; Cupping:</strong> Sensory barista session with origin tasting flight.</li>
                    <li><strong>Miniature RC Course Run:</strong> Scale terrain timed expeditions with cold brew.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
                  <strong className="text-charcoal font-medium block mb-1">Fully Configurable in Staff Admin:</strong>
                  Your team controls title, description, ticket price, duration, daily slots, and max seats per session.
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => openLive('/book?category=experience')}
                  className="px-6 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <span>Test Experience Booking Live</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 7: THE STAFF DASHBOARD */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 6 && (
          <div className="w-full max-w-5xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">06 / Staff Concierge</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">Reservations, managed in one place.</h2>
              </div>
              <button
                onClick={() => openLive('/admin')}
                className="px-5 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                <span>Open Staff Portal Live (Demo Login)</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>

            {/* 3 Authentic Admin Screenshots Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-admin-dashboard.png', title: 'Live Booking Board & Filters', caption: 'Metrics summary (Pending, Confirmed, Cancelled, Today), search bar, and one-click Confirm/Reject actions.' })}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200 p-3 shadow-sm hover:border-terracotta/50 transition-all space-y-2.5"
              >
                <div className="rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border">
                  <img src="/presentation-assets/mudbrew-admin-dashboard.png" alt="Admin Board" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium text-charcoal">Booking Overview &amp; Actions</h3>
                  <p className="text-[11px] text-stone-500 font-light mt-0.5">Filter by status, search by phone or name, and confirm or reject requests.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-experience-manager.png', title: 'Experience Catalogue Manager', caption: 'Add new workshops, edit descriptions, adjust pricing and duration, and toggle active visibility.' })}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200 p-3 shadow-sm hover:border-terracotta/50 transition-all space-y-2.5"
              >
                <div className="rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border">
                  <img src="/presentation-assets/mudbrew-experience-manager.png" alt="Experience Manager" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium text-charcoal">Experience Catalogue Editor</h3>
                  <p className="text-[11px] text-stone-500 font-light mt-0.5">Create, schedule, price, and activate or deactivate masterclasses.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveLightbox({ src: '/presentation-assets/mudbrew-operating-hours.png', title: 'Schedule, Capacity & Closures', caption: 'Configure weekday and weekend hours, table slot capacities, advance notice rules, and blackout dates.' })}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200 p-3 shadow-sm hover:border-terracotta/50 transition-all space-y-2.5"
              >
                <div className="rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border">
                  <img src="/presentation-assets/mudbrew-operating-hours.png" alt="Operating Hours" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium text-charcoal">Hours, Rules &amp; Blackouts</h3>
                  <p className="text-[11px] text-stone-500 font-light mt-0.5">Set capacity limits, blackout dates for private events, and export records to CSV.</p>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="font-semibold text-charcoal block">Internal Staff Notes</span>
                <span className="text-[11px] text-stone-500">Private host remarks saved per booking</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="font-semibold text-charcoal block">CSV Data Export</span>
                <span className="text-[11px] text-stone-500">Export guest records to Excel / Sheets</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="font-semibold text-charcoal block">Blackout Scheduling</span>
                <span className="text-[11px] text-stone-500">Block full days for private events or maintenance</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="font-semibold text-charcoal block">Zero Cloud Lock-in</span>
                <span className="text-[11px] text-stone-500">Self-contained SQLite storage with WAL speed</span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 8: BUSINESS VALUE & DISCUSSION */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 7 && (
          <div className="w-full max-w-5xl space-y-6 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-semibold">07 / Business Alignment</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">Designed around the way you work.</h2>
              <p className="text-stone-600 text-sm font-light">
                Built to elevate the MudBrew brand, streamline operations, and adapt to your practical café floor realities.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Platform Advantages */}
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
                <h3 className="font-serif text-lg font-medium text-charcoal">Potential Advantages for MudBrew</h3>
                <ul className="text-xs text-stone-600 space-y-3 font-light">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-terracotta text-base mt-0.5 shrink-0">check_circle</span>
                    <span><strong>Central Online Destination:</strong> One unified home for dining, pottery wheel sessions, RC crawling, and ordering portals.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-terracotta text-base mt-0.5 shrink-0">check_circle</span>
                    <span><strong>Reduced Phone Overhead:</strong> Automated seat calculations mean fewer phone inquiries during busy dining service.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-terracotta text-base mt-0.5 shrink-0">check_circle</span>
                    <span><strong>Predictable Staffing &amp; Prep:</strong> Clear visibility into upcoming party sizes and wheel session preps days in advance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-terracotta text-base mt-0.5 shrink-0">check_circle</span>
                    <span><strong>Brand Retention:</strong> Elegant custom styling that feels like an authentic extension of your physical sanctuary.</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Open Discovery Questions */}
              <div className="lg:col-span-6 bg-terracotta-soft/50 p-6 rounded-3xl border border-terracotta/30 space-y-4">
                <h3 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
                  <span className="material-symbols-outlined text-terracotta text-xl">forum</span>
                  <span>What we'd like to understand from you</span>
                </h3>
                <p className="text-xs text-stone-600 font-light">
                  Every café operates differently. We'd love your candid perspective on these core points:
                </p>

                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="p-3 bg-white/80 rounded-xl border border-stone-200/60 font-medium">
                    1. How do you currently manage table reservations and group walk-ins?
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-stone-200/60 font-medium">
                    2. Which workshops or activities do you actively offer or plan to introduce?
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-stone-200/60 font-medium">
                    3. Would online booking be convenient for your regular customers?
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-stone-200/60 font-medium">
                    4. What operational workflows or rules would you want tailored?
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-stone-200/60 font-medium">
                    5. What POS or messaging systems (e.g. WhatsApp) are you already using?
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE 9: CLOSING & NEXT STEPS */}
        {/* ----------------------------------------------------------------------- */}
        {currentSlide === 8 && (
          <div className="w-full max-w-4xl text-center space-y-8 animate-fadeIn">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-terracotta font-semibold">
                <span>08 / Partnership</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal">
                Let's shape the right experience for MudBrew.
              </h2>
              <p className="text-stone-600 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
                Thank you for reviewing this demonstration. Our team is ready to adapt this foundation to your exact operating requirements.
              </p>
            </div>

            {/* 3 Clear Next Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <span className="font-serif text-2xl text-terracotta font-bold block">1</span>
                <h3 className="font-serif text-base font-medium text-charcoal">Discovery &amp; Review</h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Understand your floor capacities, current reservation methods, and preferred communication channels.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <span className="font-serif text-2xl text-terracotta font-bold block">2</span>
                <h3 className="font-serif text-base font-medium text-charcoal">Scope &amp; Customization</h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Calibrate your approved experience catalogue, menu highlights, operating rules, and staff permissions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <span className="font-serif text-2xl text-terracotta font-bold block">3</span>
                <h3 className="font-serif text-base font-medium text-charcoal">Deployment &amp; Launch</h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Provide a clear proposal covering hosting, domain setup, staff training, and ongoing support.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={() => openLive('/')}
                className="px-7 py-3.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs uppercase tracking-wider font-medium flex items-center gap-2 shadow-sm"
              >
                <span>Launch Live Website Demo</span>
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </button>

              <button
                onClick={restart}
                className="px-6 py-3.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors text-xs uppercase tracking-wider font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>Restart Presentation</span>
              </button>
            </div>

            <div className="pt-8 border-t border-stone-200/60 flex flex-col items-center gap-1.5 text-xs text-stone-400">
              <div className="flex items-center gap-2 text-stone-500 font-medium">
                <span className="font-serif">The MudBrew Café</span>
                <span>×</span>
                <span className="font-semibold tracking-wide">Webinko Digital Agency</span>
              </div>
              <p className="italic font-light">Created with care by Webinko.</p>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* PRESENTATION FOOTER CONTROLS */}
      {/* ========================================================================= */}
      <footer className="relative z-20 bg-linen/95 backdrop-blur-md border-t border-stone-200/70 px-6 py-4 flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-xs uppercase tracking-wider font-medium text-charcoal transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span className="hidden sm:inline">Previous Slide</span>
        </button>

        {/* Slide Progress Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-terracotta' : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
              title={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next / Restart Button */}
        {currentSlide < totalSlides - 1 ? (
          <button
            onClick={nextSlide}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-charcoal text-white hover:bg-terracotta text-xs uppercase tracking-wider font-medium transition-all shadow-sm"
          >
            <span className="hidden sm:inline">Next Slide</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={restart}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-terracotta text-white hover:bg-terracotta-dark text-xs uppercase tracking-wider font-medium transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Restart</span>
          </button>
        )}
      </footer>

      {/* ========================================================================= */}
      {/* REUSABLE SCREENSHOT LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 bg-charcoal/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-5xl w-full border border-stone-200 shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Lightbox Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h4 className="font-serif text-base font-medium text-charcoal">{activeLightbox.title}</h4>
                {activeLightbox.caption && (
                  <p className="text-xs text-stone-500 font-light mt-0.5">{activeLightbox.caption}</p>
                )}
              </div>
              <button
                onClick={() => setActiveLightbox(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-charcoal transition-colors"
                title="Close Lightbox (Esc)"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Lightbox Image Viewport */}
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-stone-100/40">
              <img
                src={activeLightbox.src}
                alt={activeLightbox.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-stone-200/60"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

