
'use client';

import React, { useState, useEffect, useCallback, useTransition, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

import { ChevronLeft, PlusCircle, Calendar as CalendarIcon, Users, Gamepad2, Settings, ListChecks, Pencil, Save, Loader2, AlertTriangle, ChevronsDown, ChevronsUp, Bookmark, Lightbulb, CheckCircle, Trash2, ArrowRight, ChevronDown, ChevronsRight, ListFilter, ChevronRight as ChevronRightIcon, Shield, Plus, Lock, Unlock, Binoculars, Camera, ShieldQuestion, Map, MessageSquare, Recycle, Search, Milestone, Anchor, Wind, Trophy, Check, Video, Ban, CircleDot, FileCheck, FileText, BookOpen, Compass, Telescope, GraduationCap, Library, Waves, User, Wand, Download, GripVertical, Fish, Undo2, Tag, Play, Microscope, LandPlot, Leaf } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Stage, Sortie, Game, EtagesData, ContentCard, Option, GrandTheme, StageType, Defi, AssignedDefi, PedagogicalContent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getStageById, getSortiesForStage, saveOrUpdateProgramForStage, getGamesForStage, getEtagesData, deleteStage, updateStage, getPedagogicalContent } from '@/app/actions';
import { cn } from '@/lib/utils';
import { groupedThemes } from '@/data/etages';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { DefisTab } from '@/components/defis-tab';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { DeleteSlider } from '@/components/delete-slider';
import { allDefis } from '@/data/defis';
import { Switch } from '@/components/ui/switch';


const allGrandThemes = groupedThemes.flatMap(g => g.themes);

const AXE_CONFIG: { [key: string]: { icon: React.ElementType, label: string } } = {
    comprendre: { icon: BookOpen, label: 'Comprendre' },
    observer: { icon: Telescope, label: 'Observer' },
    proteger: { icon: Shield, label: 'Protéger' },
};

const PILLAR_STYLES: { [key: string]: { badge: string; filterBadge: string, border: string, bg: string, text: string, icon: React.ElementType, hover: string } } = {
    comprendre: { badge: 'bg-cop-comprendre text-background hover:bg-cop-comprendre', filterBadge: 'border-cop-comprendre text-cop-comprendre', border: 'border-cop-comprendre', bg: 'bg-cop-comprendre', text: 'text-cop-comprendre', icon: BookOpen, hover: 'hover:bg-cop-comprendre/10' },
    observer:   { badge: 'bg-cop-observer text-background hover:bg-cop-observer', filterBadge: 'border-cop-observer text-cop-observer', border: 'border-cop-observer', bg: 'bg-cop-observer', text: 'text-cop-observer', icon: Telescope, hover: 'hover:bg-cop-observer/10' },
    proteger:   { badge: 'bg-cop-proteger text-background hover:bg-cop-proteger', filterBadge: 'border-cop-proteger text-cop-proteger', border: 'border-cop-proteger', bg: 'bg-cop-proteger', text: 'text-cop-proteger', icon: Shield, hover: 'hover:bg-cop-proteger/10' },
};

