
import React, { useState } from 'react';
import { Sparkles, ClipboardList, PlusCircle, LayoutDashboard } from 'lucide-react';
import { CleaningRecord } from '../types';
import { CleaningRecordForm } from './cleaning/CleaningRecordForm';
import { CleaningHistory } from './cleaning/CleaningHistory';

interface CleaningManagementProps {
  activeTab: 'dashboard' | 'history' | 'add';
  records: CleaningRecord[];
  onAdd: (record: Omit<CleaningRecord, 'id' | 'durationMinutes'>) => void;
  onUpdate: (record: CleaningRecord) => void;
  onDelete: (id: string) => void;
  onDeletePeriod: (startDate: string, endDate: string) => void;
  onExport: () => void;
}

export const CleaningManagement: React.FC<CleaningManagementProps> = ({ 
  activeTab, 
  records, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onDeletePeriod, 
  onExport 
}) => {
  return (
    <div className="animate-fade-in">
      {activeTab === 'dashboard' && (
        <div className="py-20 text-center animate-fade-in">
          <LayoutDashboard size={64} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Dashboard de Limpeza</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Métricas e indicadores em fase de consolidação.</p>
        </div>
      )}

      {activeTab === 'history' && (
        <CleaningHistory 
          records={records}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDeletePeriod={onDeletePeriod}
          onExport={onExport}
        />
      )}

      {activeTab === 'add' && (
        <CleaningRecordForm onAdd={onAdd} />
      )}
    </div>
  );
};
