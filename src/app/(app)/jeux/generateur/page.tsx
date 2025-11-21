

'use client';

import React, { useState, useTransition, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { createGame, getFilteredGameCards, getStageById, getSortiesForStage, getAllGameCardsFromDb } from '@/app/actions';
import { Gamepad2, Loader2, ChevronLeft, Wand2, Dices, Settings, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { GameData, GameCardType, Stage, TriageItem, MotsEnRafaleItem, DilemmeDuMarinItem, QuizzItem, TriageCard, MotsEnRafaleCard, DilemmeDuMarinCard, QuizzCard, GrandTheme, GameCard } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { groupedThemes } from '@/data/etages';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
  const [creationMode, setCreationMode] = useState<'automatic' | 'manual'>('automatic');
  
  // États pour le mode manuel
  const [allCards, setAllCards] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);


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

  // Fonctions pour le mode manuel
  const loadAllCards = async () => {
    setCardsLoading(true);
    const cards = await getAllGameCardsFromDb();
    setAllCards(cards);
    setCardsLoading(false);
  };

  const handleModeChange = async (mode: 'automatic' | 'manual') => {
    setCreationMode(mode);
    if (mode === 'manual' && allCards.length === 0) {
      await loadAllCards();
    }
  };

  const handleCardToggle = (card: GameCard) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  // Fonction helper pour obtenir le contenu principal d'une carte
  const getCardContent = (card: GameCard): string => {
    if ('statement' in card) return card.statement;
    if ('definition' in card) return card.definition;
    if ('question' in card) return card.question;
    if ('optionA' in card && 'optionB' in card) return `${card.optionA} ou ${card.optionB}`;
    return 'Contenu non disponible';
  };

  const filteredCardsForManual = useMemo(() => {
    if (creationMode !== 'manual') return [];
    
    return allCards.filter(card => {
      // Filtrer par thème sélectionné si des thèmes sont choisis
      if (selectedThemeIds.length > 0) {
        const cardTheme = allThemes.find(t => t.title === card.theme);
        if (!cardTheme || !selectedThemeIds.includes(cardTheme.id)) {
          return false;
        }
      }
      
      // Filtrer par type sélectionné si des types sont choisis
      if (selectedTypes.length > 0 && !selectedTypes.includes(card.type)) {
        return false;
      }
      
      return true;
    });
  }, [allCards, selectedThemeIds, selectedTypes, creationMode]);

  const handleCreateGame = () => {
    startCreateTransition(async () => {
        if (selectedTypes.length === 0) {
            toast({ title: "Sélection requise", description: "Veuillez choisir au moins un type de question.", variant: "destructive" });
            return;
        }
        
        const themeTitles = selectedThemeIds.map(id => allThemes.find(t => t.id === id)?.title).filter(Boolean) as string[];
        
        let cardsToUse: GameCard[] = [];
        
        if (creationMode === 'manual') {
            if (selectedCards.length === 0) {
                toast({ title: "Aucune carte sélectionnée", description: "Veuillez sélectionner au moins une carte pour créer votre jeu.", variant: "destructive" });
                return;
            }
            cardsToUse = selectedCards;
        } else {
            // Mode automatique
            const filteredCards = await getFilteredGameCards(selectedTypes, themeTitles);
            
            if (filteredCards.length === 0) {
                toast({ title: "Aucune carte trouvée", description: "Impossible de trouver des cartes avec les filtres actuels. Essayez d'élargir votre recherche.", variant: "destructive" });
                return;
            }

            const shuffled = filteredCards.sort(() => 0.5 - Math.random());
            cardsToUse = shuffled.slice(0, questionCount[0]);
        }

        const triageItems: TriageItem[] = cardsToUse.filter((c): c is TriageCard => c.type === 'triage').map(c => ({id: c.id, statement: c.statement, isTrue: c.isTrue, theme: c.theme, related_objective_id: c.related_objective_id}));
        const motsItems: MotsEnRafaleItem[] = cardsToUse.filter((c): c is MotsEnRafaleCard => c.type === 'mots').map(c => ({id: c.id, definition: c.definition, answer: c.answer, theme: c.theme, related_objective_id: c.related_objective_id}));
        const dilemmeItems: DilemmeDuMarinItem[] = cardsToUse.filter((c): c is DilemmeDuMarinCard => c.type === 'dilemme').map(c => ({id: c.id, optionA: c.optionA, optionB: c.optionB, explanation: c.explanation, theme: c.theme, related_objective_id: c.related_objective_id}));
        const quizzItems: QuizzItem[] = cardsToUse.filter((c): c is QuizzCard => c.type === 'quizz').map(c => ({id: c.id, question: c.question, answers: c.answers, correctAnswerIndex: c.correctAnswerIndex, theme: c.theme, related_objective_id: c.related_objective_id}));

        const themeString = themeTitles.join(', ') || 'Thèmes variés';

        const gameData: GameData = {
            triageCôtier: { title: "Le Triage Côtier", instruction: "Démêle le vrai du faux dans les affirmations suivantes.", items: triageItems },
            motsEnRafale: { title: "Les Mots en Rafale", instruction: "Retrouve les mots qui correspondent à ces définitions !", items: motsItems },
            dilemmeDuMarin: { title: "Le Dilemme du Marin", instruction: "Que préfères-tu ? Il n'y a pas de mauvaise réponse, mais chaque choix a une conséquence !", items: dilemmeItems },
            leGrandQuizz: { title: "Le Grand Quizz", instruction: "Une seule bonne réponse par question !", items: quizzItems},
        };

        const newGame = await createGame(title, themeString, gameData, stageId);
      
        if (newGame) {
            const modeText = creationMode === 'manual' ? 'créé manuellement' : 'généré';
            toast({ title: "Jeu créé avec succès !", description: `Le jeu a été ${modeText} et ajouté à votre bibliothèque.` });
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
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><Wand2 className="w-8 h-8 text-primary"/> Créateur de Jeux</h1>
        <p className="text-muted-foreground">Créez votre jeu idéal en utilisant la génération automatique ou en sélectionnant manuellement les cartes.</p>
      </div>
      
      <Tabs value={creationMode} onValueChange={(value) => handleModeChange(value as 'automatic' | 'manual')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automatic" className="flex items-center gap-2">
            <Dices className="w-4 h-4" />
            Génération Automatique
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Sélection Manuelle
          </TabsTrigger>
        </TabsList>
      
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

        <TabsContent value="automatic" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>3. Contenu du jeu - Génération Automatique</CardTitle>
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
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>3. Contenu du jeu - Sélection Manuelle</CardTitle>
                <CardDescription>
                    Sélectionnez précisément les cartes que vous souhaitez inclure dans votre jeu. 
                    Vous pouvez filtrer par type et thème pour faciliter votre sélection.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="font-medium">Types de questions à afficher</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {GAME_TYPES.map(type => (
                            <div key={type.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`manual-${type.id}`} 
                                    checked={selectedTypes.includes(type.id)}
                                    onCheckedChange={() => handleTypeToggle(type.id)}
                                />
                                <label htmlFor={`manual-${type.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {type.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <Label className="font-medium">Cartes disponibles ({filteredCardsForManual.length})</Label>
                        <Badge variant="outline">{selectedCards.length} sélectionnées</Badge>
                    </div>
                    
                    {cardsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredCardsForManual.map(card => {
                                const isSelected = selectedCards.some(c => c.id === card.id);
                                return (
                                    <div 
                                        key={card.id}
                                        className={cn(
                                            "p-3 border rounded-lg cursor-pointer transition-colors",
                                            isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                                        )}
                                        onClick={() => handleCardToggle(card)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox 
                                                checked={isSelected}
                                                onChange={() => {}} // Géré par onClick du parent
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {getCardContent(card)}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {card.type} • {card.theme}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {filteredCardsForManual.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucune carte ne correspond aux filtres actuels.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


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

