
'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import type { GameCard, TriageCard, MotsEnRafaleCard, DilemmeDuMarinCard, QuizzCard, GameCardType, DbGameCardData } from '@/lib/types';
import { getAllGameCardsFromDb, createGameCard, updateGameCard, deleteGameCard } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlusCircle, HelpCircle, Edit, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { CreateGameCardForm } from '@/components/create-game-card-form';
import { EditGameCardForm } from '@/components/edit-game-card-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function GameCardEditorPage() {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    const dbCards = await getAllGameCardsFromDb();
    setCards(dbCards);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreate = async (type: GameCardType, data: DbGameCardData) => {
      startTransition(async () => {
        const newCard = await createGameCard(type, data);
        if (newCard) {
            toast({ title: "Carte créée", description: "La nouvelle carte de jeu a été ajoutée."});
            setIsCreateModalOpen(false);
            await fetchCards();
        } else {
            toast({ title: "Erreur", description: "La création de la carte a échoué.", variant: "destructive"});
        }
      });
  };

  const handleUpdate = async (id: number, data: DbGameCardData) => {
      let success = false;
      startTransition(async () => {
          success = await updateGameCard(id, data);
          if (success) {
              toast({ title: "Carte mise à jour", description: "Les modifications ont été enregistrées."});
              await fetchCards();
          } else {
              toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive"});
          }
      });
      return success;
  };

  const handleDelete = (id: number) => {
       startTransition(async () => {
        const success = await deleteGameCard(id);
        if (success) {
            toast({ title: "Carte supprimée", description: "La carte a été retirée de la base de données."});
            await fetchCards();
        } else {
            toast({ title: "Erreur", description: "La suppression a échoué.", variant: "destructive"});
        }
       });
  };

  const triageCards = useMemo(() => cards.filter((c): c is TriageCard => c.type === 'triage'), [cards]);
  const motsCards = useMemo(() => cards.filter((c): c is MotsEnRafaleCard => c.type === 'mots'), [cards]);
  const dilemmeCards = useMemo(() => cards.filter((c): c is DilemmeDuMarinCard => c.type === 'dilemme'), [cards]);
  const quizzCards = useMemo(() => cards.filter((c): c is QuizzCard => c.type === 'quizz'), [cards]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Éditeur de Cartes de Jeu</h1>
          <p className="text-muted-foreground">Consultez, créez et gérez les cartes pour les différents types de jeux.</p>
        </div>
         <CreateGameCardForm
            isOpen={isCreateModalOpen}
            setIsOpen={setIsCreateModalOpen}
            onCardCreate={handleCreate}
            isCreating={isPending}
         >
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une carte
            </Button>
        </CreateGameCardForm>
      </div>
      
       {loading ? (
         <div className="flex justify-center items-center py-10">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       ) : (
          <Tabs defaultValue="triage">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="triage">Vrai/Faux ({triageCards.length})</TabsTrigger>
              <TabsTrigger value="mots">Mots ({motsCards.length})</TabsTrigger>
              <TabsTrigger value="dilemme">Dilemmes ({dilemmeCards.length})</TabsTrigger>
              <TabsTrigger value="quizz">Quizz ({quizzCards.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="triage" className="mt-4">
              <CardGrid>
                {triageCards.map((card) => <TriageCardDisplay key={card.id} card={card} onUpdate={handleUpdate} onDelete={handleDelete} isPending={isPending} />)}
              </CardGrid>
            </TabsContent>

            <TabsContent value="mots" className="mt-4">
              <CardGrid>
                {motsCards.map((card) => <MotsCardDisplay key={card.id} card={card} onUpdate={handleUpdate} onDelete={handleDelete} isPending={isPending}/>)}
              </CardGrid>
            </TabsContent>

            <TabsContent value="dilemme" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dilemmeCards.map((card) => <DilemmeCardDisplay key={card.id} card={card} onUpdate={handleUpdate} onDelete={handleDelete} isPending={isPending}/>)}
              </div>
            </TabsContent>
            
            <TabsContent value="quizz" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzCards.map((card) => <QuizzCardDisplay key={card.id} card={card} onUpdate={handleUpdate} onDelete={handleDelete} isPending={isPending}/>)}
              </div>
            </TabsContent>
          </Tabs>
      )}
    </div>
  );
}

const CardGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
    </div>
);

const CardHeaderWithTheme = ({ card }: { card: GameCard }) => (
    <CardHeader className="flex-grow">
      <div className="flex justify-between items-start">
        <CardTitle className="text-base flex-1">{ 'statement' in card ? card.statement : ('definition' in card ? card.definition : card.question) }</CardTitle>
        <Badge variant="outline">{card.theme}</Badge>
      </div>
    </CardHeader>
)


const CardActions = ({ card, onUpdate, onDelete, isPending }: { card: GameCard, onUpdate: any, onDelete: (id: number) => void, isPending: boolean}) => (
    <CardFooter className="border-t pt-2 mt-2">
        <div className="flex w-full justify-end gap-2">
            <EditGameCardForm card={card} onCardUpdate={onUpdate} isUpdating={isPending}>
                <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                </Button>
            </EditGameCardForm>

             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. La carte sera supprimée.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(card.id)} disabled={isPending}>
                           {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
        </div>
    </CardFooter>
);


const TriageCardDisplay = ({ card, ...props }: { card: TriageCard, onUpdate: any, onDelete: (id: number) => void, isPending: boolean }) => (
  <Card className="flex flex-col">
    <CardHeader className="flex-grow">
       <div className="flex justify-between items-start gap-2">
        <CardTitle className="text-base flex-1">{card.statement}</CardTitle>
        <Badge variant="outline" className="shrink-0">{card.theme}</Badge>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className={`font-bold ${card.isTrue ? 'text-green-600' : 'text-red-600'}`}>
        Réponse : {card.isTrue ? 'VRAI' : 'FAUX'}
      </p>
    </CardContent>
    <CardActions card={card} {...props} />
  </Card>
);

const MotsCardDisplay = ({ card, ...props }: { card: MotsEnRafaleCard, onUpdate: any, onDelete: (id: number) => void, isPending: boolean }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex-grow">
             <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                    <CardDescription>Définition</CardDescription>
                    <CardTitle className="text-base">{card.definition}</CardTitle>
                </div>
                <Badge variant="outline" className="shrink-0">{card.theme}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="font-bold text-primary">Réponse : {card.answer}</p>
        </CardContent>
        <CardActions card={card} {...props} />
    </Card>
);


const DilemmeCardDisplay = ({ card, ...props }: { card: DilemmeDuMarinCard, onUpdate: any, onDelete: (id: number) => void, isPending: boolean }) => {
    const [revealed, setRevealed] = useState(false);
    
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base flex-1">Tu préfères...</CardTitle>
                    <Badge variant="outline" className="shrink-0">{card.theme}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
                <div className="p-2 border-l-4 border-orange-400 bg-orange-50/50">
                    <p>A) {card.optionA}</p>
                </div>
                <div className="p-2 border-l-4 border-indigo-400 bg-indigo-50/50">
                    <p>B) {card.optionB}</p>
                </div>
                <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 bg-muted/80 rounded-md mt-2">
                            <h4 className="font-semibold text-sm mb-1">Le pourquoi du comment :</h4>
                            <p className="text-sm text-muted-foreground">{card.explanation}</p>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
                <Button variant="link" size="sm" onClick={() => setRevealed(prev => !prev)} className="p-0 h-auto mt-2">
                    <HelpCircle className="mr-2 h-4 w-4"/>
                   {revealed ? "Cacher l'explication" : "Voir l'explication"}
                </Button>
            </CardContent>
            <CardActions card={card} {...props} />
        </Card>
    )
}

const QuizzCardDisplay = ({ card, ...props }: { card: QuizzCard, onUpdate: any, onDelete: (id: number) => void, isPending: boolean }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex-grow">
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base flex-1">{card.question}</CardTitle>
                <Badge variant="outline" className="shrink-0">{card.theme}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
            {card.answers.map((answer, index) => (
                <div key={index} className={cn(
                    "flex items-center gap-2 p-2 rounded-md text-sm",
                    index === card.correctAnswerIndex ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/50'
                )}>
                    {index === card.correctAnswerIndex ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                    <span>{answer}</span>
                </div>
            ))}
        </CardContent>
        <CardActions card={card} {...props} />
    </Card>
);
