
import React, { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  borderColor: string; // Espera uma classe de cor de borda lateral, ex: border-l-blue-500
  iconBg: string;
  iconColor: string;
  extra?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = memo(({ 
  title, value, subtitle, icon, borderColor, iconBg, iconColor, extra
}) => (
  <div className={`bg-white p-5 rounded-lg shadow-sm border border-slate-200 border-l-[6px] ${borderColor} transition-all hover:shadow-md flex flex-col gap-3 relative overflow-hidden`}>
    {/* Header: Icon + Title (Full Width) */}
    <div className="flex items-center gap-3 w-full">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} border border-current/10 shrink-0`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate flex-1" title={title}>
        {title}
      </span>
    </div>

    {/* Main Line: Value + Optional Selector (Aligned Right) */}
    <div className="flex items-end justify-between gap-2 mt-1">
      <div className="text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
        {value}
      </div>
      {extra && (
        <div className="shrink-0 mb-[-2px]">
          {extra}
        </div>
      )}
    </div>

    {/* Subtitle */}
    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate">
      {subtitle}
    </div>
  </div>
));
