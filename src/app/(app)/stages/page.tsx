

'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, Calendar, Users, ChevronDown, CheckCircle2, BookOpen, Eye, Shield, Trophy, ArrowRight, Gamepad2, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CreateStageForm } from '@/components/create-stage-form';
import { format, parseISO, isBefore, isAfter, startOfToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Stage, GrandTheme, AssignedDefi, Defi, Game, GameProgress, ThemeScore, DefiProgress } from '@/lib/types';
import { getStages, createStage as serverCreateStage, getAllSorties, getAllCompletedObjectives, getAllStageExploits, getAllStageGameHistory, getPedagogicalContentMinimal, getAllGameCardsMinimal } from '@/app/actions';
import { supabaseOffline } from '@/lib/supabase-offline';
import { getStagesOfflineAware } from '@/lib/offline-actions';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { groupedThemes } from '@/data/etages';
import { allDefis } from '@/data/defis';

type ThemeProgress = {
    [themeTitle: string]: { completed: number, total: number };
};

interface StageWithProgress extends Stage {
    objectivesProgress: ThemeProgress;
    defisProgress: DefiProgress;
    gamesProgress: GameProgress;
    mainThemes: GrandTheme[];
}

const allThemes = groupedThemes.flatMap(g => g.themes);


const StageCard = ({ stage }: { stage: StageWithProgress }) => {
    const today = startOfToday();
    const startDate = parseISO(stage.start_date);
    const endDate = parseISO(stage.end_date);

    let status: 'À venir' | 'En cours' | 'Passé';
    if (isBefore(endDate, today)) {
        status = 'Passé';
    } else if (isAfter(startDate, today)) {
        status = 'À venir';
    } else {
        status = 'En cours';
    }

    const statusColors = {
        'À venir': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
        'Passé': 'bg-gray-100 text-gray-700 border-gray-200',
    }
    
    const [mainTitle, ...subtitles] = stage.title.split(' - ');
    const subtitle = subtitles.join(' - ');

    const objectivesPercentage = useMemo(() => {
        const totals = Object.values(stage.objectivesProgress).reduce((acc, p) => {
            acc.completed += p.completed;
            acc.total += p.total;
            return acc;
        }, { completed: 0, total: 0 });
        return totals.total > 0 ? (totals.completed / totals.total) * 100 : 0;
    }, [stage.objectivesProgress]);

    const defisPercentage = useMemo(() => {
        const { completed, total } = stage.defisProgress;
        return total > 0 ? (completed / total) * 100 : 0;
    }, [stage.defisProgress]);

    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {mainTitle}
                    </CardTitle>
                    <Badge variant="outline" className={cn(statusColors[status], 'shrink-0')}>{status}</Badge>
                </div>
                <CardDescription className="flex items-center flex-wrap text-xs">
                    {subtitle ? (
                        <>
                            <span className="font-medium">{subtitle}</span>
                            <span className="mx-1.5">&middot;</span>
                            <span>{stage.type}</span>
                        </>
                    ) : (
                        stage.type
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(startDate, "d MMM", { locale: fr })} - {format(endDate, "d MMM yyyy", { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{stage.participants} participants</span>
                    </div>
                </div>
                 <div className="space-y-3 pt-2">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="objectives" className="border-b-0">
                             <AccordionTrigger className="p-0 hover:no-underline text-xs text-muted-foreground w-full flex-col items-start">
                                 <div className="w-full">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className='flex items-center gap-1.5'><BookOpen className="w-3.5 h-3.5" /> Objectifs Pédagogiques</span>
                                        <span>{Math.round(objectivesPercentage)}%</span>
                                    </div>
                                    <Progress value={objectivesPercentage} className="h-1.5"/>
                                 </div>
                             </AccordionTrigger>
                             <AccordionContent className="pt-4 space-y-2">
                                {Object.keys(stage.objectivesProgress).length > 0 ? (
                                    Object.entries(stage.objectivesProgress).map(([themeTitle, p]) => {
                                         const theme = stage.mainThemes?.find(t => t.title === themeTitle);
                                         if (!theme) return null;
                                         const ThemeIcon = theme.icon;
                                         const percentage = p.total > 0 ? (p.completed / p.total) * 100 : 0;
                                         if(p.total === 0) return null;

                                         return (
                                             <div key={theme.id}>
                                                 <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                                     <span className='flex items-center gap-1.5'><ThemeIcon className="w-3.5 h-3.5" /> {theme.title}</span>
                                                     <span>{p.completed} / {p.total}</span>
                                                 </div>
                                                 <Progress value={percentage} className="h-1.5"/>
                                             </div>
                                         )
                                    })
                                ) : (
                                    <p className="text-xs text-muted-foreground text-center py-2">Aucun programme d'objectifs défini.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="games" className="border-b-0">
                            <AccordionTrigger className="p-0 hover:no-underline text-xs text-muted-foreground w-full flex-col items-start">
                                <div className="w-full">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                        <span className='flex items-center gap-1.5'><Gamepad2 className="w-3.5 h-3.5 text-purple-500" /> Jeux &amp; Quiz</span>
                                        <span>{stage.gamesProgress.averageScore > 0 ? `${stage.gamesProgress.averageScore}%` : 'N/A'}</span>
                                    </div>
                                    <Progress value={stage.gamesProgress.averageScore} className="h-1.5" indicatorClassName="bg-purple-500"/>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-2">
                                {Object.keys(stage.gamesProgress.themeScores).length > 0 ? (
                                    Object.entries(stage.gamesProgress.themeScores).map(([themeTitle, score]) => {
                                        const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                                        return (
                                             <div key={themeTitle}>
                                                 <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                                     <span className='flex items-center gap-1.5'>{themeTitle}</span>
                                                     <span>{score.correct} / {score.total}</span>
                                                 </div>
                                                 <Progress value={percentage} className="h-1.5" indicatorClassName="bg-purple-500" />
                                             </div>
                                        )
                                    })
                                ) : (
                                     <p className="text-xs text-muted-foreground text-center py-2">Aucun jeu joué pour ce stage.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                    <div>
                         <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                            <span className='flex items-center gap-1.5'><Trophy className="w-3.5 h-3.5" /> Défis</span>
                             <span>{Math.round(defisPercentage)}%</span>
                        </div>
                        <Progress value={defisPercentage} className="h-1.5" indicatorClassName="bg-amber-500"/>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="pt-4 border-t gap-2">
                <Button asChild variant="outline" className="flex-1">
                    <Link href={`/stages/${stage.id}?tab=suivi`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Suivi
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                    <Link href={`/stages/${stage.id}?tab=séances`}>
                        <Anchor className="mr-2 h-4 w-4" />
                        Édition
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function StageManagerPage() {
    const [stagesWithProgress, setStagesWithProgress] = useState<StageWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, startCreateTransition] = useTransition();
    const { toast } = useToast();
    const { isOnline, wasOffline } = useOnlineStatus();

    const fetchStages = async () => {
        setLoading(true);
        const startTime = performance.now();

        // Charger toutes les données en une seule fois (optimisation)
        console.log('[fetchStages] 🚀 Starting data fetch...');
        const fetchStart = performance.now();

        const [
            stagesData,
            gameCardsMinimal,
            pedagogicalMinimal,
            allCompletedObjectivesMap,
            allExploitsMap,
            allGameHistoryMap,
            allSortiesMap
        ] = await Promise.all([
            getStagesOfflineAware(),
            getAllGameCardsMinimal(),
            getPedagogicalContentMinimal(),
            getAllCompletedObjectives(),
            getAllStageExploits(),
            getAllStageGameHistory(),
            getAllSorties(),
        ]);

        console.log(`[fetchStages] ⏱️ Initial data fetch took ${(performance.now() - fetchStart).toFixed(0)}ms`);

        // Build lookup maps for O(1) access
        const pedagogicMap = new Map(pedagogicalMinimal.map((p: any) => [p.id.toString(), p]));
        const gameCardThemeMap = new Map(gameCardsMinimal.map((g: any) => [g.id, g.theme]));
        const themeByTitleMap = new Map(allThemes.map(t => [t.title, t]));

        const stagesWithProgressData: StageWithProgress[] = [];

        for (const stage of (stagesData || [])) {
            const sorties = allSortiesMap.get(stage.id) || [];
            const programSortie = sorties.find((s: any) => (s.selected_content?.program?.length ?? 0) > 0);

            const programObjectiveIds = programSortie?.selected_content?.program?.map(String) || [];

            // Completed objectives
            const completedObjectivesFromDb = allCompletedObjectivesMap.get(stage.id) || [];
            const completedIdsSet = new Set(completedObjectivesFromDb);

            // Main themes
            let mainThemes: GrandTheme[] = [];
            if (programSortie?.selected_content?.themes) {
                const themeTitles = programSortie.selected_content.themes as string[];
                mainThemes = themeTitles
                    .map(title => themeByTitleMap.get(title))
                    .filter((t): t is GrandTheme => t !== undefined);
            }

            // Objectives progress
            const objectivesProgress: ThemeProgress = {};
            mainThemes.forEach(theme => {
                objectivesProgress[theme.title] = { completed: 0, total: 0 };
            });

            for (const objId of programObjectiveIds) {
                const ped = pedagogicMap.get(objId) as any;
                if (!ped || !ped.tags_theme) continue;
                const themeIds = ped.tags_theme;
                for (const theme of mainThemes) {
                    if (themeIds.includes(theme.id)) {
                        objectivesProgress[theme.title].total++;
                        if (completedIdsSet.has(objId)) {
                            objectivesProgress[theme.title].completed++;
                        }
                    }
                }
            }

            // Defis progress
            const stageExploits = allExploitsMap.get(stage.id) || [];
            const defisProgress: DefiProgress = {
                total: stageExploits.length,
                completed: stageExploits.filter((e: any) => e.status === 'complete').length,
            };

            // Games progress
            const gameHistory = allGameHistoryMap.get(stage.id) || [];
            let totalCorrect = 0;
            let totalQuestions = 0;
            const themeScores: Record<string, ThemeScore> = {};

            gameHistory.forEach((entry: any) => {
                totalCorrect += entry.score;
                totalQuestions += entry.total;

                if (entry.results && Array.isArray(entry.results)) {
                    (entry.results as any[]).forEach((result: any) => {
                        const cardId = result.cardId;
                        const theme = cardId ? (gameCardThemeMap.get(cardId) || result.theme || 'Inconnu') : 'Inconnu';
                        if (!themeScores[theme]) {
                            themeScores[theme] = { correct: 0, total: 0 };
                        }
                        if (result.isCorrect !== undefined) {
                            themeScores[theme].total++;
                            if (result.isCorrect) {
                                themeScores[theme].correct++;
                            }
                        }
                    });
                }
            });

            const gamesProgress: GameProgress = {
                averageScore: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
                themeScores: themeScores,
            };

            stagesWithProgressData.push({
                ...stage,
                objectivesProgress,
                defisProgress,
                gamesProgress,
                mainThemes,
            });
        }

        setStagesWithProgress(stagesWithProgressData);
        console.log(`[fetchStages] ✅ Total time: ${(performance.now() - startTime).toFixed(0)}ms for ${stagesWithProgressData.length} stages`);
        setLoading(false);
    };

    useEffect(() => {
        fetchStages();
    }, []);

    // Synchroniser quand on revient online
    useEffect(() => {
        if (isOnline && wasOffline) {
            supabaseOffline.syncOfflineActions();
            fetchStages(); // Recharger les données
        }
    }, [isOnline, wasOffline]);

    // Recharger les stages lorsque la fenêtre regagne le focus pour synchroniser le localStorage
    useEffect(() => {
        const handleFocus = () => {
            // Recharger uniquement si nous ne sommes pas déjà en train de charger
            if (!loading) {
                fetchStages();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [loading]);

    const { currentStages, upcomingStages, pastStages } = useMemo(() => {
        const today = startOfToday();
        const sortedStages = stagesWithProgress.sort((a,b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());
        
        return sortedStages.reduce(
            (acc, stage) => {
                const startDate = parseISO(stage.start_date);
                const endDate = parseISO(stage.end_date);
                 if (isBefore(endDate, today)) {
                    acc.pastStages.push(stage);
                } else if (isAfter(startDate, today)) {
                    acc.upcomingStages.push(stage);
                } else {
                    acc.currentStages.push(stage);
                }
                return acc;
            },
            { currentStages: [] as StageWithProgress[], upcomingStages: [] as StageWithProgress[], pastStages: [] as StageWithProgress[] }
        );
    }, [stagesWithProgress]);


    const handleStageCreate = (data: Omit<Stage, 'id' | 'created_at'>) => {
        startCreateTransition(async () => {
            const created = await serverCreateStage(data);
            if (created) {
                await fetchStages(); 
                toast({
                    title: "Stage créé",
                    description: "Le nouveau stage a été ajouté.",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "La création du stage a échoué.",
                    variant: "destructive"
                });
            }
        });
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pt-safe-top md:pt-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">Mes Stages</h1>
                    <p className="text-muted-foreground">Planifiez, suivez et gérez tous vos stages.</p>
                </div>
                <CreateStageForm onStageCreate={handleStageCreate} isCreating={isCreating} />
            </div>

            {loading ? (
                <div className="p-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                    <p>Chargement des stages...</p>
                </div>
            ) : stagesWithProgress.length > 0 ? (
                <div className="space-y-8">
                    {currentStages.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">En cours</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentStages.map(stage => <StageCard key={stage.id} stage={stage} />)}
                            </div>
                        </section>
                    )}

                    {upcomingStages.length > 0 && (
                        <section>
                             <h2 className="text-2xl font-semibold mb-4 text-foreground">À venir</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingStages.map(stage => <StageCard key={stage.id} stage={stage} />)}
                            </div>
                        </section>
                    )}

                    {pastStages.length > 0 && (
                        <section>
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="past-stages" className="border-b-0">
                                    <AccordionTrigger className="text-xl font-semibold hover:no-underline text-muted-foreground">
                                        Stages passés ({pastStages.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                            {pastStages.sort((a,b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()).map(stage => (
                                                <StageCard key={stage.id} stage={stage} />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p className="text-lg mb-2">Aucun stage planifié.</p>
                        <p>Utilisez le bouton "Nouveau Stage" pour commencer.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
