
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { SurgeryRecord } from '../types';

interface RecordManagementProps {
  onAdd: (record: Omit<SurgeryRecord, 'id' | 'intervalMinutes' | 'isDelay'>) => void;
  allowedRooms: string[];
}

export const RecordManagement: React.FC<RecordManagementProps> = ({ onAdd, allowedRooms }) => {
  return (
    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 p-12">
        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-200">
          <div className="p-4 bg-blue-50 text-[#3583C7] rounded-md border border-blue-100">
            <PlusCircle size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Novo Lançamento</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inserção de Dados HEPP</p>
          </div>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onAdd({
            date: fd.get('date') as string,
            medicalRecord: fd.get('record') as string,
            roomNumber: fd.get('room') as string,
            endAnesthesiaPrev: fd.get('start') as string,
            startAnesthesiaNext: fd.get('end') as string,
          });
        }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
              <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sala</label>
              <select name="room" className="w-full px-4 py-3.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-black cursor-pointer">
                {allowedRooms.map(r => <option key={r} value={r}>Sala {r}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nº Prontuário</label>
            <input name="record" type="text" placeholder="Ex: 855012" required className="w-full px-4 py-3.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-black" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Início Anestesia</label>
              <input name="start" type="time" required className="w-full px-4 py-3.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-mono font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fim Anestesia</label>
              <input name="end" type="time" required className="w-full px-4 py-3.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-mono font-bold" />
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" className="w-full bg-[#3583C7] text-white font-black py-4 rounded-md hover:bg-[#2d70ab] transition-all text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-[0.98]">
              Lançar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
