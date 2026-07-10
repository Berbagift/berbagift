"use client";

import React from 'react';
import {
  Cake, Heart, GraduationCap, TreePine,
  MoonStar, Clock, Gift, Mail,
} from 'lucide-react';

const categories = [
  { name: 'Birthday', icon: Cake },
  { name: 'Wedding', icon: Heart },
  { name: 'Graduation', icon: GraduationCap },
  { name: 'Christmas', icon: TreePine },
  { name: 'Eid', icon: MoonStar },
  { name: 'Anniversary', icon: Clock },
  { name: 'Giveaway', icon: Gift },
  { name: 'Just Because', icon: Mail },
];

export function LandingCelebration() {
  return (
    <section id="celebrations" className="py-20 lg:py-24 bg-[#FAFBFA] relative overflow-hidden">

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.02) 0%, transparent 55%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-slate-800 leading-[1.1] text-center">
            Made for every <span className="text-emerald-600">celebration</span>
          </h2>
          <p className="text-base text-slate-400 font-normal leading-relaxed text-center">
            Tailor envelope layouts to birthdays, weddings, holidays, or community giveaways.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-14 gap-x-8 max-w-3xl mx-auto">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center text-center group cursor-default"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-50/60 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-emerald-100 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-emerald-600 stroke-[1.5]" />
                </div>
                <h3 className="font-medium text-slate-600 text-[13px] transition-colors duration-200 group-hover:text-emerald-700">
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
