
import React from 'react';
import { Activity } from 'lucide-react';

export const LeanManagementCard: React.FC = () => (
  <div className="bg-[#111827] rounded-lg p-8 border border-slate-700 shadow-2xl relative overflow-hidden group">
    <div className="absolute right-[-200px] bottom-[-200px] opacity-[0.03] pointer-events-none">
      <Activity size={220} className="text-blue-500" />
    </div>
    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-blue-500" size={28} />
          <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Gestão Lean</h2>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed font-medium">
          A otimização do turnover reduz o desperdício de tempo entre cirurgias, aumentando a 
          capacidade instalada do hospital e a satisfação da equipe assistencial. Focar na meta 
          Lean é garantir a sustentabilidade operacional do centro cirúrgico.
        </p>
      </div>

      <div className="grid grid-cols-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 gap-6 min-w-[340px]">
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alta</p>
          <div className="text-xl font-bold text-emerald-500 tracking-tighter">&lt; 25</div>
          <div className="text-xl font-bold text-emerald-500 tracking-tighter uppercase">min</div>
        </div>
        <div className="text-center border-x border-slate-700 px-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Média</p>
          <div className="text-xl font-bold text-amber-500 tracking-tighter">25 - 40</div>
          <div className="text-xl font-bold text-amber-500 tracking-tighter uppercase">min</div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Baixa</p>
          <div className="text-xl font-bold text-rose-500 tracking-tighter">&gt; 40</div>
          <div className="text-xl font-bold text-rose-500 tracking-tighter uppercase">min</div>
        </div>
      </div>
    </div>
  </div>
);
