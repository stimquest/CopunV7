

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GameCard, DbGameCardData, EtagesData, Option, PedagogicalContent } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { getEtagesData, getPedagogicalContent } from '@/app/actions';

const baseSchema = z.object({
  theme: z.string({ required_error: 'Veuillez sélectionner un thème.'}),
  related_objective_id: z.string().optional(),
});

const triageSchema = baseSchema.extend({
  statement: z.string().min(10, "L'affirmation doit faire au moins 10 caractères."),
  isTrue: z.boolean(),
});

const motsSchema = baseSchema.extend({
  definition: z.string().min(10, "La définition doit faire au moins 10 caractères."),
  answer: z.string().min(1, "La réponse est requise."),
});

const dilemmeSchema = baseSchema.extend({
  optionA: z.string().min(5, "L'option A doit faire au moins 5 caractères."),
  optionB: z.string().min(5, "L'option B doit faire au moins 5 caractères."),
  explanation: z.string().min(10, "L'explication doit faire au moins 10 caractères."),
});

const quizzSchema = baseSchema.extend({
  question: z.string().min(10, "La question doit faire au moins 10 caractères."),
  answers: z.array(z.string().min(1, "La réponse ne peut être vide.")).length(4, "Il doit y avoir 4 réponses."),
  correctAnswerIndex: z.coerce.number().min(0).max(3),
});

interface EditGameCardFormProps {
  children: React.ReactNode;
  card: GameCard;
  onCardUpdate: (id: number, data: DbGameCardData) => Promise<boolean>;
  isUpdating: boolean;
}

export function EditGameCardForm({ children, card, onCardUpdate, isUpdating }: EditGameCardFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [etagesData, setEtagesData] = useState<EtagesData | null>(null);
  const [allPedagogicalContent, setAllPedagogicalContent] = useState<PedagogicalContent[]>([]);

  useEffect(() => {
    if (isOpen) {
        getEtagesData().then(setEtagesData);
        getPedagogicalContent().then(setAllPedagogicalContent);
    }
  }, [isOpen]);

  const getSchema = (type: GameCard['type']) => {
    switch (type) {
      case 'triage': return triageSchema;
      case 'mots': return motsSchema;
      case 'dilemme': return dilemmeSchema;
      case 'quizz': return quizzSchema;
    }
  };
  
  const getDefaultValues = (card: GameCard) => {
      switch (card.type) {
        case 'triage': return { theme: card.theme, statement: card.statement, isTrue: card.isTrue, related_objective_id: card.related_objective_id };
        case 'mots': return { theme: card.theme, definition: card.definition, answer: card.answer, related_objective_id: card.related_objective_id };
        case 'dilemme': return { theme: card.theme, optionA: card.optionA, optionB: card.optionB, explanation: card.explanation, related_objective_id: card.related_objective_id };
        case 'quizz': return { theme: card.theme, question: card.question, answers: card.answers, correctAnswerIndex: card.correctAnswerIndex, related_objective_id: card.related_objective_id };
        default: return { theme: '' };
      }
  }

  const form = useForm({
    resolver: zodResolver(getSchema(card.type)),
    defaultValues: getDefaultValues(card),
  });

  const onSubmit = async (data: any) => {
    const success = await onCardUpdate(card.id, data);
    if(success) {
        setIsOpen(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
        form.reset(getDefaultValues(card));
    }
    setIsOpen(open);
  }
  
  const groupedOptions = React.useMemo(() => {
    if (!etagesData) return {};
    const options = [
        ...etagesData.comprendre.options,
        ...etagesData.observer.options,
        ...etagesData.proteger.options
    ];
    return options.reduce((acc, option) => {
        const groupName = etagesData[option.etage_id as keyof EtagesData]?.title || 'Autre';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(option);
        return acc;
    }, {} as Record<string, Option[]>);
  }, [etagesData]);

  const groupedObjectives = allPedagogicalContent.reduce((acc, obj) => {
      const pillar = obj.dimension.charAt(0).toUpperCase() + obj.dimension.slice(1).toLowerCase();
      if (!acc[pillar]) acc[pillar] = [];
      acc[pillar].push(obj);
      return acc;
  }, {} as Record<string, PedagogicalContent[]>);


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la carte de jeu</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la carte.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thème</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un thème de rattachement" />
                        </SelectTrigger>
                      </FormControl>
                       <SelectContent>
                        {Object.entries(groupedOptions).map(([groupName, groupOptions], index) => (
                            <React.Fragment key={groupName}>
                                <SelectGroup>
                                    <SelectLabel>{groupName}</SelectLabel>
                                    {groupOptions.map((option) => (
                                        <SelectItem key={option.id} value={option.label}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                                {index < Object.entries(groupedOptions).length - 1 && <SelectSeparator />}
                            </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                  control={form.control}
                  name="related_objective_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectif Pédagogique Associé (optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Lier à un objectif..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {Object.entries(groupedObjectives).map(([pillar, objectives]) => (
                              <SelectGroup key={pillar}>
                                  <SelectLabel>{pillar}</SelectLabel>
                                  {objectives.map(obj => (
                                      <SelectItem key={obj.id} value={obj.id.toString()}>
                                          {obj.question}
                                      </SelectItem>
                                  ))}
                              </SelectGroup>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            {card.type === 'triage' && (
              <>
                <FormField control={form.control} name="statement" render={({ field }) => (
                  <FormItem><FormLabel>Affirmation</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="isTrue" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5"><FormLabel>La réponse est "VRAI"</FormLabel></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}/>
              </>
            )}

            {card.type === 'mots' && (
              <>
                <FormField control={form.control} name="definition" render={({ field }) => (
                  <FormItem><FormLabel>Définition</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="answer" render={({ field }) => (
                  <FormItem><FormLabel>Mot à trouver (Réponse)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </>
            )}

            {card.type === 'dilemme' && (
              <>
                <FormField control={form.control} name="optionA" render={({ field }) => (
                  <FormItem><FormLabel>Option A</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="optionB" render={({ field }) => (
                  <FormItem><FormLabel>Option B</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="explanation" render={({ field }) => (
                  <FormItem><FormLabel>Explication du dilemme</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </>
            )}

            {card.type === 'quizz' && (
              <>
                <FormField control={form.control} name="question" render={({ field }) => (
                    <FormItem><FormLabel>Question</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField
                  control={form.control}
                  name="correctAnswerIndex"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Réponses</FormLabel>
                      <FormDescription>Modifiez les réponses et sélectionnez la bonne.</FormDescription>
                       <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                          className="flex flex-col space-y-1"
                        >
                          {[0, 1, 2, 3].map(index => (
                              <FormField
                                key={index}
                                control={form.control}
                                name={`answers.${index}`}
                                render={({ field: answerField }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <div className="flex items-center gap-2 w-full">
                                          <RadioGroupItem value={index.toString()} />
                                          <Input {...answerField} placeholder={`Réponse ${index + 1}`} />
                                        </div>
                                      </FormControl>
                                  </FormItem>
                                )}
                              />
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={isUpdating}>Annuler</Button>
                <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Sauvegarder
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
