'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionStructureWithCapsules } from './session-structure-with-capsules';
import { SessionDetailsEditor } from './session-details-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { updateSession } from '@/app/actions-capsules';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Session } from '@/lib/types';

const sessionSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  description: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

interface SessionEditorProps {
  session: Session;
  stageId: number;
  onSave?: () => void;
}

export function SessionEditor({ session, stageId, onSave }: SessionEditorProps) {
  const { toast } = useToast();
  const [isSaving, startSaveTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('infos');

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: session.title,
      description: session.description || '',
    },
  });

  const handleSave = (data: SessionFormValues) => {
    startSaveTransition(async () => {
      const updated = await updateSession(session.id, {
        title: data.title,
        description: data.description || null,
      });

      if (updated) {
        toast({
          title: 'Succès',
          description: 'Séance mise à jour',
        });
        onSave?.();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour la séance',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infos">Infos</TabsTrigger>
          <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
          <TabsTrigger value="etapes">Étapes & Capsules</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        {/* TAB 1: INFOS */}
        <TabsContent value="infos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la séance</CardTitle>
              <CardDescription>Titre et description de la séance</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de la séance</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Jour 1 - Apprentissage" {...field} />
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
                          <Textarea placeholder="Description de la séance..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: OBJECTIFS */}
        <TabsContent value="objectifs">
          <SessionDetailsEditor session={session} onSave={onSave} />
        </TabsContent>

        {/* TAB 3: ÉTAPES & MODULES */}
        <TabsContent value="etapes">
          <Card>
            <CardHeader>
              <CardTitle>Étapes & Modules Environnement</CardTitle>
              <CardDescription>
                Construisez votre séance en ajoutant des étapes sportives et en assignant des modules environnement à chaque étape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionStructureWithCapsules sessionId={session.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: DÉTAILS */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la séance</CardTitle>
              <CardDescription>Vue d'ensemble de tous les éléments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Titre</h4>
                <p className="text-sm text-muted-foreground">{session.title}</p>
              </div>
              {session.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{session.description}</p>
                </div>
              )}
              {session.objectives && session.objectives.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Objectifs ({session.objectives.length})</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {session.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
              {session.success_criteria && session.success_criteria.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Critères de réussite ({session.success_criteria.length})</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {session.success_criteria.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

