import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Users, 
  Activity, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  ShieldCheck, 
  Award, 
  Calendar, 
  Send, 
  ArrowRight,
  Filter,
  UserCheck,
  Ambulance,
  BadgeCheck,
  Sparkles,
  Info,
  Map as MapIcon,
  Building2,
  Share2,
  Sliders,
  Check,
  Layers,
  Crosshair,
  Droplet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_DATA } from './mockData';
import BloodMap from './components/BloodMap';
import EmergencySOSModal from './components/EmergencySOSModal';
import BloodBankInventory from './components/BloodBankInventory';
import EligibilityChecker from './components/EligibilityChecker';
import CampRSVPModal from './components/CampRSVPModal';

export default function App() {
  // Navigation / Role view
  // 'home', 'map', 'receiver', 'donor', 'bloodBanks', 'eligibility', 'volunteer', 'compatibility', 'camps', 'new-request', 'new-donor'
  const [activeTab, setActiveTab] = useState('home');
  
  // Persistent state in localStorage with fallback
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lifepulse_data_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_DATA,
          ...parsed,
          requests: parsed.requests?.length ? parsed.requests : INITIAL_DATA.requests,
          donors: parsed.donors?.length ? parsed.donors : INITIAL_DATA.donors,
          bloodBanks: INITIAL_DATA.bloodBanks,
          camps: INITIAL_DATA.camps,
          cities: INITIAL_DATA.cities
        };
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('lifepulse_data_v4', JSON.stringify(data));
  }, [data]);

  // Form states for creating emergency request
  const [requestForm, setRequestForm] = useState({
    patientName: '',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'CRITICAL',
    hospital: '',
    city: 'Mumbai',
    area: 'Central',
    lat: 18.9995,
    lng: 72.8425,
    contactNumber: '',
    attendantName: '',
    dateNeeded: 'Immediate / Under 2 hrs',
    notes: ''
  });
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestPickerActive, setRequestPickerActive] = useState(false);

  // Form states for donor registration
  const [donorForm, setDonorForm] = useState({
    name: '',
    bloodGroup: 'A+',
    age: 25,
    gender: 'Male',
    city: 'Mumbai',
    area: 'Andheri',
    lat: 19.1136,
    lng: 72.8697,
    phone: '',
    lastDonated: 'Never / > 3 months',
    isAvailableNow: true
  });
  const [donorSubmitted, setDonorSubmitted] = useState(false);
  const [donorPickerActive, setDonorPickerActive] = useState(false);

  // Filter state for finding donors
  const [filterBloodGroup, setFilterBloodGroup] = useState('ALL');
  const [filterCity, setFilterCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [activeRSVPCamp, setActiveRSVPCamp] = useState(null);

  // Notifications banner
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Submit blood request (Receiver)
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestForm.patientName || !requestForm.hospital || !requestForm.contactNumber) {
      alert("Please fill in the required patient name, hospital, and contact number.");
      return;
    }

    // Default coordinates based on city if not picked
    const cityCoords = data.cities.find(c => c.name.toLowerCase() === requestForm.city.toLowerCase()) || data.cities[0];

    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      ...requestForm,
      lat: requestForm.lat || cityCoords.lat,
      lng: requestForm.lng || cityCoords.lng,
      status: 'OPEN',
      assignedDonor: null,
      assignedVolunteer: null,
      verificationStatus: 'PENDING',
      createdAt: 'Just now'
    };

    setData((prev) => ({
      ...prev,
      requests: [newReq, ...prev.requests]
    }));

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setRequestSubmitted(true);
    showNotification(`Emergency blood request for ${newReq.patientName} (${newReq.bloodGroup}) broadcasted!`);
    setTimeout(() => {
      setRequestSubmitted(false);
      setRequestForm({
        patientName: '',
        bloodGroup: 'O+',
        units: 1,
        urgency: 'CRITICAL',
        hospital: '',
        city: 'Mumbai',
        area: 'Central',
        lat: 18.9995,
        lng: 72.8425,
        contactNumber: '',
        attendantName: '',
        dateNeeded: 'Immediate / Under 2 hrs',
        notes: ''
      });
      setActiveTab('receiver');
    }, 1500);
  };

  // Submit donor registration
  const handleRegisterDonor = (e) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.phone || !donorForm.area) {
      alert("Please complete the required fields: Full Name, Phone, and Area.");
      return;
    }

    const cityCoords = data.cities.find(c => c.name.toLowerCase() === donorForm.city.toLowerCase()) || data.cities[0];

    const newDonor = {
      id: `DON-${Math.floor(300 + Math.random() * 700)}`,
      ...donorForm,
      lat: donorForm.lat || cityCoords.lat,
      lng: donorForm.lng || cityCoords.lng,
      eligible: true,
      donationCount: 1,
      badge: 'New Hero'
    };

    setData((prev) => ({
      ...prev,
      donors: [newDonor, ...prev.donors]
    }));

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setDonorSubmitted(true);
    showNotification(`Thank you ${newDonor.name}! You are registered as an active donor.`);
    setTimeout(() => {
      setDonorSubmitted(false);
      setActiveTab('donor');
    }, 1500);
  };

  // Volunteer actions
  const handleVerifyRequest = (reqId) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === reqId ? { ...r, verificationStatus: 'VERIFIED' } : r
      )
    }));
    showNotification(`Request ${reqId} verified by community volunteer team.`);
  };

  const handleAssignVolunteer = (reqId, volId) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === reqId ? { ...r, assignedVolunteer: volId } : r
      )
    }));
    showNotification(`Assigned volunteer ${volId} to lead coordination.`);
  };

  const handleMarkFulfilled = (reqId) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === reqId ? { ...r, status: 'COMPLETED' } : r
      )
    }));

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err) {}

    showNotification(`Request ${reqId} marked as successfully fulfilled! Life saved! 🎉`);
  };

  // Quick Match Donors calculation
  const getCompatibleDonorsForRequest = (req) => {
    const compatibleGroups = data.bloodCompatibility[req.bloodGroup]?.receive || [req.bloodGroup];
    return data.donors.filter((d) => 
      compatibleGroups.includes(d.bloodGroup) && 
      (req.city === d.city || !req.city) &&
      d.eligible
    );
  };

  // Filtered Donors list
  const filteredDonors = data.donors.filter((d) => {
    const matchGroup = filterBloodGroup === 'ALL' || d.bloodGroup === filterBloodGroup;
    const matchCity = filterCity === 'ALL' || d.city === filterCity;
    const matchSearch = searchQuery === '' || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGroup && matchCity && matchSearch;
  });

  const activeRequestCount = data.requests.filter(r => r.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Urgent Alert Bar */}
      <header className="bg-gradient-to-r from-rose-800 via-rose-700 to-red-800 text-white text-xs font-semibold py-1.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="truncate">
              National Emergency Blood Desk: <strong>104 / 108</strong> | Real-Time Tripartite Citizen Lifeline
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setIsSOSOpen(true)}
              className="bg-red-950/80 hover:bg-black text-rose-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Broadcast SOS Alert</span>
            </button>
            <span className="hidden md:inline-block text-rose-200/80">Every 2 Seconds Someone Needs Blood</span>
          </div>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="bg-gradient-to-tr from-rose-600 to-red-500 text-white p-2.5 rounded-2xl shadow-md shadow-rose-200 flex items-center justify-center transition group-hover:scale-105">
                <Heart className="h-6 w-6 fill-current animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Life<span className="text-rose-600">Pulse</span>
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Donor • Receiver • Volunteer Bridge
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden xl:flex items-center space-x-1">
              {[
                { id: 'home', label: 'Overview', icon: Activity },
                { id: 'map', label: 'Geo-Radar Map', icon: MapIcon, highlight: true },
                { id: 'receiver', label: 'Blood Requests', count: activeRequestCount, icon: Ambulance },
                { id: 'donor', label: 'Find Donors', icon: Heart },
                { id: 'bloodBanks', label: 'Blood Banks', icon: Building2 },
                { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck },
                { id: 'volunteer', label: 'Volunteer Hub', icon: UserCheck },
                { id: 'compatibility', label: 'Matrix', icon: Info },
                { id: 'camps', label: 'Camps', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200'
                        : tab.highlight
                        ? 'bg-red-50/60 text-red-700 hover:bg-red-100/80 border border-red-100 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : tab.highlight ? 'text-red-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Emergency CTA Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSOSOpen(true)}
                className="hidden sm:flex bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 font-bold px-3 py-2 rounded-xl text-xs items-center space-x-1.5 transition active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                <span>Instant SOS</span>
              </button>

              <button
                onClick={() => setActiveTab('new-request')}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md shadow-rose-200 flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Request Blood</span>
                <span className="sm:hidden">Request</span>
              </button>

              <button
                onClick={() => setActiveTab('new-donor')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition active:scale-95 hidden sm:flex items-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>Join as Donor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Sub-Bar for Mobile / Tablet */}
        <div className="xl:hidden flex overflow-x-auto border-t border-slate-100 px-3 py-2 space-x-1.5 no-scrollbar">
          {[
            { id: 'home', label: 'Overview', icon: Activity },
            { id: 'map', label: 'Geo-Radar Map', icon: MapIcon },
            { id: 'receiver', label: `Requests (${activeRequestCount})`, icon: Ambulance },
            { id: 'donor', label: 'Donors', icon: Heart },
            { id: 'bloodBanks', label: 'Blood Banks', icon: Building2 },
            { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck },
            { id: 'volunteer', label: 'Volunteers', icon: UserCheck },
            { id: 'compatibility', label: 'Matrix', icon: Info },
            { id: 'camps', label: 'Camps', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Alert Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-800 animate-bounce">
          <Sparkles className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="text-xs font-medium">{notification}</span>
        </div>
      )}

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        requests={data.requests}
      />

      {/* Camp RSVP Pass Modal */}
      <CampRSVPModal
        camp={activeRSVPCamp}
        isOpen={!!activeRSVPCamp}
        onClose={() => setActiveRSVPCamp(null)}
        onRegistered={(campId, donorName) => {
          showNotification(`Confirmed pass generated for ${donorName}!`);
        }}
      />

      {/* Main Page Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: HOME OVERVIEW */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white p-8 sm:p-12 shadow-2xl border border-rose-900/50">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-xs font-semibold text-rose-300">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Real-time Tripartite Blood Coordination Network</span>
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Bridging <span className="text-rose-400">Blood Donors</span>, <span className="text-rose-200">Receivers</span>, and <span className="text-amber-300">Volunteers</span>.
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  During medical emergencies, minutes matter. LifePulse connects families in desperate need of blood with local verified donors, supported by on-ground community volunteers and interactive geo-radar maps.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="bg-white text-rose-900 hover:bg-rose-50 font-black px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-xs sm:text-sm transition active:scale-95"
                  >
                    <MapIcon className="w-4 h-4 text-rose-600" />
                    <span>Launch Geo-Radar Map</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('new-request')}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-rose-900/50 flex items-center space-x-2 text-xs sm:text-sm transition active:scale-95"
                  >
                    <Ambulance className="w-4 h-4" />
                    <span>Post Emergency Need</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('new-donor')}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-5 py-3 rounded-xl flex items-center space-x-2 text-xs sm:text-sm backdrop-blur transition"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Register as Donor</span>
                  </button>
                </div>
              </div>

              {/* Quick stats ribbon */}
              <div className="mt-10 pt-6 border-t border-rose-900/60 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-rose-300 uppercase tracking-wider font-semibold">Active Requests</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {data.requests.filter(r => r.status === 'OPEN').length} Urgent
                  </p>
                </div>
                <div>
                  <p className="text-xs text-rose-300 uppercase tracking-wider font-semibold">Ready Donors</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {data.donors.filter(d => d.isAvailableNow).length} Standby
                  </p>
                </div>
                <div>
                  <p className="text-xs text-rose-300 uppercase tracking-wider font-semibold">Blood Banks Tracked</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {data.bloodBanks.length} Centers
                  </p>
                </div>
                <div>
                  <p className="text-xs text-rose-300 uppercase tracking-wider font-semibold">Avg Dispatch Time</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
                    &lt; 12 Mins
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Geo-Radar Preview Card */}
            <div className="bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Live Spatial Intelligence
                </span>
                <h2 className="text-2xl font-black">Find Nearest Donors & Hospitals on Live Map</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Toggle real-time radius searches (5km - 60km), check live blood bank inventory units, compute driving transit routes to hospitals, and ping available donors.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('map')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-rose-900 transition flex-shrink-0"
              >
                <span>Open Full Map Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* How The Tripartite Bridge Works */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Seamless Ecosystem</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">How LifePulse Bridges the Gap</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Three vital pillars working harmoniously to save lives when every second counts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pillar 1: Receiver */}
                <div className="bg-gradient-to-b from-rose-50/50 to-white p-6 rounded-2xl border border-rose-100 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                    <Ambulance className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">1. Receiver (Patients)</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mt-2">
                    Hospital attendants post urgent needs with exact bed location, units required, and clinical urgency. Geo-matching instantly identifies nearby donors.
                  </p>
                </div>

                {/* Pillar 2: Volunteers */}
                <div className="bg-gradient-to-b from-amber-50/50 to-white p-6 rounded-2xl border border-amber-100 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">2. Community Volunteers</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mt-2">
                    Volunteers verify hospital authenticity, eliminate fraud, coordinate donor transport, and ensure blood bank paperwork moves with zero delays.
                  </p>
                </div>

                {/* Pillar 3: Donors */}
                <div className="bg-gradient-to-b from-red-50/50 to-white p-6 rounded-2xl border border-red-100 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">3. Voluntary Donors</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mt-2">
                    Citizens receive proximity alerts when their exact blood group is needed nearby. One-click confirmation and transparent cooling period tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Urgent Requests Preview */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Immediate Emergency Blood Requirements
                  </h2>
                  <p className="text-slate-500 text-xs">Patients currently awaiting confirmed blood donors</p>
                </div>
                <button
                  onClick={() => setActiveTab('receiver')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                >
                  View All Requests <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.requests.filter(r => r.status === 'OPEN').slice(0, 3).map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-300 transition">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.urgency} NEED
                        </span>
                        <span className="text-xs font-mono text-slate-400">{req.id}</span>
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{req.patientName}</h4>
                          <p className="text-xs text-slate-500">{req.units} Unit(s) required</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500 flex-shrink-0" />
                          <span className="truncate">{req.hospital}, {req.city}</span>
                        </div>
                        <div className="flex items-center text-slate-500">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                          <span>Needed: {req.dateNeeded}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('donor');
                          setFilterBloodGroup(req.bloodGroup);
                          setFilterCity(req.city);
                        }}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        Match Donors
                      </button>
                      <button
                        onClick={() => setActiveTab('map')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-xs font-semibold flex items-center justify-center transition"
                        title="Locate on Map"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`tel:${req.contactNumber}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg text-xs font-semibold flex items-center justify-center transition"
                        title="Call Attendant"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE GEO-RADAR MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-rose-600" />
                  Live Geo-Radar Map & Emergency Dispatch
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Interactive real-time map displaying emergency blood requests, ready verified donors, certified blood banks, and active donation drives.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsSOSOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-200 transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Broadcast SOS</span>
                </button>
                <button
                  onClick={() => setActiveTab('new-request')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Request</span>
                </button>
              </div>
            </div>

            {/* The Full Interactive BloodMap Component */}
            <BloodMap
              requests={data.requests}
              donors={data.donors}
              bloodBanks={data.bloodBanks}
              camps={data.camps}
              cities={data.cities}
              showNotification={showNotification}
              onSelectDonor={(donor) => {
                showNotification(`Direct channel initiated with ${donor.name} (${donor.bloodGroup})`);
              }}
              onRequestBlood={(req) => {
                showNotification(`Pledge submitted for ${req.patientName}! Hospital informed.`);
              }}
            />
          </div>
        )}

        {/* TAB 3: RECEIVER / BLOOD REQUESTS */}
        {activeTab === 'receiver' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Blood Requisitions & Requests</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Track hospital requests, check matching donor responses, and see volunteer verification.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('map')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <MapIcon className="w-4 h-4 text-rose-600" />
                  <span>Map Radar View</span>
                </button>
                <button
                  onClick={() => setActiveTab('new-request')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 text-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Blood Request</span>
                </button>
              </div>
            </div>

            {/* List of Requests */}
            <div className="space-y-4">
              {data.requests.map((req) => {
                const compatibleDonors = getCompatibleDonorsForRequest(req);
                const assignedVol = data.volunteers.find(v => v.id === req.assignedVolunteer);
                const assignedDon = data.donors.find(d => d.id === req.assignedDonor);

                return (
                  <div key={req.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900">{req.patientName}</h3>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-medium">
                              {req.id}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Attendant: <span className="font-semibold text-slate-700">{req.attendantName || 'Family'}</span> • Contact: <span className="font-semibold text-slate-700">{req.contactNumber}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {req.verificationStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Hospital Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Awaiting Volunteer Check
                          </span>
                        )}

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          req.urgency === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {req.urgency} Urgency
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Hospital & Location</span>
                        <span className="text-slate-800 font-semibold mt-0.5 block">{req.hospital}</span>
                        <span className="text-slate-500">{req.city}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Quantity Needed</span>
                        <span className="text-slate-800 font-semibold mt-0.5 block">{req.units} Blood Unit(s)</span>
                        <span className="text-slate-500">Timeline: {req.dateNeeded}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Community Volunteer</span>
                        {assignedVol ? (
                          <span className="text-indigo-700 font-semibold mt-0.5 block flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            {assignedVol.name} ({assignedVol.phone})
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium mt-0.5 block">Not yet assigned</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Donor Match Status</span>
                        {assignedDon ? (
                          <span className="text-emerald-700 font-bold mt-0.5 block">
                            Assigned to {assignedDon.name} ({assignedDon.bloodGroup})
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium mt-0.5 block">
                            {compatibleDonors.length} Compatible Donors Nearby
                          </span>
                        )}
                      </div>
                    </div>

                    {req.notes && (
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 mb-4 border border-slate-100">
                        <span className="font-semibold text-slate-700">Clinical Case Note:</span> {req.notes}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="text-xs text-slate-400">
                        Posted {req.createdAt}
                      </div>
                      <div className="flex gap-2">
                        {req.status === 'OPEN' && (
                          <button
                            onClick={() => handleMarkFulfilled(req.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Fulfilled
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('map');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <MapIcon className="w-3.5 h-3.5" />
                          View on Map
                        </button>
                        <a
                          href={`tel:${req.contactNumber}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-rose-400" />
                          Call Attendant
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DONORS DIRECTORY */}
        {activeTab === 'donor' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Verified Blood Donors</h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Browse active blood donors, filter by blood group and city, or view proximity on the Geo-Radar.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <MapIcon className="w-4 h-4 text-rose-600" />
                    <span>Radar Map</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('new-donor')}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 text-xs transition"
                  >
                    <Heart className="w-4 h-4 text-rose-400 fill-current" />
                    <span>Register as Donor</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, area, or group..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <select
                    value={filterBloodGroup}
                    onChange={(e) => setFilterBloodGroup(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="ALL">All Blood Groups</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O- (Universal Donor)</option>
                    <option value="AB+">AB+ (Universal Recipient)</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="ALL">All Cities</option>
                    {data.cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Donors Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDonors.map((donor) => (
                <div key={donor.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        donor.isAvailableNow ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {donor.isAvailableNow ? '● Available On-Call' : 'On Standby'}
                      </span>
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                        {donor.badge}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-xl">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{donor.name}</h3>
                        <p className="text-xs text-slate-500">{donor.age} yrs • {donor.gender}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                        <span>{donor.area}, {donor.city}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                        <span>Last donation: {donor.lastDonated}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500 flex-shrink-0" />
                        <span>Total donations: {donor.donationCount} lives touched</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <a
                      href={`tel:${donor.phone}`}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Contact Donor
                    </a>
                    <button
                      onClick={() => showNotification(`Distress ping sent to ${donor.name}!`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center transition"
                      title="Send Instant Alert"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDonors.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-slate-800">No donors match this filter</h3>
                <p className="text-xs text-slate-500 mt-1">Try expanding your search query or city selection.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BLOOD BANK LIVE INVENTORY */}
        {activeTab === 'bloodBanks' && (
          <BloodBankInventory
            bloodBanks={data.bloodBanks}
            onNavigateToMap={() => setActiveTab('map')}
            showNotification={showNotification}
          />
        )}

        {/* TAB 6: ELIGIBILITY CHECKER */}
        {activeTab === 'eligibility' && (
          <EligibilityChecker
            onRegisterNow={() => setActiveTab('new-donor')}
          />
        )}

        {/* TAB 7: COMMUNITY VOLUNTEER HUB */}
        {activeTab === 'volunteer' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
              <div className="max-w-2xl space-y-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  The Backbone of the Bridge
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">Community Volunteers Command Center</h1>
                <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed">
                  Volunteers authenticate emergency requisitions directly with hospitals, eliminate fraudulent claims, coordinate blood transport, and assist distressed patient families 24/7.
                </p>
              </div>
            </div>

            {/* Volunteer Roster */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {data.volunteers.map((vol) => (
                <div key={vol.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono font-bold text-slate-400">{vol.id}</span>
                      <span className="bg-amber-100 text-amber-900 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                        ★ {vol.rating} Rating
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xl">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{vol.name}</h3>
                        <p className="text-[11px] text-amber-800 font-medium">{vol.role}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jurisdiction:</span>
                        <span className="font-semibold text-slate-800">{vol.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Dispatches:</span>
                        <span className="font-semibold text-rose-600">{vol.activeDispatches} on-going</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cases Resolved:</span>
                        <span className="font-semibold text-emerald-700">{vol.resolvedCases} lives assisted</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${vol.phone}`}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Contact ({vol.phone})
                  </a>
                </div>
              ))}
            </div>

            {/* Pending Verification Work Queue */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Hospital Verification Queue (Community Task Desk)
              </h2>

              <div className="space-y-3">
                {data.requests.filter(r => r.verificationStatus === 'PENDING').length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">All active blood requisitions are verified! No pending reviews.</p>
                ) : (
                  data.requests.filter(r => r.verificationStatus === 'PENDING').map((req) => (
                    <div key={req.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-amber-50/50 border border-amber-200 rounded-2xl gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{req.patientName}</span>
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-xs rounded-lg">{req.bloodGroup}</span>
                          <span className="text-xs text-slate-500">at {req.hospital}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Attendant Contact: {req.contactNumber} • Urgency: {req.urgency}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyRequest(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify Hospital Case
                        </button>
                        <button
                          onClick={() => handleAssignVolunteer(req.id, 'VOL-201')}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
                        >
                          Assign Volunteer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: BLOOD COMPATIBILITY MATRIX */}
        {activeTab === 'compatibility' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h1 className="text-2xl font-black text-slate-900">Interactive Blood Compatibility Matrix</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Understand which blood types can safely donate and receive Red Blood Cells (RBC) and Plasma during critical transfusions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.bloodCompatibility).map(([group, comp]) => (
                <div key={group} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-rose-300 transition">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                      {group}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Blood Type {group}</h3>
                      <p className="text-[11px] text-slate-400">
                        {group === 'O-' ? 'Universal RBC Donor' : group === 'AB+' ? 'Universal RBC Recipient' : comp.prevalence}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-700 block mb-1">Can Donate RBC To:</span>
                      <div className="flex flex-wrap gap-1">
                        {comp.give.map(g => (
                          <span key={g} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[11px]">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-blue-700 block mb-1">Can Receive RBC From:</span>
                      <div className="flex flex-wrap gap-1">
                        {comp.receive.map(g => (
                          <span key={g} className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-bold text-[11px]">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>Prevalence: <strong>{comp.prevalence}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: DONATION CAMPS */}
        {activeTab === 'camps' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Community Blood Donation Drives</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Join scheduled local blood drives organized by civic bodies, NGOs, and university volunteer clubs.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition self-start md:self-auto"
              >
                <MapIcon className="w-4 h-4 text-purple-600" />
                <span>View Camps on Map</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.camps.map((camp) => (
                <div key={camp.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-purple-200 transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono font-bold text-slate-400">{camp.id}</span>
                      <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        Upcoming Drive
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{camp.title}</h3>
                    <p className="text-xs text-purple-600 font-medium mb-4">Organized by {camp.organizer}</p>

                    <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-rose-500 flex-shrink-0" />
                        <span className="font-medium text-slate-800">{camp.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                        <span>{camp.date} • {camp.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                        <span>{camp.registered} Donors Registered / Target: {camp.targetUnits} units</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-rose-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (camp.registered / camp.targetUnits) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveRSVPCamp(camp)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment & Get Donor Pass</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL / VIEW: CREATE NEW REQUEST (RECEIVER) */}
        {activeTab === 'new-request' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Post Emergency Blood Need</h2>
                  <p className="text-xs text-slate-500">Directly alerts local donors & volunteer coordinators</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('receiver')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            {requestSubmitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900">Emergency Requisition Dispatched!</h3>
                <p className="text-xs text-slate-500">Community volunteer coordinators are verifying hospital ward details.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={requestForm.patientName}
                      onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Blood Group Needed *</label>
                    <select
                      value={requestForm.bloodGroup}
                      onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-bold text-rose-600"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Units (Bags) *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={requestForm.units}
                      onChange={(e) => setRequestForm({ ...requestForm, units: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Urgency Level</label>
                    <select
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-bold"
                    >
                      <option value="CRITICAL">CRITICAL (&lt; 2 hrs)</option>
                      <option value="HIGH">HIGH (Today)</option>
                      <option value="NORMAL">NORMAL (Next 48 hrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">City Focal Hub *</label>
                    <select
                      value={requestForm.city}
                      onChange={(e) => {
                        const cityObj = data.cities.find(c => c.name === e.target.value);
                        setRequestForm({ 
                          ...requestForm, 
                          city: e.target.value,
                          lat: cityObj ? cityObj.lat : requestForm.lat,
                          lng: cityObj ? cityObj.lng : requestForm.lng
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                    >
                      {data.cities.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital & Ward Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KEM Hospital, Parel, ICU Bed 14"
                    value={requestForm.hospital}
                    onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Attendant Contact Mobile *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={requestForm.contactNumber}
                      onChange={(e) => setRequestForm({ ...requestForm, contactNumber: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Attendant Name / Relation</label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh (Brother)"
                      value={requestForm.attendantName}
                      onChange={(e) => setRequestForm({ ...requestForm, attendantName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Clinical Context / Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Provide any additional details (surgery time, doctor contact, replacement permit)..."
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-rose-200 transition mt-2 flex items-center justify-center gap-2"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>Broadcast Urgent Blood Requisition</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODAL / VIEW: REGISTER DONOR */}
        {activeTab === 'new-donor' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Become a Registered Blood Donor</h2>
                  <p className="text-xs text-slate-500">Join the circle of everyday life-savers</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('donor')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            {donorSubmitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900">Welcome to LifePulse!</h3>
                <p className="text-xs text-slate-500">Your profile is registered. When someone nearby requires your blood group, you will receive an emergency notification.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterDonor} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={donorForm.name}
                      onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Your Blood Group *</label>
                    <select
                      value={donorForm.bloodGroup}
                      onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-bold text-rose-600"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O- (Universal Donor)</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Age (18-65) *</label>
                    <input
                      type="number"
                      min="18"
                      max="65"
                      value={donorForm.age}
                      onChange={(e) => setDonorForm({ ...donorForm, age: parseInt(e.target.value) || 20 })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                    <select
                      value={donorForm.gender}
                      onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">City Hub *</label>
                    <select
                      value={donorForm.city}
                      onChange={(e) => {
                        const cityObj = data.cities.find(c => c.name === e.target.value);
                        setDonorForm({ 
                          ...donorForm, 
                          city: e.target.value,
                          lat: cityObj ? cityObj.lat : donorForm.lat,
                          lng: cityObj ? cityObj.lng : donorForm.lng
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                    >
                      {data.cities.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Locality / Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bandra West, Koramangala"
                      value={donorForm.area}
                      onChange={(e) => setDonorForm({ ...donorForm, area: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98980 12345"
                      value={donorForm.phone}
                      onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="availableCheck"
                    checked={donorForm.isAvailableNow}
                    onChange={(e) => setDonorForm({ ...donorForm, isAvailableNow: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="availableCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                    I am currently in good health, weigh over 50kg, and am ready for emergency notifications.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md transition mt-2 flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-current" />
                  <span>Register as Voluntary Blood Donor</span>
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Heart className="w-4 h-4 text-rose-600 fill-current" />
            <span className="font-bold text-slate-800">LifePulse Platform</span>
            <span>— Blood Donor, Receiver & Community Volunteer Bridge</span>
          </div>
          <p className="mt-2 sm:mt-0">
            Emergency Response & Civic Health Initiative • 100% Voluntary Non-Profit System
          </p>
        </div>
      </footer>
    </div>
  );
}