export default function StageDetailPage() {
    const router = useRouter();
    const params = useParams();
    const stageId = params.stageId ? parseInt(params.stageId as string, 10) : null;

    // --- State for Stage Data ---
    const [stage, setStage] = useState<Stage | null>(null);
    const [sorties, setSorties] = useState<Sortie[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [etagesData, setEtagesData] = useState<EtagesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for UI ---
    const [activeTab, setActiveTab] = useState<'suivi' | 'programme' | 'ressources'>('suivi');
    
    // --- State for Objectives Tab ---
    const [allObjectives, setAllObjectives] = useState<PedagogicalContent[]>([]);
    const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(new Set());

    const programThemes = useMemo(() => {
        const programSortie = sorties.find(s => s.selected_content?.program?.length) || sorties[0];
        if (programSortie && programSortie.selected_content?.themes) {
            const themeTitles = programSortie.selected_content.themes as string[];
            return allGrandThemes
                .filter(theme => themeTitles.includes(theme.title))
                .map(theme => theme.id);
        }
        return [];
    }, [sorties]);
    
    // --- Data fetching and processing ---
    const fetchData = useCallback(async () => {
        if (!stageId) {
            setError("ID de stage manquant.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [stageData, sortiesData, gamesData, etages, allPedagogicalContent] = await Promise.all([
                getStageById(stageId),
                getSortiesForStage(stageId),
                getGamesForStage(stageId),
                getEtagesData(),
                getPedagogicalContent(),
            ]);
            
            if (!stageData || !etages) {
                setError("Impossible de charger les données critiques.");
                setLoading(false);
                return;
            }

            setStage(stageData);
            setSorties(sortiesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setGames(gamesData);
            setEtagesData(etages);

            const programSortie = sortiesData.find(s => s.selected_content?.program?.length) || sortiesData[0];

            if (programSortie && programSortie.selected_content?.program) {
                const currentProgramCardIds = new Set<string>(programSortie.selected_content.program.map(id => id.toString()));
                const objectives = allPedagogicalContent.filter(card => currentProgramCardIds.has(card.id.toString()));
                setAllObjectives(objectives);
            } else {
                 setAllObjectives([]);
            }
            
            const completedFromStorage = localStorage.getItem(`completed_objectives_${stageId}`);
            if (completedFromStorage) setCompletedObjectives(new Set(JSON.parse(completedFromStorage)));


        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    }, [stageId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onToggleObjective = (cardId: string) => {
        const newSet = new Set(completedObjectives);
        newSet.has(cardId) ? newSet.delete(cardId) : newSet.add(cardId);
        setCompletedObjectives(newSet);
        if (stageId) localStorage.setItem(`completed_objectives_${stageId}`, JSON.stringify(Array.from(newSet)));
    };
    

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Chargement du stage...</p>
            </div>
        );
    }
    
    if (error || !stage || !etagesData) {
        return (
            <Card className="m-auto mt-10 max-w-lg text-center border-destructive">
                <CardHeader><CardTitle className="flex items-center justify-center gap-2 text-destructive"><AlertTriangle/> Erreur</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{error || "Données du stage introuvables."}</p></CardContent>
                <CardFooter><Button variant="outline" asChild className="w-full"><Link href="/stages"><ChevronLeft className="mr-2 h-4 w-4"/> Retour</Link></Button></CardFooter>
            </Card>
        );
    }

    const [mainTitle, ...subtitles] = stage.title.split(' - ');
    const subtitle = subtitles.join(' - ');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Link href="/stages" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    Retour à tous les stages
                </Link>
                <SettingsView stage={stage} onStageUpdate={fetchData} />
            </div>
            
            <Card className="overflow-hidden relative bg-stage-header bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/0" />
                 <CardContent className="relative text-white p-6 space-y-6">
                    <CardHeader className="p-0">
                        <CardTitle className="text-3xl font-bold font-headline">{mainTitle}</CardTitle>
                        {subtitle && <CardDescription className="text-lg text-white/90">{subtitle}</CardDescription>}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 pt-2 text-sm text-white/80">
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {format(parseISO(stage.start_date), "d MMM", { locale: fr })} - {format(parseISO(stage.end_date), "d MMM yyyy", { locale: fr })}</span>
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {stage.participants} participants</span>
                        </div>
                    </CardHeader>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20 text-white">
                        <TabsTrigger value="suivi" className="data-[state=active]:bg-background/80 data-[state=active]:text-foreground"><ListChecks className="mr-2 h-4 w-4"/>Suivi</TabsTrigger>
                        <TabsTrigger value="programme" className="data-[state=active]:bg-background/80 data-[state=active]:text-foreground"><FileText className="mr-2 h-4 w-4"/>Programme</TabsTrigger>
                        <TabsTrigger value="ressources" className="data-[state=active]:bg-background/80 data-[state=active]:text-foreground"><Library className="mr-2 h-4 w-4"/>Ressources</TabsTrigger>
                      </TabsList>
                    </Tabs>
                </CardContent>
            </Card>
            
            <div className="mt-6">
                {activeTab === 'suivi' && stageId && (
                    <ObjectivesView 
                        stageId={stageId}
                        objectives={allObjectives}
                        games={games}
                        completedObjectives={completedObjectives}
                        onToggleObjective={onToggleObjective}
                    />
                )}
                 {activeTab === 'programme' && (
                   <ProgrammeBuilder
                        stage={stage}
                        sorties={sorties}
                        etagesData={etagesData}
                        onSave={(newlySelectedCards) => {
                            setAllObjectives(newlySelectedCards);
                            fetchData(); 
                        }}
                    />
                 )}
                {activeTab === 'ressources' && stageId && (
                    <RessourcesView
                       stageId={stageId}
                       stageType={stage.type as StageType}
                       stageThemes={programThemes}
                    />
                )}
            </div>
        </div>
    )
}

// --- Sub-components for Tabs ---

const ObjectivesView = ({ 
    stageId, 
    objectives, 
    games, 
    completedObjectives, 
    onToggleObjective 
}: { 
    stageId: number; 
    objectives: PedagogicalContent[]; 
    games: Game[];
    completedObjectives: Set<string>; 
    onToggleObjective: (cardId: string) => void 
}) => {
    const [activeThemeFilters, setActiveThemeFilters] = useState<string[]>([]);
    const [showOnlyNotSeen, setShowOnlyNotSeen] = useState(true);
    
    const themesInProgram = useMemo(() => {
        const themeIds = new Set<string>();
        objectives.forEach(card => {
            card.tags_theme.forEach(themeId => themeIds.add(themeId));
        });
        return allGrandThemes.filter(theme => themeIds.has(theme.id));
    }, [objectives]);
    
    const objectivesByPillar = useMemo(() => {
        const grouped: { [pillar: string]: PedagogicalContent[] } = { comprendre: [], observer: [], proteger: [] };
        
        let filteredObjectives = objectives;

        if (showOnlyNotSeen) {
            filteredObjectives = filteredObjectives.filter(card => !completedObjectives.has(card.id.toString()));
        }

        if (activeThemeFilters.length > 0) {
            filteredObjectives = filteredObjectives.filter(card => 
                activeThemeFilters.some(themeId => card.tags_theme.includes(themeId))
            );
        }

        filteredObjectives.forEach((card: PedagogicalContent) => {
            // Normaliser le pilier : supprimer les accents et convertir en minuscules
            const normalizedDimension = card.dimension
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents

            // Mapper les valeurs possibles
            let pillar: keyof typeof grouped = 'comprendre';
            if (normalizedDimension.includes('observer')) pillar = 'observer';
            else if (normalizedDimension.includes('proteg')) pillar = 'proteger';

            if (grouped[pillar] && !grouped[pillar].some(c => c.id === card.id)) {
                grouped[pillar].push(card);
            }
        });
        return grouped;
    }, [objectives, activeThemeFilters, showOnlyNotSeen, completedObjectives]);
    
    const handleThemeFilterToggle = (themeId: string) => {
        setActiveThemeFilters(prev => 
            prev.includes(themeId) 
                ? prev.filter(id => id !== themeId)
                : [...prev, themeId]
        );
    };

    if (objectives.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-16 px-4">
                    <h3 className="text-lg font-semibold">Le programme est vide</h3>
                    <p className="text-muted-foreground mt-1 mb-4">Allez dans l'onglet "Programme" pour définir les objectifs de ce stage.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Objectifs Pédagogiques</CardTitle></CardHeader>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <ListFilter className="mr-2 h-4 w-4" />
                                Thèmes {activeThemeFilters.length > 0 && `(${activeThemeFilters.length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Filtrer par thème</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {themesInProgram.map(theme => (
                                <DropdownMenuCheckboxItem
                                    key={theme.id}
                                    checked={activeThemeFilters.includes(theme.id)}
                                    onCheckedChange={() => handleThemeFilterToggle(theme.id)}
                                >
                                    {theme.title}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                     </DropdownMenu>

                     <div className="flex items-center space-x-2">
                        <Checkbox id="show-not-seen" checked={showOnlyNotSeen} onCheckedChange={(checked) => setShowOnlyNotSeen(!!checked)} />
                        <label htmlFor="show-not-seen" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Afficher uniquement les non vus
                        </label>
                    </div>
                </CardContent>
            </Card>

            {Object.entries(objectivesByPillar).map(([pillar, cards]) => {
                const { icon: PillarIcon, label } = AXE_CONFIG[pillar as keyof typeof AXE_CONFIG] || { icon: 'div', label: pillar };
                const pillarStyle = PILLAR_STYLES[pillar as keyof typeof PILLAR_STYLES] || {};
                
                if (cards.length === 0) return null;

                return (
                    <div key={pillar}>
                        <h3 className={cn("text-xl font-semibold flex items-center gap-3 mb-4", pillarStyle.text)}>
                            <PillarIcon className="w-6 h-6" />{label}
                        </h3>
                        <Accordion type="multiple" className="w-full space-y-2">
                            {cards.map((card: PedagogicalContent) => (
                                <AccordionItem value={card.id.toString()} key={card.id} className="border-b-0">
                                    <Card className={cn("transition-all overflow-hidden bg-card", completedObjectives.has(card.id.toString()) ? 'opacity-50' : 'opacity-100')}>
                                        <div className={cn("flex items-stretch p-1 justify-between gap-2 border-l-4 rounded-l-md", pillarStyle.border)}>
                                            {card.icon_tag && (
                                                <div className="p-3 pl-2 flex items-center justify-center shrink-0">
                                                    <Image src={`/assets/icons/${card.icon_tag}.png?v=${new Date().getTime()}`} alt={card.icon_tag} width={60} height={60} className="object-contain" />
                                                </div>
                                            )}
                                            <div className={cn("flex-grow p-3 space-y-2", !card.icon_tag && "pl-4")}>
                                                <div className="flex flex-wrap gap-1">
                                                    {card.tags_theme.map(themeId => {
                                                        const theme = allGrandThemes.find(t => t.id === themeId);
                                                        return theme ? <Badge key={themeId} variant="outline" className="font-normal">{theme.title}</Badge> : null;
                                                    })}
                                                </div>
                                                <p className="font-medium text-foreground text-sm">{card.question}</p>
                                            </div>
                                            
                                            <div className="flex flex-col items-center gap-2 pl-2 pr-1 shrink-0 pt-3">
                                                 <Switch 
                                                    checked={completedObjectives.has(card.id.toString())}
                                                    onCheckedChange={() => onToggleObjective(card.id.toString())}
                                                    aria-label="Marquer comme vu"
                                                />
                                                <AccordionTrigger className="p-1 hover:no-underline [&>svg]:mx-auto">
                                                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                                                </AccordionTrigger>
                                            </div>
                                        </div>
                                        <AccordionContent>
                                            <div className="border-t mx-3"></div>
                                            <div className="px-3 pb-3 pt-2 text-muted-foreground text-sm space-y-2">
                                                <p><span className="font-semibold text-foreground/80">Objectif:</span> {card.objectif}</p>
                                                {card.tip && <p><span className="font-semibold text-foreground/80">Conseil:</span> {card.tip}</p>}
                                            </div>
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                );
            })}
             <DefisSuivi stageId={stageId}/>
             <JeuxSuivi games={games} stageId={stageId}/>
        </div>
    );
};

const DefisSuivi = ({ stageId }: { stageId: number }) => {
    const { toast } = useToast();
    const [isProcessing, startTransition] = useTransition();

    const [assignedDefis, setAssignedDefis] = useState<AssignedDefi[]>([]);
    
    useEffect(() => {
        const storedAssignedDefis = localStorage.getItem(`assigned_defis_${stageId}`);
        setAssignedDefis(storedAssignedDefis ? JSON.parse(storedAssignedDefis) : []);
    }, [stageId]);
    
    const assignedDefisDetails = useMemo(() => {
        return assignedDefis
            .map(am => {
                const details = allDefis.find(m => m.id === am.defi_id);
                return details ? { ...am, details } : null;
            })
            .filter((am): am is AssignedDefi & { details: Defi } => am !== null);
    }, [assignedDefis]);

    const handleUpdateDefi = (assignedDefi: AssignedDefi, completed: boolean, preuveUrl?: string) => {
        startTransition(() => {
            const updatedDefis = assignedDefis.map(am => {
                if (am.id === assignedDefi.id) {
                    return {
                        ...am,
                        status: completed ? 'complete' : 'en_cours',
                        completed_at: completed ? new Date().toISOString() : null,
                        preuve_url: preuveUrl !== undefined ? preuveUrl : am.preuve_url,
                    };
                }
                return am;
            });
            
            setAssignedDefis(updatedDefis);
            localStorage.setItem(`assigned_defis_${stageId}`, JSON.stringify(updatedDefis));
            toast({ title: "Progression du défi mise à jour" });
        });
    };
    
    const iconMap: { [key: string]: React.ElementType } = {
        Shield, Trash2, Wind, Fish, Map, Gamepad2, BookOpen, Trophy, Camera, Microscope, LandPlot, Compass, Waves, Leaf
    };
    
    if (assignedDefisDetails.length === 0) return null;

    return (
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-3 mb-4 text-amber-500">
            <Trophy className="w-6 h-6" />Défis à Réaliser
        </h3>
         <Accordion type="multiple" className="w-full space-y-2">
            {assignedDefisDetails.map(assignedDefi => {
                const defiDetails = assignedDefi.details;
                if (!defiDetails) return null;
                const IconComponent = iconMap[defiDetails.icon] || Shield;
                const isCompleted = assignedDefi.status === 'complete';
                return (
                    <AccordionItem value={defiDetails.id} key={defiDetails.id} className="border-b-0">
                         <Card className={cn("transition-all overflow-hidden", isCompleted ? 'bg-card opacity-60' : 'bg-card')}>
                            <AccordionTrigger className="flex w-full p-3 text-left hover:no-underline">
                                 <div className="flex items-start gap-4 text-left flex-grow">
                                    <IconComponent className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-foreground">{defiDetails.description}</p>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                            </AccordionTrigger>
                             <AccordionContent className="px-3 pb-3">
                                 <div className="border-t pt-3 space-y-3">
                                    <p className="text-sm text-muted-foreground">{defiDetails.instruction}</p>
                                    {(defiDetails.type_preuve === 'checkbox' || defiDetails.type_preuve === 'action' || defiDetails.type_preuve === 'quiz') && (
                                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                            <Checkbox
                                                id={`defi-${assignedDefi.id}`}
                                                checked={isCompleted}
                                                onCheckedChange={(checked) => handleUpdateDefi(assignedDefi, !!checked)}
                                                disabled={isProcessing}
                                            />
                                             <label htmlFor={`defi-${assignedDefi.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Marquer comme terminé
                                            </label>
                                        </div>
                                    )}
                                     {defiDetails.type_preuve === 'photo' && (
                                        <div className="p-2 bg-muted/50 rounded-md">
                                             {isCompleted && assignedDefi.preuve_url && (
                                                 <img src={assignedDefi.preuve_url} alt={`Preuve pour ${defiDetails.description}`} width={80} height={80} className="rounded-md object-cover mb-2" />
                                            )}
                                            <Button size="sm" variant="outline">
                                                <Camera className="w-4 h-4 mr-2" />
                                                {isCompleted ? 'Modifier la preuve' : 'Valider avec une photo'}
                                            </Button>
                                        </div>
                                    )}
                                 </div>
                             </AccordionContent>
                         </Card>
                    </AccordionItem>
                )
            })}
        </Accordion>
      </div>
    )
}

