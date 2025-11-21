'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Plus, Trash2, GripVertical, ChevronUp, Pencil } from 'lucide-react';
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
import type { SessionStructure, PedagogicalContent, Defi } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { updateSessionStep, setStepObjectives, setStepDefis } from '@/app/actions-sessions';
import { allDefis } from '@/data/defis';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

const stepSchema = z.object({
  step_title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  step_duration_minutes: z.coerce.number().int().positive().optional(),
  step_description: z.string().optional(),
});

type StepFormValues = z.infer<typeof stepSchema>;

interface SessionStructureManagerProps {
  sessionId: number;
  // Objectifs disponibles pour ce stage (ex: passés depuis PlanPedagogiqueV2)
  availableObjectives?: PedagogicalContent[];
}

export function SessionStructureManager({
  sessionId,
  availableObjectives = [],
}: SessionStructureManagerProps) {
  const { toast } = useToast();
  const [steps, setSteps] = useState<
    (SessionStructure & {
      linkedPedagogicalIds?: number[] | null;
      // IDs de défis stockés en TEXT en base (defi_id), donc string côté front
      linkedDefisIds?: string[] | null;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SessionStructure | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  const form = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      step_title: '',
      step_duration_minutes: undefined,
      step_description: '',
    },
  });

  const editForm = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      step_title: '',
      step_duration_minutes: undefined,
      step_description: '',
    },
  });

  // Charge les steps réelles + liens objectifs/défis depuis les tables dédiées
  React.useEffect(() => {
    const loadSteps = async () => {
      setLoading(true);
      try {
        const client = (await import('@/lib/supabase')).supabase as any;

        // 1) Steps de base
        const { data: stepsData, error: stepsError } = await client
          .from('session_structure')
          .select('*')
          .eq('session_id', sessionId)
          .order('step_order', { ascending: true })
          .order('id', { ascending: true });

        if (stepsError || !stepsData) {
          console.error('[SessionStructureManager] loadSteps error', stepsError);
          setSteps([]);
          setLoading(false);
          return;
        }

        const stepsBase = stepsData as SessionStructure[];
        const stepIds = stepsBase.map((s) => s.id);

        if (stepIds.length === 0) {
          setSteps([]);
          setLoading(false);
          return;
        }

        // 2) Liens objectifs (session_step_pedagogical_links)
        const { data: linksObj, error: linksObjError } = await client
          .from('session_step_pedagogical_links')
          .select('session_step_id, pedagogical_content_id')
          .in('session_step_id', stepIds);

        const objByStep = new Map<number, number[]>();
        if (!linksObjError && linksObj) {
          (linksObj as any[]).forEach((row) => {
            const stepId = Number(row.session_step_id);
            const list = objByStep.get(stepId) || [];
            list.push(Number(row.pedagogical_content_id));
            objByStep.set(stepId, list);
          });
        } else if (linksObjError) {
          console.error(
            '[SessionStructureManager] load objectives links error',
            linksObjError
          );
        }

        // 3) Liens défis (session_step_defis_links) si table présente
        const defiByStep = new Map<number, string[]>();
        try {
          const { data: linksDefis, error: linksDefisError } = await client
            .from('session_step_defis_links')
            .select('session_step_id, defi_id')
            .in('session_step_id', stepIds);

          if (!linksDefisError && linksDefis) {
            (linksDefis as any[]).forEach((row) => {
              const stepId = Number(row.session_step_id);
              const list = defiByStep.get(stepId) || [];
              // defi_id est stocké en TEXT -> on force string
              list.push(String(row.defi_id));
              defiByStep.set(stepId, list);
            });
          } else if (linksDefisError) {
            // table absente ou erreur: on log juste
            console.warn(
              '[SessionStructureManager] load defis links warning',
              linksDefisError
            );
          }
        } catch (e) {
          // table possiblement non créée en dev: on ignore sans casser l’affichage
          console.warn(
            '[SessionStructureManager] session_step_defis_links not available',
            e
          );
        }

        // 4) Hydrate steps avec les IDs liés
        const hydrated = stepsBase.map((s) => ({
          ...s,
          linkedPedagogicalIds: objByStep.get(s.id) || [],
          linkedDefisIds: defiByStep.get(s.id) || [],
        }));

        setSteps(hydrated);
      } catch (error) {
        console.error(
          '[SessionStructureManager] unexpected loadSteps error',
          error
        );
        setSteps([]);
      } finally {
        setLoading(false);
      }
    };

    loadSteps();
  }, [sessionId]);
 
  const handleCreateStep = () => {
    toast({
      title: 'Création non implémentée',
      description:
        "Pour l'instant, les étapes proviennent des templates. Le CRUD manuel sera ajouté ensuite.",
    });
  };
 
  const handleDeleteStep = async () => {
    toast({
      title: 'Suppression non implémentée',
      description:
        "Pour l'instant, supprime la séance si le template ne convient pas. La suppression fine d'étapes sera ajoutée ensuite.",
      variant: 'destructive',
    });
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">
              Étapes de la séance
            </CardTitle>
            <CardDescription className="text-xs">
              Issues du template, modifiables pour adapter au terrain.
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3 w-3" />
                Ajouter une Étape
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une étape sportive</DialogTitle>
                <DialogDescription>
                  Définissez une étape de la séance (échauffement, apprentissage, pratique, débriefing)
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateStep();
                  }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="step_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de l'étape</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Échauffement, Apprentissage, Pratique, Débriefing" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="step_duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="step_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description de l'étape..." {...field} />
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
                      Ajouter l'étape
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="animate-spin mx-auto h-4 w-4" />
          </div>
        ) : steps.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            <p>Aucune étape définie pour cette séance.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => {
              const linkedObjectives =
                step.linkedPedagogicalIds && step.linkedPedagogicalIds.length
                  ? availableObjectives.filter((o) =>
                      step.linkedPedagogicalIds!.includes(Number(o.id))
                    )
                  : [];
              const linkedDefis =
                step.linkedDefisIds && step.linkedDefisIds.length
                  ? allDefis.filter((d) =>
                      step.linkedDefisIds!.includes(String(d.id))
                    )
                  : [];

              return (
                <div
                  key={step.id}
                  className="border rounded-md px-3 py-2 bg-white shadow-sm flex flex-col gap-2"
                >
                  {/* Ligne principale: titre + durée + édition */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                          {step.step_order ?? index + 1}
                        </span>
                        <h4 className="text-xs font-semibold">
                          {step.step_title}
                        </h4>
                        {step.step_duration_minutes && (
                          <span className="text-[10px] text-muted-foreground">
                            ⏱ {step.step_duration_minutes} min
                          </span>
                        )}
                      </div>
                      {step.step_description && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {step.step_description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => {
                          editForm.reset({
                            step_title: step.step_title || '',
                            step_duration_minutes:
                              step.step_duration_minutes || undefined,
                            step_description: step.step_description || '',
                          });
                          setEditingStep(step);
                        }}
                        aria-label="Éditer l'étape"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeleteStep()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Badges de liens actuels avec popovers détaillés */}
                  <div className="flex flex-wrap items-center gap-2 pl-6">
                    {/* Objectifs liés */}
                    {linkedObjectives.map((obj) => (
                      <Popover key={`obj-${obj.id}`}>
                        <PopoverTrigger asChild>
                          <Badge
                            variant="outline"
                            className="cursor-pointer text-[9px] border-emerald-400 text-emerald-700 hover:bg-emerald-50/80"
                          >
                            🎯{' '}
                            {obj.question ||
                              obj.objectif ||
                              `Objectif ${obj.id}`}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-72 p-3 space-y-1"
                        >
                          <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                            Objectif pédagogique
                          </p>
                          {obj.question && (
                            <p className="text-[11px] font-medium text-foreground">
                              {obj.question}
                            </p>
                          )}
                          {obj.objectif && (
                            <p className="text-[10px] text-muted-foreground">
                              {obj.objectif}
                            </p>
                          )}
                          {obj.tip && (
                            <p className="text-[9px] text-emerald-700 mt-1">
                              Astuce: {obj.tip}
                            </p>
                          )}
                        </PopoverContent>
                      </Popover>
                    ))}

                    {/* Défis liés */}
                    {linkedDefis.map((defi) => (
                      <Popover key={`defi-${defi.id}`}>
                        <PopoverTrigger asChild>
                          <Badge
                            variant="outline"
                            className="cursor-pointer text-[9px] border-amber-400 text-amber-600 hover:bg-amber-50/80"
                          >
                            🏅 Défi:&nbsp;
                            {defi.description ||
                              defi.instruction ||
                              String(defi.id)}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-72 p-3 space-y-1"
                        >
                          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                            Défi lié à cette étape
                          </p>
                          <p className="text-[11px] font-medium text-foreground">
                            {defi.description ||
                              defi.instruction ||
                              `Défi ${defi.id}`}
                          </p>
                          {defi.instruction && (
                            <p className="text-[10px] text-muted-foreground">
                              Consigne: {defi.instruction}
                            </p>
                          )}
                        </PopoverContent>
                      </Popover>
                    ))}

                    {/* Bouton pour lier objectifs / défis */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[9px]"
                        >
                          Lier objectifs / défis
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0 overflow-hidden">
                        {/* Header engageant */}
                        <div className="bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-4 text-white flex items-center justify-between gap-3">
                          <div>
                            <DialogTitle className="text-base font-semibold">
                              Liens pour l'étape {step.step_order ?? index + 1}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-white/80">
                              Sélectionne les objectifs environnementaux et les défis
                              réellement travaillés dans cette étape. Ces liens alimentent
                              ensuite le Suivi et le Suivi BIS.
                            </DialogDescription>
                          </div>
                        </div>

                        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Objectifs pédagogiques */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                                Objectifs pédagogiques
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Coche les questions / objectifs vus dans cette étape.
                              </p>
                            </div>
                            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                              {availableObjectives.length === 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                  Aucun objectif disponible pour ce stage. Configure le programme
                                  dans l’onglet dédié.
                                </p>
                              )}
                              {availableObjectives.map((obj) => {
                                const checked =
                                  (step.linkedPedagogicalIds || []).includes(
                                    Number(obj.id)
                                  );
                                return (
                                  <label
                                    key={obj.id}
                                    className="flex items-start gap-2 text-[10px] rounded-md px-2 py-1.5 hover:bg-emerald-50/60 cursor-pointer border border-transparent hover:border-emerald-100"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={async (val) => {
                                        const current =
                                          step.linkedPedagogicalIds || [];
                                        const next = val
                                          ? [...current, Number(obj.id)]
                                          : current.filter(
                                              (id) => id !== Number(obj.id)
                                            );
                                        const ok = await setStepObjectives(
                                          step.id,
                                          next
                                        );
                                        if (!ok) {
                                          toast({
                                            title: 'Erreur',
                                            description:
                                              "Impossible de mettre à jour les objectifs liés.",
                                            variant: 'destructive',
                                          });
                                          return;
                                        }
                                        setSteps((prev) =>
                                          prev.map((s) =>
                                            s.id === step.id
                                              ? {
                                                  ...s,
                                                  linkedPedagogicalIds: next,
                                                }
                                              : s
                                          )
                                        );
                                      }}
                                    />
                                    <div className="space-y-0.5">
                                      <div className="font-medium text-foreground">
                                        {obj.question ||
                                          obj.objectif ||
                                          `Objectif ${obj.id}`}
                                      </div>
                                      {obj.objectif && obj.question && (
                                        <div className="text-[9px] text-muted-foreground">
                                          {obj.objectif}
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Défis depuis la source métier */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                                Défis
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Coche les défis réellement activés pendant cette étape. On affiche
                                ici leurs titres et consignes (pas uniquement l’ID technique).
                              </p>
                            </div>
                            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                              {allDefis.map((defi) => {
                                const checked =
                                  (step.linkedDefisIds || []).includes(
                                    String(defi.id)
                                  );
                                return (
                                  <label
                                    key={defi.id}
                                    className="flex items-start gap-2 text-[10px] rounded-md px-2 py-1.5 hover:bg-amber-50/70 cursor-pointer border border-transparent hover:border-amber-100"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={async (val) => {
                                        const current =
                                          step.linkedDefisIds || [];
                                        const next = val
                                          ? [...current, String(defi.id)]
                                          : current.filter(
                                              (id) =>
                                                id !== String(defi.id)
                                            );
                                        const ok = await setStepDefis(
                                          step.id,
                                          next
                                        );
                                        if (!ok) {
                                          toast({
                                            title: 'Erreur',
                                            description:
                                              'Impossible de mettre à jour les défis liés.',
                                            variant: 'destructive',
                                          });
                                          return;
                                        }
                                        setSteps((prev) =>
                                          prev.map((s) =>
                                            s.id === step.id
                                              ? {
                                                  ...s,
                                                  linkedDefisIds: next,
                                                }
                                              : s
                                          )
                                        );
                                      }}
                                    />
                                    <div className="space-y-0.5">
                                      <div className="font-medium text-foreground">
                                        {defi.description ||
                                          defi.instruction ||
                                          `Défi ${defi.id}`}
                                      </div>
                                      {defi.description && (
                                        <div className="text-[9px] text-muted-foreground">
                                          {defi.description}
                                        </div>
                                      )}
                                      {!defi.description && defi.instruction && (
                                        <div className="text-[9px] text-muted-foreground">
                                          {defi.instruction}
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="px-6 pb-4 pt-0 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {}}
                          >
                            Fermer
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Dialog édition étape */}
      <Dialog
        open={!!editingStep}
        onOpenChange={(open) => {
          if (!open) setEditingStep(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'étape</DialogTitle>
            <DialogDescription className="text-xs">
              Ajuste le titre, la durée ou ajoute une description concrète.
            </DialogDescription>
          </DialogHeader>
          {editingStep && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit((values) => {
                  startSaveTransition(async () => {
                    const ok = await updateSessionStep(editingStep.id, {
                      step_title: values.step_title,
                      step_duration_minutes:
                        values.step_duration_minutes || null,
                      step_description: values.step_description || null,
                    });

                    if (!ok) {
                      toast({
                        title: 'Erreur',
                        description:
                          "Impossible de mettre à jour l'étape. Réessaie.",
                        variant: 'destructive',
                      });
                      return;
                    }

                    // Mise à jour locale immédiate
                    setSteps((prev) =>
                      prev.map((s) =>
                        s.id === editingStep.id
                          ? {
                              ...s,
                              step_title: values.step_title,
                              step_duration_minutes:
                                values.step_duration_minutes || null,
                              step_description:
                                values.step_description || null,
                            }
                          : s
                      )
                    );

                    toast({
                      title: 'Étape mise à jour',
                      description:
                        'La description et la durée ont été enregistrées.',
                    });

                    setEditingStep(null);
                  });
                })}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="step_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l'étape</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="step_duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="step_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Note concrète pour cette étape, consignes, points clés pédagogiques..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingStep(null)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

