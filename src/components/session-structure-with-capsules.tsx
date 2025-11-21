'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Clock, BookOpen, Loader2, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  createSessionStructureStep,
  getSessionStructure,
  deleteSessionStructureStep,
  getSessionCapsules,
  getEnvironmentCapsules,
  addCapsuleToSession,
  removeCapsuleFromSession,
  createModuleFromPedagogicalContent,
} from '@/app/actions-capsules';
import { getPedagogicalContent, getEtagesData } from '@/app/actions';
import type { SessionStructure, SessionModule, EnvironmentModule, PedagogicalContent } from '@/lib/types';
import { ProgrammeBuilder } from './programme-builder';
import { cn } from '@/lib/utils';

interface SessionStructureWithCapsulesProps {
  sessionId: number;
}

interface StepWithModules extends SessionStructure {
  modules?: (SessionModule & { module?: EnvironmentModule })[];
}

export function SessionStructureWithCapsules({ sessionId }: SessionStructureWithCapsulesProps) {
  const { toast } = useToast();
  const [steps, setSteps] = useState<StepWithModules[]>([]);
  const [availableModules, setAvailableModules] = useState<EnvironmentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDuration, setNewStepDuration] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [selectedStepForModule, setSelectedStepForModule] = useState<number | null>(null);
  const [addModuleMode, setAddModuleMode] = useState<'choice' | 'reuse' | 'create'>('choice');
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleLevel, setModuleLevel] = useState(0);
  const [moduleThemes, setModuleThemes] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<PedagogicalContent[]>([]);
  const [etagesData, setEtagesData] = useState<any>(null);

  useEffect(() => {
    loadData();
    // Load etages data for ProgrammeBuilder
    getEtagesData().then(data => setEtagesData(data));
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    const [stepsData, modulesData, sessionModulesData] = await Promise.all([
      getSessionStructure(sessionId),
      getEnvironmentCapsules(),
      getSessionCapsules(sessionId),
    ]);

    setAvailableModules(modulesData);

    // Enrichir les étapes avec leurs modules
    const stepsWithModules = stepsData.map((step) => ({
      ...step,
      modules: sessionModulesData.filter((sm) => sm.session_step_id === step.id),
    }));

    setSteps(stepsWithModules);
    setLoading(false);
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) {
      toast({ title: 'Erreur', description: 'Le titre est requis', variant: 'destructive' });
      return;
    }

    startSaveTransition(async () => {
      const newStep = await createSessionStructureStep(sessionId, {
        step_order: steps.length,
        step_title: newStepTitle,
        step_duration_minutes: newStepDuration ? parseInt(newStepDuration) : null,
        step_description: newStepDescription || null,
      });

      if (newStep) {
        toast({ title: 'Succès', description: 'Étape créée' });
        setNewStepTitle('');
        setNewStepDuration('');
        setNewStepDescription('');
        setIsAddingStep(false);
        await loadData();
      } else {
        toast({ title: 'Erreur', description: 'Impossible de créer l\'étape', variant: 'destructive' });
      }
    });
  };

  const handleDeleteStep = (stepId: number) => {
    startSaveTransition(async () => {
      const success = await deleteSessionStructureStep(stepId);
      if (success) {
        toast({ title: 'Succès', description: 'Étape supprimée' });
        await loadData();
      } else {
        toast({ title: 'Erreur', description: 'Impossible de supprimer l\'étape', variant: 'destructive' });
      }
    });
  };

  const handleAddModuleToStep = (module: EnvironmentModule, stepId: number) => {
    startSaveTransition(async () => {
      const result = await addCapsuleToSession(sessionId, module.id, stepId);
      if (result) {
        toast({ title: 'Succès', description: `Module "${module.title}" ajouté à l'étape` });
        await loadData();
      } else {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter le module', variant: 'destructive' });
      }
    });
  };

  const handleRemoveModule = (sessionModuleId: number) => {
    startSaveTransition(async () => {
      const success = await removeCapsuleFromSession(sessionModuleId);
      if (success) {
        toast({ title: 'Succès', description: 'Module supprimé' });
        await loadData();
      } else {
        toast({ title: 'Erreur', description: 'Impossible de supprimer le module', variant: 'destructive' });
      }
    });
  };

  const handleOpenAddModuleDialog = (stepId: number) => {
    setSelectedStepForModule(stepId);
    setAddModuleMode('choice');
    setSelectedCards([]);
    setModuleName('');
    setModuleDescription('');
    setModuleLevel(0);
    setModuleThemes([]);
  };

  const handleCloseAddModuleDialog = () => {
    setSelectedStepForModule(null);
    setAddModuleMode('choice');
    setModuleName('');
    setModuleDescription('');
    setModuleLevel(0);
    setModuleThemes([]);
    setSelectedCards([]);
  };

  const handleProgrammeBuilderSave = (selectedCards: PedagogicalContent[], level: number, themes: string[]) => {
    setSelectedCards(selectedCards);
    setModuleLevel(level);
    setModuleThemes(themes);
    // Now show the naming form - stay in 'create' mode to show the naming form
  };

  const handleCreateModule = async () => {
    if (!moduleName.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez entrer un nom pour le module', variant: 'destructive' });
      return;
    }

    if (selectedCards.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner au moins une fiche pédagogique', variant: 'destructive' });
      return;
    }

    if (!selectedStepForModule) {
      toast({ title: 'Erreur', description: 'Étape non sélectionnée', variant: 'destructive' });
      return;
    }

    startSaveTransition(async () => {
      const result = await createModuleFromPedagogicalContent(
        moduleName,
        moduleDescription || null,
        moduleThemes,
        (moduleLevel + 1).toString(), // Convert level index to string
        selectedCards.map(c => c.id.toString()),
        selectedStepForModule,
        sessionId
      );

      if (result.success) {
        toast({ title: 'Succès', description: 'Module créé et assigné à l\'étape' });
        handleCloseAddModuleDialog();
        await loadData();
      } else {
        toast({ title: 'Erreur', description: result.error || 'Impossible de créer le module', variant: 'destructive' });
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* STEPS LIST */}
      {steps.length > 0 ? (
        steps.map((step, index) => (
          <Card key={step.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-blue-50">{index + 1}</Badge>
                    <h3 className="text-lg font-semibold">{step.step_title}</h3>
                    {step.step_duration_minutes && (
                      <Badge variant="secondary" className="ml-auto">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.step_duration_minutes}min
                      </Badge>
                    )}
                  </div>
                  {step.step_description && (
                    <p className="text-sm text-gray-600 mt-2">{step.step_description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStep(step.id)}
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* MODULES FOR THIS STEP */}
              {step.modules && step.modules.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Modules environnement ({step.modules.length})
                  </p>
                  <div className="space-y-2 pl-6">
                    {step.modules.map((sm) => (
                      <div key={sm.id} className="flex items-start justify-between gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{sm.module?.title}</p>
                          {sm.module?.description && (
                            <p className="text-xs text-gray-600 mt-1">{sm.module.description}</p>
                          )}
                          {sm.module?.themes && sm.module.themes.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {sm.module.themes.map((theme) => (
                                <Badge key={theme} variant="outline" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveModule(sm.id)}
                          disabled={isSaving}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Aucun module environnement assigné</p>
              )}

              {/* ADD MODULE BUTTON */}
              <Dialog open={selectedStepForModule === step.id} onOpenChange={(open) => {
                if (!open) handleCloseAddModuleDialog();
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenAddModuleDialog(step.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un module environnement
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn(addModuleMode === 'create' ? 'max-w-7xl' : 'max-w-md')}>
                  {/* MODE: CHOICE */}
                  {addModuleMode === 'choice' && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Ajouter un module à "{step.step_title}"</DialogTitle>
                        <DialogDescription>Choisissez comment ajouter le module</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full h-auto py-4 justify-start"
                          onClick={() => setAddModuleMode('create')}
                        >
                          <div className="text-left">
                            <p className="font-semibold">Créer à la main</p>
                            <p className="text-xs text-gray-600">Construisez le contenu pédagogique en sélectionnant des fiches</p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full h-auto py-4 justify-start"
                          onClick={() => setAddModuleMode('reuse')}
                        >
                          <div className="text-left">
                            <p className="font-semibold">Réutiliser un module</p>
                            <p className="text-xs text-gray-600">Sélectionnez un module déjà créé dans la bibliothèque</p>
                          </div>
                        </Button>
                      </div>
                    </>
                  )}

                  {/* MODE: CREATE - Full Programme Builder */}
                  {addModuleMode === 'create' && etagesData && (
                    <>
                      <DialogHeader>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddModuleMode('choice')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div>
                            <DialogTitle>Créer un module pour "{step.step_title}"</DialogTitle>
                            <DialogDescription>Utilisez l'interface Programme pour construire votre module</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>

                      {selectedCards.length === 0 ? (
                        // Programme Builder (sans Étape 4 - Défis/Jeux qui sont au niveau stage)
                        <ProgrammeBuilder
                          etagesData={etagesData}
                          stageType="voile"
                          onSave={handleProgrammeBuilderSave}
                          onCancel={() => setAddModuleMode('choice')}
                          isLoading={isSaving}
                          includeStageResources={false}
                        />
                      ) : (
                        // Naming form after selection
                        <div className="space-y-4">
                          {/* Résumé visuel des fiches sélectionnées */}
                          <Card className="bg-green-50 border-green-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-green-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Résumé du module
                              </CardTitle>
                              <CardDescription className="text-green-700">
                                {selectedCards.length} fiche{selectedCards.length > 1 ? 's' : ''} pédagogique{selectedCards.length > 1 ? 's' : ''} •
                                Niveau {etagesData?.niveau.options[moduleLevel]?.label || 'Non défini'} •
                                {moduleThemes.length} thème{moduleThemes.length > 1 ? 's' : ''}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedCards.map((card, index) => (
                                  <div key={card.id} className="flex items-start gap-2 p-2 bg-white rounded border border-green-200">
                                    <Badge variant="outline" className="shrink-0 mt-0.5">{index + 1}</Badge>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{card.question}</p>
                                      <p className="text-xs text-gray-600 mt-0.5">{card.dimension}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <div>
                            <label className="text-sm font-medium">Nom du module *</label>
                            <Input
                              placeholder="Ex: Identification des poissons"
                              value={moduleName}
                              onChange={(e) => setModuleName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                              placeholder="Description optionnelle du module"
                              value={moduleDescription}
                              onChange={(e) => setModuleDescription(e.target.value)}
                              className="mt-1 w-full p-2 border rounded-md text-sm"
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedCards([]);
                                setModuleLevel(0);
                                setModuleThemes([]);
                              }}
                              disabled={isSaving}
                            >
                              ← Retour à la sélection
                            </Button>
                            <Button
                              onClick={handleCreateModule}
                              disabled={isSaving || !moduleName.trim()}
                            >
                              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              Créer le module
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* MODE: REUSE */}
                  {addModuleMode === 'reuse' && (
                    <>
                      <DialogHeader>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddModuleMode('choice')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div>
                            <DialogTitle>Réutiliser un module</DialogTitle>
                            <DialogDescription>Sélectionnez un module de la bibliothèque</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {availableModules.length > 0 ? (
                          availableModules.map((module) => {
                            const isAlreadyAssigned = step.modules?.some((sm) => sm.module_id === module.id);
                            return (
                              <div key={module.id} className="p-3 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">{module.title}</h4>
                                    {module.description && (
                                      <p className="text-xs text-gray-600 mt-1">{module.description}</p>
                                    )}
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                      {module.level && <Badge variant="outline" className="text-xs">{module.level}</Badge>}
                                      {module.themes.map((theme) => (
                                        <Badge key={theme} variant="secondary" className="text-xs">
                                          {theme}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      handleAddModuleToStep(module, step.id);
                                      handleCloseAddModuleDialog();
                                    }}
                                    disabled={isAlreadyAssigned || isSaving}
                                    size="sm"
                                  >
                                    {isAlreadyAssigned ? 'Assigné' : 'Ajouter'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>Aucun module disponible</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-gray-500">
            <p>Aucune étape créée. Commencez par ajouter une étape sportive.</p>
          </CardContent>
        </Card>
      )}

      {/* ADD STEP FORM */}
      {isAddingStep ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 space-y-4">
            <Input
              placeholder="Titre de l'étape (ex: Échauffement)"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Durée (minutes)"
              value={newStepDuration}
              onChange={(e) => setNewStepDuration(e.target.value)}
            />
            <Textarea
              placeholder="Description (optionnel)"
              value={newStepDescription}
              onChange={(e) => setNewStepDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddStep} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'étape
              </Button>
              <Button variant="outline" onClick={() => setIsAddingStep(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAddingStep(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une étape sportive
        </Button>
      )}
    </div>
  );
}

