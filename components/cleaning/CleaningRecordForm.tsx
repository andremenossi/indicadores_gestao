
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { CleaningRecord } from '../../types';

interface CleaningRecordFormProps {
  onAdd: (record: Omit<CleaningRecord, 'id' | 'durationMinutes'>) => void;
}

const CLEANING_ROOMS = ['01', '02', '03'];

export const CleaningRecordForm: React.FC<CleaningRecordFormProps> = ({ onAdd }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [staffName, setStaffName] = useState('');
  const [nurseName, setNurseName] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const cleanAndFormat = (str: string) => str.trim().replace(/\s+/g, ' ').toUpperCase();

  const handleNameInput = (e: React.FormEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.currentTarget.value.toUpperCase().replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setter(val);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const date = fd.get('date') as string;
    const room = fd.get('room') as string;
    const type = fd.get('type') as CleaningRecord['cleaningType'];
    const start = fd.get('start') as string;
    const end = fd.get('end') as string;

    const finalStaff = cleanAndFormat(staffName);
    const finalNurse = cleanAndFormat(nurseName);

    if (finalStaff.length < 3) newErrors.staff = "Informe o nome completo do colaborador.";
    if (finalNurse.length < 3) newErrors.nurse = "Informe o nome completo do enfermeiro.";
    if (date > today) newErrors.date = "Data futura não permitida.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      date,
      roomNumber: room,
      cleaningType: type,
      staffName: finalStaff,
      nurseName: finalNurse,
      startTime: start,
      endTime: end
    });
    
    e.currentTarget.reset();
    setStaffName('');
    setNurseName('');
    setErrors({});
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">Novo Registro</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Higiene e Esterilização</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
              <input name="date" type="date" required max={today} defaultValue={today} className={`w-full px-4 py-3 rounded-lg border ${errors.date ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:border-[#3583C7] text-sm font-bold shadow-inner`} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sala</label>
              <select name="room" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-black cursor-pointer shadow-inner">
                {CLEANING_ROOMS.map(r => <option key={r} value={r}>Sala {r}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Limpeza</label>
            <select name="type" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-black cursor-pointer shadow-inner">
              <option value="CONCORRENTE">CONCORRENTE</option>
              <option value="TERMINAL">TERMINAL</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Colaborador da Higiene</label>
            <input 
              name="staff" 
              type="text" 
              placeholder="NOME DO COLABORADOR" 
              required 
              value={staffName}
              onInput={(e) => handleNameInput(e, setStaffName)}
              className={`w-full px-4 py-3 rounded-lg border uppercase ${errors.staff ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:border-[#3583C7] text-sm font-black shadow-inner`} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enfermeiro de Plantão</label>
            <input 
              name="nurse" 
              type="text" 
              placeholder="NOME DO ENFERMEIRO" 
              required 
              value={nurseName}
              onInput={(e) => handleNameInput(e, setNurseName)}
              className={`w-full px-4 py-3 rounded-lg border uppercase ${errors.nurse ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:border-[#3583C7] text-sm font-black shadow-inner`} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Início</label>
              <input name="start" type="time" required className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#3583C7] text-sm font-mono font-bold shadow-inner" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Término</label>
              <input name="end" type="time" required className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#3583C7] text-sm font-mono font-bold shadow-inner" />
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-[10px] font-black text-[#EE3234] uppercase tracking-widest animate-pulse">
              Corrija os campos destacados acima.
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full bg-[#3583C7] text-white font-black py-4 rounded-lg hover:bg-[#2d70ab] transition-all text-[11px] uppercase tracking-[0.15em] shadow-lg active:scale-[0.98]">
              Registrar Limpeza
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
