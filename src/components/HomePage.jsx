import React, { useState } from 'react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    experience: 'Pottery Wheel Session (Tandem / Solo)'
  });

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    alert('Inquiry received. The MudBrew concierge will confirm your slot shortly.');
  };

  return (
    <div className="bg-linen text-charcoal min-h-screen">
      {/* Streamlined, Minimalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-linen/85 backdrop-blur-md border-b border-stone-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Brand Mark */}
          <a className="flex items-center gap-3.5 group" href="#">
            <img
              alt="The MudBrew"
              className="w-9 h-9 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
              src="/logo.png"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-tight text-charcoal font-medium">The MudBrew</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-sans -mt-0.5">Studio &amp; Cafe</span>
            </div>
          </a>

          {/* Minimal Navigation Links */}
          <nav className="hidden md:flex items-center space-x-9 text-xs uppercase tracking-[0.16em] text-stone-600 font-medium">
            <a className="hover:text-terracotta transition-colors duration-200" href="#studio">Studio</a>
            <a className="hover:text-terracotta transition-colors duration-200" href="#arena">RC Arena</a>
            <a className="hover:text-terracotta transition-colors duration-200" href="#menu">Cafe &amp; Taste</a>
            <a className="hover:text-terracotta transition-colors duration-200" href="#order">Delivery</a>
            <a className="hover:text-terracotta transition-colors duration-200" href="#visit">Visit</a>
          </nav>

          {/* Understated Action */}
          <div className="flex items-center gap-4">
            <a
              className="inline-flex items-center px-4 py-2 rounded-full border border-charcoal/20 text-xs tracking-wider uppercase text-charcoal hover:bg-charcoal hover:text-white transition-all duration-200 font-medium"
              href="#visit"
            >
              Reserve Table
            </a>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* HERO SECTION: Architectural & Editorial Balance */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-stone-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                <span>Courtyard 04 • Arts Quarter</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] tracking-[-0.02em] text-charcoal">
                Where clay meets cuisine <span className="italic text-terracotta">&amp;</span> tactile play.
              </h1>
              <p className="text-stone-600 text-base lg:text-lg font-light leading-relaxed max-w-lg">
                An intentional sanctuary combining artisanal wheel throwing, miniature indoor terrain crawling, and thoughtful culinary craft under warm acoustic arches.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-6 text-sm">
                <a
                  className="px-6 py-3 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors duration-300 font-medium tracking-wide"
                  href="#studio"
                >
                  Explore Experiences
                </a>
                <a
                  className="inline-flex items-center gap-2 text-stone-700 hover:text-terracotta font-medium tracking-wide transition-colors"
                  href="#order"
                >
                  <span>Order Online</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
              <div className="pt-6 border-t border-stone-200/60 flex items-center gap-10 text-stone-500 text-xs tracking-wide">
                <div>
                  <span className="font-serif text-lg text-charcoal font-medium block">12</span>
                  <span>Shimpo Wheels</span>
                </div>
                <div>
                  <span className="font-serif text-lg text-charcoal font-medium block">40 ft</span>
                  <span>Micro Rock Crawl</span>
                </div>
                <div>
                  <span className="font-serif text-lg text-charcoal font-medium block">100%</span>
                  <span>Pet-Friendly Patio</span>
                </div>
              </div>
            </div>

            {/* Hero Imagery: Clean Duo Grid */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-7">
                <div className="overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/50 shadow-sm aspect-[3/4]">
                  <img
                    alt="The MudBrew Arched Terracotta Installation"
                    className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700 hover:scale-102"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6PO9WinsNctTaX4jRNeLkpSPtVqeYQuHSuWQYKJ9L0sscSblu2EWjvnrql7F9rDtHTy6_Mtjog5RMIXefzTRfMpmmqwr1rT0lAIATpL6s3qTTyCxOnwIIvhKSq3Hxm5mDimPJt4iTPUq_IoYBvr_9VUdSTa8m2xlnfD149-uucu6dofX7oVxAXq0L08D8V7jXzZJPBuMGXKpayOXOuwks0LRBRG1RA1z03-AwxxMtZdtzICvn7AFhXtlVbdggA2BBvTU"
                  />
                </div>
              </div>
              <div className="col-span-5 space-y-4">
                <div className="overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/50 shadow-sm aspect-square">
                  <img
                    alt="Handmade Pottery Centering Clay"
                    className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDicshTFLwv7Q58TVRguJBVt6l_16QCsNJOPt2OkDI0HxnK03p-ulo2Sr6gWE814LyvAM5lB9ReAtqL5tJCZ2uwmZPa97pGHinxTQoEt-BADGkd_uKlIk-81CvKEg3zpJYvtSXkVu5Gz-HrfJa2pMDmbF8kmkZX7JupL-g2ejXrZWSKH2KkmzWvnwJJXtpz549IPPlExxycqvdQHYjVjK5av7A-bt0vsnkMItKyFDM04hhbQtiohc36jA4Dw1aYuiXu5C8"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/50 shadow-sm aspect-[4/5]">
                  <img
                    alt="Garden Stucco &amp; Tropical Foliage"
                    className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6Iph6d2sSB6gGy7lJvn50OBzu-mOfPG8J-zvKbc9ZHzaqBdzrY8B5FXJvCBWFYwsF11-M3aRtY-xGWQV8b8Ywzbq8n6XDr7iTJFMaG17krvUOf1TA4RVn91_tBEFtEjEml8rMyrnHzwDn5fqHNume4AU6Zgh18PMNJPFKDRCA1y1SN0mVvgT0FmQBU5eJa07QPZTQUMECQchc_ArqCTfS6J2bEn74rKaBpzehCNIqpz_QmKblSjxivwAPHlB1gfbiOtY"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: POTTERY STUDIO (Lookbook Feature 01) */}
        <section className="py-20 lg:py-24 border-t border-stone-200/60 scroll-mt-20" id="studio">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-medium block mb-2">01 / Craft</span>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight text-charcoal">The Mud Studio &amp; Kiln</h2>
              </div>
              <p className="text-stone-600 text-sm max-w-md font-light leading-relaxed">
                Raw terracotta wheel throwing and mindful hand-building. Every finished ceramic piece is bisque fired, clear glazed, and ready for table use.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border border-stone-200/60 aspect-[4/5] bg-stone-100">
                  <img
                    alt="Raw clay on wheel"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDicshTFLwv7Q58TVRguJBVt6l_16QCsNJOPt2OkDI0HxnK03p-ulo2Sr6gWE814LyvAM5lB9ReAtqL5tJCZ2uwmZPa97pGHinxTQoEt-BADGkd_uKlIk-81CvKEg3zpJYvtSXkVu5Gz-HrfJa2pMDmbF8kmkZX7JupL-g2ejXrZWSKH2KkmzWvnwJJXtpz549IPPlExxycqvdQHYjVjK5av7A-bt0vsnkMItKyFDM04hhbQtiohc36jA4Dw1aYuiXu5C8"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-stone-200/60 aspect-[4/5] bg-stone-100 -mt-6 sm:-mt-10">
                  <img
                    alt="Curated gallery alcoves and electric wheels"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPi_gKRgXjK9FkjlAW5Tf0qagqZCCQ4cHskS0Zxe92bYyQ0Zc0VPlelw7Ar8DfOW9AZ9Vkh24Rx6v0DtWdnWsZswwDvaPRq0SSzQRTJR1PMP9QnNbv_C5Jscxk1o4vyzcX2D9JYZ8Hnv2G217XGDtkboBtWGbGdMW2cddtoaniOaZ4ao1mCB7Q2tNtAAxIb48dlQefzIoP-bh2L8Y_xJDy9WbOXv0biT-sWfA7V6yJ7d1HdpoB3YXdQ6ytJxxEzQi2458"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-normal text-charcoal">Tandem Wheel Sessions</h3>
                  <p className="text-stone-600 text-sm leading-relaxed font-light">
                    Designed for couples, curious beginners, and solo retreat. Guided step-by-step from centering the lump to opening, pulling, and trimming walls.
                  </p>
                </div>
                <div className="py-4 border-y border-stone-200/60 space-y-3 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-charcoal font-medium">Session Duration</span>
                    <span>75 Minutes Guided + Firing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal font-medium">Included Clay</span>
                    <span>1.5 kg Fine Earthenware</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal font-medium">Glaze Pickup</span>
                    <span>Food-safe within 10–14 days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-serif text-lg text-charcoal">
                    From $35 <span className="text-xs font-sans text-stone-500 font-normal">/ person</span>
                  </span>
                  <a
                    className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-terracotta hover:text-charcoal transition-colors"
                    href="#visit"
                  >
                    <span>Book Wheel Slot</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: RC ARENA (Lookbook Feature 02) */}
        <section className="py-20 lg:py-24 border-t border-stone-200/60 scroll-mt-20 bg-stone-50/50" id="arena">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-medium block mb-2">02 / Mechanical</span>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight text-charcoal">Indoor Miniature RC Terrain</h2>
              </div>
              <p className="text-stone-600 text-sm max-w-md font-light leading-relaxed">
                Unplugged precision. High-torque scale 1:18 and 1:24 crawlers and hydraulic micro-excavators across layered shale, sand bridges, and obstacles.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-normal text-charcoal">Tactile Micro Terrain</h3>
                  <p className="text-stone-600 text-sm leading-relaxed font-light">
                    Positioned alongside the cafe arches, guests of all ages take command of scaled rock crawlers and construction haulers. Challenge personal lap timers or navigate rocky passes while sipping cold brew.
                  </p>
                </div>
                <div className="py-4 border-y border-stone-200/60 space-y-3 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-charcoal font-medium">Fleet</span>
                    <span>Proportional 2.4GHz 4WD Crawlers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal font-medium">Course Run</span>
                    <span>30-minute open arena access</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal font-medium">Suitability</span>
                    <span>Beginners to enthusiasts, all ages</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-serif text-lg text-charcoal">
                    $15 <span className="text-xs font-sans text-stone-500 font-normal">/ 30 min pass</span>
                  </span>
                  <a
                    className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-terracotta hover:text-charcoal transition-colors"
                    href="#visit"
                  >
                    <span>Reserve Track Time</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="rounded-2xl overflow-hidden border border-stone-200/60 aspect-[16/10] bg-stone-100 shadow-sm">
                  <img
                    alt="Indoor scale RC track with trucks and excavators"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL7L4GxTG06YzB0lD_cEpeecCTCBHulm9Na5RTIbufcsMbBWRYSKfp3CJigIQghC6kyLXhX0p_roH8FMPBAJiOiSeuoIpcJeGus7HcSvMBs3XXvO7l-0AQffKgZVLZz6Ve9bvIyuAS_0t9dlIB7oiIf17ygyHvdMYGBwNO43BcsoGkbZg1o6gRQkZRULg5AgefvzaSuAqYCAyS6c96gveSsrFSNHzCYfYeSh0HxlhPwmnBJL0TCn-McFP8jym0pWetWFU"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: ARCHITECTURE & PATIO (Lookbook Feature 03) */}
        <section className="py-20 lg:py-24 border-t border-stone-200/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-medium block">03 / Atmosphere</span>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight text-charcoal">
                  Curved Plaster, Terracotta &amp; Greenery
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Designed as an acoustic retreat, our interior combines fluted emerald booths, woven wicker lanterns, and backlit earth arches. Outside, curved plaster banquettes weave through tropical calathea and white river stones.
                </p>
                <div className="pt-2 flex items-center gap-6 text-xs text-stone-500 uppercase tracking-widest font-medium">
                  <span>• Pet-Friendly Garden</span>
                  <span>• Natural Daylighting</span>
                  <span>• Slow Paced</span>
                </div>
              </div>
              <div className="lg:col-span-6 grid grid-cols-12 gap-4">
                <div className="col-span-7 rounded-2xl overflow-hidden border border-stone-200/60 aspect-[4/5] bg-stone-100">
                  <img
                    alt="Dining alcove with backlit terracotta acoustics"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWCFvqCq65exm5qNvMeJZVw2SEHSqP8BdsYOXIgElupYICcDVSUfldP7jZMLFGL5NYt3qXjRFYYilHG1aXVVW6dx4DLxzLtY-AgxVpBj4yvrDfniiKSknTie40N43Z_4j2WexTjcqfu1EdYJP5Ay1bJXYiY8Pxb0eY_htfJa_Us0Cm052mLbcueb-jqpwaFXA2YaNV8-H8yOXj-UsIPIKUNTIzNC8BlyeKpkMfMTY-qCL5OAy1mj9ah_fzlS75ATPCySc"
                  />
                </div>
                <div className="col-span-5 rounded-2xl overflow-hidden border border-stone-200/60 aspect-[4/5] bg-stone-100 mt-6">
                  <img
                    alt="Arched window facade illuminated at night"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuChsDg3PORy1a4yvsYYBAFc19z2_jV_yNaHsL53a2sUsXfPBEINRwcvW4saVzpBHr5AmEA_-Xq1Itvrk_in0L_xIl3p56a5uUyL3S8E3JCp0aaJ48og0PT9tOVO0AuBFL_4NnKiZ11XHIjfgUQ25-SKY-gNb4SrBc4kdxBAvelMszsyCYSfskmShG_8K-_mmRTnYlOhAmnjwGNiAw31SP4A7pZlJWW_m4jqg0vP7qS4DMoG8k168Du_um1i813c64XGCQ0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHEF'S GOURMET HIGHLIGHTS (Taste) */}
        <section className="py-20 lg:py-24 border-t border-stone-200/60 scroll-mt-20" id="menu">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
              <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-medium">04 / Kitchen &amp; Brews</span>
              <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight text-charcoal">Plates from the Studio Pantry</h2>
              <p className="text-stone-600 text-sm font-light leading-relaxed">
                Wholesome café dining and slow pourovers served in custom hand-thrown tableware.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Dish 1 */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/60 space-y-4 hover:border-stone-300 transition-colors duration-200">
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <img
                    alt="Ocean Seafood Goblet"
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy2CU053LIkEAvbBw7UeG8asyexQWvLGEny9omenli817NUjGoqfy0GblQp6FqIseQi-J9z54xN5rVpVvUbPwKmscRYdq1u0G5ccpW7Z7_8WkVEpyfUYSoSYcXqfeqvEsccTKBLSjYjjriUuPA01mTFc-Fta3_73Bhh87D7oIOy4w19s2gPX-QbEsmphgN9XP7MKahgtN1vNYDtMfY9ZdE0_bpFMAOas0arlpTta2tvUHfqKt7b7-g_p1VoQebxrTKnWc"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-lg font-normal text-charcoal">Seafood Stem Goblet</h3>
                    <span className="font-serif text-stone-700 text-base">$16</span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    Poached jumbo prawns, crisp green apples, shredded romaine, black olives, and house chili vinaigrette.
                  </p>
                </div>
              </div>

              {/* Dish 2 */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/60 space-y-4 hover:border-stone-300 transition-colors duration-200">
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <img
                    alt="Charred Tuscan Salad Platter"
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaC8fqYqoqEU4aPz_AxHstODJvbIHt4Xhj2kfCn_nHUJgUKzqhy8ZDqRhobjb4-DvonOtp2fJ9GuLW5xVuLvZbQTUg3KP8zi4MebNB7wcKtdnd1zYMsDVh7U_rGtwCizGqmYj1DLLQOUnxyAePhIid_WcQkQoJRMf8SLGJRaMCDjGo_3N_htZwkuFLdK6FMJz-WfxMiyWJhVu6RBzR9erhaMoPVddHfjXXdyGMlULU1XD2VkSCWwrCjl3aMgeKSqBB3WU"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-lg font-normal text-charcoal">Tuscan Charred Salad</h3>
                    <span className="font-serif text-stone-700 text-base">$14</span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    Herb roasted chicken fillets, blistered campari tomatoes, sourdough crisps, and shaved parmesan.
                  </p>
                </div>
              </div>

              {/* Dish 3 */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/60 space-y-4 hover:border-stone-300 transition-colors duration-200">
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <img
                    alt="Dining Lounge &amp; Artisan Coffee"
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWCFvqCq65exm5qNvMeJZVw2SEHSqP8BdsYOXIgElupYICcDVSUfldP7jZMLFGL5NYt3qXjRFYYilHG1aXVVW6dx4DLxzLtY-AgxVpBj4yvrDfniiKSknTie40N43Z_4j2WexTjcqfu1EdYJP5Ay1bJXYiY8Pxb0eY_htfJa_Us0Cm052mLbcueb-jqpwaFXA2YaNV8-H8yOXj-UsIPIKUNTIzNC8BlyeKpkMfMTY-qCL5OAy1mj9ah_fzlS75ATPCySc"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-lg font-normal text-charcoal">Smoked Clay Pour-Over</h3>
                    <span className="font-serif text-stone-700 text-base">$7</span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    Single-origin beans filtered through unglazed earthenware drippers, bringing subtle cacao and raw sugar notes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <a
                className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium text-stone-600 hover:text-terracotta transition-colors"
                href="#order"
              >
                <span>View Full Cafe Menu for Takeout</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION: ORDER ONLINE / DELIVERY */}
        <section className="py-20 lg:py-24 border-t border-stone-200/60 scroll-mt-20 bg-stone-50/40" id="order">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
              <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-medium">05 / Takeaway</span>
              <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight text-charcoal">Delivery &amp; Partner Portals</h2>
              <p className="text-stone-600 text-sm font-light leading-relaxed">
                Order fresh meals and bottled cold brews directly to your door through verified partners.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* 1. Swiggy Card */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/70 flex flex-col justify-between hover:border-stone-400 transition-all duration-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-medium text-charcoal tracking-tight">Swiggy</span>
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium px-2 py-0.5 rounded-full bg-stone-100">Live Kitchen</span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    Superfast regional courier delivery, real-time live map tracking, and eco-friendly compostable containers.
                  </p>
                  <div className="text-[11px] text-stone-600 space-y-1">
                    <p>• Avg. dispatch: 25–35 min</p>
                    <p>• Full cafe beverages &amp; plates</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    className="w-full py-2.5 rounded-lg border border-stone-300 text-xs uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-white hover:border-charcoal transition-all font-medium flex items-center justify-center gap-1.5"
                    onClick={() => alert('Connecting to The MudBrew listing on Swiggy...')}
                  >
                    <span>Order on Swiggy</span>
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </button>
                </div>
              </div>

              {/* 2. Zomato Card */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/70 flex flex-col justify-between hover:border-stone-400 transition-all duration-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-medium text-charcoal tracking-tight">Zomato</span>
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium px-2 py-0.5 rounded-full bg-stone-100">4.8 Rating</span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    Browse detailed patron reviews, dish galleries, seasonal specials, and seamless contactless checkout.
                  </p>
                  <div className="text-[11px] text-stone-600 space-y-1">
                    <p>• Gold privileges applicable</p>
                    <p>• Direct kitchen dispatch</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    className="w-full py-2.5 rounded-lg border border-stone-300 text-xs uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-white hover:border-charcoal transition-all font-medium flex items-center justify-center gap-1.5"
                    onClick={() => alert('Connecting to The MudBrew profile on Zomato...')}
                  >
                    <span>Order on Zomato</span>
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </button>
                </div>
              </div>

              {/* 3. Magicpin Card */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/70 flex flex-col justify-between hover:border-stone-400 transition-all duration-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-medium text-charcoal tracking-tight">Magicpin</span>
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium px-2 py-0.5 rounded-full bg-stone-100">Rewards</span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    Local savings vouchers, points-based cashback, and verified perks for takeaway pickups and table dining.
                  </p>
                  <div className="text-[11px] text-stone-600 space-y-1">
                    <p>• Up to 20% points reward</p>
                    <p>• Curbside pickup ready</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    className="w-full py-2.5 rounded-lg border border-stone-300 text-xs uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-white hover:border-charcoal transition-all font-medium flex items-center justify-center gap-1.5"
                    onClick={() => alert('Searching MudBrew vouchers on Magicpin...')}
                  >
                    <span>Explore on Magicpin</span>
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-stone-400 text-[11px] mt-8">
              In-app links route to regional radius settings. Direct curbside pickup at Courtyard 4 is also welcomed daily.
            </p>
          </div>
        </section>

        {/* SECTION: VISIT & INQUIRIES */}
        <section className="py-20 lg:py-24 border-t border-stone-200/60 scroll-mt-20" id="visit">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Hours & Details */}
              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-medium block">06 / Sanctuary</span>
                  <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight text-charcoal">Visiting &amp; Schedule</h2>
                  <p className="text-stone-600 text-sm font-light leading-relaxed">
                    Walk-ins are welcomed throughout the day for our dining garden, specialty pour-overs, and casual RC course runs. For guided wheel sessions, booking ensures your Shimpo wheel is prepped.
                  </p>
                </div>
                <div className="space-y-4 pt-2 border-t border-stone-200/60">
                  <div className="flex justify-between py-2 text-xs border-b border-stone-200/40">
                    <span className="text-charcoal font-medium">Monday — Friday</span>
                    <span className="text-stone-600">11:00 AM – 11:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2 text-xs border-b border-stone-200/40">
                    <span className="text-charcoal font-medium">Saturday &amp; Sunday</span>
                    <span className="text-stone-600">10:30 AM – 11:30 PM</span>
                  </div>
                  <div className="flex justify-between py-2 text-xs border-b border-stone-200/40">
                    <span className="text-charcoal font-medium">Guided Pottery Slots</span>
                    <span className="text-stone-600">Daily: 11:30 AM, 3:00 PM, 6:30 PM</span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 space-y-1">
                  <p className="text-charcoal font-medium">428 Artisan Kiln Lane, Courtyard 4</p>
                  <p>Arts Quarter • Valet parking available on arrival</p>
                  <p className="pt-2">
                    <a className="text-terracotta hover:underline" href="mailto:hello@themudbrewcafe.com">
                      hello@themudbrewcafe.com
                    </a>{' '}
                    • +1 (555) 782-2739
                  </p>
                </div>
              </div>

              {/* Minimal Inquiry Form */}
              <div className="lg:col-span-6 bg-white p-8 rounded-2xl border border-stone-200/70 shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-normal text-charcoal">Studio &amp; Table Inquiry</h3>
                  <p className="text-stone-500 text-xs font-light">Let us know when you would like to visit.</p>
                </div>
                <form className="space-y-4" onSubmit={handleInquirySubmit}>
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">Name</label>
                    <input
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50/60 border border-stone-200 rounded-lg text-charcoal focus:bg-white focus:outline-none focus:border-charcoal"
                      placeholder="Elena Rostova"
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">Contact</label>
                    <input
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50/60 border border-stone-200 rounded-lg text-charcoal focus:bg-white focus:outline-none focus:border-charcoal"
                      placeholder="Phone or email"
                      required
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">Experience</label>
                    <select
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50/60 border border-stone-200 rounded-lg text-charcoal focus:bg-white focus:outline-none focus:border-charcoal"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    >
                      <option>Pottery Wheel Session (Tandem / Solo)</option>
                      <option>Miniature RC Track Reservation</option>
                      <option>Garden Cafe Table Dining</option>
                      <option>Private Gathering or Group Workshop</option>
                    </select>
                  </div>
                  <button
                    className="w-full py-3 mt-2 rounded-lg bg-charcoal text-white text-xs uppercase tracking-wider font-medium hover:bg-terracotta transition-colors duration-200"
                    type="submit"
                  >
                    Request Slot
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MINIMALIST FOOTER */}
      <footer className="border-t border-stone-200/60 py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img alt="The MudBrew" className="w-6 h-6 rounded-full object-cover opacity-80" src="/logo.png" />
            <span className="font-serif text-charcoal text-sm font-medium">The MudBrew Cafe</span>
            <span className="text-stone-300">|</span>
            <span>Arts Quarter Studio</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-wider">
            <a className="hover:text-charcoal transition-colors" href="#studio">Studio</a>
            <a className="hover:text-charcoal transition-colors" href="#arena">Arena</a>
            <a className="hover:text-charcoal transition-colors" href="#menu">Kitchen</a>
            <a className="hover:text-charcoal transition-colors" href="#order">Delivery</a>
            <a className="hover:text-charcoal transition-colors" href="https://instagram.com" rel="noopener noreferrer" target="_blank">
              Instagram
            </a>
          </div>
          <p className="text-stone-400 text-[11px]">
            © 2025 The MudBrew Cafe. Handcrafted slow living.
          </p>
        </div>
      </footer>
    </div>
  );
}
