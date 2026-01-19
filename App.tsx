import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Share2,
  Wifi
} from 'lucide-react';
import { User, SurgeryRecord, Permission, RoleConfig } from './types';
import { UserManagement } from './components/UserManagement';
import { RecordManagement } from './components/RecordManagement';
import { HistoryManagement } from './components/HistoryManagement';
import { Dashboard } from './components/Dashboard';
import { 
  INITIAL_USERS, 
  DEFAULT_ROLE_CONFIGS, 
  ALLOWED_ROOMS,
  MOCK_RECORDS
} from './constants/config';
import { calculateIntervalMinutes, displayDate } from './utils/time';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppIcon = ({ className = "" }) => (
  <div className={`flex items-center justify-center overflow-hidden ${className}`}>
    <img 
      src="logo.png" 
      alt="GTC" 
      className="max-w-full max-h-full object-contain block"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  </div>
);

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
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3583C7] p-1"
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
      <div className="w-full max-w-[380px] bg-white rounded-lg p-10 shadow-2xl border border-slate-400 animate-scale-in text-center">
        <div className="flex flex-col items-center mb-8">
          <AppIcon className="w-32 h-32 mb-4" />
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">GTC</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] mt-1">Gestão de Turnover Cirúrgico</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value.toUpperCase()); setError(''); }}
              placeholder="LOGIN"
              required
              className="w-full px-4 py-3.5 text-sm rounded-lg border border-slate-400 focus:outline-none focus:border-[#3583C7] bg-[#f8fafc] font-bold text-slate-700 placeholder-slate-300 transition-all uppercase"
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
            />
          </div>
          {error && <p className="text-[#EE3234] text-[10px] font-black text-center uppercase tracking-widest animate-pulse">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-[#3583C7] hover:bg-[#2d70ab] text-white font-black py-4 rounded-lg transition-all shadow-lg text-[11px] uppercase tracking-[0.15em] mt-2 active:scale-95"
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
  setRecords: any;
  users: User[];
  setUsers: any;
  roleConfigs: RoleConfig[];
  setRoleConfigs: any;
  onLogout: () => void;
  networkInfo: { ip: string; port: number } | null;
}> = ({ view, setView, records, setRecords, users, setUsers, roleConfigs, setRoleConfigs, onLogout, networkInfo }) => {
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
    setRecords([record, ...records]);
  };

  const handleUpdateRecord = (updated: SurgeryRecord) => {
    const diff = calculateIntervalMinutes(updated.endAnesthesiaPrev, updated.startAnesthesiaNext);
    const record: SurgeryRecord = { ...updated, intervalMinutes: diff, isDelay: diff > 60 };
    setRecords(records.map(r => r.id === record.id ? record : r));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const handleDeleteByPeriod = (startDate: string, endDate: string) => {
    setRecords(records.filter(r => r.date < startDate || r.date > endDate));
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
    link.download = `gtc_turnover_${new Date().toISOString().split('T')[0]}.csv`;
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
      <div className="p-6 mb-4 border-b border-slate-800/50 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 w-full justify-between lg:justify-center">
          <div className="flex items-center gap-3">
            <AppIcon className="w-10 h-10" />
            <div className="text-left">
              <span className="font-black text-white text-lg tracking-widest uppercase block leading-tight">GTC</span>
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest block">Gestão de Turnover Cirúrgico</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => { setView(item.id as any); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-semibold ${
              view === item.id 
              ? 'bg-[#3583C7] text-white shadow-lg translate-x-2' 
              : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Identificador de Host */}
      <div className="m-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Share2 size={12} className="text-[#3583C7]" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronização</span>
          </div>
          <div className="bg-black/40 p-2 rounded text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <Wifi size={10} />
            {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
              ? 'Este PC é o Mestre' 
              : `Conectado a: ${window.location.hostname}`}
          </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700 shrink-0">
            <UserIcon size={14} className="text-slate-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate uppercase">{user?.username}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
               {roleConfigs.find(r => r.id === user?.role)?.roleName}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[#EE3234] hover:bg-[#EE3234]/10 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fafc] w-full animate-fade-in overflow-hidden relative">
      <aside className="hidden lg:flex w-64 bg-[#0f172a] flex-col h-screen text-slate-400 border-r border-slate-800 shrink-0 z-30">
        <SidebarContent />
      </aside>
      {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-[#0f172a] flex flex-col z-[101] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-md"><Menu size={20} /></button>
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
              <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-[#3583C7] text-white rounded-md font-bold shadow-md hover:bg-[#2d70ab] transition-all text-[10px] uppercase tracking-widest">
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
                setUsers={setUsers} 
                roleConfigs={roleConfigs} 
                setRoleConfigs={setRoleConfigs} 
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
  const [records, setRecords] = useState<SurgeryRecord[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(DEFAULT_ROLE_CONFIGS);
  const [isLoading, setIsLoading] = useState(true);

  // Usa URLs relativas para que o fetch vá sempre para o servidor que serviu a página (Master ou Local)
  const API_BASE = ""; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRes = await fetch(`${API_BASE}/api/data`);
        const data = await dataRes.json();

        if (data.records && (data.records.length > 0 || data.users.length > 0)) {
          setRecords(data.records);
          setUsers(data.users);
          setRoleConfigs(data.roleConfigs);
        } else {
          // Inicializa dados se estiver vazio
          const initialData = { records: MOCK_RECORDS, users: INITIAL_USERS, roleConfigs: DEFAULT_ROLE_CONFIGS };
          await fetch(`${API_BASE}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialData)
          });
          setRecords(MOCK_RECORDS);
          setUsers(INITIAL_USERS);
          setRoleConfigs(DEFAULT_ROLE_CONFIGS);
        }
      } catch (e) {
        console.error("Erro ao conectar com API:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateDataOnServer = async (newRecords: SurgeryRecord[], newUsers: User[], newRoles: RoleConfig[]) => {
    try {
      await fetch(`${API_BASE}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: newRecords, users: newUsers, roleConfigs: newRoles })
      });
    } catch (e) {
      console.error("Erro ao sincronizar:", e);
    }
  };

  const wrapSetRecords = (newRecords: SurgeryRecord[]) => {
    setRecords(newRecords);
    updateDataOnServer(newRecords, users, roleConfigs);
  };

  const wrapSetUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    updateDataOnServer(records, newUsers, roleConfigs);
  };

  const wrapSetRoleConfigs = (newRoles: RoleConfig[]) => {
    setRoleConfigs(newRoles);
    updateDataOnServer(records, users, newRoles);
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white font-black uppercase tracking-[0.3em]">
       Carregando GTC...
    </div>
  );

  if (!user) return <LoginForm users={users} onLogin={setUser} />;

  return (
    <AuthProvider user={user} roleConfigs={roleConfigs}>
      <AppContent 
        view={view}
        setView={setView}
        records={records}
        setRecords={wrapSetRecords}
        users={users}
        setUsers={wrapSetUsers}
        roleConfigs={roleConfigs}
        setRoleConfigs={wrapSetRoleConfigs}
        onLogout={() => setUser(null)}
        networkInfo={null}
      />
    </AuthProvider>
  );
};

export default App;