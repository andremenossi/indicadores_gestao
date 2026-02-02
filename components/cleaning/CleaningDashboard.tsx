
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  ClipboardList, 
  Sparkles,
  Timer,
  Activity
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
import { CleaningRecord } from '../../types';
import { displayDate } from '../../utils/time';
import { StatCard } from '../dashboard/StatCard';
import { DashboardFilters } from '../dashboard/DashboardFilters';

interface CleaningDashboardProps {
  records: CleaningRecord[];
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

export const CleaningDashboard: React.FC<CleaningDashboardProps> = ({ records }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  const availableMonths = useMemo(() => {
    const months = records.map(r => r.date.substring(0, 7));
    return Array.from(new Set(months)).sort().reverse();
  }, [records]);

  // Filtro global unificado
  const filteredRecords = useMemo(() => {
    let result = records;
    if (selectedMonth !== 'all') {
      result = result.filter(r => r.date.startsWith(selectedMonth));
    }
    if (selectedRoom !== 'all') {
      result = result.filter(r => r.roomNumber === selectedRoom);
    }
    return result;
  }, [records, selectedMonth, selectedRoom]);

  const stats = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => {
      acc.totalMinutes += curr.durationMinutes;
      acc.totalRecords += 1;
      
      if (curr.durationMinutes <= 20) {
        acc.idealPerformanceCount += 1;
      } else if (curr.durationMinutes <= 35) {
        acc.mediumPerformanceCount += 1;
      } else {
        acc.lowPerformanceCount += 1;
      }

      return acc;
    }, {
      totalMinutes: 0,
      totalRecords: 0,
      idealPerformanceCount: 0,
      mediumPerformanceCount: 0,
      lowPerformanceCount: 0,
    });
  }, [filteredRecords]);

  const averageDuration = useMemo(() => {
    const sum = filteredRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return filteredRecords.length > 0 
      ? parseFloat((sum / filteredRecords.length).toFixed(1)) 
      : 0;
  }, [filteredRecords]);

  const chartData = useMemo(() => [
    { name: 'Ideal (≤20)', count: stats.idealPerformanceCount, fill: '#10b981' },
    { name: 'Média (21-35)', count: stats.mediumPerformanceCount, fill: '#f59e0b' },
    { name: 'Crítica (>35)', count: stats.lowPerformanceCount, fill: '#EE3234' }
  ], [stats.idealPerformanceCount, stats.mediumPerformanceCount, stats.lowPerformanceCount]);

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardFilters 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
        formatMonth={formatMonth}
        selectedRoom={selectedRoom}
        onRoomChange={setSelectedRoom}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tempo Total" 
          value={`${stats.totalMinutes}m`} 
          subtitle="Higiene consolidada" 
          icon={<Timer />} 
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard 
          title="Registros" 
          value={stats.totalRecords} 
          subtitle="Total de higienizações" 
          icon={<ClipboardList />} 
          borderColor="border-l-indigo-500" 
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard 
          title="Tempo Médio" 
          value={`${averageDuration}m`} 
          subtitle={selectedRoom === 'all' ? "Média todas as salas" : `Média Sala ${selectedRoom}`}
          icon={<Clock />} 
          borderColor="border-l-blue-500" 
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard 
          title="Tempo Ideal" 
          value={stats.idealPerformanceCount} 
          subtitle="Meta Lean: ≤ 20min" 
          icon={<Sparkles />} 
          borderColor="border-l-emerald-600" 
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Eficiência de Limpeza ({selectedRoom === 'all' ? 'Todas' : `Sala ${selectedRoom}`})
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
                  dataKey="durationMinutes" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10b981', r: 4 }} 
                  activeDot={{ r: 6 }} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Activity size={16} className="text-[#3583C7]" /> Metas de Preparo ({selectedRoom === 'all' ? 'Todas' : `Sala ${selectedRoom}`})
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

      <div className="bg-[#111827] rounded-lg p-8 border border-slate-700 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-emerald-500" size={28} />
              <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Qualidade e Agilidade</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              A literatura cita como meta ideal uma limpeza e preparo de sala ≤ 20 minutos. 
              Manter este padrão garante a rotatividade segura e eficiente do parque cirúrgico, 
              preservando os protocolos de segurança do paciente.
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 min-w-[300px] text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Ideal</p>
            <div className="text-4xl font-bold text-emerald-500 tracking-tighter">≤ 20 MIN</div>
            <p className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest mt-2">Protocolo Institucional</p>
          </div>
        </div>
      </div>
    </div>
  );
};
