"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // If user typed a pseudo instead of email, call server endpoint to map to email
      let finalEmail = email;
      if (!email.includes('@')) {
        const lookup = await fetch('/api/find-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: email }) });
        const json = await lookup.json();
        if (json?.found && json.email) {
          finalEmail = json.email;
        } else {
          setError("Utilisateur introuvable (vérifiez votre pseudo)");
          setLoading(false);
          return;
        }
      }

      const res = await signIn(finalEmail, password);
      if (res.error) {
        setError(res.error.message || 'Erreur de connexion');
      } else {
        // Optionnel: stocker le pseudo localement pour compatibilité
        // Si l'utilisateur a entré un pseudo, sauvegarder localStorage
        if (!email.includes('@')) {
          try { localStorage.setItem('econav_username', email); } catch (e) {}
        }
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Mot de passe</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
