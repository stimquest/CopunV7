// 'use client' directive
'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useTransition,
} from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// DnD-kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Form handling
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Date utilities
import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Icons (lucide-react)
import {
    ChevronLeft,
    FileText,
    Anchor,
    ListChecks,
    ListFilter,
    PlusCircle,
    Calendar as CalendarIcon,
    Users,
    Gamepad2,
    Settings,
    Pencil,
    Save,
    Loader2,
    AlertTriangle,
    ChevronsDown,
    ChevronsUp,
    Bookmark,
    Lightbulb,
    CheckCircle,
    Trash2,
    ArrowRight,
    ChevronDown,
    ChevronsRight,
    Shield,
    Plus,
    Lock,
    Unlock,
    Binoculars,
    Camera,
    ShieldQuestion,
    Map,
    MessageSquare,
    Recycle,
    Search,
    Milestone,
    Wind,
    Trophy,
    Check,
    Video,
    Ban,
    CircleDot,
    FileCheck,
    BookOpen,
    Compass,
    Telescope,
    GraduationCap,
    Library,
    Waves,
    User,
    Wand,
    Download,
    GripVertical,
    Fish,
    Undo2,
    Tag,
    Play,
    Microscope,
    LandPlot,
    Leaf,
} from 'lucide-react';

// Shadcn UI components
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { DeleteSlider } from '@/components/delete-slider';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// Local utilities and data
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { allDefis } from '@/data/defis';
import { groupedThemes } from '@/data/etages';
import type {
    Stage,
    Sortie,
    Game,
    EtagesData,
    PedagogicalContent,
    StageType,
    Defi,
    AssignedDefi,
    DefiStatus,
    StageGameHistory,
    GrandTheme,
} from '@/lib/types';

// Compute allGrandThemes from groupedThemes
const allGrandThemes = groupedThemes.flatMap(g => g.themes);

// Server actions (client wrappers)
import {
    getStagePageData,
    saveOrUpdateProgramForStage,
    deleteStage,
    updateStage,
    toggleObjectiveCompletion,
    getStageExploits,
    updateStageExploitStatus,
    getStageGameHistory,
    deleteGame,
    getGamesForStage,
} from '@/app/actions';

// Component imports
import { DefisTab } from '@/components/defis-tab';
import SuiviBisPage from '@/app/(app)/stages/[stageId]/suivi-bis/page';
import { SessionsManager } from '@/components/sessions-manager';
import { ProgrammeBuilder } from '@/components/programme-builder';
import { SettingsView } from '@/components/settings-view';
import { CameraProofModal } from '@/components/camera-proof-modal';

// ---------------------------------------------------------------------------
// Helper constants for pillars
// ---------------------------------------------------------------------------
const AXE_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
    comprendre: { icon: BookOpen, label: 'Comprendre' },
    observer: { icon: Telescope, label: 'Observer' },
    proteger: { icon: Shield, label: 'Protéger' },
};

