
import { User, RoleConfig, Permission, SurgeryRecord } from '../types';

export const STORAGE_KEYS = {
  RECORDS: 'surgical_records_v1',
  USERS: 'surgical_users_v1',
  PERMISSIONS: 'surgical_perms_v1'
};

export const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '@_admin123', role: 'ADMIN' },
  { id: '2', username: 'estatistica', password: 'estatistica123', role: 'ESTATISTICA' },
  { id: '3', username: 'cirurgico', password: 'cirurgico123', role: 'CIRURGICO' }
];

export const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  { 
    id: 'ADMIN', 
    roleName: 'ADMIN', 
    permissions: [
      'VIEW_DASHBOARD', 
      'VIEW_RECORDS', 
      'ADD_RECORDS', 
      'MANAGE_USERS', 
      'EDIT_RECORD', 
      'DELETE_RECORD', 
      'DELETE_PERIOD'
    ] 
  },
  { 
    id: 'ESTATISTICA', 
    roleName: 'ESTATISTICA', 
    permissions: ['VIEW_DASHBOARD', 'VIEW_RECORDS'] 
  },
  { 
    id: 'CIRURGICO', 
    roleName: 'CIRURGICO', 
    permissions: ['VIEW_RECORDS', 'ADD_RECORDS', 'EDIT_RECORD', 'DELETE_RECORD'] 
  }
];

export const ALLOWED_ROOMS = ['01', '02', '03'];

export const COLORS = {
  BLUE: '#3583C7',
  RED: '#EE3234'
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_DASHBOARD: 'Ver Dashboard',
  VIEW_RECORDS: 'Ver Histórico',
  ADD_RECORDS: 'Lançar Dados',
  MANAGE_USERS: 'Gerenciar Usuários',
  EDIT_RECORD: 'Editar Registro',
  DELETE_RECORD: 'Excluir Registro',
  DELETE_PERIOD: 'Limpar por Período'
};

// 30 Dados de Exemplo para Teste
export const MOCK_RECORDS: SurgeryRecord[] = Array.from({ length: 30 }, (_, i) => {
  const names = ["MARIA SILVA", "JOÃO PEREIRA", "ANA SOUZA", "CARLOS OLIVEIRA", "BEATRIZ SANTOS", "MARCOS LIMA", "JULIA COSTA", "PAULO ROCHA", "FERNANDA GOMES", "ROBERTO ALVES"];
  const intervals = [15, 20, 28, 35, 45, 50, 22, 18, 65, 30];
  const startHours = [7, 8, 9, 10, 11, 13, 14, 15, 16, 17];
  
  const interval = intervals[i % 10];
  const startH = startHours[i % 10];
  const startM = (i * 5) % 60;
  const endH = startH;
  const endM = (startM + interval) % 60;
  
  const fTime = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  return {
    id: `mock-${i}`,
    date: `2024-03-${(i % 28 + 1).toString().padStart(2, '0')}`,
    patientName: names[i % 10] + (i > 10 ? ` ${i}` : ''),
    medicalRecord: (1000 + i).toString(),
    roomNumber: ALLOWED_ROOMS[i % 3],
    endAnesthesiaPrev: fTime(startH, startM),
    startAnesthesiaNext: fTime(endH, endM),
    intervalMinutes: interval,
    isDelay: interval > 60
  };
});
