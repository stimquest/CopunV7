

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getGameById, getFilteredGameCards, saveQuizAttempt, getPedagogicalContent, saveStageGameResult } from '@/app/actions';
import { useAuth } from '@/lib/auth';
import type { Game, GameCard, TriageCard, MotsEnRafaleCard, DilemmeDuMarinCard, QuizzCard, GameCardType, ContentCard, QuizAttempt, PedagogicalContent } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCw, Trophy, Check, ThumbsUp, ThumbsDown, Lightbulb, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from '@/hooks/use-toast';


type GameMode = 'play' | 'validation';
type AnswerResult = {
    cardId: number;
    isCorrect: boolean;
};
type ValidationResult = {
    card: QuizzCard;
    userAnswerIndex: number;
    isCorrect: boolean;
};

function GameDisplayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // --- State for game data ---
  const [game, setGame] = useState<Game | null>(null);
  const [allGameCards, setAllGameCards] = useState<GameCard[]>([]);
  const [allPedagogicalContent, setAllPedagogicalContent] = useState<PedagogicalContent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- State for game flow ---
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  
  // --- Params parsing ---
  const gameId = params.gameId ? (params.gameId === 'validation' ? null : parseInt(params.gameId as string, 10)) : null;
  const objectiveIdsFromQuery = searchParams.get('objectives');
  const stageIdFromQuery = searchParams.get('stageId');


  useEffect(() => {
    const loadGame = async () => {
        setLoading(true);
        if (gameId) { // Playing a pre-built game
            setGameMode('play');
            const gameData = await getGameById(gameId);
            setGame(gameData);
            if (gameData) {
                const cards = [
                    ...(gameData.game_data.triageCôtier?.items.map(i => ({...i, type: 'triage' as const})) || []),
                    ...(gameData.game_data.motsEnRafale?.items.map(i => ({...i, type: 'mots' as const})) || []),
                    ...(gameData.game_data.dilemmeDuMarin?.items.map(i => ({...i, type: 'dilemme' as const})) || []),
                    ...(gameData.game_data.leGrandQuizz?.items.map(i => ({...i, type: 'quizz' as const})) || [])
                ].sort(() => Math.random() - 0.5);
                setAllGameCards(cards);
            }
        } else if (objectiveIdsFromQuery) { // Knowledge validation quiz
            setGameMode('validation');
            const [quizCards, pedagogicalContent] = await Promise.all([
                getFilteredGameCards(['quizz'], [], objectiveIdsFromQuery.split(',')),
                getPedagogicalContent()
            ]);
            setAllPedagogicalContent(pedagogicalContent);

            // Determine the main theme of the quiz
            const themeCounts: Record<string, number> = {};
            quizCards.forEach(card => {
                themeCounts[card.theme] = (themeCounts[card.theme] || 0) + 1;
            });
            const mainTheme = Object.keys(themeCounts).reduce((a, b) => themeCounts[a] > themeCounts[b] ? a : b, 'Thème varié');

            setAllGameCards(quizCards.sort(() => Math.random() - 0.5));
            setGame({ id: 0, created_at: '', title: 'Validation des Connaissances', theme: mainTheme, game_data: {} as any, stage_id: stageIdFromQuery ? parseInt(stageIdFromQuery) : null});
        }
        setLoading(false);
    };
    loadGame();
  }, [gameId, objectiveIdsFromQuery, stageIdFromQuery]);
  
  const handleNextCard = (wasCorrect?: boolean, userAnswerIndex?: number) => {
    const currentCard = allGameCards[currentCardIndex];
    if (wasCorrect) {
        setScore(prev => prev + 1);
    }

    if(wasCorrect !== undefined) { // Exclude dilemma cards that don't have a correct/incorrect state
        setAnswerResults(prev => [...prev, { cardId: currentCard.id, isCorrect: wasCorrect }]);
    }
    
    if (gameMode === 'validation' && currentCard.type === 'quizz' && userAnswerIndex !== undefined) {
        setValidationResults(prev => [...prev, {
            card: currentCard as QuizzCard,
            userAnswerIndex,
            isCorrect: wasCorrect === true
        }]);
    }

    if (currentCardIndex < allGameCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
    } else {
        setIsFinished(true);
        
        // --- Save Game/Quiz Results ---
        const finalScore = wasCorrect ? score + 1 : score;
        const totalScorable = answerResults.length + (wasCorrect !== undefined ? 1 : 0);
        const percentage = totalScorable > 0 ? Math.round((finalScore / totalScorable) * 100) : 0;
        
        // Save quiz attempt for the instructor
        if (gameMode === 'validation') {
            // Prefer server auth user id when available, fallback to localStorage username
            const auth = (window as any).__econav_auth_user || null;
            const usernameFallback = localStorage.getItem('econav_username');
            const userIdToSave = auth?.id || usernameFallback || 'anonymous';
            if (userIdToSave && game) {
                const attempt: Omit<QuizAttempt, 'id' | 'attempted_at'> = {
                    user_id: userIdToSave,
                    theme: game.theme,
                    score: percentage,
                    total_questions: allGameCards.length
                };
                saveQuizAttempt(attempt);
            }
        }
        
        // Save game result for the group/stage
        if (gameMode === 'play' && game && game.stage_id) {
            const finalAnswerResults = [...answerResults, ...(wasCorrect !== undefined ? [{ cardId: currentCard.id, isCorrect: wasCorrect }] : [])];

            // Sauvegarder dans Supabase
            saveStageGameResult(
                game.stage_id,
                game.id,
                finalScore,
                totalScorable,
                percentage,
                finalAnswerResults
            ).then(success => {
                if (success) {
                    console.log('[Game] Result saved to database successfully');
                } else {
                    console.error('[Game] Failed to save result to database');
                }
            }).catch(error => {
                console.error('[Game] Error saving result:', error);
            });

            // Garder aussi dans localStorage pour compatibilité/offline
            const historyKey = `game_history_${game.stage_id}`;
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            const gameResult = {
                gameId: game.id,
                stageId: game.stage_id,
                score: finalScore,
                total: totalScorable,
                percentage: percentage,
                date: new Date().toISOString(),
                results: finalAnswerResults
            };
            history.push(gameResult);
            localStorage.setItem(historyKey, JSON.stringify(history));

             if(percentage >= 80) {
                const badgeId = 'badge_animateur_pedagogique';
                const isBadgeAlreadyUnlocked = (localStorage.getItem('user_unlocked_badges') || '').includes(badgeId);
                
                if (!isBadgeAlreadyUnlocked) {
                     const currentBadges = JSON.parse(localStorage.getItem('user_unlocked_badges') || '[]');
                     currentBadges.push(badgeId);
                     localStorage.setItem('user_unlocked_badges', JSON.stringify(currentBadges));

                    toast({
                        title: "🏆 Trophée Débloqué !",
                        description: "Animateur Pédagogique : Votre groupe a obtenu plus de 80% de bonnes réponses !",
                        duration: 5000,
                    });
                }
            }
        }
    }
  }

  const handleReset = () => {
    setCurrentCardIndex(0);
    setScore(0);
    setIsFinished(false);
    setValidationResults([]);
    setAnswerResults([]);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!game || allGameCards.length === 0) {
    return (
        <div className="text-center space-y-4">
             <Link href={stageIdFromQuery ? `/stages/${stageIdFromQuery}` : '/jeux'} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 justify-center">
                <ChevronLeft className="w-4 h-4" />
                Retour
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Contenu indisponible</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Aucune question n'a pu être chargée pour ce jeu ou ce quiz de validation.</p>
                    <p className="text-xs text-muted-foreground">Cela peut arriver si aucun objectif pédagogique n'est lié au programme du stage.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  const currentCard = allGameCards[currentCardIndex];
  const scorableCardsCount = allGameCards.filter(c => c.type !== 'dilemme').length;
  
  const cardColors: { [key in GameCardType]: string } = {
    triage: "bg-blue-500",
    mots: "bg-yellow-500",
    dilemme: "bg-purple-500",
    quizz: "bg-teal-500",
  };
  
  const cardTitles: { [key in GameCardType]: string } = {
      triage: "Le Triage Côtier",
      mots: "Les Mots en Rafale",
      dilemme: "Le Dilemme du Marin",
      quizz: "Le Grand Quizz"
  }

  const backLink = game.stage_id ? `/stages/${game.stage_id}` : '/jeux';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <Link href={backLink} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" />
        Retour
      </Link>
      
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold font-headline">{game.title}</h1>
        <p className="text-lg text-muted-foreground">Thème : {game.theme}</p>
      </div>

       <div className="space-y-2">
            <Progress value={isFinished ? 100 : (currentCardIndex / allGameCards.length) * 100} />
            <p className="text-center text-sm text-muted-foreground">Question {isFinished ? allGameCards.length : currentCardIndex + 1} / {allGameCards.length}</p>
       </div>

        <div className="min-h-[450px] flex flex-col justify-center items-center">
            <AnimatePresence mode="wait">
                {isFinished ? (
                     <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-full"
                    >
                       {gameMode === 'validation' ? (
                            <ValidationResults results={validationResults} onReset={handleReset} allPedagogicalContent={allPedagogicalContent} />
                       ) : (
                            <GameResults score={score} total={scorableCardsCount} onReset={handleReset} />
                       )}
                    </motion.div>
                ) : currentCard ? (
                    <motion.div
                        key={currentCardIndex}
                        initial={{ opacity: 0, x: 300, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -300, scale: 0.8 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full"
                    >
                        <Card className="shadow-xl overflow-hidden">
                           <div className={cn("h-2", cardColors[currentCard.type])} />
                           <CardHeader className="text-center">
                               <CardTitle className="text-2xl">{cardTitles[currentCard.type]}</CardTitle>
                           </CardHeader>
                           <CardContent className="min-h-[250px] flex flex-col justify-center items-center p-6">
                               <CardContentPresenter card={currentCard} onNext={handleNextCard} gameMode={gameMode} />
                           </CardContent>
                       </Card>
                    </motion.div>
                ) : (
                  <p>Aucune carte valide pour ce jeu ou quiz.</p>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}


const CardContentPresenter = ({ card, onNext, gameMode }: { card: GameCard, onNext: (wasCorrect?: boolean, answerIndex?: number) => void, gameMode: GameMode }) => {
    switch (card.type) {
        case 'triage':
            return <TriageCôtierContent card={card} onNext={onNext} />;
        case 'mots':
            return <MotsEnRafaleContent card={card} onNext={onNext} />;
        case 'dilemme':
            return <DilemmeDuMarinContent card={card} onNext={onNext} />;
        case 'quizz':
            return <LeGrandQuizzContent card={card} onNext={onNext} gameMode={gameMode} />;
        default:
            return null;
    }
};

const TriageCôtierContent = ({ card, onNext }: { card: TriageCard, onNext: (wasCorrect: boolean) => void}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const isAnswered = selectedAnswer !== null;
    const isCorrect = isAnswered ? selectedAnswer === card.isTrue : false;

    const handleAnswer = (answer: boolean) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
    };

    return (
        <div className="text-center space-y-6 w-full">
            <p className="text-xl md:text-2xl font-semibold text-center">{card.statement}</p>
            <div className="flex gap-4 mt-4 justify-center">
                <Button
                    onClick={() => handleAnswer(true)}
                    disabled={isAnswered}
                    className={cn("text-lg px-8 py-6", isAnswered && selectedAnswer === true && (isCorrect ? 'bg-green-500 hover:bg-green-500' : 'bg-red-500 hover:bg-red-500'), isAnswered && selectedAnswer !== true && card.isTrue && 'bg-green-500 hover:bg-green-500 opacity-50')}
                >
                    <CheckCircle2 className="mr-2"/> Vrai
                </Button>
                <Button
                    onClick={() => handleAnswer(false)}
                    disabled={isAnswered}
                    className={cn("text-lg px-8 py-6", isAnswered && selectedAnswer === false && (isCorrect ? 'bg-green-500 hover:bg-green-500' : 'bg-red-500 hover:bg-red-500'), isAnswered && selectedAnswer !== false && !card.isTrue && 'bg-green-500 hover:bg-green-500 opacity-50')}
                >
                    <XCircle className="mr-2"/> Faux
                </Button>
            </div>
            {isAnswered && (
                <Button onClick={() => onNext(isCorrect)} className="mt-4">
                    Suivant <ArrowRight className="ml-2"/>
                </Button>
            )}
        </div>
    )
}

const MotsEnRafaleContent = ({ card, onNext }: { card: MotsEnRafaleCard, onNext: (wasCorrect?: boolean) => void}) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div className="space-y-4 text-center">
            <p className="text-xl md:text-2xl">{card.definition}</p>
            <AnimatePresence>
            {isRevealed && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-3xl font-bold text-primary">{card.answer}</p>
                </motion.div>
            )}
            </AnimatePresence>
            <div className="flex gap-4 mt-6 justify-center">
                {!isRevealed ? (
                    <Button onClick={() => setIsRevealed(true)} variant="outline">
                        Révéler la réponse
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onNext(true)} className="bg-green-500 hover:bg-green-600">
                           <ThumbsUp className="mr-2" /> Bonne réponse
                        </Button>
                         <Button onClick={() => onNext(false)} variant="secondary">
                           <ThumbsDown className="mr-2" /> Mauvaise réponse
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const DilemmeDuMarinContent = ({ card, onNext }: { card: DilemmeDuMarinCard, onNext: () => void }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div className="space-y-4 w-full text-center">
            <p className="font-semibold text-xl md:text-2xl text-center mb-4">Tu préfères...</p>
            <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 text-lg border-l-4 border-orange-400 bg-orange-50/50 dark:bg-orange-900/30">
                    <span className="font-bold text-orange-500">A</span>
                    <p>{card.optionA}</p>
                </div>
                    <div className="flex items-start gap-3 p-3 text-lg border-l-4 border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30">
                    <span className="font-bold text-indigo-500">B</span>
                    <p>{card.optionB}</p>
                </div>
            </div>
            <AnimatePresence>
            {isRevealed && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-3 bg-muted/80 rounded-md mt-4 text-left">
                        <h4 className="font-semibold text-sm mb-1">Le pourquoi du comment :</h4>
                        <p className="text-sm text-muted-foreground">{card.explanation}</p>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
            <div className="flex gap-4 mt-6 justify-center">
                <Button variant="link" size="sm" onClick={() => setIsRevealed(prev => !prev)} className="p-0 h-auto">
                    <HelpCircle className="mr-2 h-4 w-4"/>
                    {isRevealed ? "Cacher l'explication" : "Voir l'explication"}
                </Button>
                <Button onClick={() => onNext()}>
                    Suivant <ArrowRight className="ml-2"/>
                </Button>
            </div>
        </div>
    )
}

const LeGrandQuizzContent = ({ card, onNext, gameMode }: { card: QuizzCard, onNext: (wasCorrect: boolean, answerIndex: number) => void, gameMode: GameMode }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const isAnswered = selectedAnswer !== null;

    const handleAnswer = (answerIndex: number) => {
        if (isAnswered && gameMode === 'validation') {
            // Allow changing answer in validation mode before submitting
            setSelectedAnswer(answerIndex);
            return;
        }
        if (isAnswered) return;
        setSelectedAnswer(answerIndex);
    };
    
    const handleNext = () => {
        if (selectedAnswer === null) return;
        onNext(selectedAnswer === card.correctAnswerIndex, selectedAnswer);
    };

    return (
        <div className="space-y-4 w-full">
            <p className="font-semibold text-xl md:text-2xl mb-4 text-center">{card.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {card.answers.map((answer, aIndex) => {
                    const isSelected = selectedAnswer === aIndex;
                    const isCorrect = card.correctAnswerIndex === aIndex;
                    
                    // In play mode, show feedback immediately after clicking.
                    const showFeedback = isAnswered && gameMode !== 'validation';

                    return (
                        <Button
                            key={aIndex}
                            onClick={() => handleAnswer(aIndex)}
                            disabled={showFeedback}
                            className={cn(
                                "justify-start h-auto py-3 text-base whitespace-normal text-left",
                                // --- Play Mode Feedback ---
                                showFeedback && isCorrect && "bg-green-500 hover:bg-green-500",
                                showFeedback && !isCorrect && isSelected && "bg-red-500 hover:bg-red-500",
                                // --- Validation Mode Selection ---
                                gameMode === 'validation' && isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                            variant={isSelected ? 'default' : 'outline'}
                        >
                            <span className={cn("w-6 mr-2 font-bold")}>{String.fromCharCode(65 + aIndex)}</span>
                            {answer}
                        </Button>
                    )
                })}
            </div>

            {isAnswered && (
                <div className="text-center mt-6">
                     <Button onClick={handleNext}>
                        Suivant <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            )}
        </div>
    );
};

const GameResults = ({ score, total, onReset }: { score: number, total: number, onReset: () => void }) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    
    return (
         <Card className="bg-card text-center w-full">
            <CardHeader>
                <CardTitle className="text-3xl font-bold">Jeu terminé !</CardTitle>
                <CardDescription>Voici les résultats du groupe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                    className="flex flex-col items-center justify-center gap-4"
                >
                    <Trophy className="w-20 h-20 text-yellow-500" />
                    <p className="text-5xl font-bold">{score} / {total}</p>
                    <p className="text-xl text-muted-foreground">{percentage}% de bonnes réponses</p>
                </motion.div>
            </CardContent>
            <CardFooter className="justify-center">
                <Button onClick={onReset} variant="outline" size="lg">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Recommencer
                </Button>
            </CardFooter>
        </Card>
    )
}

const ValidationResults = ({ results, onReset, allPedagogicalContent }: { results: ValidationResult[], onReset: () => void, allPedagogicalContent: PedagogicalContent[] }) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return (
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Quiz de validation terminé</CardTitle>
                <CardDescription>Votre score : {correctAnswers} / {totalQuestions} ({percentage}%)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">Voici le détail de vos réponses. Pour les réponses incorrectes, une ressource pédagogique vous est proposée.</p>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-3">
                    {results.map((result, index) => (
                        <ResultItem key={index} result={result} allPedagogicalContent={allPedagogicalContent} />
                    ))}
                </div>
            </CardContent>
             <CardFooter className="justify-center border-t pt-4">
                <Button onClick={onReset} variant="outline" size="lg">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Recommencer le quiz
                </Button>
            </CardFooter>
        </Card>
    );
};

const ResultItem = ({ result, allPedagogicalContent }: { result: ValidationResult, allPedagogicalContent: PedagogicalContent[] }) => {
    const relatedObjective = useMemo(() => {
        if (!result.card.related_objective_id) return null;
        return allPedagogicalContent.find(q => q.id.toString() === result.card.related_objective_id);
    }, [result.card.related_objective_id, allPedagogicalContent]);

    return (
        <div className={cn(
            "border-l-4 p-3 rounded-r-md",
            result.isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
        )}>
            <div className="flex justify-between items-start">
                <p className={cn("font-semibold text-sm flex-1", result.isCorrect ? 'text-green-200' : 'text-red-200')}>{result.card.question}</p>
                {result.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/>
                ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0"/>
                )}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
                <p>Votre réponse : <span className="font-medium text-foreground">{result.card.answers[result.userAnswerIndex]}</span></p>
                {!result.isCorrect && <p>Bonne réponse : <span className="font-medium text-green-400">{result.card.answers[result.card.correctAnswerIndex]}</span></p>}
            </div>
            {relatedObjective && (
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                           <BookOpen className="mr-2 h-3 w-3" /> Voir la fiche ressource
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Objectif Pédagogique Associé</DrawerTitle>
                            <DrawerDescription>{relatedObjective.question}</DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 py-2">
                            <p className="text-sm text-muted-foreground">
                                L'objectif principal de cette notion est de :
                            </p>
                            <p className="font-semibold mt-1">{relatedObjective.objectif}</p>
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Fermer</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            )}
        </div>
    );
};


export default GameDisplayPage;