const PILLAR_STYLES: Record<string, {
    badge: string;
    filterBadge: string;
    border: string;
    bg: string;
    text: string;
    icon: React.ElementType;
    hover: string;
}> = {
    comprendre: {
        badge: 'bg-cop-comprendre text-background hover:bg-cop-comprendre',
        filterBadge: 'border-cop-comprendre text-cop-comprendre',
        border: 'border-cop-comprendre',
        bg: 'bg-cop-comprendre',
        text: 'text-cop-comprendre',
        icon: BookOpen,
        hover: 'hover:bg-cop-comprendre/10',
    },
    observer: {
        badge: 'bg-cop-observer text-background hover:bg-cop-observer',
        filterBadge: 'border-cop-observer text-cop-observer',
        border: 'border-cop-observer',
        bg: 'bg-cop-observer',
        text: 'text-cop-observer',
        icon: Telescope,
        hover: 'hover:bg-cop-observer/10',
    },
    proteger: {
        badge: 'bg-cop-proteger text-background hover:bg-cop-proteger',
        filterBadge: 'border-cop-proteger text-cop-proteger',
        border: 'border-cop-proteger',
        bg: 'bg-cop-proteger',
        text: 'text-cop-proteger',
        icon: Shield,
        hover: 'hover:bg-cop-proteger/10',
    },
};

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function StageDetailPage() {
    const router = useRouter();
    const params = useParams<{ stageId: string }>();
    const searchParams = useSearchParams();
    const stageId = params.stageId ? parseInt(params.stageId, 10) : null;
    const { toast } = useToast();

    // ---------------------- State ----------------------
    const [stage, setStage] = useState<Stage | null>(null);
    const [sorties, setSorties] = useState<Sortie[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [etagesData, setEtagesData] = useState<EtagesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const initialTab =
        (searchParams.get('tab') as 'séances' | 'programme' | 'suivi-bis') || 'séances';
    const [activeTab, setActiveTab] = useState<'séances' | 'programme' | 'suivi-bis'>(
        initialTab
    );

    // Objectives handling
    const [allObjectives, setAllObjectives] = useState<PedagogicalContent[]>([]);
    const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(
        new Set()
    );

    // Compute program themes for ProgrammeBuilder
    const programThemes = useMemo(() => {
        const programSortie =
            sorties.find((s) => s.selected_content?.program?.length) || sorties[0];
        if (programSortie && programSortie.selected_content?.themes) {
            const themeTitles = programSortie.selected_content.themes as string[];
            return allGrandThemes
                .filter((theme: GrandTheme) => themeTitles.includes(theme.title))
                .map((theme: GrandTheme) => theme.id);
        }
        return [];
    }, [sorties]);

    // ---------------------- Data fetching ----------------------
    const fetchData = useCallback(async () => {
        if (!stageId) {
            setError('ID de stage manquant.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const {
                stage: stageData,
                sorties: sortiesData,
                games: gamesData,
                etagesData: etages,
                allPedagogicalContent,
                completedObjectivesIds,
            } = await getStagePageData(stageId);

            if (!stageData || !etages) {
                setError('Impossible de charger les données critiques.');
                setLoading(false);
                return;
            }

            setStage(stageData);
            setSorties(
                sortiesData.sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                )
            );
            setGames(gamesData);
            setEtagesData(etages);

            // Build objectives from program if present
            const programSortie =
                sortiesData.find((s) => s.selected_content?.program?.length) ||
                sortiesData[0];
            if (programSortie && programSortie.selected_content?.program) {
                const ids = new Set(
                    programSortie.selected_content.program.map((id) => id.toString())
                );
                const objectives = allPedagogicalContent.filter((card) =>
                    ids.has(card.id.toString())
                );
                setAllObjectives(objectives);
            } else {
                setAllObjectives([]);
            }

            // Load completed objectives (localStorage overrides DB)
            let finalCompleted = completedObjectivesIds;
            const lsKey = `stage_${stageId}_completed_objectives`;
            const lsData = localStorage.getItem(lsKey);
            if (lsData) {
                try {
                    const parsed = JSON.parse(lsData) as string[];
                    finalCompleted = parsed;
                } catch {
                    // ignore JSON errors
                }
            } else if (completedObjectivesIds.length > 0) {
                localStorage.setItem(lsKey, JSON.stringify(completedObjectivesIds));
            }
            setCompletedObjectives(new Set(finalCompleted));
        } catch (e) {
            console.error(e);
            setError('Une erreur est survenue lors du chargement des données.');
        } finally {
            setLoading(false);
        }
    }, [stageId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ---------------------- Objective toggle ----------------------
    const onToggleObjective = async (cardId: string) => {
        const currently = completedObjectives.has(cardId);
        const newSet = new Set(completedObjectives);
        if (currently) newSet.delete(cardId);
        else newSet.add(cardId);
        setCompletedObjectives(newSet);
        const lsKey = `stage_${stageId}_completed_objectives`;
        localStorage.setItem(lsKey, JSON.stringify(Array.from(newSet)));
        try {
            const success = await toggleObjectiveCompletion(
                stageId!,
                cardId,
                !currently
            );
            if (!success) {
                toast({
                    title: 'Erreur de sauvegarde',
                    description:
                        "L'objectif a été sauvegardé localement mais pas dans la base de données.",
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Erreur de sauvegarde',
                description:
                    "L'objectif a été sauvegardé localement mais pas dans la base de données.",
                variant: 'destructive',
            });
        }
    };

    // ---------------------- Render ----------------------
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Chargement du stage…</p>
            </div>
        );
    }

    if (error || !stage || !etagesData) {
        return (
            <Card className="m-auto mt-10 max-w-lg text-center border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                        <AlertTriangle /> Erreur
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{error ?? 'Données du stage introuvables.'}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/stages">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const [mainTitle, ...subtitles] = stage.title.split(' - ');
    const subtitle = subtitles.join(' - ');

    return (
        <div className="space-y-6">
            {/* Header navigation */}
            <div className="flex justify-between items-center">
                <Link
                    href="/stages"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Retour à tous les stages
                </Link>
                <SettingsView stage={stage} onStageUpdate={fetchData} />
            </div>

            {/* Stage banner */}
            <Card className="overflow-hidden relative bg-stage-header bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/0" />
                <CardContent className="relative text-white p-6 space-y-6">
                    <CardHeader className="p-0">
                        <CardTitle className="text-3xl font-bold font-headline">
                            {mainTitle}
                        </CardTitle>
                        {subtitle && (
                            <CardDescription className="text-lg text-white/90">
                                {subtitle}
                            </CardDescription>
                        )}
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => setActiveTab(v as 'séances' | 'programme' | 'suivi-bis')}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger
                                    value="programme"
                                    className="data-[state=active]:bg-background/80 data-[state=active]:text-foreground"
                                >
                                    <FileText className="mr-2 h-4 w-4" /> Programme
                                </TabsTrigger>
                                <TabsTrigger
                                    value="séances"
                                    className="data-[state=active]:bg-background/80 data-[state=active]:text-foreground"
                                >
                                    <Anchor className="mr-2 h-4 w-4" /> Séances
                                </TabsTrigger>
                                <TabsTrigger
                                    value="suivi-bis"
                                    className="data-[state=active]:bg-background/80 data-[state=active]:text-foreground"
                                >
                                    <ListChecks className="mr-2 h-4 w-4" /> Suivi
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                </CardContent>
            </Card>

            {/* Tab content */}
            <div className="mt-6">
                {activeTab === 'séances' && stageId && (
                    <SessionsManager
                        stageId={stageId}
                        availableObjectives={allObjectives}
                    />
                )}
                {activeTab === 'programme' && stageId && (
                    <ProgrammeBuilder
                        etagesData={etagesData}
                        stageId={stageId}
                        stageType={stage.type as StageType}
                        stageThemes={programThemes}
                        onSave={(newlySelectedCards: PedagogicalContent[], _level: number, _themes: string[]) => {
                            setAllObjectives(newlySelectedCards);
                            fetchData();
                        }}
                    />
                )}
                {activeTab === 'suivi-bis' && stageId && (
                    <div className="w-full">
                        <SuiviBisPage />
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub‑components for tabs (ObjectivesView, DefisSuivi, JeuxSuivi, etc.)
// ---------------------------------------------------------------------------
const ObjectivesView = ({
    stageId,
    objectives,
    games,
    completedObjectives,
    onToggleObjective,
}: {
    stageId: number;
    objectives: PedagogicalContent[];
    games: Game[];
    completedObjectives: Set<string>;
    onToggleObjective: (cardId: string) => void;
}) => {
    const [activeThemeFilters, setActiveThemeFilters] = useState<string[]>([]);
    const [showOnlyNotSeen, setShowOnlyNotSeen] = useState(true);
    const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());

    const themesInProgram = useMemo(() => {
        const ids = new Set<string>();
        objectives.forEach((card) => {
            card.tags_theme.forEach((t) => ids.add(t));
        });
        return allGrandThemes.filter((theme: GrandTheme) => ids.has(theme.id));
    }, [objectives]);

    const objectivesByPillar = useMemo(() => {
        const grouped: Record<string, PedagogicalContent[]> = {
            comprendre: [],
            observer: [],
            proteger: [],
        };
        let filtered = objectives;
        if (showOnlyNotSeen) {
            filtered = filtered.filter(
                (c) => !completedObjectives.has(c.id.toString())
            );
        }
        if (activeThemeFilters.length > 0) {
            filtered = filtered.filter((c) =>
                activeThemeFilters.some((t) => c.tags_theme.includes(t))
            );
        }
        filtered.forEach((card) => {
            const norm = card.dimension
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            let pillar: keyof typeof grouped = 'comprendre';
            if (norm.includes('observer')) pillar = 'observer';
            else if (norm.includes('proteg')) pillar = 'proteger';
            if (!grouped[pillar].some((c) => c.id === card.id)) {
                grouped[pillar].push(card);
            }
        });
        return grouped;
    }, [objectives, activeThemeFilters, showOnlyNotSeen, completedObjectives]);

    const handleThemeFilterToggle = (themeId: string) => {
        setActiveThemeFilters((prev) =>
            prev.includes(themeId)
                ? prev.filter((id) => id !== themeId)
                : [...prev, themeId]
        );
    };

    const handleToggleObjectiveWithAnimation = (cardId: string) => {
        setAnimatingOut((prev) => new Set([...prev, cardId]));
        setTimeout(() => {
            onToggleObjective(cardId);
            setAnimatingOut((prev) => {
                const newSet = new Set(prev);
                newSet.delete(cardId);
                return newSet;
            });
        }, 300);
    };

    if (objectives.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-16 px-4">
                    <h3 className="text-lg font-semibold">Le programme est vide</h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                        Allez dans l'onglet "Programme" pour définir les objectifs de ce stage.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-xl">Objectifs Pédagogiques</CardTitle>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                        <ListFilter className="mr-2 h-4 w-4" />
                                        Thèmes {activeThemeFilters.length > 0 && `(${activeThemeFilters.length})`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Filtrer par thème</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {themesInProgram.map((theme: GrandTheme) => (
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
                                <Switch
                                    id="show-not-seen"
                                    checked={showOnlyNotSeen}
                                    onCheckedChange={setShowOnlyNotSeen}
                                />
                                <Label htmlFor="show-not-seen" className="text-sm font-medium cursor-pointer">
                                    Non vus uniquement
                                </Label>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                {Object.entries(objectivesByPillar).map(([pillar, cards]) => {
                    const { icon: PillarIcon, label } =
                        AXE_CONFIG[pillar as keyof typeof AXE_CONFIG] || {
                            icon: 'div',
                            label: pillar,
                        };
                    const pillarStyle = PILLAR_STYLES[pillar as keyof typeof PILLAR_STYLES] || {};
                    if (cards.length === 0) return null;
                    return (
                        <div key={pillar}>
                            <h3 className={cn('text-xl font-semibold flex items-center gap-3 mb-4', pillarStyle.text)}>
                                <PillarIcon className="w-6 h-6" /> {label}
                            </h3>
                            <Accordion type="multiple" className="w-full space-y-2">
                                {cards.map((card) => (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 1, height: 'auto' }}
                                        animate={
                                            animatingOut.has(card.id.toString())
                                                ? { opacity: 0, height: 0, marginBottom: 0 }
                                                : { opacity: 1, height: 'auto' }
                                        }
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <AccordionItem value={card.id.toString()} className="border-b-0">
                                            <Card
                                                className={cn(
                                                    'transition-all overflow-hidden bg-card',
                                                    completedObjectives.has(card.id.toString())
                                                        ? 'opacity-50'
                                                        : 'opacity-100'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex items-stretch p-1 justify-between gap-2 border-l-4 rounded-l-md',
                                                        pillarStyle.border
                                                    )}
                                                >
                                                    {card.icon_tag && (
                                                        <div className="p-3 pl-2 flex items-center justify-center shrink-0">
                                                            <Image
                                                                src={`/assets/icons/${card.icon_tag}.png?v=${new Date().getTime()}`}
                                                                alt={card.icon_tag}
                                                                width={60}
                                                                height={60}
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={cn(
                                                            'flex-grow p-3 space-y-2',
                                                            !card.icon_tag && 'pl-4'
                                                        )}
                                                    >
                                                        <div className="flex flex-wrap gap-1">
                                                            {card.tags_theme.map((tid) => {
                                                                const theme = allGrandThemes.find((t: GrandTheme) => t.id === tid);
                                                                return theme ? (
                                                                    <Badge
                                                                        key={tid}
                                                                        variant="outline"
                                                                        className="font-normal"
                                                                    >
                                                                        {theme.title}
                                                                    </Badge>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                        <p className="font-medium text-foreground text-sm">
                                                            {card.question}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-2 pl-2 pr-1 shrink-0 pt-3">
                                                        <Switch
                                                            checked={completedObjectives.has(card.id.toString())}
                                                            onCheckedChange={() =>
                                                                handleToggleObjectiveWithAnimation(card.id.toString())
                                                            }
                                                            aria-label="Marquer comme vu"
                                                        />
                                                        <AccordionTrigger className="p-1 hover:no-underline [&>svg]:mx-auto">
                                                            <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                                                        </AccordionTrigger>
                                                    </div>
                                                </div>

                                                <AccordionContent>
                                                    <div className="border-t mx-3" />
                                                    <div className="px-3 pb-3 pt-2 text-muted-foreground text-sm space-y-2">
                                                        <p>
                                                            <span className="font-semibold text-foreground/80">Objectif:</span>{' '}
                                                            {card.objectif}
                                                        </p>
                                                        {card.tip && (
                                                            <p>
                                                                <span className="font-semibold text-foreground/80">Conseil:</span>{' '}
                                                                {card.tip}
                                                            </p>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </Card>
                                        </AccordionItem>
                                    </motion.div>
                                ))}
                            </Accordion>
                        </div>
                    );
                })}
                <DefisSuivi stageId={stageId} />
                <JeuxSuivi games={games} stageId={stageId} />
            </Card>
        </div>
    );
};

// ---------------------------------------------------------------------------
// DefisSuivi component (unchanged from original)
// ---------------------------------------------------------------------------
const DefisSuivi = ({ stageId }: { stageId: number }) => {
    console.log('[DefisSuivi] Component rendered for stageId:', stageId);
    const { toast } = useToast();
    const [isProcessing, startTransition] = useTransition();

    const [assignedDefis, setAssignedDefis] = useState<AssignedDefi[]>([]);
    const [defiToProve, setDefiToProve] = useState<
        { assignedDefi: AssignedDefi; defi: Defi } | null
    >(null);

    console.log('[DefisSuivi] assignedDefis:', assignedDefis);
    console.log('[DefisSuivi] defiToProve:', defiToProve);

    const fetchDefis = useCallback(async () => {
        const dbExploits = await getStageExploits(stageId);
        const mappedDefis: AssignedDefi[] = dbExploits.map((e) => ({
            id: e.id,
            stage_id: e.stage_id,
            defi_id: e.exploit_id,
            status: e.status as DefiStatus,
            completed_at: e.completed_at,
            preuve_url: (e.preuves_url as string[] | null)?.[0] || null,
        }));
        setAssignedDefis(mappedDefis);
    }, [stageId]);

    useEffect(() => {
        fetchDefis();
    }, [fetchDefis]);

    const assignedDefisDetails = useMemo(() => {
        console.log('[assignedDefisDetails] assignedDefis:', assignedDefis);
        console.log('[assignedDefisDetails] allDefis:', allDefis);
        const result = assignedDefis
            .map((am) => {
                const details = allDefis.find((m) => m.id === am.defi_id);
                return details ? { ...am, details } : null;
            })
            .filter((am): am is AssignedDefi & { details: Defi } => am !== null);
        console.log('[assignedDefisDetails] result:', result);
        return result;
    }, [assignedDefis]);

    const handleUpdateDefi = (
        assignedDefi: AssignedDefi,
        completed: boolean,
        preuveUrl?: string
    ) => {
        startTransition(async () => {
            const newStatus: DefiStatus = completed ? 'complete' : 'en_cours';
            const finalPreuveUrl = preuveUrl !== undefined ? preuveUrl : assignedDefi.preuve_url;

            const success = await updateStageExploitStatus(
                assignedDefi.stage_id,
                assignedDefi.defi_id,
                newStatus,
                finalPreuveUrl
            );

            if (success) {
                toast({ title: 'Progression du défi mise à jour' });
                fetchDefis();
            } else {
                toast({
                    title: 'Erreur',
                    description: "Échec de la mise à jour du défi.",
                    variant: 'destructive',
                });
            }
        });
    };

    const iconMap: { [key: string]: React.ElementType } = {
        Shield,
        Trash2,
        Wind,
        Fish,
        Map,
        Gamepad2,
        BookOpen,
        Trophy,
        Camera,
        Microscope,
        LandPlot,
        Compass,
        Waves,
        Leaf,
    };

    if (assignedDefisDetails.length === 0) return null;

    return (
        <div>
            <h3 className="text-xl font-semibold flex items-center gap-3 mb-4 text-amber-500">
                <Trophy className="w-6 h-6" />Défis à Réaliser
            </h3>
            <Accordion type="multiple" className="w-full space-y-2">
                {assignedDefisDetails.map((assignedDefi) => {
                    const defiDetails = assignedDefi.details;
                    if (!defiDetails) return null;
                    console.log('[DEFI RENDER]', defiDetails.description, 'type_preuve:', defiDetails.type_preuve);
                    const IconComponent = iconMap[defiDetails.icon] || Shield;
                    const isCompleted = assignedDefi.status === 'complete';
                    return (
                        <AccordionItem
                            value={defiDetails.id}
                            key={defiDetails.id}
                            className="border-b-0"
                        >
                            <Card
                                className={cn(
                                    'transition-all overflow-hidden',
                                    isCompleted ? 'bg-card opacity-60' : 'bg-card'
                                )}
                            >
                                <AccordionTrigger className="flex w-full p-3 text-left hover:no-underline">
                                    <div className="flex items-start gap-4 text-left flex-grow">
                                        <IconComponent className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-foreground">
                                                {defiDetails.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3">
                                    <div className="border-t pt-3 space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            {defiDetails.instruction}
                                        </p>
                                        {(defiDetails.type_preuve === 'checkbox' ||
                                            defiDetails.type_preuve === 'action' ||
                                            defiDetails.type_preuve === 'quiz') && (
                                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                    <Checkbox
                                                        id={`defi-${assignedDefi.id}`}
                                                        checked={isCompleted}
                                                        onCheckedChange={(checked) =>
                                                            handleUpdateDefi(assignedDefi, !!checked)
                                                        }
                                                        disabled={isProcessing}
                                                    />
                                                    <label
                                                        htmlFor={`defi-${assignedDefi.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Marquer comme terminé
                                                    </label>
                                                </div>
                                            )}
                                        {defiDetails.type_preuve === 'photo' && (
                                            <div className="p-2 bg-muted/50 rounded-md">
                                                {isCompleted && assignedDefi.preuve_url && (
                                                    <img
                                                        src={assignedDefi.preuve_url}
                                                        alt={`Preuve pour ${defiDetails.description}`}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-md object-cover mb-2"
                                                    />
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        console.log('[BUTTON CLICK] Setting defiToProve:', {
                                                            assignedDefi,
                                                            defi: defiDetails,
                                                        });
                                                        setDefiToProve({ assignedDefi, defi: defiDetails });
                                                    }}
                                                    disabled={isProcessing}
                                                >
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    {isCompleted ? 'Modifier la preuve' : 'Valider avec une photo'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    );
                })}
            </Accordion>
            <CameraProofModal
                defiToProve={defiToProve}
                setDefiToProve={setDefiToProve}
                onUpdateDefi={(assignedDefi: AssignedDefi, defi: Defi, completed: boolean, url?: string) =>
                    handleUpdateDefi(assignedDefi, completed, url)
                }
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// JeuxSuivi component (unchanged)
// ---------------------------------------------------------------------------
const JeuxSuivi = ({ games, stageId }: { games: Game[]; stageId: number }) => {
    const [gameHistory, setGameHistory] = useState<StageGameHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGameHistory = useCallback(async () => {
        setLoading(true);
        const history = await getStageGameHistory(stageId);
        setGameHistory(history);
        setLoading(false);
    }, [stageId]);

    useEffect(() => {
        fetchGameHistory();
    }, [fetchGameHistory]);

    if (games.length === 0) return null;

    return (
        <div>
            <h3 className="text-xl font-semibold flex items-center gap-3 mb-4 text-purple-400">
                <Gamepad2 className="w-6 h-6" /> Jeux &amp; Quiz
            </h3>
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </div>
                ) : (
                    games.map((game) => {
                        const gameResult = gameHistory.find((r) => r.game_id === game.id);
                        return (
                            <Card
                                key={game.id}
                                className="hover:bg-muted/50 transition-colors group relative"
                            >
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{game.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Thème: {game.theme}
                                        </p>
                                        {gameResult && (
                                            <Badge
                                                variant={gameResult.percentage >= 75 ? 'default' : 'secondary'}
                                                className="mt-2"
                                            >
                                                Score: {gameResult.percentage}%
                                            </Badge>
                                        )}
                                    </div>
                                    <Link
                                        href={`/jeux/${game.id}`}
                                        className={cn(
                                            buttonVariants({ variant: 'secondary', size: 'sm' })
                                        )}
                                    >
                                        <Play className="w-4 h-4 mr-2" /> Lancer
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Remaining components (RessourcesView, JeuxRessources, SettingsView, etc.)
// are unchanged from the original file after line 70.
// ---------------------------------------------------------------------------