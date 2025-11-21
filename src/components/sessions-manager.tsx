'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Trash2, Edit2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Session, PedagogicalContent } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { SessionStructureManager } from './session-structure-manager';
import {
  getSessionsForStage,
  createSessionFromTemplate,
  deleteSessionWithSteps,
} from '@/app/actions-sessions';
import {
  ALL_TEMPLATES,
  type SessionTemplate,
} from '@/data/session-templates';

const sessionSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  description: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

interface SessionsManagerProps {
  stageId: number;
  onSessionsChange?: (sessions: Session[]) => void;
  // Objectifs pédagogiques du programme sélectionnés pour ce stage
  availableObjectives?: PedagogicalContent[];
}

export function SessionsManager({
  stageId,
  onSessionsChange,
  availableObjectives = [],
}: SessionsManagerProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Chargement réel des séances depuis Supabase
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getSessionsForStage(stageId);
        setSessions(data);
        onSessionsChange?.(data);
      } catch (error) {
        console.error('[SessionsManager] load error', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les séances du stage.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stageId, onSessionsChange, toast]);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getSessionsForStage(stageId);
      setSessions(data);
      onSessionsChange?.(data);
    } catch (error) {
      console.error('[SessionsManager] reload error', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de recharger les séances.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Création de séance via template
  const handleCreateSessionFromTemplate = (template: SessionTemplate) => {
    startSaveTransition(async () => {
      try {
        const sessionOrder = sessions.length + 1;
        const created = await createSessionFromTemplate(
          stageId,
          template,
          sessionOrder
        );

        if (!created) {
          toast({
            title: 'Erreur',
            description:
              'La création de la séance à partir du template a échoué.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Séance créée',
          description: `Template "${template.title}" appliqué avec succès.`,
        });

        setIsTemplateDialogOpen(false);
        await reload();
      } catch (error) {
        console.error(
          '[SessionsManager] handleCreateSessionFromTemplate error',
          error
        );
        toast({
          title: 'Erreur',
          description:
            'Une erreur est survenue lors de la création depuis le template.',
          variant: 'destructive',
        });
      }
    });
  };

  // Création manuelle (non encore implémentée côté actions-sessions)
  const handleCreateSession = () => {
    toast({
      title: 'Création manuelle non implémentée',
      description:
        'Utilisez un template pour générer une séance avec étapes. Le CRUD manuel sera ajouté ensuite.',
    });
  };

  const handleDeleteSession = (sessionId: number) => {
    startSaveTransition(async () => {
      const ok = await deleteSessionWithSteps(stageId, sessionId);

      if (!ok) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la séance.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Séance supprimée',
        description: 'La séance et ses étapes associées ont été supprimées.',
      });

      await reload();
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Séances du Stage</CardTitle>
            <CardDescription>
              Créez vos séances à partir de templates pédagogiques structurés.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Depuis un template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Choisir un template de séance</DialogTitle>
                  <DialogDescription>
                    Sélectionnez une séance type pour générer automatiquement la structure (sessions + étapes).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-[60vh] overflow-y-auto">
                  {ALL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleCreateSessionFromTemplate(tpl)}
                      className="text-left border rounded-lg p-3 hover:border-blue-500 hover:shadow-sm transition-all"
                    >
                      <div className="text-sm font-semibold mb-1">
                        {tpl.title}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {tpl.description}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Étapes: {tpl.steps.length} — Durée: {tpl.duration_minutes} min
                      </p>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Séance (manuel)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle séance</DialogTitle>
                  <DialogDescription>
                    Ajoutez une séance avec sa structure sportive
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateSession();
                    }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre de la séance</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Jour 1 - Apprentissage des virements"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Description de la séance..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Créer la séance
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune séance créée</p>
            <p className="text-sm">
              Utilisez un template pour générer automatiquement une première séance structurée.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions
              .slice()
              .sort((a, b) => (a.session_order ?? 0) - (b.session_order ?? 0))
              .map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg overflow-hidden bg-background"
                >
                  {/* Header de séance */}
                  <div className="w-full flex items-center justify-between p-4 bg-muted/40">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-7 w-7 rounded-md bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                        {session.session_order ?? 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {session.title}
                        </h4>
                        {session.description && (
                          <p className="text-xs text-muted-foreground">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Étapes directement visibles (structure du template)
                      + liens objectifs/défis pour chaque étape */}
                  <div className="border-t p-3 bg-muted/10 space-y-2">
                    <SessionStructureManager
                      sessionId={session.id}
                      availableObjectives={availableObjectives}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

