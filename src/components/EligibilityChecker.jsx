import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Heart, 
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EligibilityChecker({ onRegisterNow }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 26,
    weight: 65,
    gender: 'Male',
    lastDonationMonths: 4,
    hasTattooIn6Months: 'no',
    hasRecentSurgery: 'no',
    hasFeverOrAntibiotics: 'no',
    isPregnantOrLactating: 'no',
    hemoglobinKnown: 'yes'
  });

  const [assessmentResult, setAssessmentResult] = useState(null);

  const handleEvaluate = () => {
    const isAgeValid = formData.age >= 18 && formData.age <= 65;
    const isWeightValid = formData.weight >= 50;
    const coolingMonthsRequired = formData.gender === 'Female' ? 4 : 3;
    const isCoolingSatisfied = formData.lastDonationMonths >= coolingMonthsRequired;
    const hasNoRecentProcedures = formData.hasTattooIn6Months === 'no' && formData.hasRecentSurgery === 'no';
    const hasNoInfections = formData.hasFeverOrAntibiotics === 'no' && formData.isPregnantOrLactating === 'no';

    if (isAgeValid && isWeightValid && isCoolingSatisfied && hasNoRecentProcedures && hasNoInfections) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setAssessmentResult({
        status: 'ELIGIBLE',
        badgeTitle: 'Certified LifeSaver Donor',
        nextDonationDate: 'Available Today!',
        message: 'Congratulations! You meet all national medical safety guidelines to donate whole blood.'
      });
    } else if (!isCoolingSatisfied) {
      const monthsLeft = coolingMonthsRequired - formData.lastDonationMonths;
      setAssessmentResult({
        status: 'COOLING',
        badgeTitle: 'In Vital Cooling Period',
        nextDonationDate: `In ~${monthsLeft * 30} days`,
        message: `Your body is replenishing iron and red blood cells. The safe mandatory interval is ${coolingMonthsRequired} months.`
      });
    } else {
      setAssessmentResult({
        status: 'DEFERRED',
        badgeTitle: 'Temporary Deferral',
        nextDonationDate: 'Review after recovery',
        message: 'Based on current clinical guidelines (weight, recent tattoos/piercings, or medications), you are temporarily deferred to protect both donor and patient safety.'
      });
    }
  };

  const resetQuiz = () => {
    setAssessmentResult(null);
    setStep(1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            Clinical Pre-Screening Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Donor Eligibility & Health Self-Assessment</h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Quick 60-second interactive questionnaire verified by community medical officers.
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-rose-600/30 border border-rose-500/40 items-center justify-center text-rose-300">
          <Heart className="w-8 h-8 fill-current animate-pulse" />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {!assessmentResult ? (
          <div className="space-y-6">
            {/* Step 1: Vitals */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Step 1 of 2: Basic Physical Demographics</h3>
                  <p className="text-xs text-slate-500">Essential physiological parameters for safe donation volume.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Your Age (Years)</label>
                    <input
                      type="number"
                      min="15"
                      max="80"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Criteria: 18 - 65 yrs</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Body Weight (kg)</label>
                    <input
                      type="number"
                      min="35"
                      max="150"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 50 })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Criteria: Minimum 50 kg</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Biological Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                    >
                      <option value="Male">Male (3 mo interval)</option>
                      <option value="Female">Female (4 mo interval)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <span>Next: Medical History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Medical & History */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Step 2 of 2: Recent History & Interventions</h3>
                  <p className="text-xs text-slate-500">Helps protect both your hemoglobin health and patient immunity.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block">Months since your last blood donation:</span>
                      <span className="text-[11px] text-slate-500">Choose '4+' if this is your first time.</span>
                    </div>
                    <select
                      value={formData.lastDonationMonths}
                      onChange={(e) => setFormData({ ...formData, lastDonationMonths: parseInt(e.target.value) })}
                      className="p-2 border border-slate-300 rounded-xl bg-white font-semibold text-rose-600"
                    >
                      <option value="1">1 Month ago (Too recent)</option>
                      <option value="2">2 Months ago</option>
                      <option value="3">3 Months ago (Eligible for Males)</option>
                      <option value="4">4+ Months / First Time (Eligible for All)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block">Tattoos, body piercing, or dental surgery in past 6 months?</span>
                      <span className="text-[11px] text-slate-500">Requires 6-month window to rule out infectious transmissions.</span>
                    </div>
                    <div className="flex gap-2">
                      {['no', 'yes'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, hasTattooIn6Months: val })}
                          className={`px-4 py-1.5 rounded-lg font-bold uppercase text-[11px] transition ${
                            formData.hasTattooIn6Months === val ? 'bg-rose-600 text-white' : 'bg-white border text-slate-600'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block">Active fever, cold, or antibiotics in past 7 days?</span>
                      <span className="text-[11px] text-slate-500">Must be fully recovered and symptom-free.</span>
                    </div>
                    <div className="flex gap-2">
                      {['no', 'yes'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, hasFeverOrAntibiotics: val })}
                          className={`px-4 py-1.5 rounded-lg font-bold uppercase text-[11px] transition ${
                            formData.hasFeverOrAntibiotics === val ? 'bg-rose-600 text-white' : 'bg-white border text-slate-600'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleEvaluate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Calculate Eligibility Result</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Result Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              {assessmentResult.status === 'ELIGIBLE' && (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
              {assessmentResult.status === 'COOLING' && (
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="w-10 h-10" />
                </div>
              )}
              {assessmentResult.status === 'DEFERRED' && (
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                assessmentResult.status === 'ELIGIBLE' ? 'bg-emerald-100 text-emerald-800' :
                assessmentResult.status === 'COOLING' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {assessmentResult.badgeTitle}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {assessmentResult.status === 'ELIGIBLE' ? "You are 100% Eligible to Donate!" :
                 assessmentResult.status === 'COOLING' ? "Please Rest and Hydrate" : "Temporary Deferral"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {assessmentResult.message}
              </p>
            </div>

            {/* Digital Badge Certificate Preview */}
            {assessmentResult.status === 'ELIGIBLE' && (
              <div className="max-w-sm mx-auto bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-emerald-500/40 text-left relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider block">Verified Health Clearance</span>
                    <h4 className="font-bold text-white text-base">LifePulse Donor Pass</h4>
                  </div>
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-700/60 flex justify-between text-xs font-mono">
                  <div>
                    <span className="text-emerald-300 text-[10px] block">VALIDATION</span>
                    <span className="font-bold">Active Ready</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-300 text-[10px] block">COOLING STATUS</span>
                    <span className="font-bold">Cleared (0 Days)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={resetQuiz}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-take Assessment</span>
              </button>

              {assessmentResult.status === 'ELIGIBLE' && onRegisterNow && (
                <button
                  onClick={onRegisterNow}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Register as Active Donor Now</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
