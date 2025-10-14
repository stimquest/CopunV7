
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save, ChevronsUpDown, Check } from 'lucide-react';

import type { PedagogicalContent, GrandTheme } from '@/lib/types';
import { groupedThemes } from '@/data/etages';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const cardEditorSchema = z.object({
  question: z.string().min(1, "La question est requise."),
  objectif: z.string().min(1, "L'objectif est requis."),
  tip: z.string().optional(),
  niveau: z.coerce.number().min(1).max(3),
  dimension: z.string().min(1, "Le pilier est requis."),
  tags_theme: z.array(z.string()).min(1, "Au moins un thème est requis."),
  tags_filtre: z.array(z.string()),
  icon_tag: z.string().optional().nullable(),
});

type CardEditorFormValues = z.infer<typeof cardEditorSchema>;

interface CardEditorProps {
  initialData?: PedagogicalContent;
  onSave: (data: Omit<PedagogicalContent, 'id'>) => void;
  isSaving: boolean;
}

const allFilterTags = ['marée', 'outils', 'zone rocheuse', 'chenal', 'estran', 'courant', 'coefficient', 'vocabulaire', 'écosystème', 'repères visuels', 'sécurité', 'adaptation', 'vent', 'météo', 'thermique', 'vague', 'houle', 'nuage', 'dune', 'érosion', 'laisse de mer', 'pollution', 'zone sensible', 'faune', 'flore', 'migration', 'reproduction', 'observation', 'action citoyenne', 'économie', 'innovation', 'éco-geste'];
const allThemes = groupedThemes.flatMap(g => g.themes);
const iconTags = [
    { value: 'phenomenes_physiques', label: 'Phénomènes physiques marins' },
    { value: 'navigation_securite', label: 'Navigation & Sécurité' },
    { value: 'vie_marine_littoral', label: 'Vie marine & Littoral' },
    { value: 'responsabilite_environnementale', label: 'Responsabilité environnementale' },
    { value: 'apprentissage_ressources', label: 'Apprentissage & Ressources' },
];

const tagToIconTagMapping: { [key: string]: string[] } = {
    'phenomenes_physiques': ['caracteristiques_littoral', 'interactions_climatiques', 'marée', 'vent', 'courant', 'vague', 'houle', 'météo', 'thermique', 'coefficient', 'nuage', 'estran', 'érosion'],
    'navigation_securite': ['lecture_paysage', 'reperes_spatio_temporels', 'securite', 'repères visuels', 'outils', 'chenal', 'observation', 'adaptation'],
    'vie_marine_littoral': ['biodiversite_saisonnalite', 'cohabitation_vivant', 'faune', 'flore', 'écosystème', 'migration', 'reproduction', 'zone rocheuse', 'laisse de mer', 'zone sensible', 'dune'],
    'responsabilite_environnementale': ['impact_presence_humaine', 'sciences_participatives', 'pollution', 'action citoyenne', 'éco-geste'],
    'apprentissage_ressources': ['activites_humaines', 'vocabulaire', 'innovation', 'économie'],
};

// Component to handle the automatic icon tag logic
const AutoIconTagger = ({ control, setValue }: { control: any, setValue: Function }) => {
    const tagsTheme = useWatch({ control, name: 'tags_theme' });
    const tagsFiltre = useWatch({ control, name: 'tags_filtre' });

    useEffect(() => {
        const allSelectedTags = [...(tagsTheme || []), ...(tagsFiltre || [])];
        let newIconTag = null;

        // Find the first icon tag that matches the selected themes/tags
        for (const [iconTag, associatedTags] of Object.entries(tagToIconTagMapping)) {
            // Find a match with theme IDs
            const themeMatch = allSelectedTags.some(selectedTagId => 
                allThemes.some(theme => theme.id === selectedTagId && associatedTags.includes(theme.id))
            );
            if (themeMatch) {
                newIconTag = iconTag;
                break;
            }
            // Find a match with filter tags (direct match)
            if (allSelectedTags.some(selectedTag => associatedTags.includes(selectedTag))) {
                newIconTag = iconTag;
                break;
            }
        }
        
        setValue('icon_tag', newIconTag, { shouldDirty: true });

    }, [tagsTheme, tagsFiltre, setValue]);

    return null;
};


