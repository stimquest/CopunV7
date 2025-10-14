

'use client';

import * as React from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import type { ContentCard, Option, CardPriority, CardType } from '@/lib/types';
import { cardTypes } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const cardSchema = z.object({
  question: z.string().min(3, { message: 'La question doit contenir au moins 3 caractères.' }),
  answer: z.string().min(10, { message: 'La réponse doit contenir au moins 10 caractères.' }),
  tagIds: z.array(z.string()).min(1, { message: 'Veuillez sélectionner au moins un tag.' }),
  priority: z.enum(['essential', 'complementary', 'personal']),
  type: z.enum(cardTypes, { required_error: 'Veuillez sélectionner un type de fiche.'}),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CreateCardFormProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onCardCreate: (data: Omit<CardFormValues, 'tagIds'>, tagIds: string[]) => void;
  options: Option[];
}

export function CreateCardForm({ children, isOpen, setIsOpen, onCardCreate, options }: CreateCardFormProps) {
  
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      question: '',
      answer: '',
      tagIds: [],
      priority: 'personal',
      type: 'Question',
    },
  });

  const onSubmit = (data: CardFormValues) => {
    const { tagIds, ...cardData } = data;
    onCardCreate(cardData, tagIds);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        form.reset();
    }
    setIsOpen(open);
  }
  
  const groupedOptions = React.useMemo(() => {
    const etageMap: Record<string, string> = {
        'comprendre': 'Comprendre',
        'observer': 'Observer',
        'proteger': 'Protéger'
    };
    return options.reduce((acc, option) => {
        const groupName = etageMap[option.etage_id] || 'Niveau';
        if(groupName) {
             if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(option);
        }
        return acc;
    }, {} as Record<string, Option[]>);
  }, [options]);


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle fiche</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer une nouvelle fiche.
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
                    <Textarea placeholder="Titre de la ressource ou question de la fiche..." {...field} rows={3} />
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
                    <Textarea placeholder="Contenu de la ressource ou pistes de réponse..." {...field} rows={5} />
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
                                        const option = options.find(o => o.id === tagId);
                                        return option ? <Badge key={tagId} variant="secondary">{option.label}</Badge> : null;
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personnel</SelectItem>
                        <SelectItem value="complementary">Complémentaire</SelectItem>
                        <SelectItem value="essential">Essentiel</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Annuler</Button>
                <Button type="submit">Créer la fiche</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
