'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, Loader2, Play, Trash2 } from 'lucide-react';
import { getGamesForStage, deleteGame } from '@/app/actions';
import type { Game } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const JeuxRessources = ({ stageId }: { stageId: number }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();

    const fetchGames = useCallback(async () => {
        const data = await getGamesForStage(stageId);
        setGames(data);
        setLoading(false);
    }, [stageId]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const handleDeleteGame = (gameId: number) => {
        startDeleteTransition(async () => {
            const success = await deleteGame(gameId, stageId);
            if (success) {
                toast({ title: 'Jeu retiré', description: 'Le jeu a été retiré du stage.' });
                await fetchGames();
            } else {
                toast({ title: 'Erreur', description: 'La suppression du jeu a échoué.', variant: 'destructive' });
            }
        });
    };

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
                                <div className="flex items-center gap-2">
                                    <Link href={`/jeux/${game.id}`} className={cn(buttonVariants({variant: 'ghost', size: 'icon'}))}><Play className="w-5 h-5"/></Link>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game.id)} disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 text-destructive" />}
                                    </Button>
                                </div>
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