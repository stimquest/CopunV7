
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading]);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center">
             <Image src="/assets/logoCopun1.png" alt="Logo Cop'un de la mer" width={96} height={96} className="h-auto" />
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
            <div className="text-center space-y-6 text-muted-foreground">
                <h2 className="text-2xl font-bold text-foreground">Bienvenue</h2>
                <p>
                    Cette application, dédiée à l’approche environnementale intégrée dans la pratique sportive, vise à te guider pour que tu puisses gagner en compétence et transmettre ce que tu sais en reliant les contenus entre eux.
                </p>
                
                <Separator />

                <div className="text-left space-y-4 text-sm">
                    <p className="text-center font-semibold text-foreground">Voici le sens caché de COP’UN ©</p>
                    <p className="text-center italic">Comprendre – Observer – Protéger pour ne faire qu’UN, être en harmonie</p>
                    <p><strong className="text-cop-comprendre">Comprendre</strong> met l’accent sur les caractéristiques du lieu géographique et ce qui se passe en milieu littoral : marées, biodiversité, activités humaines…</p>
                    <p><strong className="text-cop-observer">Observer</strong> invite à passer au crible l’espace d’évolution avec les 5 sens pour saisir les interactions entre les éléments : vent, nuages, vagues, courants…</p>
                    <p><strong className="text-cop-proteger">Protéger</strong> vise à zoomer sur la notion de site naturel : sa beauté mais aussi ses fragilités</p>
                </div>
                
                <Separator />

                <p className="font-semibold text-foreground">COP’UN c’est un ami qui te veut du bien.</p>
                <p className="font-bold text-lg text-primary">A toi de jouer !</p>
            </div>
            <div className="space-y-6 mt-8 text-center">
              {user ? (
                <>
                  <h3 className="text-lg font-semibold">Connecté en tant que {user.user_metadata?.full_name || user.email}</h3>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push('/stages')} size="lg">Voir mes stages</Button>
                    <Button variant="outline" onClick={handleSignOut} size="lg">Se déconnecter</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Veuillez vous connecter pour accéder à vos stages et contenus.</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push('/signin')} size="lg">Se connecter</Button>
                    <Button variant="outline" onClick={() => router.push('/profil')} size="lg">Profil (local)</Button>
                  </div>
                </>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
