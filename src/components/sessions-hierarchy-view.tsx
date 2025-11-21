'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Clock, BookOpen, Trophy, Gamepad2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSessions, getSessionStructure } from '@/app/actions-sessions';
import type { Session, SessionStructure } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { createSession, deleteSession, updateSession } from '@/app/actions-sessions';
import { SessionEditor } from './session-editor';

const sessionSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  description: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

interface SessionsHierarchyViewProps {
  stageId: number;
}

interface SessionWithDetails extends Session {
  steps?: SessionStructure[];
}

export function SessionsHierarchyView({ stageId }: SessionsHierarchyViewProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    loadSessions();
  }, [stageId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const sessionsData = await getSessions(stageId);

      // Load details for each session
      const sessionsWithDetails = await Promise.all(
        sessionsData.map(async (session) => {
          const steps = await getSessionStructure(session.id);
          return { ...session, steps };
        })
      );

      setSessions(sessionsWithDetails);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les séances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = (data: SessionFormValues) => {
    startSaveTransition(async () => {
      const newSession = await createSession(stageId, {
        title: data.title,
        description: data.description || null,
        session_order: sessions.length,
      });

      if (newSession) {
        toast({
          title: 'Succès',
          description: 'Séance créée avec succès',
        });
        form.reset();
        setIsOpen(false);
        await loadSessions();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de créer la séance',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      const success = await deleteSession(sessionId, stageId);
      if (success) {
        toast({
          title: 'Succès',
          description: 'Séance supprimée',
        });
        await loadSessions();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la séance',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditSession = (session: SessionWithDetails) => {
    setEditingSessionId(session.id);
    setIsEditOpen(true);
  };

  const toggleSessionExpanded = (sessionId: number) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const toggleStepExpanded = (stepId: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Organisation du Stage</CardTitle>
          <CardDescription>Vue hiérarchique des séances et leurs ressources</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune séance créée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg overflow-hidden">
                {/* SESSION HEADER */}
                <div
                  onClick={() => toggleSessionExpanded(session.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer bg-muted/20"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {expandedSessions.has(session.id) ? (
                      <ChevronDown className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      {session.description && (
                        <p className="text-sm text-muted-foreground">{session.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSession(session);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* SESSION CONTENT */}
                {expandedSessions.has(session.id) && (
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Contenu de la séance à venir...
                    </p>
                  </CardContent>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EDIT SESSION DIALOG */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-[90vw] h-[90vh] max-w-5xl flex flex-col">
            <DialogHeader>
              <DialogTitle>Éditer la séance</DialogTitle>
              <DialogDescription>Configurez tous les éléments de votre séance</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {editingSessionId && sessions.find(s => s.id === editingSessionId) && (
                <SessionEditor
                  session={sessions.find(s => s.id === editingSessionId)!}
                  stageId={stageId}
                  onSave={() => {
                    setIsEditOpen(false);
                    loadSessions();
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* BUTTON AT THE BOTTOM */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Séance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle séance</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
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
                        <Textarea placeholder="Description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

