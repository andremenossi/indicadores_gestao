
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
  Eye,
  EyeOff
} from 'lucide-react';
import { User, SurgeryRecord, DashboardStats, Permission, RoleConfig } from './types';
import { UserManagement } from './components/UserManagement';
import { RecordManagement } from './components/RecordManagement';
import { HistoryManagement } from './components/HistoryManagement';
import { Dashboard } from './components/Dashboard';

// --- Configuration & Constants ---

const STORAGE_KEYS = {
  RECORDS: 'surgical_records_v1',
  USERS: 'surgical_users_v1',
  PERMISSIONS: 'surgical_perms_v1'
};

const COLORS = {
  BLUE: '#3583C7',
  RED: '#EE3234'
};

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '@_admin123', role: 'ADMIN' },
  { id: '2', username: 'estatistica', password: 'estatistica123', role: 'ESTATISTICA' },
  { id: '3', username: 'cirurgico', password: 'cirurgico123', role: 'CIRURGICO' }
];

const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  { id: 'ADMIN', roleName: 'ADMIN', permissions: ['VIEW_DASHBOARD', 'VIEW_RECORDS', 'ADD_RECORDS', 'MANAGE_USERS'] },
  { id: 'ESTATISTICA', roleName: 'ESTATISTICA', permissions: ['VIEW_DASHBOARD', 'VIEW_RECORDS'] },
  { id: 'CIRURGICO', roleName: 'CIRURGICO', permissions: ['VIEW_RECORDS', 'ADD_RECORDS'] }
];

const ALLOWED_ROOMS = ['01', '02', '03'];

