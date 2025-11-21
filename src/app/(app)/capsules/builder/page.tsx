'use client';

import React, { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Loader2, GraduationCap, Trophy, Gamepad2, Tag, BookOpen, Telescope, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createCapsuleFromPedagogicalContent } from '@/app/actions-capsules';
import { getPedagogicalContent, getEtagesData, getGamesForStage } from '@/app/actions';
import type { PedagogicalContent, EtagesData, Game, Defi } from '@/lib/types';
import { allDefis } from '@/data/defis';
import { groupedThemes } from '@/data/etages';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GripVertical, Undo2 } from 'lucide-react';

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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Create allGrandThemes from groupedThemes
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

  // Défis and Jeux state
  const [selectedDefis, setSelectedDefis] = useState<string[]>([]);
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);

  // Load data
  useEffect(() => {
    Promise.all([getPedagogicalContent(), getEtagesData(), getGamesForStage(null)]).then(([cards, etages, gamesMapOrArray]) => {
      setAllPedagogicalContent(cards);
      setEtagesData(etages);
      setItems({ available: cards, selected: [] });
      // Get all games - handle both Map and Array returns
      let allGamesArray: Game[] = [];
      if (gamesMapOrArray instanceof Map) {
        allGamesArray = gamesMapOrArray.get(null) || [];
      } else if (Array.isArray(gamesMapOrArray)) {
        allGamesArray = gamesMapOrArray;
      }
      setAllGames(allGamesArray);
    }).catch(err => {
      console.error('Error loading data:', err);
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
      available: [...prev.available, card].sort((a, b) => a.question.localeCompare(b.question))
    }));
  };

  // Filter cards
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

  // Save capsule
  const handleSaveCapsule = () => {
    if (!capsuleTitle.trim()) {
      toast({ title: "Erreur", description: "Le titre de la capsule est requis", variant: 'destructive' });
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
        items.selected.map(c => c.id.toString()),
        selectedDefis,
        selectedGames
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

      <Card>
        <CardHeader>
          <CardTitle>Étape 3 : Pourquoi j'en parle ? (Construire le module)</CardTitle>
          <CardDescription>Sélectionnez les fiches-objectifs pour construire votre module.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:hidden">
              <TabsTrigger value="explore">Explorer les fiches ({filteredAvailableCards.length})</TabsTrigger>
              <TabsTrigger value="selected">Mon Module ({items.selected.length})</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Explorer Column */}
              <div className={cn("w-full", activeTab !== 'explore' && 'hidden md:block')}>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 -mx-2 px-2 overflow-x-auto">
                    <ToggleGroup type="single" value={pillarFilter ?? ""} onValueChange={(value) => setPillarFilter(value || null)} className="flex-shrink-0">
                      {Object.entries(PILLAR_STYLES).map(([key, { icon: PillarIcon, badge }]) => {
                        const isActive = pillarFilter === key;

                        return (
                          <ToggleGroupItem
                            key={key}
                            value={key}
                            className={cn(
                              "border h-9 whitespace-nowrap",
                              isActive ? badge : "bg-background border-border text-foreground"
                            )}
                          >
                            <PillarIcon className="w-4 h-4 mr-2" />
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9" disabled={availableTags.length === 0}>
                          <Tag className="mr-2 h-4 w-4" />
                          Tags {tagFilter.length > 0 && `(${tagFilter.length})`}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Filtrer par tag</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableTags.map(tag => (
                          <DropdownMenuCheckboxItem
                            key={tag}
                            checked={tagFilter.includes(tag)}
                            onCheckedChange={() => handleTagFilterToggle(tag)}
                          >
                            {tag}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {(pillarFilter || tagFilter.length > 0) && <Button variant="ghost" size="sm" className="h-9" onClick={() => {setPillarFilter(null); setTagFilter([])}}>Effacer</Button>}
                  </div>
                  <div className="min-h-[400px] max-h-[60vh] overflow-y-auto bg-muted/50 p-2 rounded-lg space-y-2">
                    <Accordion type="multiple" className="w-full space-y-2">
                      {filteredAvailableCards.length > 0 ? (
                        filteredAvailableCards.map(card => (
                          <div key={card.id} className={cn("transition-opacity", pillarFilter && pillarFilter !== getPillarFromCardId(card.id) && "opacity-40 hover:opacity-100")}>
                            <ActionableCard card={card} onAdd={() => addCard(card)} />
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-sm text-muted-foreground">Aucune fiche à afficher. Essayez de changer les filtres ou le niveau du stage.</p>
                      )}
                    </Accordion>
                  </div>
                </div>
              </div>

              {/* Selected Column */}
              <div className={cn("w-full", activeTab !== 'selected' && 'hidden md:block')}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="min-h-[400px] max-h-[60vh] overflow-y-auto bg-muted/50 p-2 rounded-lg space-y-2">
                    <SortableContext items={items.selected.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                      <Accordion type="multiple" className="w-full space-y-2">
                        {items.selected.length > 0 ? (
                          items.selected.map(card => (
                            <DraggableCard key={card.id} card={card} onRemove={() => removeCard(card)} />
                          ))
                        ) : (
                          <p className="p-4 text-center text-sm text-muted-foreground">Cliquez sur les fiches à gauche pour les ajouter ici.</p>
                        )}
                      </Accordion>
                    </SortableContext>
                  </div>
                </DndContext>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Étape 4 : Ressources pédagogiques</CardTitle>
          <CardDescription>Gérez les défis et jeux pour enrichir votre capsule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="defis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="defis"><Trophy className="w-4 h-4 mr-2"/>Défis ({selectedDefis.length})</TabsTrigger>
              <TabsTrigger value="jeux"><Gamepad2 className="w-4 h-4 mr-2"/>Jeux ({selectedGames.length})</TabsTrigger>
            </TabsList>

            {/* DÉFIS TAB */}
            <TabsContent value="defis" className="mt-6 space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allDefis.map(defi => (
                  <div key={defi.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedDefis.includes(defi.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDefis([...selectedDefis, defi.id]);
                        } else {
                          setSelectedDefis(selectedDefis.filter(id => id !== defi.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{defi.description}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{defi.instruction}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{defi.type_preuve}</Badge>
                        {defi.tags_theme.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* JEUX TAB */}
            <TabsContent value="jeux" className="mt-6 space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allGames.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aucun jeu disponible</p>
                  </div>
                ) : (
                  allGames.map(game => (
                    <div key={game.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={selectedGames.includes(game.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGames([...selectedGames, game.id]);
                          } else {
                            setSelectedGames(selectedGames.filter(id => id !== game.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{game.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{game.theme}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Étape 5 : Informations du module</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Titre du module *</label>
            <Input
              placeholder="Ex: Marées et courants"
              value={capsuleTitle}
              onChange={(e) => setCapsuleTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Description optionnelle du module..."
              value={capsuleDescription}
              onChange={(e) => setCapsuleDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Étape 6 : Action de l'encadrant (Finalisation)</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="w-full" disabled={items.selected.length === 0}>
            <Link href="/capsules">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la bibliothèque
            </Link>
          </Button>
          <Button className="w-full" onClick={handleSaveCapsule} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
            Créer le module
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const ActionableCard = ({ card, onAdd }: { card: PedagogicalContent, onAdd: () => void }) => {
  // Normaliser la dimension pour enlever les accents
  const pillarKey = card.dimension
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
  const styleInfo = PILLAR_STYLES[pillarKey] || {};

  return (
    <AccordionItem value={card.id.toString()} className="border-b-0">
      <div className={cn("p-0 bg-card flex items-start justify-between gap-2 rounded-md shadow-sm border-l-4", styleInfo.border)}>
        <AccordionTrigger className="flex-grow p-3 text-left hover:no-underline">
          <p className="text-sm font-semibold text-left">{card.question}</p>
        </AccordionTrigger>
        <div className="flex items-center shrink-0 pr-2 pt-3 gap-2">
          <Badge className={cn(styleInfo.badge, "pointer-events-none")}>{pillarKey.charAt(0).toUpperCase() + pillarKey.slice(1)}</Badge>
          <Button size="icon" variant="ghost" onClick={onAdd} className="h-8 w-8 shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AccordionContent className="bg-card rounded-b-md px-3 pb-3 -mt-1">
        <div className="border-t pt-2 text-muted-foreground text-xs space-y-1">
          <p><span className="font-semibold text-foreground/80">Objectif:</span> {card.objectif}</p>
          {card.tip && <p><span className="font-semibold text-foreground/80">Conseil:</span> {card.tip}</p>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

const DraggableCard = ({ card, onRemove }: { card: PedagogicalContent, onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: card.id.toString()});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  // Normaliser la dimension pour enlever les accents
  const pillarKey = card.dimension
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
  const styleInfo = PILLAR_STYLES[pillarKey] || {};

  return (
    <AccordionItem value={card.id.toString()} ref={setNodeRef} style={style} className="border-b-0">
      <div className={cn("p-0 bg-card flex items-start justify-between gap-2 rounded-md shadow-sm border-l-4", styleInfo.border)}>
        <div className="flex items-center flex-grow">
          <span {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-3 shrink-0 self-stretch flex items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </span>
          <AccordionTrigger className="flex-grow p-3 pl-0 text-left hover:no-underline">
            <p className="text-sm font-semibold text-left">{card.question}</p>
          </AccordionTrigger>
        </div>
        <div className="flex items-center shrink-0 pr-1 pt-3 gap-2">
          <Badge className={cn(styleInfo.badge, "pointer-events-none")}>{pillarKey.charAt(0).toUpperCase() + pillarKey.slice(1)}</Badge>
          <Button size="icon" variant="ghost" onClick={onRemove} className="h-8 w-8 shrink-0 text-destructive-foreground/70 hover:text-destructive-foreground">
            <Undo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AccordionContent className="bg-card rounded-b-md px-3 pb-3 -mt-1">
        <div className="border-t pt-2 text-muted-foreground text-xs space-y-1">
          <p><span className="font-semibold text-foreground/80">Objectif:</span> {card.objectif}</p>
          {card.tip && <p><span className="font-semibold text-foreground/80">Conseil:</span> {card.tip}</p>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

