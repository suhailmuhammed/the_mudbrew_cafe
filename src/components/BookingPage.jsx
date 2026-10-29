import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Category: 'table' or 'experience'
  const initialCategory = searchParams.get('category') === 'experience' ? 'experience' : 'table';
  const initialExpId = searchParams.get('experienceId') || '';

  const [category, setCategory] = useState(initialCategory);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    date: getTomorrowDateString(),
    timeSlot: '',
    guestCount: 2,
    specialRequests: '',
    experienceId: initialExpId
  });

  // Experiences Catalogue from Backend
  const [experiences, setExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  // Availability State
  const [availability, setAvailability] = useState({
    loading: false,
    available: true,
    reason: '',
    slots: []
  });

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Public Settings (advance booking bounds, etc.)
  const [settings, setSettings] = useState({
    maxTableGuests: 10,
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    currency: '$'
  });

  function getTomorrowDateString() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  function getMaxDateString(daysAhead = 30) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  // Load Public Settings
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  // Load Active Experiences from Backend
  useEffect(() => {
    setLoadingExperiences(true);
    fetch('/api/experiences')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExperiences(data);
          // Auto select first experience if not already set
          if (data.length > 0 && !formData.experienceId) {
            setFormData(prev => ({ ...prev, experienceId: String(data[0].id) }));
          }
        }
      })
      .catch(err => {
        console.error('Failed to load experiences:', err);
      })
      .finally(() => {
        setLoadingExperiences(false);
      });
  }, []);

  // Query Availability whenever date, type, experienceId, or guestCount changes
  useEffect(() => {
    if (!formData.date) return;

    if (category === 'experience' && !formData.experienceId) return;

    setAvailability(prev => ({ ...prev, loading: true, reason: '' }));

    const queryParams = new URLSearchParams({
      date: formData.date,
      type: category,
      guests: String(formData.guestCount)
    });

    if (category === 'experience' && formData.experienceId) {
      queryParams.append('experienceId', formData.experienceId);
    }

    fetch(`/api/availability?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAvailability({
            loading: false,
            available: false,
            reason: data.error,
            slots: []
          });
        } else {
          setAvailability({
            loading: false,
            available: data.available,
            reason: data.reason || '',
            slots: data.slots || []
          });

          // Reset selected timeSlot if it is no longer valid or available
          if (formData.timeSlot) {
            const currentSlotValid = (data.slots || []).some(
              s => s.time === formData.timeSlot && s.isAvailable
            );
            if (!currentSlotValid) {
              setFormData(prev => ({ ...prev, timeSlot: '' }));
            }
          }
        }
      })
      .catch(err => {
        setAvailability({
          loading: false,
          available: false,
          reason: 'Unable to check availability at this moment. Please check your connection.',
          slots: []
        });
      });
  }, [category, formData.date, formData.experienceId, formData.guestCount]);

  // Selected Experience Object
  const selectedExperience = experiences.find(e => String(e.id) === String(formData.experienceId));

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      setSubmitError('Please provide your full name.');
      return;
    }
    if (!formData.mobile.trim()) {
      setSubmitError('Please provide a valid mobile number for booking confirmation.');
      return;
    }
    if (!formData.date) {
      setSubmitError('Please select a reservation date.');
      return;
    }
    if (!formData.timeSlot) {
      setSubmitError('Please select an available time slot.');
      return;
    }
    if (category === 'experience' && !formData.experienceId) {
      setSubmitError('Please choose an experience or studio session.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type: category,
        customerName: formData.customerName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || undefined,
        date: formData.date,
        timeSlot: formData.timeSlot,
        guestCount: formData.guestCount,
        specialRequests: formData.specialRequests.trim() || undefined,
        experienceId: category === 'experience' ? parseInt(formData.experienceId, 10) : undefined
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit reservation. Please try another slot.');
      }

      // Successful reservation: navigate to confirmation view
      navigate(`/booking/${data.booking.reference}`, {
        state: {
          booking: data.booking,
          notifications: data.notifications,
          message: data.message
        }
      });
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linen text-charcoal flex flex-col selection:bg-terracotta-soft selection:text-terracotta">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-linen/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.png"
              alt="The MudBrew"
              className="w-9 h-9 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-95"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-tight text-charcoal font-medium">The MudBrew</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-sans -mt-0.5">Reservations</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-600 hover:text-terracotta transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Sanctuary</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Booking Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 lg:py-14">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-stone-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
            <span>Slow Craft • Courtyard 04</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight">
            Reserve Your Table or Craft Slot
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
            Reserve an intimate table in our sunlit acoustic sanctuary, or enroll in a curated wheel-throwing and sensory coffee masterclass.
          </p>
        </div>

        {/* Category Toggle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setCategory('table');
              setFormData(prev => ({ ...prev, timeSlot: '' }));
            }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
              category === 'table'
                ? 'bg-white border-terracotta shadow-sm ring-1 ring-terracotta/30'
                : 'bg-stone-50/70 border-stone-200 hover:border-stone-300 hover:bg-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                category === 'table' ? 'bg-terracotta text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              <span className="material-symbols-outlined text-xl">restaurant</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-medium text-charcoal">Table Dining Sanctuary</span>
                {category === 'table' && (
                  <span className="text-[10px] uppercase font-semibold bg-terracotta-soft text-terracotta px-2 py-0.5 rounded-full tracking-wider">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                Slow-crafted breakfast, artisanal kitchen bites, single-origin pour-overs &amp; courtyard garden seating.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory('experience');
              setFormData(prev => ({ ...prev, timeSlot: '' }));
            }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
              category === 'experience'
                ? 'bg-white border-terracotta shadow-sm ring-1 ring-terracotta/30'
                : 'bg-stone-50/70 border-stone-200 hover:border-stone-300 hover:bg-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                category === 'experience' ? 'bg-terracotta text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              <span className="material-symbols-outlined text-xl">local_cafe</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-medium text-charcoal">Studio &amp; Brew Experience</span>
                {category === 'experience' && (
                  <span className="text-[10px] uppercase font-semibold bg-terracotta-soft text-terracotta px-2 py-0.5 rounded-full tracking-wider">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                Ceramic wheel throwing, barista pour-over cupping, and miniature RC crawler terrain sessions.
              </p>
            </div>
          </button>
        </div>

        {/* Booking Form Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-10">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* CATEGORY B: EXPERIENCE SELECTION */}
            {category === 'experience' && (
              <div className="space-y-4 pb-6 border-b border-stone-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Choose Configured Experience
                  </label>
                  <span className="text-[11px] text-stone-400">Only verified MudBrew studio sessions</span>
                </div>

                {loadingExperiences ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    Loading verified experience catalogue...
                  </div>
                ) : experiences.length === 0 ? (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs text-center">
                    No active studio experiences currently scheduled. Please check back soon or book a dining table.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {experiences.map(exp => {
                      const isSelected = String(formData.experienceId) === String(exp.id);
                      return (
                        <div
                          key={exp.id}
                          onClick={() => setFormData(prev => ({ ...prev, experienceId: String(exp.id), timeSlot: '' }))}
                          className={`cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between ${
                            isSelected
                              ? 'border-terracotta bg-terracotta-soft/30 ring-1 ring-terracotta'
                              : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs text-terracotta font-medium mb-1.5">
                              <span>{settings.currency}{exp.price} / person</span>
                              <span className="text-stone-400 text-[10px]">{exp.duration_mins} mins</span>
                            </div>
                            <h3 className="font-serif text-sm font-medium text-charcoal leading-snug mb-1">
                              {exp.name}
                            </h3>
                            <p className="text-[11px] text-stone-500 line-clamp-3 font-light leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-stone-200/50 flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider">
                            <span>Max {exp.max_participants} seats</span>
                            <span className={isSelected ? 'text-terracotta font-semibold' : 'text-stone-400'}>
                              {isSelected ? 'Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedExperience && (
                  <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-600 flex items-center gap-3">
                    <span className="material-symbols-outlined text-terracotta text-lg">info</span>
                    <div>
                      <span className="font-medium text-charcoal">{selectedExperience.name}</span>: Session duration is {selectedExperience.duration_mins} minutes. Materials and tastings included.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RESERVATION PARAMETERS: Date, Guests, Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
              {/* Date Input */}
              <div className="sm:col-span-6 space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Reservation Date
                </label>
                <input
                  type="date"
                  min={getTodayDateString()}
                  max={getMaxDateString(settings.maxAdvanceDays)}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-3 text-sm bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta transition-colors"
                />
                <span className="text-[11px] text-stone-400 block">
                  Up to {settings.maxAdvanceDays} days in advance
                </span>
              </div>

              {/* Guest / Participant Count */}
              <div className="sm:col-span-6 space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  {category === 'table' ? 'Number of Guests' : 'Number of Participants'}
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-3 text-sm bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta transition-colors"
                  >
                    {Array.from(
                      { length: category === 'table' ? settings.maxTableGuests : (selectedExperience?.max_participants || 8) },
                      (_, i) => i + 1
                    ).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? (category === 'table' ? 'Guest' : 'Participant') : (category === 'table' ? 'Guests' : 'Participants')}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] text-stone-400 block">
                  {category === 'table'
                    ? `Max ${settings.maxTableGuests} guests per table reservation`
                    : `Max ${selectedExperience?.max_participants || 8} per session`}
                </span>
              </div>
            </div>

            {/* REAL-TIME TIME SLOTS SELECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Available Time Slots
                </label>
                {availability.loading && (
                  <span className="text-[11px] text-terracotta animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                    Checking real-time capacity...
                  </span>
                )}
              </div>

              {!availability.available && availability.reason ? (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-base text-stone-500 mt-0.5">event_busy</span>
                  <div>
                    <span className="font-medium text-charcoal">Unavailable Date: </span>
                    {availability.reason}
                  </div>
                </div>
              ) : availability.slots.length === 0 && !availability.loading ? (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-xs text-center">
                  No slots currently available for this date. Please select another date or contact our concierge.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availability.slots.map(slot => {
                    const isSelected = formData.timeSlot === slot.time;
                    const disabled = !slot.isAvailable;

                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={disabled}
                        onClick={() => setFormData({ ...formData, timeSlot: slot.time })}
                        className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          disabled
                            ? 'bg-stone-100 text-stone-400 border-stone-200/50 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-terracotta text-white border-terracotta shadow-sm scale-[1.02]'
                            : 'bg-stone-50/70 border-stone-200 text-charcoal hover:border-terracotta/50 hover:bg-white'
                        }`}
                      >
                        <div className="font-serif text-sm">{slot.time}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                          {disabled ? 'Booked' : `${slot.remainingCapacity} seats left`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CUSTOMER CONTACT INFORMATION */}
            <div className="space-y-6 pt-6 border-t border-stone-200/60">
              <h2 className="font-serif text-lg font-medium text-charcoal">Guest Details &amp; Contact</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Full Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Mobile Number <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-019-2834"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta"
                  />
                  <span className="text-[10px] text-stone-400">Used for reservation confirmation &amp; concierge updates</span>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. maya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Special Requests or Requirements <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      category === 'table'
                        ? 'Seating preference (patio garden / acoustic arch), dietary notes, celebrations, high chairs...'
                        : 'Any prior pottery experience, dietary restrictions for tasting flight, left-handed wheel setup...'
                    }
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* SUMMARY & SUBMISSION */}
            <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-500">
                <span className="text-charcoal font-medium">Selected Slot: </span>
                {formData.date ? formData.date : '—'} at {formData.timeSlot ? formData.timeSlot : '—'} • {formData.guestCount} {category === 'table' ? 'guests' : 'participants'}
              </div>

              <button
                type="submit"
                disabled={submitting || !formData.timeSlot || (!availability.available && availability.slots.length === 0)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-charcoal text-white hover:bg-terracotta disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-300 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Confirming with Concierge...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Reservation</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Studio Etiquette & Transparency note */}
        <div className="mt-8 text-center text-stone-400 text-xs space-y-1">
          <p>
            MudBrew reserves slots atomically to prevent double-booking. Cancellations welcomed with 2 hours advance notice.
          </p>
          <p>
            For private gatherings or groups of 10+, please contact our concierge team directly at +1 (555) 782-2739.
          </p>
        </div>
      </main>
    </div>
  );
}

