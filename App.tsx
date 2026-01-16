
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  LogOut, 
  User as UserIcon,
  Users as UsersIcon,
  Download,
  ChevronRight,
  Menu,
  X,
  Eye, 
  EyeOff
} from 'lucide-react';
import { User, SurgeryRecord, Permission, RoleConfig } from './types';
import { UserManagement } from './components/UserManagement';
import { RecordManagement } from './components/RecordManagement';
import { HistoryManagement } from './components/HistoryManagement';
import { Dashboard } from './components/Dashboard';
import { 
  STORAGE_KEYS, 
  INITIAL_USERS, 
  DEFAULT_ROLE_CONFIGS, 
  ALLOWED_ROOMS,
  MOCK_RECORDS
} from './constants/config';
import { calculateIntervalMinutes, displayDate } from './utils/time';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';

const PasswordInput: React.FC<{ value?: string; onChange?: (val: string) => void; name: string; placeholder?: string; required?: boolean; className?: string; defaultValue?: string }> = ({ value, onChange, name, placeholder, required, className, defaultValue }) => {
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
        className={`w-full pr-12 transition-all ${className || 'px-4 py-3 border border-slate-400 rounded-lg bg-[#f8fafc] font-bold text-sm outline-none focus:border-[#3583C7]'}`}
      />
      <button 
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3583C7] transition-colors p-1"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const LoginForm: React.FC<{ users: User[], onLogin: (user: User) => void }> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (matched) onLogin(matched);
    else setError('Usuário ou senha incorretos.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] p-4 animate-fade-in">
      <div className="w-full max-w-[380px] bg-white rounded-lg p-10 shadow-2xl border border-slate-400 animate-scale-in">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-7 bg-[#EE3234] rounded-full"></div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">HEPP</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">Gerir Turnover</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Login"
              required
              className="w-full px-4 py-3.5 text-sm rounded-lg border border-slate-400 focus:outline-none focus:border-[#3583C7] bg-[#f8fafc] font-bold text-slate-700 placeholder-slate-300 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
            <PasswordInput 
              name="password"
              value={password}
              onChange={(val) => { setPassword(val); setError(''); }}
              placeholder="••••••••"
              required
              className="px-4 py-3.5 text-sm rounded-lg border border-slate-400 focus:outline-none focus:border-[#3583C7] bg-[#f8fafc] font-bold text-slate-700 placeholder-slate-300 transition-all"
            />
          </div>
          {error && <p className="text-[#EE3234] text-[10px] font-black text-center uppercase tracking-widest animate-pulse">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-[#3583C7] hover:bg-[#2d70ab] text-white font-black py-4 rounded-lg transition-all shadow-lg shadow-blue-500/10 text-[11px] uppercase tracking-[0.15em] mt-2 active:scale-95"
          >
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

const AppContent: React.FC<{
  view: string;
  setView: (v: any) => void;
  records: SurgeryRecord[];
  setRecords: (val: SurgeryRecord[] | ((prev: SurgeryRecord[]) => SurgeryRecord[])) => void;
  users: User[];
  setUsers: (val: User[] | ((prev: User[]) => User[])) => void;
  roleConfigs: RoleConfig[];
  setRoleConfigs: (val: RoleConfig[] | ((prev: RoleConfig[]) => RoleConfig[])) => void;
  onLogout: () => void;
}> = ({ view, setView, records, setRecords, users, setUsers, roleConfigs, setRoleConfigs, onLogout }) => {
  const { user, hasPermission } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddRecord = (newRecord: Omit<SurgeryRecord, 'id' | 'intervalMinutes' | 'isDelay'>) => {
    const diff = calculateIntervalMinutes(newRecord.endAnesthesiaPrev, newRecord.startAnesthesiaNext);
    const record: SurgeryRecord = {
      ...newRecord,
      id: Math.random().toString(36).substr(2, 9),
      intervalMinutes: diff,
      isDelay: diff > 60
    };
    setRecords(prev => [record, ...prev]);
  };

  const handleUpdateRecord = (updated: SurgeryRecord) => {
    const diff = calculateIntervalMinutes(updated.endAnesthesiaPrev, updated.startAnesthesiaNext);
    const record: SurgeryRecord = {
      ...updated,
      intervalMinutes: diff,
      isDelay: diff > 60
    };
    setRecords(prev => prev.map(r => r.id === record.id ? record : r));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteByPeriod = (startDate: string, endDate: string) => {
    setRecords(prev => prev.filter(r => r.date < startDate || r.date > endDate));
  };

  const exportToExcel = () => {
    const BOM = '\uFEFF';
    const headers = ['Data', 'Paciente', 'Prontuário', 'Sala', 'Início Anestesia', 'Fim Anestesia', 'Intervalo (min)', 'Status'];
    const rows = records.map(r => [
      displayDate(r.date), r.patientName, r.medicalRecord, r.roomNumber, r.endAnesthesiaPrev, r.startAnesthesiaNext, r.intervalMinutes,
      r.isDelay ? 'Atraso' : (r.intervalMinutes < 25 ? 'Alta' : r.intervalMinutes <= 40 ? 'Média' : 'Baixa')
    ]);
    const csvContent = BOM + [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hepp_turnover_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'VIEW_DASHBOARD' },
    { id: 'records', label: 'Histórico', icon: ClipboardList, perm: 'VIEW_RECORDS' },
    { id: 'add', label: 'Lançamento', icon: PlusCircle, perm: 'ADD_RECORDS' },
    { id: 'users', label: 'Usuário', icon: UsersIcon, perm: 'MANAGE_USERS' },
  ].filter(item => hasPermission(item.perm as Permission));

  const SidebarContent = () => (
    <>
      <div className="p-8 mb-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#EE3234] rounded-sm shrink-0"></div>
          <span className="font-black text-white tracking-widest uppercase truncate">HEPP GESTÃO</span>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => { setView(item.id as any); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 text-sm font-semibold group ${
              view === item.id 
              ? 'bg-[#3583C7] text-white shadow-lg translate-x-2' 
              : 'hover:bg-slate-800 hover:text-slate-200 hover:translate-x-1'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4 cursor-default">
          <div className="w-8 h-8 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700 shrink-0">
            <UserIcon size={14} className="text-slate-400" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate uppercase">{user?.username}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[#EE3234] hover:bg-[#EE3234]/10 transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fafc] w-full animate-fade-in overflow-hidden relative">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#0f172a] flex-col h-screen text-slate-400 border-r border-slate-800 shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile Drawer */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-[#0f172a] flex flex-col z-[101] transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               aria-label="Abrir menu"
               className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
             >
               <Menu size={20} />
             </button>
             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest truncate">
                <span>Gestão</span>
                <ChevronRight size={14} className="opacity-50" />
                <span className="text-slate-800 uppercase tracking-tight font-black truncate">
                  {view === 'dashboard' ? 'Painel Geral' : view === 'records' ? 'Histórico' : view === 'add' ? 'Lançamento' : 'Usuário'}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {view === 'records' && (
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-[#3583C7] text-white rounded-md font-bold shadow-md hover:bg-[#2d70ab] transition-all text-[10px] uppercase tracking-widest active:scale-95"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {view === 'dashboard' && <Dashboard records={records} />}
            {view === 'records' && (
              <HistoryManagement 
                records={records} 
                onUpdate={handleUpdateRecord}
                onDelete={handleDeleteRecord}
                onDeletePeriod={handleDeleteByPeriod}
              />
            )}
            {view === 'add' && <RecordManagement onAdd={handleAddRecord} allowedRooms={ALLOWED_ROOMS} />}
            {view === 'users' && hasPermission('MANAGE_USERS') && (
              <UserManagement 
                users={users} 
                setUsers={setUsers as any} 
                roleConfigs={roleConfigs} 
                setRoleConfigs={setRoleConfigs as any} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'records' | 'add' | 'users'>('dashboard');
  
  const [records, setRecords] = useLocalStorage<SurgeryRecord[]>(STORAGE_KEYS.RECORDS, MOCK_RECORDS);
  const [users, setUsers] = useLocalStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const [roleConfigs, setRoleConfigs] = useLocalStorage<RoleConfig[]>(STORAGE_KEYS.PERMISSIONS, DEFAULT_ROLE_CONFIGS);

  if (!user) return <LoginForm users={users} onLogin={setUser} />;

  return (
    <AuthProvider user={user} roleConfigs={roleConfigs}>
      <AppContent 
        view={view}
        setView={setView}
        records={records}
        setRecords={setRecords}
        users={users}
        setUsers={setUsers}
        roleConfigs={roleConfigs}
        setRoleConfigs={setRoleConfigs}
        onLogout={() => setUser(null)}
      />
    </AuthProvider>
  );
};

export default App;
