'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEnvironmentCapsuleById, updateEnvironmentCapsule } from '@/app/actions-capsules';
import type { EnvironmentCapsuleWithContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ModuleEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const moduleId = parseInt(params.id as string);

  const [module, setModule] = useState<EnvironmentCapsuleWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: '',
    level: 'débutant' as 'débutant' | 'intermédiaire' | 'avancé',
  });

  useEffect(() => {
    const loadModule = async () => {
      setLoading(true);
      const data = await getEnvironmentCapsuleById(moduleId);
      if (data) {
        setModule(data);
        setFormData({
          title: data.title,
          description: data.description || '',
          duration_minutes: data.duration_minutes?.toString() || '',
          level: data.level || 'débutant',
        });
      }
      setLoading(false);
    };

    loadModule();
  }, [moduleId]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erreur', description: 'Le titre est requis', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const success = await updateEnvironmentCapsule(moduleId, {
      title: formData.title,
      description: formData.description || null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      level: formData.level,
    });

    if (success) {
      toast({ title: 'Succès', description: 'Module mis à jour avec succès' });
      router.push(`/capsules/${moduleId}`);
    } else {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le module', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Module non trouvé</p>
          <Link href="/capsules">
            <Button>Retour à la bibliothèque</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/capsules/${moduleId}`} className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au module
          </Link>

          <h1 className="text-3xl font-bold text-foreground">Modifier le module</h1>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du module</CardTitle>
            <CardDescription>Modifiez les détails de votre module environnement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre du module"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du module"
                rows={4}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Durée (minutes)</label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="Durée en minutes"
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Niveau</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Link href={`/capsules/${moduleId}`}>
                <Button variant="outline">Annuler</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

