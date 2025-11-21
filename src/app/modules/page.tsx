'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, BookOpen, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getEnvironmentCapsules } from '@/app/actions-capsules';
import type { EnvironmentModule } from '@/lib/types';

export default function ModulesPage() {
  const [modules, setModules] = useState<EnvironmentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await getEnvironmentCapsules();
      setModules(data || []);
    } finally {
      setLoading(false);
    }
  };

  const filtered = modules.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.themes || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="h-7 w-7 text-green-600" />
            Modules environnement
          </h1>
          <p className="text-sm text-muted-foreground">
            Tous les modules environnement construits avec l'outil Programme. Réutilisez-les dans vos séances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadModules} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, thème, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Chargement des modules...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Aucun module environnement trouvé.
            </p>
            <p className="text-xs text-muted-foreground">
              Créez un module depuis l'outil Programme, il apparaîtra automatiquement ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((m) => (
            <Card key={m.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    {m.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Module issu de l'outil Programme
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {m.level && (
                    <Badge variant="outline" className="text-[9px]">Niveau {m.level}</Badge>
                  )}
                  {Array.isArray(m.themes) && m.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {m.themes.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[8px]">{t}</Badge>
                      ))}
                      {m.themes.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{m.themes.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {m.description && (
                  <p className="line-clamp-3">{m.description}</p>
                )}
                <p className="text-[10px]">
                  Pour l'utiliser dans un stage, ouvrez le plan pédagogique et attachez ce module à une étape.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}