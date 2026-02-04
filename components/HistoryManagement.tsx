
import React, { useState, useMemo, useDeferredValue, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  AlertCircle, 
  ClipboardList,
  Edit2, 
  Trash2,
  Trash,
  AlertTriangle,
  Download
} from 'lucide-react';
import { SurgeryRecord } from '../types';
import { displayDate, calculateIntervalMinutes } from '../utils/time';
import { useAuth } from '../contexts/AuthContext';
import { ALLOWED_ROOMS } from '../constants/config';

interface HistoryManagementProps {
  records: SurgeryRecord[];
  onUpdate: (record: SurgeryRecord) => void;
  onDelete: (id: string) => void;
  onDeletePeriod: (startDate: string, endDate: string) => void;
  onExport: () => void;
}

const LIMIT_OPTIONS = [10, 20, 30, 40, 50, 'Sem Limite'];

const normalizeString = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  showIcon?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmar", showIcon = true }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-[0_30px_90px_-15px_rgba(0,0,0,0.4)] border border-slate-300 w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-10 text-center">
          {showIcon && (
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-6 text-[#EE3234] bg-red-50 rounded-full border border-red-100">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
          )}
          <h3 className="text-xl font-black text-[#EE3234] uppercase tracking-tight mb-4 leading-tight">{title}</h3>
          <p className="text-[13px] text-slate-500 font-bold leading-relaxed px-4">{message}</p>
        </div>
        <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            CANCELAR
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-1 px-4 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white bg-[#EE3234] hover:bg-[#d02c2e] transition-all shadow-xl shadow-red-500/20 active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditModal: React.FC<{
  record: SurgeryRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: SurgeryRecord) => void;
}> = ({ record, isOpen, onClose, onSave }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patientName, setPatientName] = useState(record.patientName.toUpperCase());
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value.toUpperCase().replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setPatientName(val);
  };

  const handleRecordInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const date = fd.get('date') as string;
    const medRecord = fd.get('record') as string;
    const room = fd.get('room') as string;
    const start = fd.get('start') as string;
    const end = fd.get('end') as string;

    const finalName = patientName.trim().replace(/\s+/g, ' ');

    if (!finalName || finalName.length < 3) {
      newErrors.patientName = "Nome completo obrigatório.";
    }

    if (!/^\d+$/.test(medRecord)) {
      newErrors.record = "Apenas números permitidos.";
    }

    if (date > today) {
      newErrors.date = "Data futura inválida.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...record,
      date,
      patientName: finalName.toUpperCase(),
      medicalRecord: medRecord,
      roomNumber: room,
      endAnesthesiaPrev: start,
      startAnesthesiaNext: end,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-300 w-full max-w-lg overflow-hidden animate-scale-in">
        <form onSubmit={handleSubmit}>
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Editar Registro</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Atualize os dados do turnover</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-200"><X size={20} /></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  max={today}
                  defaultValue={record.date} 
                  className={`w-full px-4 py-3.5 rounded-lg border transition-all ${errors.date ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} text-xs font-bold focus:outline-none focus:border-[#3583C7] shadow-inner`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sala</label>
                <select name="room" defaultValue={record.roomNumber} className="w-full px-4 py-3.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-black focus:outline-none focus:border-[#3583C7] shadow-inner">
                  {ALLOWED_ROOMS.map(r => <option key={r} value={r}>Sala {r}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Paciente</label>
              <input 
                name="patientName" 
                type="text" 
                required 
                value={patientName}
                onInput={handleNameInput}
                className={`w-full px-4 py-3.5 rounded-lg border transition-all uppercase ${errors.patientName ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} text-xs font-black focus:outline-none focus:border-[#3583C7] shadow-inner`} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prontuário</label>
              <input 
                name="record" 
                type="text" 
                required 
                maxLength={12}
                onInput={handleRecordInput}
                defaultValue={record.medicalRecord} 
                className={`w-full px-4 py-3.5 rounded-lg border transition-all ${errors.record ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} text-xs font-black focus:outline-none focus:border-[#3583C7] shadow-inner`} 
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Início Anestesia</label>
                <input 
                  name="start" 
                  type="time" 
                  required 
                  defaultValue={record.endAnesthesiaPrev} 
                  className="w-full px-4 py-3.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono font-bold focus:outline-none focus:border-[#3583C7] shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fim Anestesia</label>
                <input 
                  name="end" 
                  type="time" 
                  required 
                  defaultValue={record.startAnesthesiaNext} 
                  className="w-full px-4 py-3.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono font-bold focus:outline-none focus:border-[#3583C7] shadow-inner" 
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-100 border-t border-slate-200 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-4 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
            >
              CANCELAR
            </button>
            <button type="submit" className="flex-1 px-4 py-4 bg-[#3583C7] rounded-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#2d70ab] transition-all shadow-xl shadow-blue-500/20 active:scale-95">SALVAR ALTERAÇÕES</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export const HistoryManagement: React.FC<HistoryManagementProps> = ({ records, onUpdate, onDelete, onDeletePeriod, onExport }) => {
  const { hasPermission } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  const [sortField, setSortField] = useState<keyof SurgeryRecord>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [displayLimit, setDisplayLimit] = useState<number | string>(10);
  const [editingRecord, setEditingRecord] = useState<SurgeryRecord | null>(null);
  
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isRangeDeleteConfirmOpen, setIsRangeDeleteConfirmOpen] = useState(false);
  
  const [deleteRange, setDeleteRange] = useState({ start: '', end: '' });
  const [showMaintenance, setShowMaintenance] = useState(false);

  const filteredAndSortedRecords = useMemo(() => {
    const cleanSearch = normalizeString(deferredSearchTerm.trim().replace(/\s+/g, ' '));
    
    let result = records.filter(r => {
      const formattedDate = normalizeString(displayDate(r.date));
      const patient = normalizeString(r.patientName || '');
      const record = normalizeString(r.medicalRecord);
      
      return patient.includes(cleanSearch) || record.includes(cleanSearch) || formattedDate.includes(cleanSearch);
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
  }, [records, deferredSearchTerm, sortField, sortOrder, displayLimit]);

  const toggleSort = (field: keyof SurgeryRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSearchInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value.toUpperCase().replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '');
    setSearchTerm(val);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getSortIcon = (field: keyof SurgeryRecord) => {
    const size = 14;
    if (sortField !== field) return <ArrowUpDown size={size} className="opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp size={size} className="text-white" /> : <ArrowDown size={size} className="text-white" />;
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      {editingRecord && (
        <EditModal 
          record={editingRecord} 
          isOpen={!!editingRecord} 
          onClose={() => setEditingRecord(null)} 
          onSave={onUpdate} 
        />
      )}

      <ConfirmationModal 
        isOpen={!!idToDelete}
        onClose={() => setIdToDelete(null)}
        onConfirm={() => idToDelete && onDelete(idToDelete)}
        title="EXCLUIR REGISTRO"
        message="Tem certeza que deseja excluir permanentemente este lançamento? Esta ação não poderá ser desfeita."
        confirmLabel="EXCLUIR AGORA"
        showIcon={true}
      />

      <ConfirmationModal 
        isOpen={isRangeDeleteConfirmOpen}
        onClose={() => setIsRangeDeleteConfirmOpen(false)}
        onConfirm={() => onDeletePeriod(deleteRange.start, deleteRange.end)}
        title="LIMPEZA DE PERÍODO"
        message={`Você está excluindo TODOS os registros entre ${displayDate(deleteRange.start)} e ${displayDate(deleteRange.end)}.`}
        confirmLabel="LIMPAR PERÍODO"
        showIcon={true}
      />

      <div className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-300 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 group flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#3583C7]" size={18} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="PESQUISAR POR PACIENTE, PRONTUÁRIO OU DATA..."
                value={searchTerm}
                onInput={handleSearchInput}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#3583C7] focus:ring-4 focus:ring-[#3583C7]/10 transition-all text-sm font-bold shadow-inner uppercase"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#EE3234] transition-colors rounded-full hover:bg-slate-200"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exibir</span>
              <select 
                value={displayLimit} 
                onChange={(e) => setDisplayLimit(e.target.value === 'Sem Limite' ? e.target.value : Number(e.target.value))}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:border-[#3583C7]"
              >
                {LIMIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <button 
                onClick={onExport}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3583C7] text-white rounded-md font-black shadow-md hover:bg-[#2d70ab] transition-all text-[10px] uppercase tracking-widest"
              >
                <Download size={14} /> Exportar
            </button>

            {hasPermission('DELETE_PERIOD_TURNOVER') && (
              <button 
                onClick={() => setShowMaintenance(!showMaintenance)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase transition-all active:scale-95 ${showMaintenance ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Trash size={14} /> Manutenção
              </button>
            )}
          </div>
        </div>

        <div className={`drawer-container ${showMaintenance ? 'open' : ''}`}>
          <div className="drawer-content">
            <div className="mt-4 p-6 bg-rose-50 border border-rose-200 rounded-lg shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} className="text-[#EE3234]" />
                <h4 className="text-[10px] font-black text-[#EE3234] uppercase tracking-widest">Exclusão em Lote</h4>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5 flex-1 min-w-[150px]">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Início</label>
                  <input type="date" value={deleteRange.start} onChange={(e) => setDeleteRange({...deleteRange, start: e.target.value})} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded outline-none focus:border-[#EE3234]" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-[150px]">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fim</label>
                  <input type="date" value={deleteRange.end} onChange={(e) => setDeleteRange({...deleteRange, end: e.target.value})} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded outline-none focus:border-[#EE3234]" />
                </div>
                <button 
                  onClick={() => setIsRangeDeleteConfirmOpen(true)}
                  className="px-6 py-2.5 bg-[#EE3234] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-[#d02c2e] transition-all"
                >
                  Limpar Período
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-300 overflow-hidden">
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-10 bg-[#0f172a] text-white">
              <tr className="[&>th]:px-4 [&>th]:py-4 [&>th]:text-[10px] [&>th]:font-black [&>th]:uppercase [&>th]:tracking-widest [&>th]:border-b [&>th]:border-slate-800">
                <th onClick={() => toggleSort('date')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[110px]">
                  <div className="flex items-center justify-between">Data {getSortIcon('date')}</div>
                </th>
                <th onClick={() => toggleSort('patientName' as any)} className="cursor-pointer hover:bg-slate-700 transition-colors">
                   <div className="flex items-center justify-between">Paciente {getSortIcon('patientName' as any)}</div>
                </th>
                <th onClick={() => toggleSort('medicalRecord')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[100px]">
                  <div className="flex items-center justify-between">Pront. {getSortIcon('medicalRecord')}</div>
                </th>
                <th onClick={() => toggleSort('roomNumber')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[85px]">
                  <div className="flex items-center justify-between">Sala {getSortIcon('roomNumber')}</div>
                </th>
                <th onClick={() => toggleSort('endAnesthesiaPrev')} className="text-center cursor-pointer hover:bg-slate-700 transition-colors w-[85px]">
                  <div className="flex items-center justify-between">Início {getSortIcon('endAnesthesiaPrev')}</div>
                </th>
                <th onClick={() => toggleSort('startAnesthesiaNext')} className="text-center cursor-pointer hover:bg-slate-700 transition-colors w-[85px]">
                  <div className="flex items-center justify-between">Fim {getSortIcon('startAnesthesiaNext')}</div>
                </th>
                <th onClick={() => toggleSort('intervalMinutes')} className="text-center cursor-pointer hover:bg-slate-700 transition-colors w-[90px]">
                  <div className="flex items-center justify-between">Tempo {getSortIcon('intervalMinutes')}</div>
                </th>
                <th onClick={() => toggleSort('isDelay')} className="text-center cursor-pointer hover:bg-slate-700 transition-colors w-[110px]">
                  <div className="flex items-center justify-between">Status {getSortIcon('isDelay')}</div>
                </th>
                <th className="text-right p-4 w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map((r) => (
                  <tr key={r.id} className="group hover:bg-slate-200/70 transition-all duration-200 border-b border-slate-300 last:border-0 cursor-default">
                    <td className="px-4 py-6 font-bold text-slate-500 text-[11px] align-middle">{displayDate(r.date)}</td>
                    <td className="px-4 py-6 font-bold text-slate-900 uppercase whitespace-normal break-words leading-tight text-[11px] align-middle">
                      {r.patientName || '-'}
                    </td>
                    <td className="px-4 py-6 font-bold text-slate-800 text-[11px] align-middle">{r.medicalRecord}</td>
                    <td className="px-4 py-6 text-center align-middle">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 border border-slate-300">
                        {r.roomNumber}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center font-mono text-[11px] font-bold text-slate-500 align-middle">{r.endAnesthesiaPrev}</td>
                    <td className="px-4 py-6 text-center font-mono text-[11px] font-bold text-slate-500 align-middle">{r.startAnesthesiaNext}</td>
                    <td className="px-4 py-6 text-center align-middle">
                      <span className={`text-[11px] font-black ${r.isDelay ? 'text-[#EE3234]' : 'text-slate-900'}`}>{r.intervalMinutes}m</span>
                    </td>
                    <td className="px-4 py-6 text-center align-middle">
                      {r.isDelay ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-[#EE3234] rounded text-[9px] font-black uppercase tracking-widest border border-[#EE3234]/40">
                          Atraso
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                          r.intervalMinutes < 25 ? 'bg-emerald-50 text-emerald-600 border-emerald-400' : 
                          r.intervalMinutes <= 40 ? 'bg-amber-50 text-amber-600 border-amber-400' : 
                          'bg-rose-50 text-rose-600 border-rose-400'
                        }`}>
                          {r.intervalMinutes < 25 ? 'Alta' : r.intervalMinutes <= 40 ? 'Média' : 'Baixa'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-6 text-right align-middle">
                      {(hasPermission('EDIT_TURNOVER') || hasPermission('DELETE_TURNOVER')) && (
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          {hasPermission('EDIT_TURNOVER') && (
                            <button 
                              onClick={() => setEditingRecord(r)}
                              className="p-1 text-slate-600 hover:text-[#3583C7] transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {hasPermission('DELETE_TURNOVER') && (
                            <button 
                              onClick={() => setIdToDelete(r.id)}
                              className="p-1 text-slate-600 hover:text-[#EE3234] transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-20 bg-slate-50">
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
