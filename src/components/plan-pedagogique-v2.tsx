'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ListChecks,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Search,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Session, SessionStructure, PedagogicalContent } from '@/lib/types';
import {
  ALL_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type SessionTemplate,
} from '@/data/session-templates';
import {
  getSessionsForStage,
  getSessionStructure,
  createSessionFromTemplate,
} from '@/app/actions-sessions';

/**
 * PlanPedagogiqueV2
 *
 * - UTILISE les tables existantes:
 *   - public.sessions
 *   - public.session_structure
 * - UTILISE les templates:
 *   - src/data/session-templates.ts
 * - PERMET:
 *   - de charger les séances/étapes d'un stage
 *   - de générer une séance complète depuis un template (Séance 2h, etc.)
 *     -> insertion réelle en base via actions-sessions.ts
 */

interface PlanPedagogiqueV2Props {
  stageId: number;
  programObjectives: PedagogicalContent[];
}

type ViewMode = 'build' | 'links';

interface SessionWithDetails extends Session {
  steps: SessionStructure[];
}

export function PlanPedagogiqueV2({
  stageId,
  programObjectives,
}: PlanPedagogiqueV2Props) {
  const { toast } = useToast();

  const [mode, setMode] = useState<ViewMode>('build');
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Chargement initial des séances + étapes depuis Supabase
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const base = await getSessionsForStage(stageId);
        const withSteps: SessionWithDetails[] = await Promise.all(
          base.map(async (s) => {
            const steps = await getSessionStructure(s.id);
            return { ...s, steps };
          })
        );
        setSessions(withSteps);
      } catch (error) {
        console.error('[PlanPedagogiqueV2] loadAll error', error);
        toast({
          title: 'Erreur',
          description:
            'Impossible de charger les séances du plan pédagogique.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [stageId, toast]);

  const reload = async () => {
    try {
      setLoading(true);
      const base = await getSessionsForStage(stageId);
      const withSteps: SessionWithDetails[] = await Promise.all(
        base.map(async (s) => {
          const steps = await getSessionStructure(s.id);
          return { ...s, steps };
        })
      );
      setSessions(withSteps);
    } catch (error) {
      console.error('[PlanPedagogiqueV2] reload error', error);
      toast({
        title: 'Erreur',
        description:
          'Impossible de recharger les séances du plan pédagogique.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSessionFromTemplate = async (
    template: SessionTemplate
  ) => {
    try {
      const order = sessions.length + 1;
      const created = await createSessionFromTemplate(
        stageId,
        template,
        order
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
        description: `Le template "${template.title}" a généré une séance et ses étapes.`,
      });

      setShowTemplateDialog(false);
      await reload();
    } catch (error) {
      console.error(
        '[PlanPedagogiqueV2] handleCreateSessionFromTemplate error',
        error
      );
      toast({
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de la création depuis le template.',
        variant: 'destructive',
      });
    }
  };

  const handleNotImplemented = (label: string) => {
    toast({
      title: 'Fonctionnalité à venir',
      description: `${label} sera connecté aux liens pédagogiques / édition avancée.`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex flex-col items-center gap-2">
          <div className="animate-spin h-6 w-6 rounded-full border-b-2 border-blue-500" />
          <p className="text-sm text-muted-foreground">
            Chargement du plan pédagogique...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="w-4 h-4 text-blue-600" />
            Plan Pédagogique
          </CardTitle>
          <CardDescription className="text-xs">
            Construisez vos séances à partir de templates, puis reliez-les au Programme.
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={reload}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowTemplateDialog(true)}
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Ajouter via template
            </Button>
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as ViewMode)}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-2 h-7">
              <TabsTrigger value="build" className="text-[10px] px-2">
                Construction
              </TabsTrigger>
              <TabsTrigger value="links" className="text-[10px] px-2">
                Liens objectifs
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 min-h-0">
        <Tabs value={mode} className="h-full flex flex-col">
          <TabsContent value="build" className="flex-1 flex flex-col mt-0">
            <BuildView
              sessions={sessions}
              onCreateSessionFromTemplate={() =>
                setShowTemplateDialog(true)
              }
              onEditSession={() =>
                handleNotImplemented('Édition de séance')
              }
              onDeleteSession={() =>
                handleNotImplemented('Suppression de séance')
              }
              onAddStep={() =>
                handleNotImplemented('Ajout étape')
              }
              onEditStep={() =>
                handleNotImplemented('Édition étape')
              }
              onDeleteStep={() =>
                handleNotImplemented('Suppression étape')
              }
            />
          </TabsContent>
          <TabsContent value="links" className="flex-1 flex flex-col mt-0">
            <LinksView
              sessions={sessions}
              programObjectives={programObjectives}
              onToggleLink={() =>
                handleNotImplemented('Lien étape ↔ fiche Programme')
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <TemplateSelectionDialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelectTemplate={handleCreateSessionFromTemplate}
      />
    </Card>
  );
}

/* ========================================================================== */
/* BuildView: affichage type du constructeur, sans backend câblé             */
/* ========================================================================== */

interface BuildViewProps {
  sessions: SessionWithDetails[];
  onCreateSessionFromTemplate: () => void;
  onEditSession: () => void;
  onDeleteSession: () => void;
  onAddStep: () => void;
  onEditStep: () => void;
  onDeleteStep: () => void;
}

function BuildView({
  sessions,
  onCreateSessionFromTemplate,
  onEditSession,
  onDeleteSession,
  onAddStep,
  onEditStep,
  onDeleteStep,
}: BuildViewProps) {
  const hasSessions = sessions.length > 0;

  return (
    <div className="space-y-4">
      {!hasSessions && (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center space-y-2">
            <p className="text-sm font-medium">
              Aucun plan généré pour ce stage.
            </p>
            <p className="text-xs text-muted-foreground">
              Utilisez les templates pour créer automatiquement une séance et ses étapes dans le plan.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={onCreateSessionFromTemplate}
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Choisir un template
            </Button>
          </CardContent>
        </Card>
      )}

      {hasSessions &&
        sessions.map((session) => (
          <Card
            key={session.id}
            className="overflow-hidden border-l-4 border-l-blue-500"
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/40 to-transparent">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-9 w-9 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    {session.session_order ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">
                      {session.title}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">
                      {session.steps.length} étape
                      {session.steps.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={onEditSession}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={onDeleteSession}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {session.steps.length === 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Aucune étape définie pour cette séance.
                </p>
              )}
              {session.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="border rounded-md p-2 flex items-center gap-2 bg-muted/20"
                >
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[8px]">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate">
                      {step.step_title}
                    </div>
                    {step.step_duration_minutes && (
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {step.step_duration_minutes} min
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={onEditStep}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={onDeleteStep}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1 border-dashed"
                onClick={onAddStep}
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Ajouter une étape
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

/* ========================================================================== */
/* LinksView: représentation des liens Étapes ↔ Fiches Programme (UI only)    */
/* ========================================================================== */

interface LinksViewProps {
  sessions: SessionWithDetails[];
  programObjectives: PedagogicalContent[];
  onToggleLink: () => void;
}

function LinksView({
  sessions,
  programObjectives,
  onToggleLink,
}: LinksViewProps) {
  if (!sessions.length) {
    return (
      <div className="py-4 text-xs text-muted-foreground">
        Aucune séance disponible. La liaison Étapes ↔ Programme sera active une fois les séances câblées.
      </div>
    );
  }

  if (!programObjectives.length) {
    return (
      <div className="py-4 text-xs text-muted-foreground">
        Aucun objectif pédagogique chargé. Configurez le Programme pour voir les liens potentiels.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
      {sessions.map((session) => (
        <div key={session.id} className="space-y-1">
          <div className="text-[10px] font-semibold text-blue-700">
            {session.session_order ?? '–'} - {session.title}
          </div>
          {session.steps.length === 0 && (
            <div className="text-[9px] text-muted-foreground pl-2">
              Aucune étape dans cette séance.
            </div>
          )}
          {session.steps.map((step) => (
            <div
              key={step.id}
              className="border rounded-md bg-background p-2 mb-1"
            >
              <div className="text-[9px] font-medium">
                {step.step_title}
              </div>
              <div className="mt-1 grid gap-1 md:grid-cols-3 lg:grid-cols-4">
                {programObjectives.map((obj) => {
                  const id = Number((obj as any).id);
                  const label =
                    ((obj as any).question as string) ||
                    ((obj as any).objectif as string) ||
                    `Fiche #${id}`;
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-1.5 text-[8px] cursor-pointer"
                    >
                      <Checkbox
                        className="h-3 w-3"
                        checked={false}
                        onCheckedChange={onToggleLink}
                      />
                      <span className="line-clamp-2">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== */
/* Template Selection Dialog (UI only, sans backend)                          */
/* ========================================================================== */

interface TemplateSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SessionTemplate) => void;
}

function TemplateSelectionDialog({
  open,
  onClose,
  onSelectTemplate,
}: TemplateSelectionDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    TEMPLATE_CATEGORIES[0]?.id ?? ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALL_TEMPLATES.filter((tpl) => {
    const categoryMatch =
      !selectedCategory || tpl.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryMatch;
    return (
      categoryMatch &&
      (tpl.title.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q))
    );
  });

  const handleSelect = (tpl: SessionTemplate) => {
    onSelectTemplate(tpl);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-lg">
            Choisir un template de séance
          </DialogTitle>
          <DialogDescription className="text-xs">
            Basez rapidement votre plan sur une séance type (implémentation backend à connecter).
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un template..."
              className="pl-7 h-8 text-xs"
            />
          </div>

          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <TabsList className="grid grid-cols-4 h-8">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="text-[10px] px-1"
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 mt-3 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              Aucun template ne correspond à cette recherche.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelect(tpl)}
                className="group text-left border rounded-lg p-3 hover:border-blue-400 hover:shadow-sm transition-all bg-background"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                    {tpl.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold line-clamp-1">
                      {tpl.title}
                    </div>
                    <div className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">
                      {tpl.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[8px] text-muted-foreground">
                  <span>Durée: {tpl.duration_minutes} min</span>
                  <span>Étapes: {tpl.steps.length}</span>
                  {tpl.level && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {tpl.level}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
