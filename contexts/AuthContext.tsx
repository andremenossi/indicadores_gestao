
import React, { createContext, useContext, ReactNode } from 'react';
import { User, Permission, RoleConfig } from '../types';

interface AuthContextType {
  user: User | null;
  hasPermission: (perm: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ 
  user: User | null; 
  roleConfigs: RoleConfig[]; 
  children: ReactNode 
}> = ({ user, roleConfigs, children }) => {
  
  const hasPermission = (perm: Permission): boolean => {
    if (!user) return false;
    const config = roleConfigs.find(c => c.id === user.role);
    return config?.permissions.includes(perm) || false;
  };

  return (
    <AuthContext.Provider value={{ user, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
