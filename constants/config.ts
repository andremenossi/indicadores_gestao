
import { User, RoleConfig, Permission, SurgeryRecord } from '../types';

export const STORAGE_KEYS = {
  RECORDS: 'gsc_records_v1',
  USERS: 'gsc_users_v1',
  PERMISSIONS: 'gsc_perms_v1'
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
      'MANAGE_USERS',
      'VIEW_TURNOVER', 
      'ADD_TURNOVER', 
      'EDIT_TURNOVER', 
      'DELETE_TURNOVER', 
      'DELETE_PERIOD_TURNOVER',
      'VIEW_CLEANING',
      'ADD_CLEANING',
      'EDIT_CLEANING',
      'DELETE_CLEANING',
      'DELETE_PERIOD_CLEANING'
    ] 
  },
  { 
    id: 'ESTATISTICA', 
    roleName: 'ESTATISTICA', 
    permissions: [
      'VIEW_DASHBOARD', 
      'VIEW_TURNOVER', 
      'EDIT_TURNOVER', 
      'VIEW_CLEANING', 
      'EDIT_CLEANING'
    ] 
  },
  { 
    id: 'CIRURGICO', 
    roleName: 'CIRURGICO', 
    permissions: [
      'VIEW_TURNOVER', 
      'ADD_TURNOVER', 
      'VIEW_CLEANING', 
      'ADD_CLEANING'
    ] 
  }
];

export const ALLOWED_ROOMS = ['01', '02', '03', '04', '05'];

export const COLORS = {
  BLUE: '#3583C7',
  RED: '#EE3234'
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_DASHBOARD: 'Ver Dashboard Geral',
  MANAGE_USERS: 'Gerenciar Usuários',
  // Turnover
  VIEW_TURNOVER: 'Ver Histórico Turnover',
  ADD_TURNOVER: 'Lançar Dados Turnover',
  EDIT_TURNOVER: 'Editar Lançamento Turnover',
  DELETE_TURNOVER: 'Excluir Item Turnover',
  DELETE_PERIOD_TURNOVER: 'Limpar Período Turnover',
  // Limpeza
  VIEW_CLEANING: 'Ver Histórico Limpeza',
  ADD_CLEANING: 'Lançar Dados Limpeza',
  EDIT_CLEANING: 'Editar Lançamento Limpeza',
  DELETE_CLEANING: 'Excluir Item Limpeza',
  DELETE_PERIOD_CLEANING: 'Limpar Período Limpeza'
};

export const MOCK_RECORDS: SurgeryRecord[] = Array.from({ length: 15 }, (_, i) => {
  const names = ["MARIA SILVA", "JOÃO PEREIRA", "ANA SOUZA", "CARLOS OLIVEIRA", "BEATRIZ SANTOS"];
  const intervals = [15, 25, 30, 45, 70];
  const startHours = [7, 9, 11, 14, 16];
  
  const interval = intervals[i % 5];
  const startH = startHours[i % 5];
  const fTime = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  return {
    id: `mock-${i}`,
    date: `2024-03-${(i % 28 + 1).toString().padStart(2, '0')}`,
    patientName: names[i % 5],
    medicalRecord: (1000 + i).toString(),
    roomNumber: ALLOWED_ROOMS[i % 5],
    endAnesthesiaPrev: fTime(startH, 0),
    startAnesthesiaNext: fTime(startH, interval),
    intervalMinutes: interval,
    isDelay: interval > 60
  };
});
