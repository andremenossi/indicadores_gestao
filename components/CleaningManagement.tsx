
import React from 'react';
import { CleaningRecord } from '../types';
import { CleaningRecordForm } from './cleaning/CleaningRecordForm';
import { CleaningHistory } from './cleaning/CleaningHistory';
import { CleaningDashboard } from './cleaning/CleaningDashboard';
import { ImportManagement } from './ImportManagement';

interface CleaningManagementProps {
  activeTab: 'dashboard' | 'history' | 'add' | 'import';
  records: CleaningRecord[];
  onAdd: (record: Omit<CleaningRecord, 'id' | 'durationMinutes'>) => void;
  onUpdate: (record: CleaningRecord) => void;
  onDelete: (id: string) => void;
  onDeletePeriod: (startDate: string, endDate: string) => void;
  onExport: () => void;
  onBatchAdd?: (records: CleaningRecord[]) => void;
}

export const CleaningManagement: React.FC<CleaningManagementProps> = ({ 
  activeTab, 
  records, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onDeletePeriod, 
  onExport,
  onBatchAdd
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

      {activeTab === 'import' && (
        <ImportManagement 
          type="cleaning"
          onBatchAdd={onBatchAdd || (() => {})}
        />
      )}
    </div>
  );
};
