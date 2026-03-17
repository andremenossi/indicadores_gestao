
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  ClipboardList, 
  AlertCircle,
  LayoutDashboard,
  Timer,
  Activity,
  CheckCircle2
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
import { SurgeryRecord, CleaningRecord } from '../types';
import { displayDate, calculateIntervalMinutes } from '../utils/time';
import { StatCard } from './dashboard/StatCard';
import { LeanManagementCard } from './dashboard/LeanManagementCard';
import { DashboardFilters } from './dashboard/DashboardFilters';
import { ALLOWED_ROOMS } from '../constants/config';

interface DashboardProps {
  records: SurgeryRecord[];
  cleaningRecords?: CleaningRecord[];
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

export const Dashboard: React.FC<DashboardProps> = ({ records, cleaningRecords = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [activeView, setActiveView] = useState<'occupancy' | 'turnover'>('occupancy');

  const availableMonths = useMemo(() => {
    const months = records.map(r => r.date.substring(0, 7));
    return Array.from(new Set(months)).sort().reverse();
  }, [records]);

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

  const filteredCleaning = useMemo(() => {
    let result = cleaningRecords;
    if (selectedMonth !== 'all') {
      result = result.filter(r => r.date.startsWith(selectedMonth));
    }
    if (selectedRoom !== 'all') {
      result = result.filter(r => r.roomNumber === selectedRoom);
    }
    return result;
  }, [cleaningRecords, selectedMonth, selectedRoom]);

  // CÁLCULO TAXA DE OCUPAÇÃO E PERFORMANCE DE OCUPAÇÃO
  const occupationStats = useMemo(() => {
    const surgeryMinutes = filteredRecords.reduce((acc, curr) => acc + curr.intervalMinutes, 0);
    const cleaningMinutes = filteredCleaning.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    
    // Performance baseada na duração da ocupação (cirurgia)
    const occupancyPerformance = filteredRecords.reduce((acc, curr) => {
      if (curr.intervalMinutes < 25) acc.high++;
      if (curr.isDelay) acc.delays++;
      return acc;
    }, { high: 0, delays: 0 });

    // Numerador para o indicador: Cirurgia + Limpeza
    const numeratorForRate = surgeryMinutes + cleaningMinutes;

    let numDays = 1;
    if (selectedMonth === 'all') {
      if (records.length > 0) {
        const dates = records.map(r => new Date(r.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        numDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
      }
    } else {
      const [year, month] = selectedMonth.split('-').map(Number);
      numDays = new Date(year, month, 0).getDate();
    }

    const roomsCount = selectedRoom === 'all' ? ALLOWED_ROOMS.length : 1;
    const denominator = numDays * 1440 * roomsCount;

    const rate = denominator > 0 ? parseFloat(((numeratorForRate / denominator) * 100).toFixed(1)) : 0;

    return { 
      totalOccupancyMinutes: surgeryMinutes + cleaningMinutes,
      indicatorResult: rate, 
      count: filteredRecords.length,
      occupancyPerformance
    };
  }, [filteredRecords, filteredCleaning, records, selectedMonth, selectedRoom]);

  // CÁLCULO TURNOVER
  const computedTurnovers = useMemo(() => {
    const groups: Record<string, SurgeryRecord[]> = {};
    records.forEach(r => {
      const key = `${r.date}_${r.roomNumber}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    const result: { id: string; date: string; roomNumber: string; gap: number; isDelay: boolean }[] = [];

    Object.values(groups).forEach(group => {
      const sorted = [...group].sort((a, b) => a.endAnesthesiaPrev.localeCompare(b.endAnesthesiaPrev));
      sorted.forEach((rec, idx) => {
        if (idx > 0) {
          const prev = sorted[idx - 1];
          const gap = calculateIntervalMinutes(prev.startAnesthesiaNext, rec.endAnesthesiaPrev);
          result.push({
            id: rec.id,
            date: rec.date,
            roomNumber: rec.roomNumber,
            gap,
            isDelay: gap > 60
          });
        }
      });
    });
    return result;
  }, [records]);

  const filteredTurnovers = useMemo(() => {
    let result = computedTurnovers;
    if (selectedMonth !== 'all') {
      result = result.filter(r => r.date.startsWith(selectedMonth));
    }
    if (selectedRoom !== 'all') {
      result = result.filter(r => r.roomNumber === selectedRoom);
    }
    return result;
  }, [computedTurnovers, selectedMonth, selectedRoom]);

  const turnoverStats = useMemo(() => {
    return filteredTurnovers.reduce((acc, curr) => {
      if (!curr.isDelay) {
        acc.validTotalGapMinutes += curr.gap;
      }
      
      if (curr.isDelay) {
        acc.delaysCount += 1;
      } else {
        if (curr.gap < 25) acc.highPerformanceCount += 1;
        else if (curr.gap <= 40) acc.mediumPerformanceCount += 1;
        else acc.lowPerformanceCount += 1;
      }
      return acc;
    }, {
      validTotalGapMinutes: 0,
      highPerformanceCount: 0,
      delaysCount: 0,
      mediumPerformanceCount: 0,
      lowPerformanceCount: 0,
    });
  }, [filteredTurnovers]);

  const indicatorTurnoverResult = useMemo(() => {
    const validTurnoverPatients = filteredRecords.filter(r => r.intervalMinutes <= 60).length;
    return validTurnoverPatients > 0 
      ? parseFloat((turnoverStats.validTotalGapMinutes / validTurnoverPatients).toFixed(1)) 
      : 0;
  }, [turnoverStats.validTotalGapMinutes, filteredRecords]);

  const chartData = useMemo(() => [
    { name: 'Alta (<25)', count: turnoverStats.highPerformanceCount, fill: '#10b981' },
    { name: 'Média (25-40)', count: turnoverStats.mediumPerformanceCount, fill: '#f59e0b' },
    { name: 'Baixa (>40)', count: turnoverStats.lowPerformanceCount, fill: '#EE3234' }
  ], [turnoverStats]);

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardFilters 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
        formatMonth={formatMonth}
        selectedRoom={selectedRoom}
        onRoomChange={setSelectedRoom}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Procedimentos */}
        <StatCard 
          title="Procedimentos" 
          value={occupationStats.count} 
          subtitle="Total de cirurgias" 
          icon={<ClipboardList />} 
          borderColor="border-l-cyan-600" 
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        
        {activeView === 'occupancy' ? (
          <>
            {/* 2. Ocupação Total */}
            <StatCard 
              title="Ocupação Total" 
              value={`${occupationStats.totalOccupancyMinutes}m`} 
              subtitle="Tempo total em sala" 
              icon={<Timer />} 
              borderColor="border-l-blue-600"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            {/* 3. Taxa de Ocupação */}
            <StatCard 
              title="Taxa de Ocupação" 
              value={occupationStats.indicatorResult} 
              subtitle="Resultado do indicador" 
              icon={<Activity />} 
              borderColor="border-l-indigo-600"
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
          </>
        ) : (
          <>
            {/* 2. Tempo Total */}
            <StatCard 
              title="Tempo Total" 
              value={`${turnoverStats.validTotalGapMinutes}m`} 
              subtitle="Soma total dos intervalos" 
              icon={<Clock />} 
              borderColor="border-l-teal-500"
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
            />
            {/* 3. Turnover */}
            <StatCard 
              title="Turnover" 
              value={indicatorTurnoverResult} 
              subtitle="Resultado do indicador"
              icon={<TrendingUp />} 
              borderColor="border-l-emerald-500" 
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </>
        )}

        {/* 4. Alta Performance */}
        <StatCard 
          title="Alta Performance" 
          value={activeView === 'occupancy' ? occupationStats.occupancyPerformance.high : turnoverStats.highPerformanceCount} 
          subtitle={activeView === 'occupancy' ? "Cirurgias < 25min" : "Intervalos < 25min"} 
          icon={<CheckCircle2 />} 
          borderColor="border-l-green-600" 
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />

        {/* 5. Atrasos Graves */}
        <StatCard 
          title="Atrasos Graves" 
          value={activeView === 'occupancy' ? occupationStats.occupancyPerformance.delays : turnoverStats.delaysCount} 
          subtitle={activeView === 'occupancy' ? "Cirurgias > 60min" : "Intervalos > 60min"} 
          icon={<AlertCircle />} 
          borderColor="border-l-red-600" 
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#3583C7]" /> 
            {activeView === 'occupancy' ? 'Evolução de Ocupação' : 'Evolução de Turnover'} ({selectedRoom === 'all' ? 'Geral' : `Sala ${selectedRoom}`})
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeView === 'occupancy' ? [...filteredRecords].reverse().slice(0, 20) : [...filteredTurnovers].reverse().slice(0, 20)}>
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
                  dataKey={activeView === 'occupancy' ? 'intervalMinutes' : 'gap'} 
                  stroke={activeView === 'occupancy' ? '#6366f1' : '#3583C7'} 
                  strokeWidth={3} 
                  dot={{ fill: activeView === 'occupancy' ? '#6366f1' : '#3583C7', r: 4 }} 
                  activeDot={{ r: 6 }} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <LayoutDashboard size={16} className="text-emerald-500" /> Distribuição de Metas Lean ({selectedRoom === 'all' ? 'Geral' : `Sala ${selectedRoom}`})
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
