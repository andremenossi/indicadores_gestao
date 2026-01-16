
import React, { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { SurgeryRecord } from '../types';

interface RecordManagementProps {
  onAdd: (record: Omit<SurgeryRecord, 'id' | 'intervalMinutes' | 'isDelay'>) => void;
  allowedRooms: string[];
}

export const RecordManagement: React.FC<RecordManagementProps> = ({ onAdd, allowedRooms }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patientName, setPatientName] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const date = fd.get('date') as string;
    const name = patientName.trim().replace(/\s+/g, ' ').toUpperCase();
    const record = fd.get('record') as string;
    const room = fd.get('room') as string;
    const start = fd.get('start') as string;
    const end = fd.get('end') as string;

    if (!name || name.length < 3) {
      newErrors.patientName = "Informe o nome completo do paciente.";
    }

    if (!/^\d+$/.test(record)) {
      newErrors.record = "O prontuário deve conter apenas números.";
    }

    if (date > today) {
      newErrors.date = "Não é possível lançar dados em datas futuras.";
    }

    if (start === end) {
      newErrors.time = "Os horários de início e fim não podem ser iguais.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onAdd({
      date,
      patientName: name,
      medicalRecord: record,
      roomNumber: room,
      endAnesthesiaPrev: start,
      startAnesthesiaNext: end,
    });
    
    e.currentTarget.reset();
    setPatientName('');
  };

  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value.toUpperCase().replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setPatientName(val);
  };

  const handleRecordInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
          <div className="p-3 bg-blue-50 text-[#3583C7] rounded-md border border-blue-100">
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">Novo Lançamento</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dados Assistenciais</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
              <input 
                name="date" 
                type="date" 
                required 
                max={today}
                defaultValue={today} 
                className={`w-full px-4 py-3 rounded-lg border ${errors.date ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:border-[#3583C7] text-sm font-bold`} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sala</label>
              <select name="room" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#3583C7] bg-slate-50 text-sm font-black cursor-pointer">
                {allowedRooms.map(r => <option key={r} value={r}>Sala {r}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Paciente</label>
            <input 
              name="patientName" 
              type="text" 
              placeholder="NOME COMPLETO" 
              required 
              value={patientName}
              onInput={handleNameInput}
              className={`w-full px-4 py-3 rounded-lg border uppercase ${errors.patientName ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:border-[#3583C7] text-sm font-black`} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nº Prontuário</label>
            <input 
              name="record" 
              type="text" 
              placeholder="APENAS NÚMEROS" 
              required 
              onInput={handleRecordInput}
              maxLength={12}
              className={`w-full px-4 py-3 rounded-lg border ${errors.record ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:border-[#3583C7] text-sm font-black`} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Início Anestesia</label>
              <input 
                name="start" 
                type="time" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#3583C7] text-sm font-mono font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fim Anestesia</label>
              <input 
                name="end" 
                type="time" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#3583C7] text-sm font-mono font-bold" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-[#3583C7] text-white font-black py-4 rounded-lg hover:bg-[#2d70ab] transition-all text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-blue-500/10 active:scale-[0.98]">
              Lançar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
