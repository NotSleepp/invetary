// components/RoleGuard.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(role || ''))) {
      router.push('/login'); // Redirigir a login si no tiene acceso
    }
  }, [user, role, loading, allowedRoles, router]);

  if (loading || !user || !allowedRoles.includes(role || '')) {
    return <div>Loading...</div>; // Mostrar pantalla de carga si no está listo
  }

  return <>{children}</>;
};
