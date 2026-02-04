
export enum PerformanceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export type Role = string;

export type Permission = 
  | 'VIEW_DASHBOARD' 
  | 'MANAGE_USERS'
  // Turnover Cirúrgico
  | 'VIEW_TURNOVER' 
  | 'VIEW_TURNOVER_DASHBOARD'
  | 'ADD_TURNOVER' 
  | 'EDIT_TURNOVER'
  | 'DELETE_TURNOVER'
  | 'DELETE_PERIOD_TURNOVER'
  | 'IMPORT_TURNOVER'
  // Registro de Limpeza
  | 'VIEW_CLEANING'
  | 'VIEW_CLEANING_DASHBOARD'
  | 'ADD_CLEANING'
  | 'EDIT_CLEANING'
  | 'DELETE_CLEANING'
  | 'DELETE_PERIOD_CLEANING'
  | 'IMPORT_CLEANING';

export interface RoleConfig {
  id: string;
  roleName: string;
  permissions: Permission[];
}

export interface SurgeryRecord {
  id: string;
  date: string;
  patientName: string;
  medicalRecord: string;
  roomNumber: string;
  endAnesthesiaPrev: string;
  startAnesthesiaNext: string;
  intervalMinutes: number;
  isDelay: boolean;
}

export interface CleaningRecord {
  id: string;
  date: string;
  roomNumber: string;
  staffName: string;
  nurseName: string;
  cleaningType: 'CONCORRENTE' | 'TERMINAL';
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
}