export function CardEditor({ initialData, onSave, isSaving }: CardEditorProps) {
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const form = useForm<CardEditorFormValues>({
    resolver: zodResolver(cardEditorSchema),
    defaultValues: {
      question: initialData?.question || '',
      objectif: initialData?.objectif || '',
      tip: initialData?.tip || '',
      niveau: initialData?.niveau || 1,
      dimension: initialData?.dimension || 'COMPRENDRE',
      tags_theme: initialData?.tags_theme || [],
      tags_filtre: initialData?.tags_filtre || [],
      icon_tag: initialData?.icon_tag || null,
    },
  });

  const onSubmit = (data: CardEditorFormValues) => {
    const dataToSave = {
        ...data,
        icon_tag: data.icon_tag === 'none' ? null : data.icon_tag,
    };
    onSave(dataToSave);
  };
  
  const isEditMode = !!initialData;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AutoIconTagger control={form.control} setValue={form.setValue} />
        <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-4 -my-4">
          <div>
            <Button variant="ghost" asChild>
                <Link href="/admin/contenu">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste
                </Link>
            </Button>
            <h1 className="text-2xl font-bold font-headline mt-1 ml-4">
              {isEditMode ? "Modifier la fiche" : "Créer une fiche"}
            </h1>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? "Sauvegarder" : "Créer la fiche"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <fieldset className="lg:col-span-2 space-y-6 group">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Question</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Saisissez la question principale..."/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="objectif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Objectif Pédagogique</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Décrivez l'objectif à atteindre..."/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Conseil du moniteur</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Ajoutez un conseil pratique ou une astuce..."/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </fieldset>
          <fieldset className="lg:col-span-1 space-y-6 sticky top-24 group">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dimension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="COMPRENDRE">Comprendre</SelectItem>
                          <SelectItem value="OBSERVER">Observer</SelectItem>
                          <SelectItem value="PROTÉGER">Protéger</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="niveau"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v,10))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Niveau 1</SelectItem>
                          <SelectItem value="2">Niveau 2-3</SelectItem>
                          <SelectItem value="3">Niveau 4-5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="icon_tag"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tag Icône</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? 'none'}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une icône..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">Aucune</SelectItem>
                                {iconTags.map(tag => (
                                    <SelectItem key={tag.value} value={tag.value}>{tag.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="tags_theme"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Thèmes</FormLabel>
                             <Popover open={themePopoverOpen} onOpenChange={setThemePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                        <div className="flex gap-1 flex-wrap">
                                            {field.value.length > 0 ? (
                                                field.value.map(themeId => {
                                                    const theme = allThemes.find(t => t.id === themeId);
                                                    return theme ? <Badge key={themeId} variant="secondary">{theme.title}</Badge> : null;
                                                })
                                            ) : "Sélectionner des thèmes..."}
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un thème..." />
                                        <CommandEmpty>Aucun thème trouvé.</CommandEmpty>
                                        <CommandList>
                                        {groupedThemes.map((group) => (
                                            <CommandGroup key={group.label} heading={group.label}>
                                                {group.themes.map((theme: GrandTheme) => (
                                                    <CommandItem
                                                        key={theme.id}
                                                        value={theme.title}
                                                        onSelect={() => {
                                                            const newValue = field.value.includes(theme.id)
                                                                ? field.value.filter(id => id !== theme.id)
                                                                : [...field.value, theme.id];
                                                            field.onChange(newValue);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", field.value.includes(theme.id) ? "opacity-100" : "opacity-0")} />
                                                        {theme.title}
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
                    name="tags_filtre"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Filtres contextuels</FormLabel>
                             <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                        <div className="flex gap-1 flex-wrap">
                                            {field.value.length > 0 ? (
                                                field.value.map(tag => (
                                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                                ))
                                            ) : "Sélectionner des filtres..."}
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un filtre..." />
                                        <CommandEmpty>Aucun filtre trouvé.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {allFilterTags.map((tag) => (
                                                    <CommandItem
                                                        key={tag}
                                                        value={tag}
                                                        onSelect={() => {
                                                            const newValue = field.value.includes(tag)
                                                                ? field.value.filter(id => id !== tag)
                                                                : [...field.value, tag];
                                                            field.onChange(newValue);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", field.value.includes(tag) ? "opacity-100" : "opacity-0")} />
                                                        {tag}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
              </CardContent>
            </Card>
          </fieldset>
        </div>
      </form>
    </FormProvider>
  );
}

    