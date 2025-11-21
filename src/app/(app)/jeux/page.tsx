

'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Gamepad2, PlusCircle, ArrowRight, Wand2, Rows, ChevronDown, Trash2 } from 'lucide-react';
import { getGames, deleteGame as serverDeleteGame } from '@/app/actions';
import type { Game } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


export default function GamesListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const fetchGames = async () => {
    setLoading(true);
    const gamesData = await getGames();
    setGames(gamesData);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchGames();
  }, []);

  const handleDelete = (gameId: number) => {
    startDeleteTransition(async () => {
      const success = await serverDeleteGame(gameId);
      if (success) {
        toast({ title: 'Jeu supprimé', description: 'Le jeu a bien été supprimé de la bibliothèque.' });
        await fetchGames();
      } else {
        toast({ title: 'Erreur', description: 'La suppression du jeu a échoué.', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Bibliothèque de Jeux</h1>
          <p className="text-muted-foreground">Créez et gérez vos quizz et jeux pédagogiques.</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouveau Jeu
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Choisir une méthode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/jeux/generateur')}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    <span>Générateur Assisté</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/jeux/nouveau')}>
                    <Rows className="mr-2 h-4 w-4" />
                    <span>Création Manuelle (Pioche)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : games.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full">
                <Gamepad2 className="w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle>Aucun jeu pour le moment</CardTitle>
            <CardDescription className="mt-2">
              Cliquez sur "Nouveau Jeu" pour en créer un.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(game => (
            <Card key={game.id} className="flex flex-col hover:shadow-md transition-shadow relative group">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce jeu ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(game.id)} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

              <CardHeader>
                <CardTitle className="text-lg">{game.title}</CardTitle>
                <CardDescription>Thème : {game.theme}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">Créé le {format(new Date(game.created_at), 'd MMMM yyyy', { locale: fr })}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/jeux/${game.id}`} className="w-full">
                  <Button className="w-full" variant="secondary">
                    Jouer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
