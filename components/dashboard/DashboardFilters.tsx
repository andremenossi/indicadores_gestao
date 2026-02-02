
import React from 'react';
import { Calendar, ChevronDown, DoorOpen } from 'lucide-react';
import { ALLOWED_ROOMS } from '../../constants/config';

interface DashboardFiltersProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  formatMonth: (month: string) => string;
  selectedRoom: string;
  onRoomChange: (room: string) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ 
  selectedMonth, 
  onMonthChange, 
  availableMonths, 
  formatMonth,
  selectedRoom,
  onRoomChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtro de Período */}
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg border border-slate-300 shadow-sm min-w-[260px] flex-1 sm:flex-none">
        <Calendar size={18} className="text-slate-400 shrink-0" />
        <div className="flex flex-col flex-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Período</span>
          <div className="relative">
            <select 
              value={selectedMonth} 
              onChange={(e) => onMonthChange(e.target.value)}
              className="appearance-none bg-transparent w-full pr-8 text-xs font-black text-[#3583C7] outline-none cursor-pointer uppercase tracking-tight"
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

      {/* Filtro de Sala (Global) */}
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg border border-slate-300 shadow-sm min-w-[180px] flex-1 sm:flex-none">
        <DoorOpen size={18} className="text-slate-400 shrink-0" />
        <div className="flex flex-col flex-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidade / Sala</span>
          <div className="relative">
            <select 
              value={selectedRoom} 
              onChange={(e) => onRoomChange(e.target.value)}
              className="appearance-none bg-transparent w-full pr-8 text-xs font-black text-[#3583C7] outline-none cursor-pointer uppercase tracking-tight"
            >
              <option value="all">Todas as Salas</option>
              {ALLOWED_ROOMS.map(r => (
                <option key={r} value={r}>Sala {r}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#3583C7]" />
          </div>
        </div>
      </div>
    </div>
  );
};
