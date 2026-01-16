
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  PlusCircle, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Save,
  AlertTriangle 
} from 'lucide-react';
import { User, RoleConfig, Permission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UserTable } from './users/UserTable';
import { RoleList } from './users/RoleList';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roleConfigs: RoleConfig[];
  setRoleConfigs: React.Dispatch<React.SetStateAction<RoleConfig[]>>;
}

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
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
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
  return createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-300 w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-10 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center mb-6 text-[#EE3234] bg-red-50 rounded-full border border-red-100">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-[#EE3234] uppercase tracking-tight mb-4 leading-tight">{title}</h3>
          <p className="text-[13px] text-slate-500 font-bold leading-relaxed px-4">{message}</p>
        </div>
        <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onCancel} 
            className="flex-1 px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            CANCELAR
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-3.5 bg-[#EE3234] rounded-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#d02c2e] transition-all shadow-xl shadow-red-500/20 active:scale-95"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, roleConfigs, setRoleConfigs }) => {
  const { user: currentUser } = useAuth();
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

  const closeUserForm = () => { setIsAddingUser(false); setIsEditingUser(null); };
  const closeRoleForm = () => { setIsAddingRole(false); setIsEditingRole(null); };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const username = fd.get('username') as string;
    const password = fd.get('password') as string;
    const role = fd.get('role') as string;

    if (isEditingUser) {
      if (isEditingUser.username === 'admin') return closeUserForm();
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
      if (isEditingRole.id === 'ADMIN') return closeRoleForm();
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

  const allPermissions: Permission[] = ['VIEW_DASHBOARD', 'VIEW_RECORDS', 'ADD_RECORDS', 'EDIT_RECORD', 'DELETE_RECORD', 'DELETE_PERIOD', 'MANAGE_USERS'];
  const isChanged = JSON.stringify(roleConfigs) !== JSON.stringify(draftRoleConfigs);

  const showUserForm = isAddingUser || isEditingUser;
  const showRoleForm = isAddingRole || isEditingRole;

  return (
    <>
      <div className="space-y-6 animate-fade-in relative z-[50]">
        <div className="flex border-b border-slate-300 gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button onClick={() => setTab('users')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest relative transition-colors ${tab === 'users' ? 'text-[#3583C7]' : 'text-slate-400 hover:text-slate-600'}`}>
            Usuários {tab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3583C7] rounded-t-full" />}
          </button>
          <button onClick={() => setTab('roles')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest relative transition-colors ${tab === 'roles' ? 'text-[#3583C7]' : 'text-slate-400 hover:text-slate-600'}`}>
            Nível de acesso {tab === 'roles' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3583C7] rounded-t-full" />}
          </button>
        </div>

        {tab === 'users' ? (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Gerenciar Usuários</h3>
              <button onClick={() => showUserForm ? closeUserForm() : setIsAddingUser(true)} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md text-[10px] font-black uppercase transition-all ${showUserForm ? 'bg-slate-500' : 'bg-[#3583C7] hover:bg-[#2d70ab]'}`}>
                {showUserForm ? <X size={14} /> : <PlusCircle size={14} />} 
                {showUserForm ? 'Cancelar' : 'Novo Usuário'}
              </button>
            </div>

            <div className={`drawer-container ${showUserForm ? 'open' : ''}`}>
              <div className="drawer-content">
                <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
                  <form onSubmit={handleSaveUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
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
                    <button type="submit" className="font-black py-3 px-4 rounded-lg text-[10px] uppercase transition-all shadow-md bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95">Salvar Usuário</button>
                  </form>
                </div>
              </div>
            </div>

            <UserTable 
              users={users} 
              roleConfigs={roleConfigs} 
              currentUser={currentUser} 
              onEdit={(u) => { setIsEditingUser(u); setIsAddingUser(false); }} 
              onDelete={(id) => setDeleteTarget({ type: 'user', id })} 
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Configurar Níveis</h3>
              <button onClick={() => showRoleForm ? closeRoleForm() : setIsAddingRole(true)} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md text-[10px] font-black uppercase transition-all ${showRoleForm ? 'bg-slate-500' : 'bg-[#3583C7] hover:bg-[#2d70ab]'}`}>
                {showRoleForm ? <X size={14} /> : <PlusCircle size={14} />} 
                {showRoleForm ? 'Cancelar' : 'Novo Nível'}
              </button>
            </div>

            <div className={`drawer-container ${showRoleForm ? 'open' : ''}`}>
              <div className="drawer-content">
                <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
                  <form onSubmit={handleSaveRole} className="flex flex-col sm:flex-row gap-4 items-end max-w-2xl">
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Nome do Nível</label>
                      <input name="roleName" type="text" required defaultValue={isEditingRole?.roleName} disabled={isEditingRole?.id === 'ADMIN'} className="w-full px-4 py-3 border border-slate-300 rounded-md font-black text-sm outline-none focus:border-[#3583C7]" />
                    </div>
                    <button type="submit" className="w-full sm:w-auto font-black py-3 px-8 rounded-lg text-[10px] uppercase transition-all shadow-md bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95">Salvar Nível</button>
                  </form>
                </div>
              </div>
            </div>

            <RoleList 
              roles={draftRoleConfigs} 
              allPermissions={allPermissions} 
              onEdit={setIsEditingRole} 
              onDelete={(id) => setDeleteTarget({ type: 'role', id })} 
              onTogglePermission={togglePermission} 
            />

            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                {isChanged ? <AlertCircle className="text-amber-500" size={16} /> : <CheckCircle2 className="text-emerald-500" size={16} />}
                {isChanged ? 'Alterações pendentes' : 'Configurações atualizadas'}
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button onClick={() => setDraftRoleConfigs(JSON.parse(JSON.stringify(roleConfigs)))} disabled={!isChanged} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors active:scale-95"><RotateCcw size={14} /> Descartar</button>
                <button onClick={() => { setRoleConfigs(draftRoleConfigs); alert('Configurações salvas!'); }} disabled={!isChanged} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-lg text-[10px] font-black uppercase bg-[#3583C7] text-white hover:bg-[#2d70ab] disabled:opacity-30 transition-all shadow-md active:scale-95"><Save size={14} /> Aplicar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!deleteTarget}
        title={`EXCLUIR ${deleteTarget?.type === 'user' ? 'USUÁRIO' : 'NÍVEL'}`}
        message="Esta ação é definitiva e removerá todos os acessos associados. Deseja continuar?"
        onConfirm={() => {
          if (deleteTarget?.type === 'user') setUsers(users.filter(u => u.id !== deleteTarget.id));
          else setDraftRoleConfigs(draftRoleConfigs.filter(r => r.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
