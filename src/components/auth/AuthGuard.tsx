'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const publicPaths = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur n'est pas connecté et que ce n'est pas une page publique
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, isPublicPath, router]);

  // Si c'est une page publique, on affiche le contenu directement sans le layout
  if (isPublicPath) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Pendant le chargement, on affiche un spinner
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur est connecté, on affiche le contenu protégé
  return <>{children}</>;
}
