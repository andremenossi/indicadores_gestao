
import React, { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = memo(({ 
  title, value, subtitle, icon, borderColor, iconBg, iconColor
}) => (
  <div className={`bg-white p-5 rounded-lg shadow-sm border border-slate-200 border-l-4 ${borderColor} transition-all hover:shadow-md flex flex-col gap-3`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} border border-current/10`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    <div>
      <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{value}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{subtitle}</div>
    </div>
  </div>
));