const JeuxSuivi = ({ games, stageId }: { games: Game[], stageId: number }) => {
    
    if (games.length === 0) return null;
    
    return (
        <div>
            <h3 className="text-xl font-semibold flex items-center gap-3 mb-4 text-purple-400">
                <Gamepad2 className="w-6 h-6" />Jeux &amp; Quiz
            </h3>
            <div className="space-y-3">
                {games.map(game => {
                    // In a real app, this would be reactive. Here we simulate reading from localStorage.
                    const history = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(`game_history_${stageId}`) || '[]') : [];
                    const gameResult = history.find((r: any) => r.gameId === game.id);

                    return (
                        <Card key={game.id} className="hover:bg-muted/50 transition-colors group relative">
                           <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{game.title}</p>
                                    <p className="text-sm text-muted-foreground">Thème: {game.theme}</p>
                                    {gameResult && (
                                         <Badge variant={gameResult.percentage >= 75 ? 'default' : 'secondary'} className="mt-2">Score: {gameResult.percentage}%</Badge>
                                    )}
                                </div>
                                <Link href={`/jeux/${game.id}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Lancer
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    )
}

const RessourcesView = ({ stageId, stageType, stageThemes }: { stageId: number, stageType: StageType, stageThemes: string[] }) => {
    return (
      <Tabs defaultValue="defis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="defis"><Trophy className="w-4 h-4 mr-2"/>Défis</TabsTrigger>
          <TabsTrigger value="jeux"><Gamepad2 className="w-4 h-4 mr-2"/>Jeux</TabsTrigger>
        </TabsList>
        <TabsContent value="defis" className="mt-6">
            <DefisTab 
                stageId={stageId}
                stageType={stageType}
                stageThemes={stageThemes}
            />
        </TabsContent>
        <TabsContent value="jeux" className="mt-6">
            <JeuxRessources stageId={stageId} />
        </TabsContent>
      </Tabs>
    )
}

const JeuxRessources = ({ stageId }: { stageId: number }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        getGamesForStage(stageId).then(data => {
            setGames(data);
            setLoading(false);
        });
    }, [stageId]);

    const newGameURL = `/jeux/generateur?stageId=${stageId}`;

    return (
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div><CardTitle>Bibliothèque de Jeux</CardTitle><CardDescription>Créez et gérez les jeux de révision pour ce stage.</CardDescription></div>
                    <Link href={newGameURL}><Button><PlusCircle className="mr-2 h-4 w-4" />Créer un jeu</Button></Link>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="animate-spin" /> : games.length > 0 ? (
                    <div className="space-y-3">{games.map((game: Game) => (
                        <Card key={game.id} className="hover:bg-muted transition-colors group relative">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div><p className="font-semibold">{game.title}</p><p className="text-sm text-muted-foreground">Thème: {game.theme} - Créé le {format(new Date(game.created_at), 'd MMM yyyy', { locale: fr })}</p></div>
                                <Link href={`/jeux/${game.id}`} className={cn(buttonVariants({variant: 'ghost'}))}><Play className="w-5 h-5"/></Link>
                            </CardContent>
                        </Card>
                    ))}</div>
                ) : (
                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg"><h3 className="text-lg font-semibold">Aucun jeu créé</h3><p className="text-muted-foreground mt-1">Créez votre premier jeu pour ce stage.</p></div>
                )}
            </CardContent>
        </Card>
    )
}


type CardContainer = Record<"available" | "selected", PedagogicalContent[]>;

const ProgrammeBuilder = ({ 
    stage, 
    sorties,
    etagesData, 
    onSave,
}: { 
    stage: Stage, 
    sorties: Sortie[],
    etagesData: EtagesData, 
    onSave: (newlySelectedCards: PedagogicalContent[]) => void,
}) => {
    const { toast } = useToast();
    const [isSaving, startSaveTransition] = useTransition();
    const [allPedagogicalContent, setAllPedagogicalContent] = useState<PedagogicalContent[]>([]);

    const getInitialState = useCallback((allCards: PedagogicalContent[]) => {
        const programSortie = sorties.find(s => s.selected_content?.program?.length) || sorties[0];
        
        let initialSelectedCardIds = new Set<string>();
        let initialLevel = 0;
        let initialThemeIds: string[] = [];

        if (programSortie) {
            const content = programSortie.selected_content || {};
            const notions = programSortie.selected_notions || {};
            if (content.program) initialSelectedCardIds = new Set(content.program);
            if (notions.niveau) initialLevel = notions.niveau;
            if (content.themes) {
                initialThemeIds = (content.themes as string[]).map(title => allGrandThemes.find(t => t.title === title)?.id).filter((id): id is string => !!id);
            }
        }

        const selected = allCards.filter(c => initialSelectedCardIds.has(c.id.toString()));
        const available = allCards.filter(c => !initialSelectedCardIds.has(c.id.toString()));

        return {
            items: { available, selected },
            level: initialLevel,
            themeIds: initialThemeIds,
        };
    }, [sorties]);

    const [level, setLevel] = useState(0);
    const [themeIds, setThemeIds] = useState<string[]>([]);
    const [items, setItems] = useState<CardContainer>({ available: [], selected: [] });
    const [activeTab, setActiveTab] = useState('explore');
    const [pillarFilter, setPillarFilter] = useState<string | null>(null);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    
    useEffect(() => {
        getPedagogicalContent().then(allCards => {
            setAllPedagogicalContent(allCards);
            const initialState = getInitialState(allCards);
            setLevel(initialState.level);
            setThemeIds(initialState.themeIds);
            setItems(initialState.items);
        });
    }, [sorties, getInitialState]);


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

    const handleSaveProgram = () => {
        startSaveTransition(async () => {
            if (!stage) return;
            const mainThemeTitles = themeIds.map(id => allGrandThemes.find(t => t.id === id)?.title).filter((t): t is string => !!t);

            const result = await saveOrUpdateProgramForStage(stage.id, level, mainThemeTitles, items.selected.map(c => c.id.toString()));

            if (result.success) {
                toast({ title: "Programme sauvegardé", description: "Le programme a été mis à jour avec succès." });
                onSave(items.selected);
            } else {
                toast({ title: "Erreur", description: result.error || "La sauvegarde a échoué.", variant: 'destructive' });
            }
        });
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
        return originalCard?.dimension.toLowerCase();
    };
    
    const handleTagFilterToggle = (tag: string) => {
        setTagFilter(prev => 
            prev.includes(tag) 
                ? prev.filter(id => id !== tag)
                : [...prev, tag]
        );
    };

    const pillarMap: { [key: string]: string } = {
        'Comprendre le lieu géographique': 'comprendre',
        "Observer l'espace d'évolution": 'observer',
        'Protéger le site naturel': 'proteger',
    };

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
                    <CardTitle>Étape 3 : Pourquoi j’en parle ? (Construire le programme)</CardTitle>
                    <CardDescription>Sélectionnez les fiches-objectifs pour construire vos séances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="explore">Explorer les fiches ({filteredAvailableCards.length})</TabsTrigger>
                            <TabsTrigger value="selected">Mon Programme ({items.selected.length})</TabsTrigger>
                        </TabsList>
                        
                        <div className="flex flex-col md:flex-row gap-4 mt-4">
                            {/* Explorer Column */}
                            <div className={cn("w-full md:w-1/2", activeTab !== 'explore' && 'hidden md:block')}>
                                <div className="space-y-2">
                                     <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 -mx-2 px-2">
                                        <ToggleGroup type="single" value={pillarFilter ?? ""} onValueChange={(value) => setPillarFilter(value || null)}>
                                            {Object.entries(PILLAR_STYLES).map(([key, { icon: PillarIcon, text }]) => (
                                                <ToggleGroupItem key={key} value={key} className={cn("border bg-background data-[state=on]:bg-transparent h-9", pillarFilter === key && `${PILLAR_STYLES[key as keyof typeof PILLAR_STYLES].filterBadge} data-[state=on]:bg-transparent`)}>
                                                    <PillarIcon className={cn("w-4 h-4 mr-2 text-muted-foreground", pillarFilter === key && text)} />
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </ToggleGroupItem>
                                            ))}
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
                           <div className={cn("w-full md:w-1/2", activeTab !== 'selected' && 'hidden md:block')}>
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
            <CardHeader><CardTitle>Étape 4 : Action de l’encadrant (Finalisation)</CardTitle></CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full" disabled={items.selected.length === 0}>
                    <Link href={`/jeux/validation?stageId=${stage.id}&objectives=${items.selected.map(c => c.id).join(',')}`}>
                        <GraduationCap className="mr-2 h-4 w-4" />Je teste mes connaissances
                    </Link>
                </Button>
                <Button className="w-full" onClick={handleSaveProgram} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Appliquer le programme
                </Button>
            </CardContent>
        </Card>
      </div>
    );
};


const ActionableCard = ({ card, onAdd }: { card: PedagogicalContent, onAdd: () => void }) => {
    const pillarKey = card.dimension.toLowerCase();
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
    const pillarKey = card.dimension.toLowerCase();
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

const stageSettingsSchema = z.object({
  id: z.number(),
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  type: z.string().min(1, { message: 'Le type est requis.' }),
  participants: z.coerce.number().int().positive({ message: 'Le nombre de participants doit être positif.' }),
  start_date: z.string().min(1, { message: 'Une date de début est requise.' }),
  end_date: z.string().min(1, { message: 'Une date de fin est requise.' }),
}).refine(data => {
    if (!data.start_date || !data.end_date) return true;
    return data.end_date >= data.start_date;
}, { message: 'La date de fin doit être après ou égale à la date de début.', path: ['end_date'] });

type StageSettingsFormValues = z.infer<typeof stageSettingsSchema>;

const SettingsView = ({ stage, onStageUpdate }: { stage: Stage, onStageUpdate: () => void }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isUpdating, startUpdateTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const form = useForm<StageSettingsFormValues>({
        resolver: zodResolver(stageSettingsSchema),
        defaultValues: {
            id: stage.id,
            title: stage.title,
            type: stage.type,
            participants: stage.participants,
            start_date: stage.start_date,
            end_date: stage.end_date,
        }
    });
    
    const type = form.watch('type');
    const startDate = form.watch('start_date');

    React.useEffect(() => {
        if (stage) {
            form.reset({
                id: stage.id,
                title: stage.title,
                type: stage.type,
                participants: stage.participants,
                start_date: stage.start_date,
                end_date: stage.end_date,
            });
        }
    }, [stage, form]);

    React.useEffect(() => {
        if (!startDate) return;
        try {
            const startDateObj = parse(startDate, 'yyyy-MM-dd', new Date());
            if(isNaN(startDateObj.getTime())) return;

            if (type === 'Journée') {
                form.setValue('end_date', format(startDateObj, 'yyyy-MM-dd'));
            } else if (type === 'Hebdomadaire') {
                form.setValue('end_date', format(addDays(startDateObj, 4), 'yyyy-MM-dd'));
            }
        } catch (e) {
            console.error("Invalid date value", e);
        }
    }, [type, startDate, form]);

    const handleStageUpdate = (data: Omit<Stage, 'created_at'>) => {
        startUpdateTransition(async () => {
            const updatedStage = await updateStage(data);
            if (updatedStage) {
                toast({ title: 'Stage mis à jour', description: 'Les informations ont été enregistrées.' });
                onStageUpdate();
                setIsDialogOpen(false);
            } else {
                 toast({ title: 'Erreur', description: 'La mise à jour a échoué.', variant: 'destructive' });
            }
        });
    };

    const handleDelete = () => {
        startDeleteTransition(async () => {
            await deleteStage(stage.id);
            toast({ title: 'Stage Supprimé' });
            router.push('/stages');
        });
    };

    const onSubmit = (data: StageSettingsFormValues) => {
        handleStageUpdate(data);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Paramètres du stage</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Paramètres du Stage</DialogTitle>
                    <DialogDescription>Gérez les informations de base et les actions dangereuses liées à ce stage.</DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Titre du stage</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Stage Voile - Août" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Hebdomadaire">Hebdomadaire</SelectItem>
                                        <SelectItem value="Journée">Journée</SelectItem>
                                        <SelectItem value="Libre">Libre</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="participants"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Participants</FormLabel>
                                    <FormControl>
                                    <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="start_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date de début</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                                >
                                                {field.value ? (
                                                    format(parse(field.value, 'yyyy-MM-dd', new Date()), 'PPP', { locale: fr })
                                                ) : (
                                                    <span>Choisissez une date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                initialFocus
                                                locale={fr}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date de fin</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                                disabled={type === 'Journée' || type === 'Hebdomadaire'}
                                                >
                                                {field.value ? (
                                                    format(parse(field.value, 'yyyy-MM-dd', new Date()), 'PPP', { locale: fr })
                                                ) : (
                                                    <span>Choisissez une date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                disabled={(date) => {
                                                const startDateValue = form.getValues('start_date');
                                                return startDateValue ? date < parse(startDateValue, 'yyyy-MM-dd', new Date()) : false;
                                                }}
                                                initialFocus
                                                locale={fr}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                        </div>
                        <DialogFooter className="pt-4 flex-col gap-2">
                            <div className="w-full flex sm:flex-row flex-col-reverse gap-2">
                                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="w-full">Annuler</Button>
                                <Button type="submit" disabled={isUpdating} className="w-full">
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sauvegarder
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>

                <div className="border-t pt-6 mt-6">
                    <DeleteSlider onConfirm={handleDelete} disabled={isDeleting} />
                </div>
            </DialogContent>
        </Dialog>
    );
};


