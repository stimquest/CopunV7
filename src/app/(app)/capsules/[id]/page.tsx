'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEnvironmentCapsuleById, deleteEnvironmentCapsule } from '@/app/actions-capsules';
import type { EnvironmentCapsuleWithContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Clock, Zap, BookOpen, HelpCircle, Gamepad2, Trophy } from 'lucide-react';

export default function CapsuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const capsuleId = parseInt(params.id as string);

  const [capsule, setCapsule] = useState<EnvironmentCapsuleWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCapsule = async () => {
      setLoading(true);
      const data = await getEnvironmentCapsuleById(capsuleId);
      setCapsule(data);
      setLoading(false);
    };

    loadCapsule();
  }, [capsuleId]);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) return;

    setDeleting(true);
    const success = await deleteEnvironmentCapsule(capsuleId);
    if (success) {
      router.push('/capsules');
    } else {
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <BookOpen className="w-4 h-4" />;
      case 'question':
        return <HelpCircle className="w-4 h-4" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4" />;
      case 'defi':
        return <Trophy className="w-4 h-4" />;
      case 'tip':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'info':
        return 'Information';
      case 'question':
        return 'Question';
      case 'game':
        return 'Jeu';
      case 'defi':
        return 'Défi';
      case 'tip':
        return 'Conseil';
      default:
        return type;
    }
  };

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'débutant':
        return 'bg-green-100 text-green-800';
      case 'intermédiaire':
        return 'bg-yellow-100 text-yellow-800';
      case 'avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (!capsule) {
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
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/capsules" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour à la bibliothèque
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{capsule.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={capsule.is_public ? 'default' : 'secondary'}>
                  {capsule.is_public ? '🌍 Publique' : '🔒 Privée'}
                </Badge>
                {capsule.level && (
                  <Badge className={getLevelColor(capsule.level)}>
                    {capsule.level}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/capsules/${capsule.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Description and Metadata */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {capsule.description || 'Pas de description fournie'}
                </p>
              </CardContent>
            </Card>

            {/* Content Items */}
            <Card>
              <CardHeader>
                <CardTitle>Contenu ({capsule.content.length} éléments)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {capsule.content.length === 0 ? (
                  <p className="text-muted-foreground">Aucun contenu pour ce module</p>
                ) : (
                  capsule.content.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getContentIcon(item.content_type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {getContentTypeLabel(item.content_type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {JSON.stringify(item.content_data, null, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-4">
            {/* Duration */}
            {capsule.duration_minutes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Durée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{capsule.duration_minutes} min</p>
                </CardContent>
              </Card>
            )}

            {/* Themes */}
            {capsule.themes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thématiques</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {capsule.themes.map((theme) => (
                    <Badge key={theme} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            {capsule.activity_types.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Activités
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {capsule.activity_types.map((activity) => (
                    <Badge key={activity} variant="outline">
                      {activity}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Locations */}
            {capsule.location_types.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lieux</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {capsule.location_types.map((location) => (
                    <Badge key={location} variant="outline">
                      {location}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Seasons */}
            {capsule.season.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Saisons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {capsule.season.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

