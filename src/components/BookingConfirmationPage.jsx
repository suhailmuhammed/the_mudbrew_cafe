import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

export default function BookingConfirmationPage() {
  const { ref } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [notifications, setNotifications] = useState(location.state?.notifications || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking && ref) {
      setLoading(true);
      fetch(`/api/bookings/${ref}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setBooking(data);
          }
        })
        .catch(err => {
          setError('Failed to fetch booking details. Please verify your reference number.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [ref]);

  const copyReference = () => {
    if (booking?.reference) {
      navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const downloadCalendarFile = () => {
    if (!booking) return;

    const summary = booking.type === 'experience'
      ? `The MudBrew Experience: ${booking.experienceName || 'Studio Session'}`
      : 'The MudBrew Cafe — Dining Reservation';

    const description = `Reservation at The MudBrew Cafe.\\nReference: ${booking.reference}\\nGuests: ${booking.guestCount}\\nCourtyard 4, Arts Quarter. Phone: +1 (555) 782-2739`;

    const cleanDate = booking.date.replace(/-/g, '');
    const cleanTime = booking.timeSlot.replace(':', '') + '00';
    const dtStart = `${cleanDate}T${cleanTime}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The MudBrew Cafe//Reservations//EN',
      'BEGIN:VEVENT',
      `UID:${booking.reference}@themudbrewcafe.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'LOCATION:428 Artisan Kiln Lane, Courtyard 4, Arts Quarter',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mudbrew-reservation-${booking.reference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-linen text-charcoal flex flex-col selection:bg-terracotta-soft selection:text-terracotta">
      {/* Header */}
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
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-sans -mt-0.5">Booking Details</span>
            </div>
          </Link>

          <Link
            to="/book"
            className="text-xs uppercase tracking-wider text-stone-600 hover:text-terracotta transition-colors font-medium"
          >
            New Reservation
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 lg:py-14">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-stone-500 text-sm font-light">Retrieving reservation status from sanctuary database...</p>
          </div>
        ) : error || !booking ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h1 className="font-serif text-2xl text-charcoal">Reservation Not Found</h1>
            <p className="text-stone-600 text-sm max-w-md mx-auto font-light leading-relaxed">
              {error || 'We could not locate a reservation matching this reference code. Please check your reference or contact our concierge.'}
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link
                to="/book"
                className="px-6 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs uppercase tracking-wider font-medium"
              >
                Make a Reservation
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 rounded-full border border-stone-300 text-charcoal hover:bg-stone-50 transition-colors text-xs uppercase tracking-wider font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Announcement Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : booking.status === 'pending'
                  ? 'bg-amber-50/80 border-amber-200'
                  : booking.status === 'rejected'
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-stone-100 border-stone-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    booking.status === 'confirmed'
                      ? 'bg-emerald-600 text-white'
                      : booking.status === 'pending'
                      ? 'bg-amber-600 text-white'
                      : booking.status === 'rejected'
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-600 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {booking.status === 'confirmed'
                      ? 'verified'
                      : booking.status === 'pending'
                      ? 'hourglass_top'
                      : booking.status === 'rejected'
                      ? 'cancel'
                      : 'info'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/80 border text-charcoal">
                      Status: {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
                    {booking.status === 'confirmed'
                      ? 'Your Booking is Confirmed!'
                      : booking.status === 'pending'
                      ? 'Request Received — Under Concierge Review'
                      : booking.status === 'rejected'
                      ? 'Reservation Request Declined'
                      : 'Reservation Cancelled'}
                  </h1>
                  <p className="text-stone-700 text-xs sm:text-sm font-light leading-relaxed">
                    {booking.status === 'confirmed'
                      ? 'Your table or craft session has been guaranteed on our studio floor. We look forward to seeing you.'
                      : booking.status === 'pending'
                      ? 'Your reservation request is safely saved on our server. Because wheel stations and tables have limited capacity, our host verifies each slot manually. Please note: This is a pending request, not yet a guaranteed seating.'
                      : booking.status === 'rejected'
                      ? 'Unfortunately, we are unable to accommodate this time slot due to private studio buyouts or full capacity.'
                      : 'This reservation has been cancelled.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Reservation Details Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Reference Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/60 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-0.5">Booking Reference Number</span>
                  <div className="font-mono text-xl sm:text-2xl font-semibold text-terracotta tracking-wider flex items-center gap-3">
                    <span>{booking.reference}</span>
                    <button
                      onClick={copyReference}
                      className="text-stone-400 hover:text-charcoal transition-colors text-xs flex items-center gap-1 font-sans"
                      title="Copy Reference Number"
                    >
                      <span className="material-symbols-outlined text-base">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={downloadCalendarFile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-xs uppercase tracking-wider text-charcoal hover:bg-stone-50 transition-colors font-medium self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-base">calendar_add_on</span>
                  <span>Add to Calendar</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block mb-1">Booking Category</span>
                  <span className="font-serif text-base text-charcoal font-medium">
                    {booking.type === 'experience'
                      ? `Craft Experience: ${booking.experienceName || 'Studio Masterclass'}`
                      : 'Dining Sanctuary Table'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block mb-1">Date &amp; Time Slot</span>
                  <span className="font-serif text-base text-charcoal font-medium">
                    {booking.date} at {booking.timeSlot}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block mb-1">
                    {booking.type === 'experience' ? 'Participants' : 'Party Size'}
                  </span>
                  <span className="font-serif text-base text-charcoal font-medium">
                    {booking.guestCount} {booking.guestCount === 1 ? 'person' : 'guests'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block mb-1">Guest Contact</span>
                  <div className="font-medium text-charcoal">
                    {booking.customerName}
                    <div className="text-stone-500 font-sans text-xs mt-0.5">{booking.mobile}</div>
                    {booking.email && <div className="text-stone-500 font-sans text-xs">{booking.email}</div>}
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="sm:col-span-2 pt-2 border-t border-stone-200/40">
                    <span className="text-stone-400 uppercase tracking-wider text-[10px] block mb-1">Special Requests</span>
                    <p className="text-stone-700 italic bg-stone-50 p-3 rounded-xl border border-stone-200/50">
                      "{booking.specialRequests}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Honest Notification Dispatcher Card */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200/70 p-5 text-xs space-y-2">
              <div className="flex items-center gap-2 text-stone-700 font-medium">
                <span className="material-symbols-outlined text-stone-500 text-base">notifications</span>
                <span>Notification System Status</span>
              </div>
              <p className="text-stone-500 font-light leading-relaxed">
                {notifications?.email?.configured || notifications?.whatsapp?.configured ? (
                  <span>Dispatch notifications have been queued to your registered contact channel.</span>
                ) : (
                  <span>
                    Direct automated SMS / WhatsApp gateway is unconfigured in this deployment environment.
                    Your reservation is recorded securely in our persistent database. Our staff host will reference your confirmation code <strong className="text-charcoal">{booking.reference}</strong> upon arrival.
                  </span>
                )}
              </p>
            </div>

            {/* Follow-up Concierge Details */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-base text-charcoal font-medium">Need Assistance or Adjustments?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Phone</span>
                  <a href="tel:+15557822739" className="font-medium text-charcoal hover:text-terracotta">
                    +1 (555) 782-2739
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Email</span>
                  <a href="mailto:hello@themudbrewcafe.com" className="font-medium text-terracotta hover:underline">
                    hello@themudbrewcafe.com
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Location</span>
                  <span className="text-charcoal">Courtyard 4, Arts Quarter</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/book"
                  className="px-6 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs uppercase tracking-wider font-medium"
                >
                  Book Another Table
                </Link>
                <Link
                  to="/"
                  className="px-6 py-2.5 rounded-full border border-stone-300 text-charcoal hover:bg-stone-50 transition-colors text-xs uppercase tracking-wider font-medium"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

