
import React from 'react';
import { Edit2, Trash2, Lock, CheckCircle2 } from 'lucide-react';
import { RoleConfig, Permission } from '../../types';
import { PERMISSION_LABELS } from '../../constants/config';

interface RoleListProps {
  roles: RoleConfig[];
  allPermissions: Permission[];
  onEdit: (role: RoleConfig) => void;
  onDelete: (id: string) => void;
  onTogglePermission: (roleId: string, perm: Permission) => void;
}

export const RoleList: React.FC<RoleListProps> = ({ 
  roles, 
  allPermissions, 
  onEdit, 
  onDelete, 
  onTogglePermission 
}) => {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map(config => (
        <div key={config.id} className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm relative group hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{config.roleName}</h4>
              {config.id === 'ADMIN' && <Lock size={12} className="text-amber-500" />}
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(config)} disabled={config.id === 'ADMIN'} className="p-1.5 text-slate-400 hover:text-[#3583C7] disabled:opacity-20"><Edit2 size={12} /></button>
              <button onClick={() => onDelete(config.id)} disabled={config.id === 'ADMIN'} className="p-1.5 text-slate-400 hover:text-[#EE3234] disabled:opacity-20"><Trash2 size={12} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {allPermissions.map(perm => {
              const isChecked = config.permissions.includes(perm);
              return (
                <button 
                  key={perm} 
                  onClick={() => onTogglePermission(config.id, perm)} 
                  disabled={config.id === 'ADMIN'} 
                  className={`w-full flex items-center justify-between px-3 py-2 rounded border text-[9px] font-black uppercase transition-all ${isChecked ? 'bg-blue-50 border-[#3583C7]/30 text-[#3583C7]' : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600'}`}
                >
                  {PERMISSION_LABELS[perm]} {isChecked && <CheckCircle2 size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
