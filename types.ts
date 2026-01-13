
export enum PerformanceLevel {
  HIGH = 'HIGH', // < 25 min
  MEDIUM = 'MEDIUM', // 25-40 min
  LOW = 'LOW' // > 40 min
}

// Role agora é uma string que representa o ID único do nível de acesso
export type Role = string;

export type Permission = 'VIEW_DASHBOARD' | 'VIEW_RECORDS' | 'ADD_RECORDS' | 'MANAGE_USERS';

export interface RoleConfig {
  id: string;
  roleName: string; // Nome visível do nível (ex: Administrador, Enfermeiro)
  permissions: Permission[];
}

export interface SurgeryRecord {
  id: string;
  date: string;
  medicalRecord: string; // Prontuário
  roomNumber: string;
  endAnesthesiaPrev: string; // HH:mm
  startAnesthesiaNext: string; // HH:mm
  intervalMinutes: number;
  isDelay: boolean; // > 60 minutes
}

export interface DashboardStats {
  averageTurnover: number;
  totalPatients: number;
  highPerformanceCount: number;
  mediumPerformanceCount: number;
  lowPerformanceCount: number;
  delaysCount: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role; // ID da RoleConfig correspondente
}
