'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Plus, Trophy, Gamepad2, Tag, BookOpen, Telescope, Shield, GripVertical, Trash2, Undo2 } from 'lucide-react';
import { groupedThemes } from '@/data/etages';
import { getPedagogicalContent } from '@/app/actions';
import type { PedagogicalContent, EtagesData, StageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DefisTab } from '@/components/defis-tab';
import { JeuxRessources } from '@/components/missions-tab';

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

interface ProgrammeBuilderProps {
    etagesData: EtagesData;
    stageType: StageType;
    stageThemes?: string[];
    onSave: (selectedCards: PedagogicalContent[], level: number, themes: string[]) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    includeStageResources?: boolean; // Si true, affiche l'Étape 4 (Défis/Jeux) - pour l'onglet Programme uniquement
    stageId?: number; // Requis si includeStageResources est true
}

const ActionableCard = ({ card, onAdd }: { card: PedagogicalContent, onAdd: () => void }) => {
    const pillarKey = card.dimension.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
};

const DraggableCard = ({ card, onRemove }: { card: PedagogicalContent, onRemove: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: card.id.toString()});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };
    const pillarKey = card.dimension.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
};

export const ProgrammeBuilder = ({
    etagesData,
    stageType,
    stageThemes = [],
    onSave,
    onCancel,
    isLoading = false,
    includeStageResources = false,
    stageId = 0,
}: ProgrammeBuilderProps) => {
    const [level, setLevel] = useState(0);
    const [themeIds, setThemeIds] = useState<string[]>([]);
    const [items, setItems] = useState<CardContainer>({ available: [], selected: [] });
    const [allPedagogicalContent, setAllPedagogicalContent] = useState<PedagogicalContent[]>([]);
    const [pillarFilter, setPillarFilter] = useState<string | null>(null);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'explore' | 'selected'>('explore');
    const [isLoading2, setIsLoading2] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, { distance: 8 }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const fetchContent = async () => {
            const content = await getPedagogicalContent();
            setAllPedagogicalContent(content);
            setItems({ available: content, selected: [] });
            setIsLoading2(false);
        };
        fetchContent();
    }, []);

    const addCard = (card: PedagogicalContent) => {
        setItems(prev => ({
            ...prev,
            selected: [...prev.selected, card]
        }));
    };

    const removeCard = (card: PedagogicalContent) => {
        setItems(prev => ({
            ...prev,
            selected: prev.selected.filter(c => c.id !== card.id)
        }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.selected.findIndex(c => c.id.toString() === active.id);
            const newIndex = items.selected.findIndex(c => c.id.toString() === over.id);
            setItems(prev => ({
                ...prev,
                selected: arrayMove(prev.selected, oldIndex, newIndex)
            }));
        }
    };

    const baseFilteredCards = useMemo(() => {
        let cards = items.available.filter(card => card.niveau === level + 1);
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
        return originalCard?.dimension.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    
    const handleTagFilterToggle = (tag: string) => {
        setTagFilter(prev => 
            prev.includes(tag) 
                ? prev.filter(id => id !== tag)
                : [...prev, tag]
        );
    };

    const handleSave = () => {
        onSave(items.selected, level, themeIds);
    };

    if (isLoading2) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
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
                    <CardTitle>Étape 3 : Pourquoi j'en parle ? (Construire le programme)</CardTitle>
                    <CardDescription>Sélectionnez les fiches-objectifs pour construire vos séances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'explore' | 'selected')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:hidden">
                            <TabsTrigger value="explore">Explorer les fiches ({filteredAvailableCards.length})</TabsTrigger>
                            <TabsTrigger value="selected">Mon Programme ({items.selected.length})</TabsTrigger>
                        </TabsList>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className={cn("w-full", activeTab !== 'explore' && 'hidden md:block')}>
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 -mx-2 px-2">
                                        <ToggleGroup type="single" value={pillarFilter ?? ""} onValueChange={(value) => setPillarFilter(value || null)} className="flex flex-wrap gap-2">
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
                                        {(pillarFilter || tagFilter.length > 0) && <Button variant="ghost" size="sm" className="h-9" onClick={() => { setPillarFilter(null); setTagFilter([]); }}>Effacer</Button>}
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
                                                <p className="p-4 text-center text-sm text-muted-foreground">Aucune fiche à afficher.</p>
                                            )}
                                        </Accordion>
                                    </div>
                                </div>
                            </div>

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
                                                    <p className="p-4 text-center text-sm text-muted-foreground">Aucune fiche sélectionnée</p>
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

            {/* Étape 4 : Ressources pédagogiques - Uniquement pour l'onglet Programme (niveau stage) */}
            {includeStageResources && (
                <Card>
                    <CardHeader>
                        <CardTitle>Étape 4 : Ressources pédagogiques</CardTitle>
                        <CardDescription>Gérez les défis et jeux pour enrichir votre stage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="defis" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="defis"><Trophy className="w-4 h-4 mr-2"/>Défis</TabsTrigger>
                                <TabsTrigger value="jeux"><Gamepad2 className="w-4 h-4 mr-2"/>Jeux</TabsTrigger>
                            </TabsList>
                            <TabsContent value="defis" className="mt-6">
                                <DefisTab
                                    stageId={stageId}
                                    stageType={stageType}
                                    stageThemes={themeIds.map(id => allGrandThemes.find(t => t.id === id)?.title).filter((t): t is string => !!t)}
                                />
                            </TabsContent>
                            <TabsContent value="jeux" className="mt-6">
                                <JeuxRessources stageId={stageId} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2 justify-end sticky bottom-0 bg-background/80 backdrop-blur-sm p-4 -mx-4 -mb-4">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                        Annuler
                    </Button>
                )}
                <Button onClick={handleSave} disabled={isLoading || items.selected.length === 0}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer le module
                </Button>
            </div>
        </div>
    );
};

