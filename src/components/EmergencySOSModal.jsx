import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  Share2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Ambulance, 
  X, 
  Send,
  ShieldAlert
} from 'lucide-react';

export default function EmergencySOSModal({ isOpen, onClose, requests = [], onBroadcast }) {
  const [copied, setCopied] = useState(false);
  const [selectedReq, setSelectedReq] = useState(requests[0] || null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [customPatient, setCustomPatient] = useState('');
  const [customHospital, setCustomHospital] = useState('');
  const [customGroup, setCustomGroup] = useState('O+');
  const [customPhone, setCustomPhone] = useState('');

  // Audio synthesizer beep for siren
  useEffect(() => {
    if (!isOpen || !soundEnabled) return;

    let audioCtx = null;
    let osc = null;
    let intervalId = null;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = () => {
        if (!audioCtx) return;
        const oscNode = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscNode.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        oscNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscNode.start();
        oscNode.stop(audioCtx.currentTime + 0.35);
      };

      playBeep();
      intervalId = setInterval(playBeep, 1200);
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx) audioCtx.close();
    };
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const targetReq = selectedReq || {
    patientName: customPatient || "Emergency Patient",
    bloodGroup: customGroup,
    hospital: customHospital || "Emergency Trauma Care",
    city: "Local City",
    contactNumber: customPhone || "+91 800-BLOOD-911"
  };

  const shareText = `🚨 URGENT EMERGENCY BLOOD REQUEST 🚨\nBlood Group: ${targetReq.bloodGroup}\nPatient: ${targetReq.patientName}\nHospital: ${targetReq.hospital}, ${targetReq.city || ''}\nUrgent Contact: ${targetReq.contactNumber}\nVerified through LifePulse Emergency Network. Please forward to all eligible donors immediately!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-600/70 text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Urgent Glow Effect */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-700 to-red-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Emergency SOS Broadcast</h3>
                <span className="bg-red-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-bounce">
                  Live Alert
                </span>
              </div>
              <p className="text-xs text-slate-400">One-click multi-channel dispatch for critical patients</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                soundEnabled ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? "Mute alert siren" : "Enable alert siren tone"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Select Active Request or Custom */}
          {requests.length > 0 && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Select Active Emergency Case to Broadcast:
              </label>
              <select
                value={selectedReq?.id || ''}
                onChange={(e) => {
                  const req = requests.find(r => r.id === e.target.value);
                  setSelectedReq(req || null);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    [{r.bloodGroup}] {r.patientName} — {r.hospital} ({r.urgency})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Broadcast Message Preview Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Pre-Formatted Distress Dispatch Text:
            </span>
            <div className="font-mono text-slate-300 text-xs whitespace-pre-line leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {shareText}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast on WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Distress Text Copied!" : "Copy Broadcast Link"}</span>
            </button>
          </div>

          {/* Emergency 24x7 Helplines */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              National Emergency Medical Helplines (Direct Dial):
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <a
                href="tel:108"
                className="bg-red-950/60 hover:bg-red-900/60 border border-red-800 p-2 rounded-xl text-red-300 font-bold flex flex-col items-center justify-center transition"
              >
                <Ambulance className="w-4 h-4 mb-0.5" />
                <span>108 Ambulance</span>
              </a>
              <a
                href="tel:104"
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-slate-200 font-bold flex flex-col items-center justify-center transition"
              >
                <Phone className="w-4 h-4 mb-0.5 text-blue-400" />
                <span>104 Blood Desk</span>
              </a>
              <a
                href="tel:112"
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-slate-200 font-bold flex flex-col items-center justify-center transition"
              >
                <ShieldAlert className="w-4 h-4 mb-0.5 text-amber-400" />
                <span>112 All-Emergency</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
