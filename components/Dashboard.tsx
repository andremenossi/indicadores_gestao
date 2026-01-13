
import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  ClipboardList, 
  AlertCircle,
  LayoutDashboard,
  Calendar,
  Timer,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { SurgeryRecord } from '../types';

interface DashboardProps {
  records: SurgeryRecord[];
}

const displayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

const formatMonth = (monthStr: string) => {
  if (!monthStr) return 'Todos';
  const [year, month] = monthStr.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[parseInt(month) - 1]} / ${year}`;
};

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: React.ReactNode; 
  borderColor: string;
  iconBg: string;
  iconColor: string;
}> = ({ 
  title, value, subtitle, icon, borderColor, iconBg, iconColor
}) => (
  <div className={`bg-white p-5 rounded-lg shadow-sm border border-slate-200 border-l-4 ${borderColor} transition-all hover:shadow-md flex flex-col gap-3`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} border border-current/10`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    <div>
      <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{value}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{subtitle}</div>
    </div>
  </div>
);

const LeanManagementCard: React.FC = () => (
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

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const availableMonths = useMemo(() => {
    const months = records.map(r => r.date.substring(0, 7));
    return Array.from(new Set(months)).sort().reverse();
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (selectedMonth === 'all') return records;
    return records.filter(r => r.date.startsWith(selectedMonth));
  }, [records, selectedMonth]);

  const stats = useMemo(() => {
    const totalMinutes = filteredRecords.reduce((acc, curr) => acc + curr.intervalMinutes, 0);
    const totalPatients = filteredRecords.length;
    
    const recordsWithoutDelay = filteredRecords.filter(r => !r.isDelay);
    const avgTurnover = recordsWithoutDelay.length > 0 
      ? (recordsWithoutDelay.reduce((acc, curr) => acc + curr.intervalMinutes, 0) / recordsWithoutDelay.length) 
      : 0;

    return {
      totalMinutes,
      totalPatients,
      averageTurnover: parseFloat(avgTurnover.toFixed(1)),
      highPerformanceCount: filteredRecords.filter(r => r.intervalMinutes < 25 && !r.isDelay).length,
      delaysCount: filteredRecords.filter(r => r.isDelay).length,
      mediumPerformanceCount: filteredRecords.filter(r => r.intervalMinutes >= 25 && r.intervalMinutes <= 40 && !r.isDelay).length,
      lowPerformanceCount: filteredRecords.filter(r => r.intervalMinutes > 40 && !r.isDelay).length,
    };
  }, [filteredRecords]);

  const chartData = [
    { name: 'Alta (<25)', count: stats.highPerformanceCount, fill: '#10b981' },
    { name: 'Média (25-40)', count: stats.mediumPerformanceCount, fill: '#f59e0b' },
    { name: 'Baixa (>40)', count: stats.lowPerformanceCount, fill: '#EE3234' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Global Filter Header - Aligned Left as requested */}
      <div className="flex justify-start">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg border border-slate-300 shadow-sm min-w-[280px]">
          <Calendar size={18} className="text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Período</span>
            <div className="relative">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
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

      {/* 5 Cards Grid with vibrant restored colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Tempo Total" 
          value={`${stats.totalMinutes}m`} 
          subtitle="Soma de turnovers" 
          icon={<Timer />} 
          borderColor="border-blue-500"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard 
          title="Procedimentos" 
          value={stats.totalPatients} 
          subtitle="Total no período" 
          icon={<ClipboardList />} 
          borderColor="border-blue-500" 
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard 
          title="Turnover Médio" 
          value={`${stats.averageTurnover}m`} 
          subtitle="Meta Lean: 25min" 
          icon={<Clock />} 
          borderColor="border-indigo-500" 
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />

        <StatCard 
          title="Alta Performance" 
          value={stats.highPerformanceCount} 
          subtitle="Dentro da Meta" 
          icon={<TrendingUp />} 
          borderColor="border-emerald-500" 
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard 
          title="Atrasos Graves" 
          value={stats.delaysCount} 
          subtitle="Acima de 60min" 
          icon={<AlertCircle />} 
          borderColor="border-red-600" 
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#3583C7]" /> Evolução de Eficiência ({selectedMonth === 'all' ? 'Tudo' : formatMonth(selectedMonth)})
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...filteredRecords].reverse().slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="700" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => displayDate(val)} 
                />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} unit="m" />
                <Tooltip 
                  labelFormatter={(val) => displayDate(val as string)} 
                  contentStyle={{ borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="intervalMinutes" 
                  stroke="#3583C7" 
                  strokeWidth={3} 
                  dot={{ fill: '#3583C7', r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <LayoutDashboard size={16} className="text-emerald-500" /> Distribuição de Metas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} tick={{dy: 10}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <LeanManagementCard />
    </div>
  );
};
