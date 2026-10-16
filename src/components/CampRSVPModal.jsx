import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  Download, 
  QrCode, 
  Share2, 
  Heart,
  Sparkles,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CampRSVPModal({ camp, isOpen, onClose, onRegistered }) {
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorGroup, setDonorGroup] = useState('O+');
  const [preferredSlot, setPreferredSlot] = useState('10:00 AM - 11:30 AM');
  const [isSuccess, setIsSuccess] = useState(false);
  const [passId, setPassId] = useState('');

  if (!isOpen || !camp) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedId = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;
    setPassId(generatedId);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    if (onRegistered) {
      onRegistered(camp.id, donorName);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Donation Camp Pass
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{camp.title}</h3>
            <p className="text-xs text-slate-500">{camp.organizer}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
            {/* Camp summary */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-slate-600">
              <div className="flex items-center text-slate-800 font-semibold">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500 flex-shrink-0" />
                <span>{camp.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                <span>{camp.date} • {camp.time}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Siddharth Mehta"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Blood Group</label>
                <select
                  value={donorGroup}
                  onChange={(e) => setDonorGroup(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-bold text-rose-600"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Preferred Arrival Slot</label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
              >
                <option value="09:30 AM - 11:00 AM">09:30 AM - 11:00 AM (Morning Early)</option>
                <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM (Midday)</option>
                <option value="01:30 PM - 03:00 PM">01:30 PM - 03:00 PM (Afternoon)</option>
                <option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM (Late Session)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-rose-200 transition mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Reservation & Generate Pass</span>
            </button>
          </form>
        ) : (
          /* Digital Pass Screen */
          <div className="py-4 space-y-4 text-xs">
            {/* The Pass Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white p-5 rounded-3xl shadow-xl border border-rose-900/50 relative overflow-hidden">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <span className="font-black text-sm text-white">LifePulse Official Pass</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{passId}</span>
                </div>
                <div className="bg-rose-600 text-white font-black text-sm px-2.5 py-1 rounded-xl">
                  {donorGroup}
                </div>
              </div>

              <div className="py-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Donor Participant</span>
                <h4 className="text-lg font-black text-white">{donorName}</h4>
                <p className="text-slate-300 text-xs">{camp.title}</p>
                <p className="text-slate-400 text-[11px]">{camp.location}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">APPOINTMENT WINDOW</span>
                  <span className="text-emerald-400 font-bold">{camp.date} • {preferredSlot}</span>
                </div>

                {/* Simulated QR Code */}
                <div className="w-12 h-12 bg-white p-1 rounded-xl flex items-center justify-center text-slate-900">
                  <QrCode className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>SMS notification & confirmation token dispatched to {donorPhone}.</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Save / Print Pass</span>
              </button>
              <button
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
