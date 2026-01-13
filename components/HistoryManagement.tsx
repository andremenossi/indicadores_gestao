
import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  AlertCircle, 
  ClipboardList 
} from 'lucide-react';
import { SurgeryRecord } from '../types';

interface HistoryManagementProps {
  records: SurgeryRecord[];
}

const displayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

const LIMIT_OPTIONS = [10, 20, 30, 40, 50, 'Sem Limite'];

export const HistoryManagement: React.FC<HistoryManagementProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof SurgeryRecord>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [displayLimit, setDisplayLimit] = useState<number | string>(10);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredAndSortedRecords = useMemo(() => {
    let result = records.filter(r => {
      const formattedDate = displayDate(r.date);
      return (
        r.medicalRecord.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formattedDate.includes(searchTerm) ||
        r.date.includes(searchTerm)
      );
    });

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    if (displayLimit !== 'Sem Limite') result = result.slice(0, Number(displayLimit));
    return result;
  }, [records, searchTerm, sortField, sortOrder, displayLimit]);

  const toggleSort = (field: keyof SurgeryRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const getSortIcon = (field: keyof SurgeryRecord) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-white" /> : <ArrowDown size={12} className="text-white" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-row gap-4 items-center justify-between bg-white p-6 rounded-lg border border-slate-300 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            ref={searchInputRef}
            type="text"
            placeholder="Pesquise por Prontuário ou Data (DD-MM-YYYY)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#3583C7] transition-all text-sm font-bold shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-slate-400 hover:bg-slate-600 transition-colors p-1 rounded-full shadow-sm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 whitespace-nowrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exibir</span>
          <select 
            value={displayLimit} 
            onChange={(e) => setDisplayLimit(e.target.value === 'Sem Limite' ? e.target.value : Number(e.target.value))}
            className="px-6 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer focus:ring-2 focus:ring-[#3583C7]/10 outline-none"
          >
            {LIMIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-300 shadow-lg overflow-hidden">
        {/* Container de rolagem interna com altura máxima calculada para o espaço ideal */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar relative">
          <table className="w-full text-left border-collapse table-striped">
            <thead className="sticky top-0 z-10">
              <tr>
                <th onClick={() => toggleSort('date')} className="cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-between">Data {getSortIcon('date')}</div>
                </th>
                <th onClick={() => toggleSort('medicalRecord')} className="cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-between">Prontuário {getSortIcon('medicalRecord')}</div>
                </th>
                <th onClick={() => toggleSort('roomNumber')} className="text-center cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-center gap-2">Sala {getSortIcon('roomNumber')}</div>
                </th>
                <th onClick={() => toggleSort('endAnesthesiaPrev')} className="text-center cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-center gap-2">Início Anestesia {getSortIcon('endAnesthesiaPrev')}</div>
                </th>
                <th onClick={() => toggleSort('startAnesthesiaNext')} className="text-center cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-center gap-2">Fim Anestesia {getSortIcon('startAnesthesiaNext')}</div>
                </th>
                <th onClick={() => toggleSort('intervalMinutes')} className="text-center cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-center gap-2">Tempo {getSortIcon('intervalMinutes')}</div>
                </th>
                <th onClick={() => toggleSort('isDelay')} className="text-right cursor-pointer hover:bg-slate-700 bg-[#1e293b]">
                  <div className="flex items-center justify-end gap-2">Status {getSortIcon('isDelay')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold text-slate-500 text-xs">{displayDate(r.date)}</td>
                    <td className="font-black text-slate-900">{r.medicalRecord}</td>
                    <td className="text-center">
                      <span className="px-2.5 py-1 bg-slate-200 rounded-md text-[10px] font-black text-slate-600 border border-slate-300">{r.roomNumber}</span>
                    </td>
                    <td className="text-center font-black text-slate-600 font-mono text-xs">{r.endAnesthesiaPrev}</td>
                    <td className="text-center font-black text-slate-600 font-mono text-xs">{r.startAnesthesiaNext}</td>
                    <td className="text-center">
                      <span className={`text-sm font-black ${r.isDelay ? 'text-[#EE3234]' : 'text-slate-900'}`}>{r.intervalMinutes} min</span>
                    </td>
                    <td className="text-right">
                      {r.isDelay ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#EE3234] rounded-md text-[9px] font-black uppercase tracking-widest border border-[#EE3234]/20">
                          <AlertCircle size={10} /> Atraso
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                          r.intervalMinutes < 25 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          r.intervalMinutes <= 40 ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                          'bg-slate-50 text-slate-500 border-slate-300'
                        }`}>
                          {r.intervalMinutes < 25 ? 'Alta' : r.intervalMinutes <= 40 ? 'Média' : 'Baixa'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-20 bg-slate-50">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <ClipboardList size={40} />
                      <span className="text-xs font-black uppercase tracking-widest">Nenhum registro encontrado</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
