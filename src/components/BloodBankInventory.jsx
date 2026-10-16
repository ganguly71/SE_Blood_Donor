import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Droplet,
  ExternalLink,
  HeartHandshake,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BloodBankInventory({ bloodBanks = [], onNavigateToMap, showNotification }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [pledgeModalBank, setPledgeModalBank] = useState(null);
  const [pledgeForm, setPledgeForm] = useState({ name: '', phone: '', group: 'O+', date: 'Tomorrow' });

  // Filtered Banks
  const filteredBanks = bloodBanks.filter((bank) => {
    const matchCity = selectedCity === 'ALL' || bank.city === selectedCity;
    const matchSearch = searchQuery === '' || 
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If a group filter is selected, check if this bank has stock or matches
    return matchCity && matchSearch;
  });

  const handlePledgeSubmit = (e) => {
    e.preventDefault();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    if (showNotification) {
      showNotification(`Thank you ${pledgeForm.name}! Your donation pledge at ${pledgeModalBank.name} has been recorded.`);
    }
    setPledgeModalBank(null);
  };

  const getStockBadge = (count) => {
    if (count === 0) {
      return <span className="text-[10px] bg-red-100 text-red-800 font-black px-1.5 py-0.5 rounded">OUT</span>;
    }
    if (count <= 2) {
      return <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200 animate-pulse">{count}U CRITICAL</span>;
    }
    if (count <= 6) {
      return <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200">{count}U LOW</span>;
    }
    return <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">{count}U SAFE</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-blue-400" />
            Central Blood Reserve Transparency
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Blood Bank Live Inventory & Stock Finder</h1>
          <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed">
            Directly monitor real-time blood unit availability across certified hospital blood centers, Red Cross apex facilities, and civic repositories. Prevent panic by locating safe stock instantly.
          </p>
        </div>

        <button
          onClick={onNavigateToMap}
          className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition self-start md:self-auto"
        >
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>View on Geo-Radar</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blood bank or hospital..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
          >
            <option value="ALL">All Cities ({bloodBanks.length} Facilities)</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>

        <div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold text-rose-600"
          >
            <option value="ALL">All Blood Groups Highlighted</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
              <option key={bg} value={bg}>Highlight {bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Blood Banks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBanks.map((bank) => (
          <div key={bank.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-bold text-slate-400">{bank.id}</span>
                <div className="flex items-center gap-1.5">
                  {bank.isGovernmentApproved && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                      Govt Certified
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    24x7 Ready
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{bank.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{bank.address}</span>
                  </p>
                </div>
              </div>

              {/* Live Inventory Grid */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 mb-4">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>Current Available Units:</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">Updated 8m ago</span>
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Object.entries(bank.inventory || {}).map(([grp, count]) => {
                    const isHighlighted = selectedGroup === 'ALL' || selectedGroup === grp;
                    return (
                      <div
                        key={grp}
                        className={`p-2 rounded-xl text-center border transition ${
                          isHighlighted ? 'bg-white shadow-sm' : 'opacity-40 bg-slate-100'
                        } ${
                          count <= 2 ? 'border-red-200' : 'border-slate-200'
                        }`}
                      >
                        <span className="font-black text-xs block text-slate-800">{grp}</span>
                        <div className="mt-1">{getStockBadge(count)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <a
                href={`tel:${bank.phone}`}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Desk ({bank.phone})
              </a>

              <button
                onClick={() => setPledgeModalBank(bank)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Pledge Donation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pledge Donation Modal */}
      {pledgeModalBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pledge Donation at {pledgeModalBank.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Book a priority donor fast-track walk-in slot.</p>

            <form onSubmit={handlePledgeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sen"
                  value={pledgeForm.name}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Contact</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={pledgeForm.phone}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blood Group</label>
                  <select
                    value={pledgeForm.group}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, group: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold text-rose-600"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Preferred Slot</label>
                  <select
                    value={pledgeForm.date}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Today">Today Afternoon</option>
                    <option value="Tomorrow">Tomorrow Morning</option>
                    <option value="This Weekend">This Weekend</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPledgeModalBank(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl shadow-md transition"
                >
                  Confirm Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
