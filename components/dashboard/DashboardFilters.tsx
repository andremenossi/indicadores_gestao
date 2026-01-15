
import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DashboardFiltersProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  formatMonth: (month: string) => string;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ 
  selectedMonth, 
  onMonthChange, 
  availableMonths, 
  formatMonth 
}) => {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg border border-slate-300 shadow-sm min-w-[280px]">
        <Calendar size={18} className="text-slate-400" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Período</span>
          <div className="relative">
            <select 
              value={selectedMonth} 
              onChange={(e) => onMonthChange(e.target.value)}
              className="appearance-none bg-transparent pr-8 text-xs font-black text-[#3583C7] outline-none cursor-pointer uppercase tracking-tight"
            >
              <option value="all">Todos os Meses</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#3583C7]" />
          </div>
        </div>
      </div>
    </div>
  );
};
