
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  X, 
  Edit2, 
  Trash2, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Save 
} from 'lucide-react';
import { User, RoleConfig, Permission } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roleConfigs: RoleConfig[];
  setRoleConfigs: React.Dispatch<React.SetStateAction<RoleConfig[]>>;
  currentUser: User;
}

const COLORS = {
  BLUE: '#3583C7',
  RED: '#EE3234'
};

const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_DASHBOARD: 'Ver Dashboard',
  VIEW_RECORDS: 'Ver Histórico',
  ADD_RECORDS: 'Lançar Dados',
  MANAGE_USERS: 'Gerenciar Usuários'
};

const PasswordInput: React.FC<{ value?: string; onChange?: (val: string) => void; name: string; placeholder?: string; required?: boolean; className?: string; defaultValue?: string; disabled?: boolean }> = ({ value, onChange, name, placeholder, required, className, defaultValue, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative group">
      <input 
        name={name}
        type={show ? "text" : "password"} 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        disabled={disabled}
        className={`w-full pr-12 ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'} ${className || 'px-4 py-3 border border-slate-300 rounded-md font-black text-sm outline-none focus:border-[#3583C7]'}`}
      />
      {!disabled && (
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3583C7] transition-colors p-1"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-200">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-[#EE3234] rounded-lg text-xs font-black uppercase tracking-widest text-white hover:bg-[#d02c2e] transition-colors shadow-lg shadow-red-500/20">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, roleConfigs, setRoleConfigs, currentUser }) => {
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<User | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState<RoleConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'role'; id: string } | null>(null);
  
  const [draftRoleConfigs, setDraftRoleConfigs] = useState<RoleConfig[]>([]);

  useEffect(() => {
    setDraftRoleConfigs(JSON.parse(JSON.stringify(roleConfigs)));
  }, [roleConfigs, tab]);

  const closeUserForm = () => {
    setIsAddingUser(false);
    setIsEditingUser(null);
  };

  const closeRoleForm = () => {
    setIsAddingRole(false);
    setIsEditingRole(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const username = fd.get('username') as string;
    const password = fd.get('password') as string;
    const role = fd.get('role') as string;

    if (isEditingUser) {
      if (isEditingUser.username === 'admin') {
        alert('O usuário admin é protegido.');
        closeUserForm();
        return;
      }
      setUsers(users.map(u => u.id === isEditingUser.id ? { ...u, username, password, role } : u));
    } else {
      setUsers([...users, { id: Math.random().toString(36).substr(2, 9), username, password, role }]);
    }
    closeUserForm();
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const roleName = fd.get('roleName') as string;

    if (isEditingRole) {
      if (isEditingRole.id === 'ADMIN') {
        alert('Nível ADMIN protegido.');
        closeRoleForm();
        return;
      }
      setDraftRoleConfigs(draftRoleConfigs.map(r => r.id === isEditingRole.id ? { ...r, roleName } : r));
    } else {
      setDraftRoleConfigs([...draftRoleConfigs, { id: Math.random().toString(36).substr(2, 9), roleName, permissions: [] }]);
    }
    closeRoleForm();
  };

  const togglePermission = (roleId: string, perm: Permission) => {
    if (roleId === 'ADMIN') return;
    setDraftRoleConfigs(prev => prev.map(config => {
      if (config.id === roleId) {
        const has = config.permissions.includes(perm);
        return { ...config, permissions: has ? config.permissions.filter(p => p !== perm) : [...config.permissions, perm] };
      }
      return config;
    }));
  };

  const saveAllConfigs = () => {
    setRoleConfigs(draftRoleConfigs);
    alert('Configurações salvas!');
  };

  const isChanged = JSON.stringify(roleConfigs) !== JSON.stringify(draftRoleConfigs);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ConfirmationModal 
        isOpen={!!deleteTarget}
        title={`Excluir ${deleteTarget?.type === 'user' ? 'Usuário' : 'Nível de Acesso'}`}
        message="Esta ação não pode ser desfeita. Deseja continuar?"
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'user') setUsers(users.filter(u => u.id !== deleteTarget.id));
          else setDraftRoleConfigs(draftRoleConfigs.filter(r => r.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex border-b border-slate-300 gap-8">
        <button onClick={() => setTab('users')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${tab === 'users' ? 'text-[#3583C7]' : 'text-slate-400 hover:text-slate-600'}`}>
          Usuários {tab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3583C7] rounded-t-full"></div>}
        </button>
        <button onClick={() => setTab('roles')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${tab === 'roles' ? 'text-[#3583C7]' : 'text-slate-400 hover:text-slate-600'}`}>
          Nível de acesso {tab === 'roles' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3583C7] rounded-t-full"></div>}
        </button>
      </div>

      {tab === 'users' ? (
        <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Gerenciar Usuários</h3>
            <button 
              onClick={() => (isAddingUser || isEditingUser) ? closeUserForm() : setIsAddingUser(true)} 
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-md text-[10px] font-black uppercase transition-all ${isAddingUser || isEditingUser ? 'bg-slate-500' : 'bg-[#3583C7] hover:bg-[#2d70ab]'}`}
            >
              {(isAddingUser || isEditingUser) ? <X size={14} /> : <PlusCircle size={14} />} 
              {(isAddingUser || isEditingUser) ? 'Cancelar' : 'Novo Usuário'}
            </button>
          </div>

          <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isAddingUser || isEditingUser ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 bg-slate-50 border-b border-slate-200">
              <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Login</label>
                  <input name="username" type="text" required defaultValue={isEditingUser?.username} disabled={isEditingUser?.username === 'admin'} className="w-full px-4 py-3 border border-slate-300 rounded-md font-black text-sm outline-none focus:border-[#3583C7]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Senha</label>
                  <PasswordInput name="password" required defaultValue={isEditingUser?.password} disabled={isEditingUser?.username === 'admin'} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Nível</label>
                  <select name="role" defaultValue={isEditingUser?.role || roleConfigs[0]?.id} disabled={isEditingUser?.username === 'admin'} className="w-full px-4 py-3 border border-slate-300 rounded-md font-black text-sm cursor-pointer outline-none focus:border-[#3583C7]">
                    {roleConfigs.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                  </select>
                </div>
                <button type="submit" className="font-black py-3 px-4 rounded-md text-[10px] uppercase transition-all shadow-md bg-emerald-600 text-white hover:bg-emerald-700">
                  Salvar Usuário
                </button>
              </form>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-striped">
              <thead className="bg-[#0f172a] text-white uppercase text-[10px] font-black">
                <tr>
                  <th className="p-4 border-b border-slate-300">Login</th>
                  <th className="p-4 text-center border-b border-slate-300">Nível</th>
                  <th className="p-4 border-b border-slate-300">Senha</th>
                  <th className="p-4 text-right border-b border-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="group transition-colors border-b border-slate-100">
                    <td className="p-4 font-black uppercase text-sm align-middle">
                      <div className="flex items-center gap-2">
                        {u.username}
                        {u.username === 'admin' && <span title="Usuário Protegido"><Lock size={12} className="text-amber-500" /></span>}
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <span className="px-2 py-1 bg-white border border-slate-300 rounded text-[9px] font-black text-slate-600 uppercase">
                        {roleConfigs.find(r => r.id === u.role)?.roleName || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 group cursor-help text-slate-400">
                        <Lock size={12} />
                        <span className="blur-[4px] group-hover:blur-0 transition-all duration-300 font-bold text-xs">{u.password}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setIsEditingUser(u); setIsAddingUser(false); }} disabled={u.username === 'admin'} className="p-2 rounded border border-slate-200 text-[#3583C7] hover:bg-blue-50 disabled:opacity-30"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget({ type: 'user', id: u.id })} disabled={u.username === 'admin' || u.id === currentUser.id} className="p-2 rounded border border-slate-200 text-[#EE3234] hover:bg-red-50 disabled:opacity-30"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-300 flex items-center justify-between bg-slate-50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Configurar Níveis</h3>
            <button onClick={() => (isAddingRole || isEditingRole) ? closeRoleForm() : setIsAddingRole(true)} className={`flex items-center gap-2 px-4 py-2 text-white rounded-md text-[10px] font-black uppercase transition-all ${isAddingRole || isEditingRole ? 'bg-slate-500' : 'bg-[#3583C7] hover:bg-[#2d70ab]'}`}>
              {(isAddingRole || isEditingRole) ? <X size={14} /> : <PlusCircle size={14} />} 
              {(isAddingRole || isEditingRole) ? 'Cancelar' : 'Novo Nível'}
            </button>
          </div>

          <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isAddingRole || isEditingRole ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 bg-slate-50 border-b border-slate-300">
              <form onSubmit={handleSaveRole} className="flex gap-4 items-end max-w-2xl">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Nome do Nível</label>
                  <input name="roleName" type="text" required defaultValue={isEditingRole?.roleName} disabled={isEditingRole?.id === 'ADMIN'} className="w-full px-4 py-3 border border-slate-300 rounded-md font-black text-sm outline-none focus:border-[#3583C7]" />
                </div>
                <button type="submit" className="font-black py-3 px-8 rounded-md text-[10px] uppercase transition-all shadow-md bg-emerald-600 text-white hover:bg-emerald-700">
                  Salvar Nível
                </button>
              </form>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftRoleConfigs.map(config => (
              <div key={config.id} className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm relative group hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{config.roleName}</h4>
                    {config.id === 'ADMIN' && <Lock size={12} className="text-amber-500" />}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setIsEditingRole(config)} disabled={config.id === 'ADMIN'} className="p-1.5 text-slate-400 hover:text-[#3583C7] disabled:opacity-20"><Edit2 size={12} /></button>
                    <button onClick={() => setDeleteTarget({ type: 'role', id: config.id })} disabled={config.id === 'ADMIN'} className="p-1.5 text-slate-400 hover:text-[#EE3234] disabled:opacity-20"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(['VIEW_DASHBOARD', 'VIEW_RECORDS', 'ADD_RECORDS', 'MANAGE_USERS'] as Permission[]).map(perm => {
                    const isChecked = config.permissions.includes(perm);
                    return (
                      <button key={perm} onClick={() => togglePermission(config.id, perm)} disabled={config.id === 'ADMIN'} className={`w-full flex items-center justify-between px-3 py-2 rounded border text-[9px] font-black uppercase transition-all ${isChecked ? 'bg-blue-50 border-[#3583C7]/30 text-[#3583C7]' : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600'}`}>
                        {PERMISSION_LABELS[perm]} {isChecked && <CheckCircle2 size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
              {isChanged ? <AlertCircle className="text-amber-500" size={16} /> : <CheckCircle2 className="text-emerald-500" size={16} />}
              {isChanged ? 'Alterações pendentes' : 'Configurações atualizadas'}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setDraftRoleConfigs(JSON.parse(JSON.stringify(roleConfigs)))} disabled={!isChanged} className="flex items-center gap-2 px-6 py-2 rounded-md text-[10px] font-black uppercase bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"><RotateCcw size={14} /> Descartar</button>
              <button onClick={saveAllConfigs} disabled={!isChanged} className="flex items-center gap-2 px-8 py-2 rounded-md text-[10px] font-black uppercase bg-[#3583C7] text-white hover:bg-[#2d70ab] disabled:opacity-30 transition-all shadow-md active:scale-95"><Save size={14} /> Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
