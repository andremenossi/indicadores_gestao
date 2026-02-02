
import React from 'react';
import { CleaningRecord } from '../types';
import { CleaningRecordForm } from './cleaning/CleaningRecordForm';
import { CleaningHistory } from './cleaning/CleaningHistory';
import { CleaningDashboard } from './cleaning/CleaningDashboard';

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
        <CleaningDashboard records={records} />
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
