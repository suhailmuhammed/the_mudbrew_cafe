import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('mudbrew_admin_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mudbrew_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Tab: 'bookings' | 'experiences' | 'settings' | 'blocked'
  const [activeTab, setActiveTab] = useState('bookings');

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0, rejected: 0, completed: 0, todayTotal: 0 });
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected booking for Details / Notes modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [staffNoteInput, setStaffNoteInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Experiences Catalogue state
  const [experiences, setExperiences] = useState([]);
  const [loadingExp, setLoadingExp] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expModalOpen, setExpModalOpen] = useState(false);

  // Schedule & Capacity Settings state
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Blocked Dates & Closures state
  const [blockedList, setBlockedList] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockSlot, setNewBlockSlot] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Auth helper headers
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('mudbrew_admin_token', data.token);
      localStorage.setItem('mudbrew_admin_user', JSON.stringify(data.user));
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('mudbrew_admin_token');
    localStorage.removeItem('mudbrew_admin_user');
  };

  // Fetch Bookings with current filters
  const fetchBookings = async () => {
    if (!token) return;
    setLoadingBookings(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterDate) params.append('date', filterDate);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, { headers: authHeaders });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setBookings(data.bookings || []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Experiences
  const fetchExperiences = async () => {
    if (!token) return;
    setLoadingExp(true);
    try {
      const res = await fetch('/api/admin/experiences', { headers: authHeaders });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setExperiences(data || []);
    } catch (err) {
      console.error('Failed to load experiences:', err);
    } finally {
      setLoadingExp(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    if (!token) return;
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', { headers: authHeaders });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Fetch Blocked List
  const fetchBlocked = async () => {
    if (!token) return;
    setLoadingBlocked(true);
    try {
      const res = await fetch('/api/admin/blocked', { headers: authHeaders });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setBlockedList(data || []);
    } catch (err) {
      console.error('Failed to load blocked dates:', err);
    } finally {
      setLoadingBlocked(false);
    }
  };

  // Trigger data fetches on tab change / filter changes
  useEffect(() => {
    if (token) {
      if (activeTab === 'bookings') fetchBookings();
      if (activeTab === 'experiences') fetchExperiences();
      if (activeTab === 'settings') fetchSettings();
      if (activeTab === 'blocked') fetchBlocked();
    }
  }, [token, activeTab, filterStatus, filterType, filterDate]);

  // Update Booking Status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Booking updated to ${newStatus}`);
      fetchBookings();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(data.booking);
      }
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Save Staff Notes
  const saveStaffNotes = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/notes`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ staffNotes: staffNoteInput })
      });
      if (!res.ok) throw new Error('Failed to save staff notes.');

      showToast('Staff notes updated successfully');
      setSelectedBooking(prev => ({ ...prev, staff_notes: staffNoteInput }));
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.append('status', filterStatus);
    if (filterType !== 'all') params.append('type', filterType);
    if (filterDate) params.append('date', filterDate);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    window.open(`/api/admin/export-csv?${params.toString()}&token=${token}`, '_blank');
  };

  // Experience creation/save
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const isEdit = !!editingExp.id;
    const url = isEdit ? `/api/admin/experiences/${editingExp.id}` : '/api/admin/experiences';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(editingExp)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save experience.');

      showToast(isEdit ? 'Experience updated' : 'New experience created');
      setExpModalOpen(false);
      setEditingExp(null);
      fetchExperiences();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Experience
  const handleDeleteExperience = async (id) => {
    if (!confirm('Are you sure you want to remove this experience? Existing bookings will be retained.')) return;
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error('Failed to delete experience.');
      showToast('Experience removed');
      fetchExperiences();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to update settings.');
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 3000);
      showToast('Settings & Booking Rules Saved');
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Blocked Date / Slot
  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!newBlockDate) return;
    try {
      const res = await fetch('/api/admin/blocked', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          date: newBlockDate,
          timeSlot: newBlockSlot || undefined,
          reason: newBlockReason || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to block slot.');

      showToast('Block date/slot added');
      setNewBlockDate('');
      setNewBlockSlot('');
      setNewBlockReason('');
      fetchBlocked();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Block
  const handleDeleteBlock = async (id) => {
    try {
      const res = await fetch(`/api/admin/blocked/${id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error('Failed to remove block.');
      showToast('Block removed');
      fetchBlocked();
    } catch (err) {
      alert(err.message);
    }
  };

  // If Not Authenticated: Render Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-linen flex flex-col justify-center items-center px-4 selection:bg-terracotta-soft selection:text-terracotta">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 shadow-md p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block group mb-1">
              <img src="/logo.png" alt="The MudBrew" className="w-12 h-12 rounded-full object-cover mx-auto" />
            </Link>
            <h1 className="font-serif text-2xl text-charcoal font-medium">The MudBrew Staff Portal</h1>
            <p className="text-stone-500 text-xs font-light">
              Authorized concierge access to reservation schedules &amp; studio controls.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Username</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none focus:border-terracotta"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-full bg-charcoal text-white hover:bg-terracotta transition-colors text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400">
              Default concierge credentials: <code className="text-terracotta font-mono font-semibold">admin</code> / <code className="text-terracotta font-mono font-semibold">mudbrew2026!</code>
            </span>
            <div className="mt-3">
              <Link to="/" className="text-xs text-stone-500 hover:text-terracotta transition-colors">
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen text-charcoal flex flex-col selection:bg-terracotta-soft selection:text-terracotta">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal text-white px-4 py-2.5 rounded-full text-xs shadow-lg flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Staff Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="The MudBrew" className="w-8 h-8 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="font-serif text-base font-medium text-charcoal leading-tight">The MudBrew</span>
                <span className="text-[9px] tracking-widest uppercase text-terracotta font-bold">Staff Concierge Portal</span>
              </div>
            </Link>

            <span className="text-stone-300 hidden sm:inline">|</span>

            <nav className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'bookings' ? 'bg-terracotta-soft text-terracotta font-semibold' : 'text-stone-600 hover:text-charcoal'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('experiences')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'experiences' ? 'bg-terracotta-soft text-terracotta font-semibold' : 'text-stone-600 hover:text-charcoal'
                }`}
              >
                Experiences
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'settings' ? 'bg-terracotta-soft text-terracotta font-semibold' : 'text-stone-600 hover:text-charcoal'
                }`}
              >
                Schedule &amp; Rules
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'blocked' ? 'bg-terracotta-soft text-terracotta font-semibold' : 'text-stone-600 hover:text-charcoal'
                }`}
              >
                Closures &amp; Blocks
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-charcoal">{currentUser?.name || 'Staff User'}</div>
              <div className="text-[10px] text-stone-400 capitalize">{currentUser?.role || 'Concierge'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-terracotta hover:border-terracotta text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnavigation */}
        <div className="sm:hidden flex border-t border-stone-100 overflow-x-auto px-4 py-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'bookings' ? 'bg-terracotta text-white font-medium' : 'text-stone-600'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'experiences' ? 'bg-terracotta text-white font-medium' : 'text-stone-600'
            }`}
          >
            Experiences
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-terracotta text-white font-medium' : 'text-stone-600'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'blocked' ? 'bg-terracotta text-white font-medium' : 'text-stone-600'
            }`}
          >
            Closures
          </button>
        </div>
      </header>

      {/* Main Staff Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ========================================================= */}
        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">Total Bookings</span>
                <span className="font-serif text-2xl font-semibold text-charcoal">{summary.total}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold block">Pending Review</span>
                <span className="font-serif text-2xl font-bold text-amber-700">{summary.pending}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold block">Confirmed</span>
                <span className="font-serif text-2xl font-bold text-emerald-700">{summary.confirmed}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium block">Today's Visits</span>
                <span className="font-serif text-2xl font-semibold text-charcoal">{summary.todayTotal}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">Cancelled</span>
                <span className="font-serif text-2xl font-medium text-stone-500">{summary.cancelled}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">Completed</span>
                <span className="font-serif text-2xl font-medium text-stone-500">{summary.completed}</span>
              </div>
            </div>

            {/* Filter Controls & Search */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 sm:flex-none">
                  <span className="material-symbols-outlined text-stone-400 absolute left-3 top-2.5 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Search name, phone, ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-terracotta"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="table">Table Reservation</option>
                  <option value="experience">Studio Experience</option>
                </select>

                {/* Date Filter */}
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-charcoal focus:bg-white focus:outline-none"
                />

                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="text-stone-400 hover:text-charcoal text-xs"
                    title="Clear date filter"
                  >
                    Clear Date
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchBookings}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-xl bg-charcoal text-white hover:bg-terracotta text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              {loadingBookings ? (
                <div className="py-16 text-center text-stone-400 text-xs">
                  Loading reservation records...
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-16 text-center text-stone-400 text-xs space-y-2">
                  <span className="material-symbols-outlined text-3xl text-stone-300">inbox</span>
                  <p>No booking records found matching current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50/80 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        <th className="py-3 px-4">Ref &amp; Category</th>
                        <th className="py-3 px-4">Guest Info</th>
                        <th className="py-3 px-4">Date &amp; Time Slot</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Concierge Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-semibold text-charcoal block">{b.reference}</span>
                            <span className="text-[10px] font-sans text-stone-500 capitalize">
                              {b.type === 'experience' ? (b.experience_name || 'Experience') : 'Dining Table'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-charcoal block">{b.customer_name}</span>
                            <span className="text-stone-500 text-[11px] block">{b.mobile}</span>
                            {b.email && <span className="text-stone-400 text-[10px] block">{b.email}</span>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-charcoal block">{b.date}</span>
                            <span className="text-terracotta font-semibold text-[11px]">{b.time_slot}</span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 font-medium">
                            {b.guest_count} {b.type === 'experience' ? 'participants' : 'guests'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : b.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : b.status === 'completed'
                                  ? 'bg-stone-200 text-stone-800'
                                  : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-medium uppercase tracking-wider"
                                  title="Confirm Reservation"
                                >
                                  Confirm
                                </button>
                              )}
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'rejected')}
                                  className="px-2.5 py-1 rounded border border-rose-300 text-rose-600 hover:bg-rose-50 text-[10px] font-medium uppercase tracking-wider"
                                  title="Reject Request"
                                >
                                  Reject
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'completed')}
                                  className="px-2.5 py-1 rounded bg-stone-700 text-white hover:bg-charcoal text-[10px] font-medium uppercase tracking-wider"
                                  title="Mark as Completed"
                                >
                                  Complete
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                  className="px-2 py-1 rounded border border-stone-200 text-stone-500 hover:bg-stone-100 text-[10px]"
                                  title="Cancel Booking"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setStaffNoteInput(b.staff_notes || '');
                                }}
                                className="px-2 py-1 rounded border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta text-[10px] font-medium"
                                title="View details & internal staff notes"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: EXPERIENCES CATALOGUE CONFIGURATION */}
        {/* ========================================================= */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-medium text-charcoal">Studio &amp; Brew Experiences</h2>
                <p className="text-stone-500 text-xs">Configure artisanal masterclasses, pricing, duration, and schedules.</p>
              </div>

              <button
                onClick={() => {
                  setEditingExp({
                    name: '',
                    tagline: '',
                    description: '',
                    price: 35.0,
                    duration_mins: 60,
                    max_participants: 6,
                    available_days: [0, 1, 2, 3, 4, 5, 6],
                    time_slots: ['11:30', '15:00', '18:30'],
                    is_active: 1
                  });
                  setExpModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-charcoal text-white hover:bg-terracotta text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Experience</span>
              </button>
            </div>

            {loadingExp ? (
              <div className="py-16 text-center text-stone-400 text-xs">Loading experience catalogue...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map(exp => (
                  <div
                    key={exp.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm ${
                      exp.is_active ? 'border-stone-200' : 'border-stone-200 bg-stone-50/80 opacity-75'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            exp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {exp.is_active ? 'Active & Bookable' : 'Draft / Inactive'}
                        </span>
                        <span className="font-serif text-sm font-semibold text-terracotta">
                          ${exp.price}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-base font-medium text-charcoal">{exp.name}</h3>
                        {exp.tagline && <p className="text-[11px] text-stone-400 italic mt-0.5">{exp.tagline}</p>}
                      </div>

                      <p className="text-xs text-stone-600 font-light leading-relaxed line-clamp-3">
                        {exp.description}
                      </p>

                      <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
                        <div>
                          <strong className="text-charcoal font-medium">Duration:</strong> {exp.duration_mins} mins • <strong className="text-charcoal font-medium">Max Seats:</strong> {exp.max_participants}
                        </div>
                        <div>
                          <strong className="text-charcoal font-medium">Time Slots:</strong> {Array.isArray(exp.time_slots) ? exp.time_slots.join(', ') : exp.time_slots}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setEditingExp(exp);
                          setExpModalOpen(true);
                        }}
                        className="text-stone-600 hover:text-terracotta font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SCHEDULE, CAPACITY & BOOKING RULES */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8">
            <div>
              <h2 className="font-serif text-xl font-medium text-charcoal">Operating Hours &amp; Capacity Rules</h2>
              <p className="text-stone-500 text-xs">Enforce table limits, opening hours, and advance booking rules.</p>
            </div>

            {loadingSettings || !settings ? (
              <div className="py-12 text-center text-stone-400 text-xs">Loading configuration settings...</div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* General Capacities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-stone-100">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      Table Capacity per Time Slot (Max concurrent guests)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.table_capacity_per_slot || '24'}
                      onChange={(e) => setSettings({ ...settings, table_capacity_per_slot: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      Max Guests per Single Table Booking
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.max_table_guests_per_booking || '10'}
                      onChange={(e) => setSettings({ ...settings, max_table_guests_per_booking: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      Minimum Advance Notice (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={settings.min_advance_hours || '2'}
                      onChange={(e) => setSettings({ ...settings, min_advance_hours: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      Maximum Advance Booking Window (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={settings.max_advance_days || '30'}
                      onChange={(e) => setSettings({ ...settings, max_advance_days: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Auto Confirmation Toggles */}
                <div className="space-y-3 pb-6 border-b border-stone-100">
                  <h3 className="font-serif text-sm font-medium text-charcoal">Approval Workflow</h3>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div>
                      <span className="text-xs font-medium text-charcoal block">Auto-Confirm Table Bookings</span>
                      <span className="text-[11px] text-stone-400">If checked, table reservations are instantly confirmed if capacity exists.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={String(settings.auto_confirm_tables) === 'true'}
                      onChange={(e) => setSettings({ ...settings, auto_confirm_tables: String(e.target.checked) })}
                      className="w-4 h-4 text-terracotta rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div>
                      <span className="text-xs font-medium text-charcoal block">Auto-Confirm Experience Bookings</span>
                      <span className="text-[11px] text-stone-400">If checked, workshop bookings confirm automatically without manual concierge approval.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={String(settings.auto_confirm_experiences) === 'true'}
                      onChange={(e) => setSettings({ ...settings, auto_confirm_experiences: String(e.target.checked) })}
                      className="w-4 h-4 text-terracotta rounded"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">Changes apply immediately to customer booking calculations.</span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-charcoal text-white hover:bg-terracotta text-xs font-medium uppercase tracking-wider transition-colors"
                  >
                    Save Booking Rules
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CLOSURES & BLOCKED DATES/SLOTS */}
        {/* ========================================================= */}
        {activeTab === 'blocked' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add New Block Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h2 className="font-serif text-lg font-medium text-charcoal">Block Date or Time Slot</h2>
                <p className="text-stone-500 text-xs">Blackout entire days for private events/holidays or block specific time slots.</p>
              </div>

              <form onSubmit={handleAddBlock} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Date to Block *</label>
                  <input
                    type="date"
                    required
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Specific Time Slot <span className="text-stone-400 font-normal">(Leave blank to block full day)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15:00 or 18:30"
                    value={newBlockSlot}
                    onChange={(e) => setNewBlockSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Reason for Block</label>
                  <input
                    type="text"
                    placeholder="e.g. Private ceramic buyout, Kiln maintenance, Holiday..."
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-charcoal text-white hover:bg-terracotta text-xs uppercase tracking-wider font-medium transition-colors"
                >
                  Add Blackout / Block
                </button>
              </form>
            </div>

            {/* Blocked Dates List */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-medium text-charcoal">Active Blackouts &amp; Blocked Slots</h2>

              {loadingBlocked ? (
                <div className="py-8 text-center text-stone-400 text-xs">Loading blocked slots...</div>
              ) : blockedList.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  No dates or slots currently blocked. All standard hours open for bookings.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {blockedList.map(item => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-charcoal flex items-center gap-2">
                          <span>{item.date}</span>
                          {item.time_slot ? (
                            <span className="text-terracotta font-mono text-[11px]">at {item.time_slot}</span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                              Full Day Blocked
                            </span>
                          )}
                        </div>
                        {item.reason && <p className="text-stone-500 text-[11px] mt-0.5 italic">"{item.reason}"</p>}
                      </div>

                      <button
                        onClick={() => handleDeleteBlock(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove blackout"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: BOOKING DETAILS & STAFF NOTES */}
        {/* ========================================================= */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-stone-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Booking Reference</span>
                  <div className="font-mono text-xl font-semibold text-terracotta">{selectedBooking.reference}</div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-stone-400 hover:text-charcoal"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">Type</span>
                  <span className="font-medium text-charcoal capitalize">{selectedBooking.type}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">Schedule</span>
                  <span className="font-medium text-charcoal">{selectedBooking.date} @ {selectedBooking.time_slot}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">Customer</span>
                  <span className="font-medium text-charcoal">{selectedBooking.customer_name}</span>
                  <div className="text-stone-500">{selectedBooking.mobile}</div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">Guest Count</span>
                  <span className="font-medium text-charcoal">{selectedBooking.guest_count}</span>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                  <span className="text-stone-400 text-[10px] uppercase block mb-1">Customer Special Requests:</span>
                  <p className="text-charcoal italic">"{selectedBooking.special_requests}"</p>
                </div>
              )}

              {/* Staff Internal Notes Editor */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold block">
                    Internal Staff Notes (Not visible to customer)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={staffNoteInput}
                  onChange={(e) => setStaffNoteInput(e.target.value)}
                  placeholder="e.g. Table 4 courtyard corner; anniversary flowers requested; VIP guest..."
                  className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-terracotta"
                />
                <button
                  type="button"
                  onClick={saveStaffNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 rounded-xl bg-charcoal text-white hover:bg-terracotta text-xs font-medium transition-colors"
                >
                  {savingNotes ? 'Saving Notes...' : 'Save Staff Notes'}
                </button>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Current Status: {selectedBooking.status}</span>
                <div className="flex items-center gap-2">
                  {selectedBooking.status !== 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                    >
                      Confirm
                    </button>
                  )}
                  {selectedBooking.status !== 'rejected' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 text-xs font-medium"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: CREATE / EDIT EXPERIENCE */}
        {/* ========================================================= */}
        {expModalOpen && editingExp && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif text-lg font-medium text-charcoal">
                  {editingExp.id ? 'Edit Experience' : 'Add New Craft Experience'}
                </h3>
                <button onClick={() => setExpModalOpen(false)} className="text-stone-400 hover:text-charcoal">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveExperience} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Experience Name *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.name}
                    onChange={(e) => setEditingExp({ ...editingExp, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Tagline</label>
                  <input
                    type="text"
                    value={editingExp.tagline || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingExp.description}
                    onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingExp.price}
                      onChange={(e) => setEditingExp({ ...editingExp, price: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Duration (Mins) *</label>
                    <input
                      type="number"
                      required
                      value={editingExp.duration_mins}
                      onChange={(e) => setEditingExp({ ...editingExp, duration_mins: parseInt(e.target.value, 10) })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Max Seats *</label>
                    <input
                      type="number"
                      required
                      value={editingExp.max_participants}
                      onChange={(e) => setEditingExp({ ...editingExp, max_participants: parseInt(e.target.value, 10) })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Daily Time Slots (Comma-separated e.g. 11:30, 15:00, 18:30)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editingExp.time_slots) ? editingExp.time_slots.join(', ') : editingExp.time_slots}
                    onChange={(e) => {
                      const slots = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setEditingExp({ ...editingExp, time_slots: slots });
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={!!editingExp.is_active}
                    onChange={(e) => setEditingExp({ ...editingExp, is_active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-terracotta rounded"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs text-charcoal font-medium">
                    Active &amp; Visible on Public Customer Booking Form
                  </label>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setExpModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-charcoal text-white hover:bg-terracotta text-xs font-medium uppercase tracking-wider transition-colors"
                  >
                    Save Experience
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

