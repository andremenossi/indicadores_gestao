
import React, { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  Stethoscope,
  Sparkles,
  Settings
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { User, SurgeryRecord, CleaningRecord, Permission, RoleConfig } from './types';
import { UserManagement } from './components/UserManagement';
import { RecordManagement } from './components/RecordManagement';
import { HistoryManagement } from './components/HistoryManagement';
import { Dashboard } from './components/Dashboard';
import { CleaningManagement } from './components/CleaningManagement';
import { 
  INITIAL_USERS, 
  DEFAULT_ROLE_CONFIGS, 
  ALLOWED_ROOMS,
  MOCK_RECORDS
} from './constants/config';
import { calculateIntervalMinutes, displayDate } from './utils/time';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type ModuleId = 'general' | 'turnover' | 'cleaning' | 'users';
type TabId = 'dashboard' | 'history' | 'add';

const AppIcon = ({ className = "" }) => (
  <div className={`flex items-center justify-center overflow-hidden ${className}`}>
    <img 
      src="logo.png" 
      alt="GSC" 
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

const LogoutConfirmationModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-[340px] overflow-hidden animate-scale-in">
        <div className="p-8 text-center">
          <div className="mx-auto w-14 h-14 flex items-center justify-center mb-4 text-[#EE3234] bg-red-50 rounded-full border border-red-100">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Finalizar Sessão?</h3>
          <p className="text-[12px] text-slate-500 font-bold leading-relaxed px-4">Suas alterações foram salvas. Você precisará logar novamente para acessar.</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button 
            onClick={onCancel} 
            className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Permanecer
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#EE3234] hover:bg-[#d02c2e] transition-colors"
          >
            Sair Agora
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const LoginForm: React.FC<{ users: User[], onLogin: (user: User) => void }> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Busca insensível a maiúsculas/minúsculas para o login
    const matched = users.find(u => 
      u.username.toUpperCase() === username.toUpperCase() && 
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
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">GSC</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] mt-1">Gestão de Sala Cirúrgica</p>
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
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  records: SurgeryRecord[];
  setRecords: any;
  cleaningRecords: CleaningRecord[];
  setCleaningRecords: any;
  users: User[];
  setUsers: any;
  roleConfigs: RoleConfig[];
  setRoleConfigs: any;
  onLogout: () => void;
}> = (props) => {
  const { user, hasPermission } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleAddRecord = (newRecord: Omit<SurgeryRecord, 'id' | 'intervalMinutes' | 'isDelay'>) => {
    const diff = calculateIntervalMinutes(newRecord.endAnesthesiaPrev, newRecord.startAnesthesiaNext);
    const record: SurgeryRecord = {
      ...newRecord,
      id: Math.random().toString(36).substr(2, 9),
      intervalMinutes: diff,
      isDelay: diff > 60
    };
    props.setRecords([record, ...props.records]);
    props.setActiveTab('history');
  };

  const handleUpdateRecord = (updated: SurgeryRecord) => {
    const diff = calculateIntervalMinutes(updated.endAnesthesiaPrev, updated.startAnesthesiaNext);
    const record: SurgeryRecord = { ...updated, intervalMinutes: diff, isDelay: diff > 60 };
    props.setRecords(props.records.map(r => r.id === record.id ? record : r));
  };

  const handleDeleteRecord = (id: string) => {
    props.setRecords(props.records.filter(r => r.id !== id));
  };

  const handleDeleteByPeriod = (startDate: string, endDate: string) => {
    props.setRecords(props.records.filter(r => r.date < startDate || r.date > endDate));
  };

  const handleAddCleaningRecord = (newRec: Omit<CleaningRecord, 'id' | 'durationMinutes'>) => {
    const duration = calculateIntervalMinutes(newRec.startTime, newRec.endTime);
    const rec: CleaningRecord = {
      ...newRec,
      id: Math.random().toString(36).substr(2, 9),
      durationMinutes: duration
    };
    props.setCleaningRecords([rec, ...props.cleaningRecords]);
    props.setActiveTab('history');
  };

  const handleUpdateCleaningRecord = (updated: CleaningRecord) => {
    const duration = calculateIntervalMinutes(updated.startTime, updated.endTime);
    const rec = { ...updated, durationMinutes: duration };
    props.setCleaningRecords(props.cleaningRecords.map(r => r.id === rec.id ? rec : r));
  };

  const handleDeleteCleaningRecord = (id: string) => {
    props.setCleaningRecords(props.cleaningRecords.filter(r => r.id !== id));
  };

  const handleDeleteCleaningByPeriod = (startDate: string, endDate: string) => {
    props.setCleaningRecords(props.cleaningRecords.filter(r => r.date < startDate || r.date > endDate));
  };

  const exportToExcel = () => {
    const BOM = '\uFEFF';
    const headers = ['Data', 'Paciente', 'Prontuário', 'Sala', 'Início Anestesia', 'Fim Anestesia', 'Intervalo (min)', 'Status'];
    const rows = props.records.map(r => [
      displayDate(r.date), r.patientName, r.medicalRecord, r.roomNumber, r.endAnesthesiaPrev, r.startAnesthesiaNext, r.intervalMinutes,
      r.isDelay ? 'Atraso' : (r.intervalMinutes < 25 ? 'Alta' : r.intervalMinutes <= 40 ? 'Média' : 'Baixa')
    ]);
    const csvContent = BOM + [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `turnover_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportCleaningToExcel = () => {
    const BOM = '\uFEFF';
    const headers = ['Data', 'Sala', 'Tipo', 'Colaborador', 'Enfermeiro', 'Início', 'Término', 'Duração (min)'];
    const rows = props.cleaningRecords.map(r => [
      displayDate(r.date), r.roomNumber, r.cleaningType, r.staffName, r.nurseName, r.startTime, r.endTime, r.durationMinutes
    ]);
    const csvContent = BOM + [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `limpeza_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const modules = [
    { id: 'general', label: 'Painel Geral', icon: LayoutDashboard, perm: 'VIEW_DASHBOARD' },
    { id: 'turnover', label: 'Turnover Cirúrgico', icon: Stethoscope, perm: 'VIEW_TURNOVER' },
    { id: 'cleaning', label: 'Registro de Limpeza', icon: Sparkles, perm: 'VIEW_CLEANING' },
    { id: 'users', label: 'Usuários', icon: UsersIcon, perm: 'MANAGE_USERS' },
  ].filter(m => hasPermission(m.perm as Permission));

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Histórico', icon: ClipboardList },
    { id: 'add', label: 'Lançamento', icon: PlusCircle },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 mb-4 border-b border-slate-800/50 flex flex-col items-center">
        <div className="flex items-center gap-3 w-full justify-between lg:justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#0f172a] font-black text-xl">H</div>
            <div className="text-left">
              <span className="font-black text-white text-lg tracking-widest uppercase block leading-tight">HEPP GESTÃO</span>
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest block">Inteligência Hospitalar</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {modules.map((m) => (
          <button 
            key={m.id}
            onClick={() => { props.setActiveModule(m.id as ModuleId); setIsSidebarOpen(false); if(m.id === 'turnover' || m.id === 'cleaning') props.setActiveTab('dashboard'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${
              props.activeModule === m.id 
              ? 'bg-[#3583C7] text-white shadow-lg' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <m.icon size={18} className="shrink-0" />
            <span className="truncate">{m.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center border border-slate-700 shrink-0">
            <UserIcon size={14} className="text-slate-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-white truncate uppercase">{user?.username}</p>
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest truncate">
               {props.roleConfigs.find(r => r.id === user?.role)?.roleName}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[#EE3234] hover:bg-[#EE3234]/10 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 w-full animate-fade-in overflow-hidden relative">
      <aside className="hidden lg:flex w-64 bg-[#0f172a] flex-col h-screen shrink-0 z-30">
        <SidebarContent />
      </aside>
      
      {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-[#0f172a] flex flex-col z-[101] transition-transform duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white">
        {(props.activeModule === 'turnover' || props.activeModule === 'cleaning') && (
          <header className="bg-slate-50 border-b border-slate-300 pt-3 px-6 flex items-end gap-1 shrink-0 z-20 h-14">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-md mb-1 mr-2"><Menu size={20} /></button>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => props.setActiveTab(tab.id as TabId)}
                className={`relative flex items-center gap-2 px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-lg border-x border-t border-transparent ${
                  props.activeTab === tab.id 
                  ? 'nav-tab-active shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </header>
        )}

        {!(props.activeModule === 'turnover' || props.activeModule === 'cleaning') && (
          <div className="lg:hidden h-14 flex items-center px-6 border-b border-slate-200 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"><Menu size={20} /></button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-white">
          <div className="max-w-7xl mx-auto">
            {props.activeModule === 'turnover' && (
              <div className="animate-fade-in">
                {props.activeTab === 'dashboard' && <Dashboard records={props.records} />}
                {props.activeTab === 'history' && (
                  <HistoryManagement 
                    records={props.records} 
                    onUpdate={handleUpdateRecord}
                    onDelete={handleDeleteRecord}
                    onDeletePeriod={handleDeleteByPeriod}
                    onExport={exportToExcel}
                  />
                )}
                {props.activeTab === 'add' && <RecordManagement onAdd={handleAddRecord} allowedRooms={ALLOWED_ROOMS} />}
              </div>
            )}
            
            {props.activeModule === 'cleaning' && (
              <div className="animate-fade-in">
                <CleaningManagement 
                  activeTab={props.activeTab}
                  records={props.cleaningRecords}
                  onAdd={handleAddCleaningRecord}
                  onUpdate={handleUpdateCleaningRecord}
                  onDelete={handleDeleteCleaningRecord}
                  onDeletePeriod={handleDeleteCleaningByPeriod}
                  onExport={exportCleaningToExcel}
                />
              </div>
            )}

            {props.activeModule === 'general' && (
              <div className="py-20 text-center animate-fade-in">
                <LayoutDashboard size={64} className="mx-auto text-slate-200 mb-4" />
                <h2 className="text-xl font-black text-slate-900 uppercase">Painel Geral Consolidado</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Visão 360º dos setores.</p>
              </div>
            )}

            {props.activeModule === 'users' && hasPermission('MANAGE_USERS') && (
              <div className="animate-fade-in">
                <UserManagement 
                  users={props.users} 
                  setUsers={props.setUsers} 
                  roleConfigs={props.roleConfigs} 
                  setRoleConfigs={props.setRoleConfigs} 
                />
              </div>
            )}
          </div>
        </main>
      </div>
      
      <LogoutConfirmationModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={() => { setIsLogoutModalOpen(false); props.onLogout(); }} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>('turnover');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [records, setRecords] = useState<SurgeryRecord[]>([]);
  const [cleaningRecords, setCleaningRecords] = useState<CleaningRecord[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(DEFAULT_ROLE_CONFIGS);
  const [isLoading, setIsLoading] = useState(true);

  // Define a base da API dinamicamente para facilitar o uso em rede
  const API_BASE = window.location.origin.includes('localhost') ? "" : window.location.origin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRes = await fetch(`${API_BASE}/api/data`);
        const data = await dataRes.json();
        
        // Só atualizamos o estado se o servidor retornar usuários válidos
        // Isso previne que um erro no servidor limpe a lista de acesso Admin do front
        if (data && data.users && data.users.length > 0) {
          setRecords(data.records || []);
          setCleaningRecords(data.cleaningRecords || []);
          setUsers(data.users);
          setRoleConfigs(data.roleConfigs);
        } else {
          // Fallback seguro se o banco de dados do servidor estiver ilegível
          setRecords(MOCK_RECORDS);
          setCleaningRecords([]);
          setUsers(INITIAL_USERS);
          setRoleConfigs(DEFAULT_ROLE_CONFIGS);
        }
      } catch (e) { 
        console.error('Falha ao conectar com o servidor de dados:', e); 
        // Em caso de erro de rede, mantém os usuários padrão para permitir login local se possível
        setUsers(INITIAL_USERS);
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, [API_BASE]);

  const updateServer = async (recs: SurgeryRecord[], cleaningRecs: CleaningRecord[], usrs: User[], roles: RoleConfig[]) => {
    try {
      await fetch(`${API_BASE}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recs, cleaningRecords: cleaningRecs, users: usrs, roleConfigs: roles })
      });
    } catch (e) { console.error('Erro ao salvar no servidor:', e); }
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] text-white font-black uppercase tracking-widest">Iniciando GSC...</div>;
  if (!user) return <LoginForm users={users} onLogin={setUser} />;

  return (
    <AuthProvider user={user} roleConfigs={roleConfigs}>
      <AppContent 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        records={records}
        setRecords={(newRecs: any) => { setRecords(newRecs); updateServer(newRecs, cleaningRecords, users, roleConfigs); }}
        cleaningRecords={cleaningRecords}
        setCleaningRecords={(newClean: any) => { setCleaningRecords(newClean); updateServer(records, newClean, users, roleConfigs); }}
        users={users}
        setUsers={(newUsrs: any) => { setUsers(newUsrs); updateServer(records, cleaningRecords, newUsrs, roleConfigs); }}
        roleConfigs={roleConfigs}
        setRoleConfigs={(newRoles: any) => { setRoleConfigs(newRoles); updateServer(records, cleaningRecords, users, newRoles); }}
        onLogout={() => setUser(null)}
      />
    </AuthProvider>
  );
};

export default App;
