'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { updateSession } from '@/app/actions-sessions';
import { useToast } from '@/hooks/use-toast';
import type { Session } from '@/lib/types';

interface SessionDetailsEditorProps {
  session: Session;
  onSave?: () => void;
}

export function SessionDetailsEditor({ session, onSave }: SessionDetailsEditorProps) {
  const { toast } = useToast();
  const [isSaving, startSaveTransition] = useTransition();

  // Objectives
  const [objectives, setObjectives] = useState<string[]>(session.objectives || []);
  const [objectiveInput, setObjectiveInput] = useState('');

  // Success Criteria
  const [successCriteria, setSuccessCriteria] = useState<string[]>(session.success_criteria || []);
  const [criteriaInput, setCriteriaInput] = useState('');

  // Required Materials
  const [materials, setMaterials] = useState<string[]>(session.required_materials || []);
  const [materialInput, setMaterialInput] = useState('');

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput('');
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const addCriteria = () => {
    if (criteriaInput.trim()) {
      setSuccessCriteria([...successCriteria, criteriaInput.trim()]);
      setCriteriaInput('');
    }
  };

  const removeCriteria = (index: number) => {
    setSuccessCriteria(successCriteria.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    if (materialInput.trim()) {
      setMaterials([...materials, materialInput.trim()]);
      setMaterialInput('');
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    startSaveTransition(async () => {
      const updated = await updateSession(session.id, {
        objectives: objectives.length > 0 ? objectives : null,
        success_criteria: successCriteria.length > 0 ? successCriteria : null,
        required_materials: materials.length > 0 ? materials : null,
      });

      if (updated) {
        toast({
          title: 'Succès',
          description: 'Détails de la séance mis à jour',
        });
        onSave?.();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour les détails',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* OBJECTIVES */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs du jour</CardTitle>
          <CardDescription>Qu'est-ce que les jeunes doivent apprendre ?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Découvrir les éléments du catamaran"
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <Button onClick={addObjective} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {objectives.map((obj, idx) => (
              <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                {obj}
                <button
                  onClick={() => removeObjective(idx)}
                  className="ml-1 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SUCCESS CRITERIA */}
      <Card>
        <CardHeader>
          <CardTitle>Critères de réussite</CardTitle>
          <CardDescription>À la fin de la séance, les jeunes doivent pouvoir...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Embarquer en sécurité"
              value={criteriaInput}
              onChange={(e) => setCriteriaInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCriteria()}
            />
            <Button onClick={addCriteria} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {successCriteria.map((criteria, idx) => (
              <Badge key={idx} variant="outline" className="flex items-center gap-2">
                ✓ {criteria}
                <button
                  onClick={() => removeCriteria(idx)}
                  className="ml-1 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* REQUIRED MATERIALS */}
      <Card>
        <CardHeader>
          <CardTitle>Matériel à vérifier</CardTitle>
          <CardDescription>Checklist avant la séance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: 5 gilets de sauvetage"
              value={materialInput}
              onChange={(e) => setMaterialInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
            />
            <Button onClick={addMaterial} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {materials.map((material, idx) => (
              <Badge key={idx} variant="outline" className="flex items-center gap-2">
                □ {material}
                <button
                  onClick={() => removeMaterial(idx)}
                  className="ml-1 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SAVE BUTTON */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer les détails
      </Button>
    </div>
  );
}

