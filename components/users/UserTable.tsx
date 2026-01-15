
import React from 'react';
import { Edit2, Trash2, Lock } from 'lucide-react';
import { User, RoleConfig } from '../../types';

interface UserTableProps {
  users: User[];
  roleConfigs: RoleConfig[];
  currentUser: User | null;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  roleConfigs, 
  currentUser, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
        <thead className="bg-[#0f172a] text-white">
          <tr className="[&>th]:px-4 [&>th]:py-4 [&>th]:text-[10px] [&>th]:font-black [&>th]:uppercase [&>th]:tracking-widest [&>th]:border-b [&>th]:border-slate-800">
            <th className="w-1/3">Login</th>
            <th className="text-center w-1/4">Nível</th>
            <th className="w-1/4">Senha</th>
            <th className="text-right w-1/6">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {users.map(u => (
            <tr key={u.id} className="group hover:bg-slate-200/70 transition-all duration-200 border-b border-slate-300 last:border-0 cursor-default">
              <td className="px-4 py-6 font-black uppercase text-[11px] align-middle">
                <div className="flex items-center gap-2">
                  {u.username}
                  {u.username === 'admin' && <span title="Usuário Protegido"><Lock size={12} className="text-amber-500" /></span>}
                </div>
              </td>
              <td className="px-4 py-6 text-center align-middle">
                <span className="inline-block px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-600 uppercase border border-slate-300">
                  {roleConfigs.find(r => r.id === u.role)?.roleName || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-6 align-middle">
                <div className="flex items-center gap-2 group/pass cursor-help text-slate-400">
                  <Lock size={12} />
                  <span className="blur-[4px] group-hover/pass:blur-0 transition-all duration-300 font-bold text-[11px]">{u.password}</span>
                </div>
              </td>
              <td className="px-4 py-6 text-right align-middle">
                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(u)} 
                    disabled={u.username === 'admin'} 
                    className="p-1 text-slate-600 hover:text-[#3583C7] transition-colors disabled:opacity-30"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(u.id)} 
                    disabled={u.username === 'admin' || (currentUser && u.id === currentUser.id)} 
                    className="p-1 text-slate-600 hover:text-[#EE3234] transition-colors disabled:opacity-30"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
