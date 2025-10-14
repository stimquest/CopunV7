

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
import type { GameCardType, DbGameCardData, EtagesData, Option, PedagogicalContent } from '@/lib/types';
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

const getValidationSchema = (type: GameCardType) => {
    switch (type) {
        case 'triage': return triageSchema;
        case 'mots': return motsSchema;
        case 'dilemme': return dilemmeSchema;
        case 'quizz': return quizzSchema;
        default: throw new Error(`Unknown card type: ${type}`);
    }
}


interface CreateGameCardFormProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onCardCreate: (type: GameCardType, data: DbGameCardData) => void;
  isCreating: boolean;
}

export function CreateGameCardForm({ children, isOpen, setIsOpen, onCardCreate, isCreating }: CreateGameCardFormProps) {
  const [cardType, setCardType] = useState<GameCardType>('triage');
  const [etagesData, setEtagesData] = useState<EtagesData | null>(null);
  const [allPedagogicalContent, setAllPedagogicalContent] = useState<PedagogicalContent[]>([]);

  useEffect(() => {
    if (isOpen) {
        getEtagesData().then(setEtagesData);
        getPedagogicalContent().then(setAllPedagogicalContent);
    }
  }, [isOpen]);
  
  const defaultValues = {
    theme: undefined,
    related_objective_id: undefined,
    statement: '',
    isTrue: true,
    definition: '',
    answer: '',
    optionA: '',
    optionB: '',
    explanation: '',
    question: '',
    answers: ['', '', '', ''],
    correctAnswerIndex: 0,
  }

  const form = useForm({
    resolver: zodResolver(getValidationSchema(cardType)),
    defaultValues: defaultValues,
  });
  
  useEffect(() => {
    form.reset(defaultValues);
    // @ts-ignore - We are dynamically changing the resolver.
    form.resolver = zodResolver(getValidationSchema(cardType));
  }, [cardType, form]);


  const onSubmit = (data: any) => {
    onCardCreate(cardType, data);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        form.reset(defaultValues);
        setCardType('triage');
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
          <DialogTitle>Créer une carte de jeu</DialogTitle>
          <DialogDescription>
            Choisissez un type de carte et remplissez les informations.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <Select onValueChange={(value) => setCardType(value as GameCardType)} defaultValue={cardType}>
                <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type de carte" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="triage">Vrai ou Faux</SelectItem>
                    <SelectItem value="mots">Mot en Rafale</SelectItem>
                    <SelectItem value="dilemme">Dilemme</SelectItem>
                    <SelectItem value="quizz">Quizz (QCM)</SelectItem>
                </SelectContent>
             </Select>
             
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

            {cardType === 'triage' && (
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

            {cardType === 'mots' && (
              <>
                <FormField control={form.control} name="definition" render={({ field }) => (
                  <FormItem><FormLabel>Définition</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="answer" render={({ field }) => (
                  <FormItem><FormLabel>Mot à trouver (Réponse)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </>
            )}

            {cardType === 'dilemme' && (
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

            {cardType === 'quizz' && (
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
                      <FormDescription>Saisissez les 4 réponses possibles et cochez la bonne.</FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
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
                                          <Input {...answerField} placeholder={`Réponse ${String.fromCharCode(65 + index)}`} />
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
                <Button variant="outline" type="button" onClick={() => handleOpenChange(false)} disabled={isCreating}>Annuler</Button>
                <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Créer la carte
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