// 30 Dados para testes
const MOCK_RECORDS: SurgeryRecord[] = [
  { id: 'r1', date: '2023-11-01', medicalRecord: '100001', roomNumber: '01', endAnesthesiaPrev: '07:30', startAnesthesiaNext: '07:50', intervalMinutes: 20, isDelay: false },
  { id: 'r2', date: '2023-11-01', medicalRecord: '100002', roomNumber: '01', endAnesthesiaPrev: '09:00', startAnesthesiaNext: '09:35', intervalMinutes: 35, isDelay: false },
  { id: 'r3', date: '2023-11-01', medicalRecord: '100003', roomNumber: '02', endAnesthesiaPrev: '08:15', startAnesthesiaNext: '08:45', intervalMinutes: 30, isDelay: false },
  { id: 'r4', date: '2023-11-01', medicalRecord: '100004', roomNumber: '03', endAnesthesiaPrev: '10:00', startAnesthesiaNext: '11:15', intervalMinutes: 75, isDelay: true },
  { id: 'r5', date: '2023-11-02', medicalRecord: '100005', roomNumber: '01', endAnesthesiaPrev: '07:00', startAnesthesiaNext: '07:15', intervalMinutes: 15, isDelay: false },
  { id: 'r6', date: '2023-11-02', medicalRecord: '100006', roomNumber: '02', endAnesthesiaPrev: '11:20', startAnesthesiaNext: '12:05', intervalMinutes: 45, isDelay: false },
  { id: 'r7', date: '2023-11-02', medicalRecord: '100007', roomNumber: '01', endAnesthesiaPrev: '13:00', startAnesthesiaNext: '13:22', intervalMinutes: 22, isDelay: false },
  { id: 'r8', date: '2023-11-03', medicalRecord: '100008', roomNumber: '03', endAnesthesiaPrev: '08:40', startAnesthesiaNext: '09:50', intervalMinutes: 70, isDelay: true },
  { id: 'r9', date: '2023-11-03', medicalRecord: '100009', roomNumber: '02', endAnesthesiaPrev: '14:10', startAnesthesiaNext: '14:40', intervalMinutes: 30, isDelay: false },
  { id: 'r10', date: '2023-11-03', medicalRecord: '100010', roomNumber: '01', endAnesthesiaPrev: '15:30', startAnesthesiaNext: '15:55', intervalMinutes: 25, isDelay: false },
  { id: 'r11', date: '2023-11-04', medicalRecord: '100011', roomNumber: '01', endAnesthesiaPrev: '07:30', startAnesthesiaNext: '07:48', intervalMinutes: 18, isDelay: false },
  { id: 'r12', date: '2023-11-04', medicalRecord: '100012', roomNumber: '02', endAnesthesiaPrev: '09:00', startAnesthesiaNext: '10:30', intervalMinutes: 90, isDelay: true },
  { id: 'r13', date: '2023-11-04', medicalRecord: '100013', roomNumber: '03', endAnesthesiaPrev: '11:00', startAnesthesiaNext: '11:38', intervalMinutes: 38, isDelay: false },
  { id: 'r14', date: '2023-11-05', medicalRecord: '100014', roomNumber: '01', endAnesthesiaPrev: '08:15', startAnesthesiaNext: '08:35', intervalMinutes: 20, isDelay: false },
  { id: 'r15', date: '2023-11-05', medicalRecord: '100015', roomNumber: '01', endAnesthesiaPrev: '10:20', startAnesthesiaNext: '11:05', intervalMinutes: 45, isDelay: false },
  { id: 'r16', date: '2023-11-05', medicalRecord: '100016', roomNumber: '02', endAnesthesiaPrev: '13:00', startAnesthesiaNext: '13:18', intervalMinutes: 18, isDelay: false },
  { id: 'r17', date: '2023-11-06', medicalRecord: '100017', roomNumber: '01', endAnesthesiaPrev: '07:45', startAnesthesiaNext: '08:12', intervalMinutes: 27, isDelay: false },
  { id: 'r18', date: '2023-11-06', medicalRecord: '100018', roomNumber: '03', endAnesthesiaPrev: '09:30', startAnesthesiaNext: '10:05', intervalMinutes: 35, isDelay: false },
  { id: 'r19', date: '2023-11-06', medicalRecord: '100019', roomNumber: '02', endAnesthesiaPrev: '14:00', startAnesthesiaNext: '15:10', intervalMinutes: 70, isDelay: true },
  { id: 'r20', date: '2023-11-07', medicalRecord: '100020', roomNumber: '01', endAnesthesiaPrev: '08:00', startAnesthesiaNext: '08:23', intervalMinutes: 23, isDelay: false },
  { id: 'r21', date: '2023-11-07', medicalRecord: '100021', roomNumber: '01', endAnesthesiaPrev: '10:00', startAnesthesiaNext: '10:30', intervalMinutes: 30, isDelay: false },
  { id: 'r22', date: '2023-11-07', medicalRecord: '100022', roomNumber: '03', endAnesthesiaPrev: '13:00', startAnesthesiaNext: '13:55', intervalMinutes: 55, isDelay: false },
  { id: 'r23', date: '2023-11-08', medicalRecord: '100023', roomNumber: '02', endAnesthesiaPrev: '07:30', startAnesthesiaNext: '07:45', intervalMinutes: 15, isDelay: false },
  { id: 'r24', date: '2023-11-08', medicalRecord: '100024', roomNumber: '01', endAnesthesiaPrev: '09:00', startAnesthesiaNext: '09:20', intervalMinutes: 20, isDelay: false },
  { id: 'r25', date: '2023-11-08', medicalRecord: '100025', roomNumber: '01', endAnesthesiaPrev: '11:00', startAnesthesiaNext: '12:15', intervalMinutes: 75, isDelay: true },
  { id: 'r26', date: '2023-11-09', medicalRecord: '100026', roomNumber: '03', endAnesthesiaPrev: '08:15', startAnesthesiaNext: '08:50', intervalMinutes: 35, isDelay: false },
  { id: 'r27', date: '2023-11-09', medicalRecord: '100027', roomNumber: '02', endAnesthesiaPrev: '10:20', startAnesthesiaNext: '10:42', intervalMinutes: 22, isDelay: false },
  { id: 'r28', date: '2023-11-09', medicalRecord: '100028', roomNumber: '01', endAnesthesiaPrev: '13:30', startAnesthesiaNext: '14:05', intervalMinutes: 35, isDelay: false },
  { id: 'r29', date: '2023-11-10', medicalRecord: '100029', roomNumber: '01', endAnesthesiaPrev: '07:00', startAnesthesiaNext: '07:18', intervalMinutes: 18, isDelay: false },
  { id: 'r30', date: '2023-11-10', medicalRecord: '100030', roomNumber: '02', endAnesthesiaPrev: '09:30', startAnesthesiaNext: '10:40', intervalMinutes: 70, isDelay: true },
];

const displayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

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
        className={`w-full pr-12 ${className || 'px-4 py-3 border border-slate-200 rounded-lg bg-[#f8fafc] font-bold text-sm outline-none focus:border-[#3583C7]'}`}
      />
      <button 
        type="button"
        onClick={() => setShow(!show)}
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
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] p-4">
      <div className="w-full max-w-[440px] bg-white rounded-lg p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-7 bg-[#EE3234] rounded-full"></div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">HEPP GESTÃO</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">Acesso ao Centro Cirúrgico</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Login"
              required
              className="w-full px-4 py-3.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#3583C7] bg-[#f8fafc] font-bold text-slate-700 placeholder-slate-300 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <PasswordInput 
              name="password"
              value={password}
              onChange={(val) => { setPassword(val); setError(''); }}
              placeholder="••••••••"
              required
              className="px-4 py-3.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#3583C7] bg-[#f8fafc] font-bold text-slate-700 placeholder-slate-300 transition-colors"
            />
          </div>
          {error && <p className="text-[#EE3234] text-[10px] font-black text-center uppercase tracking-widest animate-pulse">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-[#3583C7] hover:bg-[#2d70ab] text-white font-black py-4 rounded-lg transition-all shadow-lg shadow-blue-500/10 text-[11px] uppercase tracking-[0.15em] mt-2 active:scale-[0.98]"
          >
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'records' | 'add' | 'users'>('dashboard');
  const [records, setRecords] = useState<SurgeryRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(DEFAULT_ROLE_CONFIGS);

  useEffect(() => {
    const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedPerms = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    else setRecords(MOCK_RECORDS);

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      setUsers(INITIAL_USERS);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (savedPerms) setRoleConfigs(JSON.parse(savedPerms));
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(roleConfigs)); }, [roleConfigs]);

  const hasPermission = (perm: Permission) => {
    if (!user) return false;
    const config = roleConfigs.find(c => c.id === user.role);
    return config?.permissions.includes(perm) || false;
  };

  const handleAddRecord = (newRecord: Omit<SurgeryRecord, 'id' | 'intervalMinutes' | 'isDelay'>) => {
    const endMatch = newRecord.endAnesthesiaPrev.split(':');
    const startMatch = newRecord.startAnesthesiaNext.split(':');
    const endMinutes = parseInt(endMatch[0]) * 60 + parseInt(endMatch[1]);
    const startMinutes = parseInt(startMatch[0]) * 60 + parseInt(startMatch[1]);
    let diff = startMinutes - endMinutes;
    if (diff < 0) diff += 1440; 
    const record: SurgeryRecord = {
      ...newRecord,
      id: Math.random().toString(36).substr(2, 9),
      intervalMinutes: diff,
      isDelay: diff > 60
    };
    setRecords(prev => [record, ...prev]);
    setView(hasPermission('VIEW_DASHBOARD') ? 'dashboard' : 'records');
  };

  const exportToExcel = () => {
    const BOM = '\uFEFF';
    const headers = ['Data', 'Prontuário', 'Sala', 'Início Anestesia', 'Fim Anestesia', 'Intervalo (min)', 'Status'];
    const rows = records.map(r => [
      displayDate(r.date), r.medicalRecord, r.roomNumber, r.endAnesthesiaPrev, r.startAnesthesiaNext, r.intervalMinutes,
      r.isDelay ? 'Atraso' : (r.intervalMinutes < 25 ? 'Alta' : r.intervalMinutes <= 40 ? 'Média' : 'Baixa')
    ]);
    const csvContent = BOM + [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hepp_turnover_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!user) return <LoginForm users={users} onLogin={setUser} />;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'VIEW_DASHBOARD' },
    { id: 'records', label: 'Histórico', icon: ClipboardList, perm: 'VIEW_RECORDS' },
    { id: 'add', label: 'Lançamento', icon: PlusCircle, perm: 'ADD_RECORDS' },
    { id: 'users', label: 'Usuário', icon: UsersIcon, perm: 'MANAGE_USERS' },
  ].filter(item => hasPermission(item.perm as Permission));

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .table-striped th { padding: 16px 20px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: #ffffff; background-color: #1e293b; }
        .table-striped td { padding: 16px 20px; font-size: 13px; color: #1e293b; border-bottom: 1px solid #e2e8f0; }
        .table-striped tr:nth-child(even) { background-color: #f8fafc; }
        .table-striped tr:hover { background-color: #e2e8f0 !important; cursor: pointer; transition: background 0.2s ease; }
      `}</style>

      <aside className="hidden lg:flex w-64 bg-[#0f172a] flex-col sticky top-0 h-screen text-slate-400 border-r border-slate-800">
        <div className="p-8 mb-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#EE3234] rounded-sm"></div>
            <span className="font-black text-white tracking-widest uppercase">HEPP GESTÃO</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-semibold ${view === item.id ? 'bg-[#3583C7] text-white shadow-lg' : 'hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700">
              <UserIcon size={14} className="text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate uppercase">{user.username}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[#EE3234] hover:bg-[#EE3234]/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
             <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-md"><Menu size={20} /></button>
             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <span>Gestão</span>
                <ChevronRight size={14} />
                <span className="text-slate-800 uppercase tracking-tight font-black">
                  {view === 'dashboard' ? 'Painel Geral' : view === 'records' ? 'Histórico' : view === 'add' ? 'Inserção' : 'Usuário'}
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
                Exportar CSV
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto space-y-8">
          {view === 'dashboard' && <Dashboard records={records} />}
          {view === 'records' && <HistoryManagement records={records} />}
          {view === 'add' && <RecordManagement onAdd={handleAddRecord} allowedRooms={ALLOWED_ROOMS} />}
          {view === 'users' && hasPermission('MANAGE_USERS') && (
            <UserManagement 
              users={users} 
              setUsers={setUsers} 
              roleConfigs={roleConfigs} 
              setRoleConfigs={setRoleConfigs} 
              currentUser={user} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
