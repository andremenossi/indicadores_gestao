
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  ClipboardList, 
  AlertCircle,
  LayoutDashboard,
  Timer
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
import { displayDate } from '../utils/time';
import { StatCard } from './dashboard/StatCard';
import { LeanManagementCard } from './dashboard/LeanManagementCard';
import { DashboardFilters } from './dashboard/DashboardFilters';

interface DashboardProps {
  records: SurgeryRecord[];
}

const formatMonth = (monthStr: string) => {
  if (!monthStr || monthStr === 'all') return 'Todos';
  const [year, month] = monthStr.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[parseInt(month) - 1]} / ${year}`;
};

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
    return filteredRecords.reduce((acc, curr) => {
      acc.totalMinutes += curr.intervalMinutes;
      acc.totalPatients += 1;
      
      if (curr.isDelay) {
        acc.delaysCount += 1;
      } else {
        acc.turnoverSum += curr.intervalMinutes;
        acc.validTurnoverCount += 1;
        
        if (curr.intervalMinutes < 25) {
          acc.highPerformanceCount += 1;
        } else if (curr.intervalMinutes <= 40) {
          acc.mediumPerformanceCount += 1;
        } else {
          acc.lowPerformanceCount += 1;
        }
      }
      return acc;
    }, {
      totalMinutes: 0,
      totalPatients: 0,
      turnoverSum: 0,
      validTurnoverCount: 0,
      highPerformanceCount: 0,
      delaysCount: 0,
      mediumPerformanceCount: 0,
      lowPerformanceCount: 0,
    });
  }, [filteredRecords]);

  const averageTurnover = useMemo(() => {
    return stats.validTurnoverCount > 0 
      ? parseFloat((stats.turnoverSum / stats.validTurnoverCount).toFixed(1)) 
      : 0;
  }, [stats.turnoverSum, stats.validTurnoverCount]);

  const chartData = useMemo(() => [
    { name: 'Alta (<25)', count: stats.highPerformanceCount, fill: '#10b981' },
    { name: 'Média (25-40)', count: stats.mediumPerformanceCount, fill: '#f59e0b' },
    { name: 'Baixa (>40)', count: stats.lowPerformanceCount, fill: '#EE3234' }
  ], [stats.highPerformanceCount, stats.mediumPerformanceCount, stats.lowPerformanceCount]);

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardFilters 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
        formatMonth={formatMonth}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Tempo Total" 
          value={`${stats.totalMinutes}m`} 
          subtitle="Soma de turnovers" 
          icon={<Timer />} 
          borderColor="border-l-blue-500"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard 
          title="Procedimentos" 
          value={stats.totalPatients} 
          subtitle="Total no período" 
          icon={<ClipboardList />} 
          borderColor="border-l-indigo-500" 
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard 
          title="Turnover Médio" 
          value={`${averageTurnover}m`} 
          subtitle="Meta Lean: 25min" 
          icon={<Clock />} 
          borderColor="border-l-cyan-500" 
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <StatCard 
          title="Alta Performance" 
          value={stats.highPerformanceCount} 
          subtitle="Dentro da Meta" 
          icon={<TrendingUp />} 
          borderColor="border-l-emerald-500" 
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard 
          title="Atrasos Graves" 
          value={stats.delaysCount} 
          subtitle="Acima de 60min" 
          icon={<AlertCircle />} 
          borderColor="border-l-red-600" 
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#3583C7]" /> Evolução de Eficiência ({formatMonth(selectedMonth)})
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
                  isAnimationActive={false}
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
                <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={50} isAnimationActive={false}>
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