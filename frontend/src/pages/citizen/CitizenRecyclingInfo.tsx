import React, { useState } from 'react';
import {
  BookOpen,
  Leaf,
  Recycle,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calculator,
  TrendingUp,
  TreeDeciduous,
  Droplets,
  Zap,
} from 'lucide-react';

export const CitizenRecyclingInfo: React.FC = () => {
  // Household Impact Calculator State
  const [plasticKg, setPlasticKg] = useState<number>(10);
  const [paperKg, setPaperKg] = useState<number>(15);
  const [organicKg, setOrganicKg] = useState<number>(20);

  // Calculations
  const co2Saved = (plasticKg * 1.8 + paperKg * 0.9 + organicKg * 0.5).toFixed(1);
  const treesPreserved = (paperKg * 0.017).toFixed(2);
  const waterSavedLiters = (paperKg * 26 + plasticKg * 15).toFixed(0);
  const energySavedKwh = (plasticKg * 5.7 + paperKg * 4.1).toFixed(1);

  const segregationGuides = [
    {
      type: 'Organic & Bio-Waste',
      color: 'border-emerald-500 bg-emerald-50/50',
      tag: 'Green Bin',
      accepted: ['Fruit & vegetable peels', 'Food scraps & coffee grounds', 'Garden trimmings & dry leaves', 'Eggshells'],
      prohibited: ['Plastic bags', 'Diapers & sanitary waste', 'Treated wood', 'Glass/Metal'],
    },
    {
      type: 'Plastic Packaging',
      color: 'border-blue-500 bg-blue-50/50',
      tag: 'Blue Bin',
      accepted: ['Rinsed PET water bottles', 'Milk jugs & detergent bottles', 'Clean plastic jars & tubs', 'Rigid containers'],
      prohibited: ['Greasy food wraps', 'Single-use straws', 'Styrofoam foam cups', 'Chemical hazard containers'],
    },
    {
      type: 'Paper & Cardboard',
      color: 'border-amber-500 bg-amber-50/50',
      tag: 'Yellow Bin',
      accepted: ['Flattened cardboard boxes', 'Newspapers & magazines', 'Clean office paper', 'Shipping cartons'],
      prohibited: ['Soiled pizza boxes with grease', 'Wax-coated cups', 'Thermal receipt paper', 'Tissue napkins'],
    },
    {
      type: 'Glass & Metals',
      color: 'border-cyan-500 bg-cyan-50/50',
      tag: 'Gray Bin',
      accepted: ['Rinsed beverage glass bottles', 'Clean glass food jars', 'Aluminum soda cans', 'Tin & steel food cans'],
      prohibited: ['Broken window panes & mirrors', 'Light bulbs', 'Ceramic plates & mugs', 'Aerosol cans with contents'],
    },
    {
      type: 'Electronic Waste (E-Waste)',
      color: 'border-violet-500 bg-violet-50/50',
      tag: 'Purple Depot',
      accepted: ['Old computers & phones', 'Cables, chargers & mice', 'Lithium batteries', 'Small kitchen electronics'],
      prohibited: ['Broken CRT tubes', 'Leaking automotive batteries', 'Fluorescent mercury tubes'],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Citizen Educational Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Recycling & Segregation Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Learn how proper household waste separation dramatically boosts municipal circular economy efficiency and protects the environment.
        </p>
      </div>

      {/* Household Impact Calculator Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-forest-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Household Impact Calculator</h2>
              <p className="text-xs text-slate-400">Estimate environmental savings from your monthly segregated waste</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            Live Simulator
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Plastic Waste (kg/month): {plasticKg} kg
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={plasticKg}
              onChange={(e) => setPlasticKg(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Paper / Cardboard (kg/month): {paperKg} kg
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={paperKg}
              onChange={(e) => setPaperKg(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Organic Waste (kg/month): {organicKg} kg
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={organicKg}
              onChange={(e) => setOrganicKg(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300">
              <Leaf className="w-4 h-4" />
              <span>CO₂ Prevented</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{co2Saved} kg</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-300">
              <TreeDeciduous className="w-4 h-4" />
              <span>Trees Saved</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{treesPreserved}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300">
              <Droplets className="w-4 h-4" />
              <span>Water Conserved</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{waterSavedLiters} L</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-yellow-300">
              <Zap className="w-4 h-4" />
              <span>Energy Saved</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{energySavedKwh} kWh</p>
          </div>
        </div>
      </div>

      {/* Category Guides */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Segregation Rules & Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segregationGuides.map((guide, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 border-2 bg-white shadow-sm space-y-4 ${guide.color}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{guide.type}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-sm border text-slate-700">
                  {guide.tag}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Accepted Items:</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-slate-600">
                    {guide.accepted.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Do NOT Include:</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-slate-500">
                    {guide.prohibited.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
