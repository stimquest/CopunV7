

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Check, ChevronsUpDown } from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ContentCard, Option, CardPriority } from '@/lib/types';
import { cardTypes } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const cardSchema = z.object({
  question: z.string().min(3, { message: 'La question doit contenir au moins 3 caractères.' }),
  answer: z.string().min(10, { message: 'La réponse doit contenir au moins 10 caractères.' }),
  tagIds: z.array(z.string()).min(1, { message: 'Veuillez sélectionner au moins un tag.' }),
  type: z.enum(cardTypes, { required_error: 'Veuillez sélectionner un type de fiche.'}),
  priority: z.enum(['essential', 'complementary', 'personal']),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface EditCardFormProps {
  card: ContentCard;
  allOptions: Option[];
  onCardUpdate: (data: ContentCard, tagIds: string[]) => void;
}

export function EditCardForm({ card, allOptions, onCardUpdate }: EditCardFormProps) {
  const [open, setOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      question: card.question,
      answer: card.answer,
      tagIds: card.tags || [],
      type: card.type || 'Question',
      priority: card.priority || 'personal',
    },
  });

  React.useEffect(() => {
    if(open) {
      form.reset({
        question: card.question,
        answer: card.answer,
        tagIds: card.tags || [],
        type: card.type || 'Question',
        priority: card.priority || 'personal',
      });
    }
  }, [open, card, form]);

  const onSubmit = (data: CardFormValues) => {
    const { tagIds, ...cardData } = data;
    // We keep the old fields for now, even if they are not in the form
    onCardUpdate({ ...card, ...cardData, priority: data.priority as CardPriority, tags: tagIds }, tagIds);
    setOpen(false);
  };

  const groupedOptions = React.useMemo(() => {
    const etageMap: Record<string, string> = {
        'comprendre': 'Comprendre',
        'observer': 'Observer',
        'proteger': 'Protéger',
        'niveau': 'Niveau'
    };
    return allOptions.reduce((acc, option) => {
        const groupName = etageMap[option.etage_id] || 'Autre';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(option);
        return acc;
    }, {} as Record<string, Option[]>);
  }, [allOptions]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Modifier la fiche</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la fiche.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de fiche</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Question">Fiche Question</SelectItem>
                        <SelectItem value="Ressource">Fiche Ressource</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre / Question</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu / Pistes de réflexion</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tags thématiques</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-auto min-h-10"
                        >
                          <div className="flex gap-1 flex-wrap">
                              {field.value.length > 0 ? (
                                  field.value.map(tagId => {
                                      const tagLabel = allOptions.find(o => o.id === tagId)?.label || tagId;
                                      return <Badge key={tagId} variant="secondary">{tagLabel}</Badge>
                                  })
                              ) : (
                                  <span className="text-muted-foreground">Sélectionnez un ou plusieurs tags</span>
                              )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher un tag..." />
                        <CommandList>
                          <CommandEmpty>Aucun tag trouvé.</CommandEmpty>
                          {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                                <CommandGroup key={groupName} heading={groupName}>
                                    {groupOptions.map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.label}
                                            onSelect={() => {
                                                const currentTags = field.value || [];
                                                const newTags = currentTags.includes(option.id)
                                                    ? currentTags.filter(id => id !== option.id)
                                                    : [...currentTags, option.id];
                                                form.setValue("tagIds", newTags);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", field.value?.includes(option.id) ? "opacity-100" : "opacity-0")} />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personnel</SelectItem>
                        <SelectItem value="complementary" disabled>Complémentaire</SelectItem>
                        <SelectItem value="essential" disabled>Essentiel</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
