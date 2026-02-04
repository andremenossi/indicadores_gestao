
import React, { useState, useMemo, useDeferredValue, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  Download, 
  Trash, 
  AlertCircle, 
  Trash2, 
  Edit2,
  ClipboardList, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  AlertTriangle
} from 'lucide-react';
import { CleaningRecord } from '../../types';
import { displayDate, calculateIntervalMinutes } from '../../utils/time';
import { useAuth } from '../../contexts/AuthContext';

interface CleaningHistoryProps {
  records: CleaningRecord[];
  onUpdate: (record: CleaningRecord) => void;
  onDelete: (id: string) => void;
  onDeletePeriod: (startDate: string, endDate: string) => void;
  onExport: () => void;
}

const LIMIT_OPTIONS = [10, 20, 30, 40, 50, 'Sem Limite'];
const CLEANING_ROOMS = ['01', '02', '03'];

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-[0_30px_90px_-15px_rgba(0,0,0,0.4)] border border-slate-300 w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-10 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center mb-6 text-[#EE3234] bg-red-50 rounded-full border border-red-100">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-[#EE3234] uppercase tracking-tight mb-4 leading-tight">{title}</h3>
          <p className="text-[13px] text-slate-500 font-bold leading-relaxed px-4">{message}</p>
        </div>
        <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all active:scale-95">CANCELAR</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white bg-[#EE3234] hover:bg-[#d02c2e] transition-all shadow-xl active:scale-95">CONFIRMAR</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditCleaningModal: React.FC<{
  record: CleaningRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: CleaningRecord) => void;
}> = ({ record, isOpen, onClose, onSave }) => {
  const [staffName, setStaffName] = useState(record.staffName);
  const [nurseName, setNurseName] = useState(record.nurseName);
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleNameInput = (e: React.FormEvent<HTMLInputElement>, setter: (v: string) => void) => {
    setter(e.currentTarget.value.toUpperCase().replace(/[^a-zA-ZÀ-ÿ\s]/g, ''));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      ...record,
      date: fd.get('date') as string,
      roomNumber: fd.get('room') as string,
      cleaningType: fd.get('type') as CleaningRecord['cleaningType'],
      staffName: staffName.trim().replace(/\s+/g, ' ').toUpperCase(),
      nurseName: nurseName.trim().replace(/\s+/g, ' ').toUpperCase(),
      startTime: fd.get('start') as string,
      endTime: fd.get('end') as string,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-scale-in">
        <form onSubmit={handleSubmit}>
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Editar Limpeza</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2"><X size={20} /></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</label>
                <input name="date" type="date" required defaultValue={record.date} max={today} className="w-full px-4 py-3 border border-slate-300 rounded bg-slate-50 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sala</label>
                <select name="room" defaultValue={record.roomNumber} className="w-full px-4 py-3 border border-slate-300 rounded bg-slate-50 text-xs font-black">
                  {CLEANING_ROOMS.map(r => <option key={r} value={r}>Sala {r}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</label>
              <select name="type" defaultValue={record.cleaningType} className="w-full px-4 py-3 border border-slate-300 rounded bg-slate-50 text-xs font-black">
                <option value="CONCORRENTE">CONCORRENTE</option>
                <option value="TERMINAL">TERMINAL</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</label>
              <input value={staffName} onInput={(e) => handleNameInput(e, setStaffName)} type="text" className="w-full px-4 py-3 border border-slate-300 rounded bg-slate-50 text-xs font-black uppercase" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enfermeiro</label>
              <input value={nurseName} onInput={(e) => handleNameInput(e, setNurseName)} type="text" className="w-full px-4 py-3 border border-slate-300 rounded bg-slate-50 text-xs font-black uppercase" />
            </div>
          </div>
          <div className="p-6 bg-slate-100 border-t border-slate-200 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded text-[10px] font-black uppercase">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-[#3583C7] text-white rounded text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Salvar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const CleaningHistory: React.FC<CleaningHistoryProps> = ({ records, onUpdate, onDelete, onDeletePeriod, onExport }) => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [deleteRange, setDeleteRange] = useState({ start: '', end: '' });
  const [sortField, setSortField] = useState<keyof CleaningRecord>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [displayLimit, setDisplayLimit] = useState<number | string>(10);
  const [editingRecord, setEditingRecord] = useState<CleaningRecord | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isRangeDeleteConfirmOpen, setIsRangeDeleteConfirmOpen] = useState(false);

  const deferredSearch = useDeferredValue(searchTerm);

  const filtered = useMemo(() => {
    const cleanS = normalize(deferredSearch.trim());
    let result = records.filter(r => 
      normalize(r.staffName).includes(cleanS) || 
      normalize(r.nurseName).includes(cleanS) || 
      r.roomNumber.includes(cleanS) ||
      displayDate(r.date).includes(cleanS)
    );

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    if (displayLimit !== 'Sem Limite') result = result.slice(0, Number(displayLimit));
    return result;
  }, [records, deferredSearch, sortField, sortOrder, displayLimit]);

  const toggleSort = (field: keyof CleaningRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: keyof CleaningRecord) => {
    const size = 14;
    if (sortField !== field) return <ArrowUpDown size={size} className="opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp size={size} className="text-white" /> : <ArrowDown size={size} className="text-white" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {editingRecord && <EditCleaningModal record={editingRecord} isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} onSave={onUpdate} />}
      <ConfirmationModal isOpen={!!idToDelete} onClose={() => setIdToDelete(null)} onConfirm={() => idToDelete && onDelete(idToDelete)} title="EXCLUIR REGISTRO" message="Deseja excluir permanentemente este registro de limpeza?" />
      <ConfirmationModal isOpen={isRangeDeleteConfirmOpen} onClose={() => setIsRangeDeleteConfirmOpen(false)} onConfirm={() => onDeletePeriod(deleteRange.start, deleteRange.end)} title="EXCLUSÃO EM LOTE" message={`Atenção: Todos os registros entre ${displayDate(deleteRange.start)} e ${displayDate(deleteRange.end)} serão apagados.`} />

      <div className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-300 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 group flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#3583C7]" size={18} />
              <input 
                type="text"
                placeholder="Pesquisar por colaborador, enfermeiro ou sala..."
                value={searchTerm}
                onInput={(e) => setSearchTerm(e.currentTarget.value.toUpperCase())}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#3583C7] text-sm font-bold shadow-inner uppercase"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#EE3234] rounded-full hover:bg-slate-200"><X size={16} strokeWidth={3} /></button>}
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

            <button onClick={onExport} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3583C7] text-white rounded-md font-black shadow-md hover:bg-[#2d70ab] transition-all text-[10px] uppercase tracking-widest">
                <Download size={14} /> Exportar
            </button>
            
            {hasPermission('DELETE_PERIOD_CLEANING') && (
              <button onClick={() => setShowMaintenance(!showMaintenance)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase transition-all active:scale-95 ${showMaintenance ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
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
                <button onClick={() => setIsRangeDeleteConfirmOpen(true)} className="px-6 py-2.5 bg-[#EE3234] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-[#d02c2e] transition-all">Limpar Período</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-sm">
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-10 bg-[#0f172a] text-white">
              <tr className="[&>th]:px-4 [&>th]:py-4 [&>th]:text-[10px] [&>th]:font-black [&>th]:uppercase [&>th]:tracking-widest [&>th]:border-b [&>th]:border-slate-800">
                <th onClick={() => toggleSort('date')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[110px]">
                  <div className="flex items-center justify-between">Data {getSortIcon('date')}</div>
                </th>
                <th onClick={() => toggleSort('roomNumber')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[85px]">
                  <div className="flex items-center justify-between">Sala {getSortIcon('roomNumber')}</div>
                </th>
                <th onClick={() => toggleSort('cleaningType')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[130px]">
                  <div className="flex items-center justify-between">Tipo {getSortIcon('cleaningType')}</div>
                </th>
                <th onClick={() => toggleSort('staffName')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[180px]">
                  <div className="flex items-center justify-between">Colab. {getSortIcon('staffName')}</div>
                </th>
                <th onClick={() => toggleSort('nurseName')} className="cursor-pointer hover:bg-slate-700 transition-colors w-[180px]">
                  <div className="flex items-center justify-between">Enf. {getSortIcon('nurseName')}</div>
                </th>
                <th onClick={() => toggleSort('startTime')} className="w-[85px] text-center cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">Início {getSortIcon('startTime')}</div>
                </th>
                <th onClick={() => toggleSort('endTime')} className="w-[85px] text-center cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">Fim {getSortIcon('endTime')}</div>
                </th>
                <th onClick={() => toggleSort('durationMinutes')} className="w-[90px] text-center cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">Tempo {getSortIcon('durationMinutes')}</div>
                </th>
                <th className="text-right p-4 w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="group hover:bg-slate-200/70 transition-all duration-200 border-b border-slate-300 last:border-0 cursor-default">
                    <td className="px-4 py-5 font-bold text-slate-500 text-[11px] align-middle">{displayDate(r.date)}</td>
                    <td className="px-4 py-5 align-middle"><span className="inline-block px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 border border-slate-300">{r.roomNumber}</span></td>
                    <td className="px-4 py-5 align-middle"><span className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase border ${r.cleaningType === 'TERMINAL' ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-blue-50 text-blue-600 border-blue-300'}`}>{r.cleaningType}</span></td>
                    <td className="px-4 py-5 font-black text-slate-900 uppercase text-[11px] truncate align-middle" title={r.staffName}>{r.staffName}</td>
                    <td className="px-4 py-5 font-bold text-slate-700 uppercase text-[11px] truncate align-middle" title={r.nurseName}>{r.nurseName}</td>
                    <td className="px-4 py-5 text-center font-mono text-[11px] font-bold text-slate-500 align-middle">{r.startTime}</td>
                    <td className="px-4 py-5 text-center font-mono text-[11px] font-bold text-slate-500 align-middle">{r.endTime}</td>
                    <td className="px-4 py-5 text-center align-middle font-black text-slate-900 text-[11px]">{r.durationMinutes}m</td>
                    <td className="px-4 py-5 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {hasPermission('EDIT_CLEANING') && (
                          <button onClick={() => setEditingRecord(r)} className="p-1 text-slate-600 hover:text-[#3583C7] transition-colors"><Edit2 size={16} /></button>
                        )}
                        {hasPermission('DELETE_CLEANING') && (
                          <button onClick={() => setIdToDelete(r.id)} className="p-1 text-slate-600 hover:text-[#EE3234] transition-colors"><Trash2 size={16} /></button>
                        )}
                      </div>
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
