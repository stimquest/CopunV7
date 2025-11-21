'use client';

import React, { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Loader2, GraduationCap, Trophy, Gamepad2, Tag, GripVertical, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createCapsuleFromPedagogicalContent } from '@/app/actions-capsules';
import { getPedagogicalContent, getEtagesData } from '@/app/actions';
import type { PedagogicalContent, EtagesData } from '@/lib/types';
import { groupedThemes } from '@/data/etages';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Telescope, Shield, FileText } from 'lucide-react';

// Drag and drop
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  CSS,
} from '@dnd-kit/sortable';

const allGrandThemes = groupedThemes.flatMap(g => g.themes);

const PILLAR_STYLES: { [key: string]: { badge: string; filterBadge: string, border: string, bg: string, text: string, icon: React.ElementType, hover: string } } = {
    comprendre: { badge: 'bg-cop-comprendre text-background hover:bg-cop-comprendre', filterBadge: 'border-cop-comprendre text-cop-comprendre', border: 'border-cop-comprendre', bg: 'bg-cop-comprendre', text: 'text-cop-comprendre', icon: BookOpen, hover: 'hover:bg-cop-comprendre/10' },
    observer:   { badge: 'bg-cop-observer text-background hover:bg-cop-observer', filterBadge: 'border-cop-observer text-cop-observer', border: 'border-cop-observer', bg: 'bg-cop-observer', text: 'text-cop-observer', icon: Telescope, hover: 'hover:bg-cop-observer/10' },
    proteger:   { badge: 'bg-cop-proteger text-background hover:bg-cop-proteger', filterBadge: 'border-cop-proteger text-cop-proteger', border: 'border-cop-proteger', bg: 'bg-cop-proteger', text: 'text-cop-proteger', icon: Shield, hover: 'hover:bg-cop-proteger/10' },
};

const pillarMap: { [key: string]: string } = {
    'Comprendre le lieu géographique': 'comprendre',
    "Observer l'espace d'évolution": 'observer',
    'Protéger le site naturel': 'proteger',
};

interface CardContainer {
  available: PedagogicalContent[];
  selected: PedagogicalContent[];
}

export default function CapsuleBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, startSaveTransition] = useTransition();

  // Form state
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [capsuleDescription, setCapsuleDescription] = useState('');
  const [level, setLevel] = useState(0);
  const [themeIds, setThemeIds] = useState<string[]>([]);
  const [items, setItems] = useState<CardContainer>({ available: [], selected: [] });
  const [activeTab, setActiveTab] = useState('explore');
  const [pillarFilter, setPillarFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [allPedagogicalContent, setAllPedagogicalContent] = useState<PedagogicalContent[]>([]);
  const [etagesData, setEtagesData] = useState<EtagesData | null>(null);

  // Load data
  useEffect(() => {
    Promise.all([getPedagogicalContent(), getEtagesData()]).then(([cards, etages]) => {
      setAllPedagogicalContent(cards);
      setEtagesData(etages);
      setItems({ available: cards, selected: [] });
    });
  }, []);

  // Drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prev => {
      const oldIndex = prev.selected.findIndex(item => item.id.toString() === active.id);
      const newIndex = prev.selected.findIndex(item => item.id.toString() === over.id);
      return {
        ...prev,
        selected: arrayMove(prev.selected, oldIndex, newIndex)
      };
    });
  };

  const addCard = (card: PedagogicalContent) => {
    setItems(prev => ({
      available: prev.available.filter(c => c.id !== card.id),
      selected: [...prev.selected, card]
    }));
  };

  const removeCard = (card: PedagogicalContent) => {
    setItems(prev => ({
      selected: prev.selected.filter(c => c.id !== card.id),
      available: [...prev.available, card].sort((a,b) => a.question.localeCompare(b.question))
    }));
  };

  const baseFilteredCards = useMemo(() => {
    let cards = items.available
        .filter(card => card.niveau === level + 1);

    if (themeIds.length > 0) {
        cards = cards.filter(card => themeIds.some(themeId => card.tags_theme.includes(themeId)));
    }
    return cards;
  }, [items.available, level, themeIds]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    baseFilteredCards.forEach(card => {
        (card.tags_filtre || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [baseFilteredCards]);

  const filteredAvailableCards = useMemo(() => {
    if (tagFilter.length === 0) return baseFilteredCards;
    return baseFilteredCards.filter(card => 
        tagFilter.some(tag => (card.tags_filtre || []).includes(tag))
    );
  }, [baseFilteredCards, tagFilter]);

  const getPillarFromCardId = (cardId: number) => {
    const originalCard = allPedagogicalContent.find(q => q.id === cardId);
    return originalCard?.dimension
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
  };
  
  const handleTagFilterToggle = (tag: string) => {
    setTagFilter(prev => 
        prev.includes(tag) 
            ? prev.filter(id => id !== tag)
            : [...prev, tag]
    );
  };

  const handleSaveCapsule = () => {
    if (!capsuleTitle.trim()) {
      toast({ title: "Erreur", description: "Le titre du module est requis", variant: 'destructive' });
      return;
    }

    if (items.selected.length === 0) {
      toast({ title: "Erreur", description: "Sélectionnez au moins un contenu pédagogique", variant: 'destructive' });
      return;
    }

    startSaveTransition(async () => {
      const mainThemeTitles = themeIds
        .map(id => allGrandThemes.find(t => t.id === id)?.title)
        .filter((t): t is string => !!t);

      const result = await createCapsuleFromPedagogicalContent(
        capsuleTitle,
        capsuleDescription || null,
        mainThemeTitles,
        level,
        items.selected.map(c => c.id.toString())
      );

      if (result) {
        toast({ title: "Succès", description: "Module créé avec succès !" });
        router.push(`/capsules/${result.id}`);
      } else {
        toast({ title: "Erreur", description: "Impossible de créer le module", variant: 'destructive' });
      }
    });
  };

  if (!etagesData) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Étape 1 : À qui je parle ? (Niveau du groupe)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="sm:hidden">
            <Select value={level.toString()} onValueChange={(v) => v && setLevel(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                {etagesData.niveau.options.map((option, index) => (
                  <SelectItem key={option.id} value={index.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ToggleGroup type="single" value={level.toString()} onValueChange={(v) => v && setLevel(parseInt(v))} className="hidden sm:grid sm:grid-cols-3 gap-2">
            {etagesData.niveau.options.map((option, index) => (
              <ToggleGroupItem key={option.id} value={index.toString()} className="h-auto flex-col items-start p-3 data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary">
                <p className="font-semibold">{option.label}</p>
                <p className="text-xs text-left font-normal text-muted-foreground">{option.tip}</p>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Étape 2 : De quoi je parle ? (Choix des thèmes)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupedThemes.map(group => {
            const pillarKey = pillarMap[group.label];
            const pillarStyle = PILLAR_STYLES[pillarKey] || {};
            return (
              <div key={group.label}>
                <h4 className={cn("font-semibold uppercase text-xs tracking-wider mb-2", pillarStyle.text)}>
                  {group.label}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.themes.map(theme => {
                    const isActive = themeIds.includes(theme.id);
                    return (
                      <Badge
                        key={theme.id}
                        onClick={() => setThemeIds(prev => prev.includes(theme.id) ? prev.filter(id => id !== theme.id) : [...prev, theme.id])}
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "cursor-pointer py-1",
                          !isActive && pillarStyle.hover,
                          isActive && pillarStyle.badge
                        )}
                      >
                        <theme.icon className="w-3.5 h-3.5 mr-1.5"/>
                        {theme.title}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  );
}

