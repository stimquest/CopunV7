

'use client';

import React, { useState, useTransition, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { createGame, getFilteredGameCards, getStageById, getSortiesForStage } from '@/app/actions';
import { Gamepad2, Loader2, ChevronLeft, Wand2, Dices } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { GameData, GameCardType, Stage, TriageItem, MotsEnRafaleItem, DilemmeDuMarinItem, QuizzItem, TriageCard, MotsEnRafaleCard, DilemmeDuMarinCard, QuizzCard, GrandTheme } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { groupedThemes } from '@/data/etages';

const allThemes = groupedThemes.flatMap(g => g.themes);


const GAME_TYPES: { id: GameCardType, label: string }[] = [
    { id: 'triage', label: 'Vrai ou Faux' },
    { id: 'mots', label: 'Mots en Rafale' },
    { id: 'dilemme', label: 'Dilemmes' },
    { id: 'quizz', label: 'Quizz' },
];


function GameGeneratorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isCreating, startCreateTransition] = useTransition();

  const stageId = searchParams.get('stageId') ? parseInt(searchParams.get('stageId') as string, 10) : null;
  
  const [stage, setStage] = useState<Stage | null>(null);
  const [title, setTitle] = useState('');
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTypes, setSelectedTypes] = useState<GameCardType[]>(['triage', 'mots', 'dilemme', 'quizz']);
  const [questionCount, setQuestionCount] = useState([10]);


  useEffect(() => {
    const fetchStageInfo = async () => {
        setIsLoading(true);
        if (stageId) {
            const [stageData, sortiesData] = await Promise.all([
                getStageById(stageId),
                getSortiesForStage(stageId)
            ]);

            if (stageData) {
                setStage(stageData);
                const startDate = format(new Date(stageData.start_date), 'd MMM', { locale: fr });
                const endDate = format(new Date(stageData.end_date), 'd MMM yyyy', { locale: fr });
                
                setTitle(`Jeu pour ${stageData.title}`);

                let stageThemeSet = new Set<string>();
                sortiesData.forEach(sortie => {
                    if (sortie.themes) sortie.themes.forEach(t => stageThemeSet.add(t));
                });
                const themeTitles = Array.from(stageThemeSet);
                const themeIds = themeTitles.map(title => allThemes.find(t => t.title === title)?.id).filter(Boolean) as string[];
                setSelectedThemeIds(themeIds);
            }
        } else {
            setTitle('Nouveau Jeu Aléatoire');
        }
        setIsLoading(false);
    }
    fetchStageInfo();
  }, [stageId]);

  const handleTypeToggle = (type: GameCardType) => {
    setSelectedTypes(prev => 
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  
  const handleThemeToggle = (themeId: string) => {
    setSelectedThemeIds(prev =>
        prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]
    );
  };
  
  const groupedThemeOptions = useMemo(() => {
    return groupedThemes.map(group => ({
        ...group,
        themes: group.themes.map(theme => ({
            ...theme,
            selected: selectedThemeIds.includes(theme.id)
        }))
    }))
  }, [selectedThemeIds]);

  const handleCreateGame = () => {
    startCreateTransition(async () => {
        if (selectedTypes.length === 0) {
            toast({ title: "Sélection requise", description: "Veuillez choisir au moins un type de question.", variant: "destructive" });
            return;
        }
        
        const themeTitles = selectedThemeIds.map(id => allThemes.find(t => t.id === id)?.title).filter(Boolean) as string[];

        const filteredCards = await getFilteredGameCards(selectedTypes, themeTitles);
        
        if (filteredCards.length === 0) {
            toast({ title: "Aucune carte trouvée", description: "Impossible de trouver des cartes avec les filtres actuels. Essayez d'élargir votre recherche.", variant: "destructive" });
            return;
        }

        const shuffled = filteredCards.sort(() => 0.5 - Math.random());
        const selectedCards = shuffled.slice(0, questionCount[0]);

        const triageItems: TriageItem[] = selectedCards.filter((c): c is TriageCard => c.type === 'triage').map(c => ({id: c.id, statement: c.statement, isTrue: c.isTrue, theme: c.theme, related_objective_id: c.related_objective_id}));
        const motsItems: MotsEnRafaleItem[] = selectedCards.filter((c): c is MotsEnRafaleCard => c.type === 'mots').map(c => ({id: c.id, definition: c.definition, answer: c.answer, theme: c.theme, related_objective_id: c.related_objective_id}));
        const dilemmeItems: DilemmeDuMarinItem[] = selectedCards.filter((c): c is DilemmeDuMarinCard => c.type === 'dilemme').map(c => ({id: c.id, optionA: c.optionA, optionB: c.optionB, explanation: c.explanation, theme: c.theme, related_objective_id: c.related_objective_id}));
        const quizzItems: QuizzItem[] = selectedCards.filter((c): c is QuizzCard => c.type === 'quizz').map(c => ({id: c.id, question: c.question, answers: c.answers, correctAnswerIndex: c.correctAnswerIndex, theme: c.theme, related_objective_id: c.related_objective_id}));

        const themeString = themeTitles.join(', ') || 'Thèmes variés';

        const gameData: GameData = {
            triageCôtier: { title: "Le Triage Côtier", instruction: "Démêle le vrai du faux dans les affirmations suivantes.", items: triageItems },
            motsEnRafale: { title: "Les Mots en Rafale", instruction: "Retrouve les mots qui correspondent à ces définitions !", items: motsItems },
            dilemmeDuMarin: { title: "Le Dilemme du Marin", instruction: "Que préfères-tu ? Il n'y a pas de mauvaise réponse, mais chaque choix a une conséquence !", items: dilemmeItems },
            leGrandQuizz: { title: "Le Grand Quizz", instruction: "Une seule bonne réponse par question !", items: quizzItems},
        };

        const newGame = await createGame(title, themeString, gameData, stageId);
      
        if (newGame) {
            toast({ title: "Jeu créé avec succès !", description: "Le jeu a été généré et ajouté à votre bibliothèque." });
            router.push(`/jeux/${newGame.id}`);
        } else {
            toast({ title: "Erreur de création", description: "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
        }
    });
  }

  const backLink = stageId ? `/stages/${stageId}` : '/jeux';

  if (isLoading) {
      return (
          <div className="flex flex-col gap-4 justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement du générateur...</p>
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link href={backLink} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" />
        {stageId ? `Retour au stage` : `Retour à la bibliothèque`}
      </Link>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><Wand2 className="w-8 h-8 text-primary"/> Générateur de Jeu Assisté</h1>
        <p className="text-muted-foreground">Configurez votre jeu idéal et laissez l'assistant le composer pour vous en quelques secondes.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>1. Informations sur le jeu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="title">Titre du jeu</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du jeu"/>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle>2. Thèmes du jeu</CardTitle>
            <CardContent className="text-sm text-muted-foreground pt-2">
              {stageId ? "Les thèmes du stage sont pré-sélectionnés. " : ""}
              Cliquez sur les badges pour personnaliser la sélection.
            </CardContent>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupedThemeOptions.map(group => (
            <div key={group.label}>
              <h4 className="font-semibold text-muted-foreground mb-2">{group.label}</h4>
              <div className="flex flex-wrap gap-2">
                {group.themes.map(theme => {
                   const Icon = theme.icon;
                   return (
                      <Badge
                        key={theme.id}
                        variant={theme.selected ? 'default' : 'secondary'}
                        onClick={() => handleThemeToggle(theme.id)}
                        className="text-base cursor-pointer px-3 py-1"
                      >
                         <Icon className="w-4 h-4 mr-2" />
                        {theme.title}
                      </Badge>
                   )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle>3. Contenu du jeu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label className="font-medium">Types de questions à inclure</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {GAME_TYPES.map(type => (
                        <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={type.id} 
                                checked={selectedTypes.includes(type.id)}
                                onCheckedChange={() => handleTypeToggle(type.id)}
                            />
                            <label htmlFor={type.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {type.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <Label className="font-medium">Nombre de questions ({questionCount[0]})</Label>
                 <Slider 
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    min={5}
                    max={25}
                    step={1}
                    className="mt-3"
                 />
            </div>

        </CardContent>
      </Card>


        <Button onClick={handleCreateGame} disabled={isCreating} className="w-full text-lg py-6">
            {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Dices className="mr-2 h-5 w-5" />}
            {isCreating ? 'Génération en cours...' : `Générer le jeu`}
        </Button>
    </div>
  );
}

export default function GameGeneratorPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <GameGeneratorPageContent />
    </Suspense>
  );
}

