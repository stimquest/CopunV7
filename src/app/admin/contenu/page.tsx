
'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import type { PedagogicalContent, GrandTheme } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ListFilter, X, Info, Trash2, Loader2 } from 'lucide-react';
import { getPedagogicalContent, deletePedagogicalContent } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { groupedThemes } from '@/data/etages';

const PILLARS: { [key: string]: { label: string, color: string } } = {
    'COMPRENDRE': { label: 'Comprendre', color: 'bg-cop-comprendre text-background' },
    'OBSERVER': { label: 'Observer', color: 'bg-cop-observer text-background' },
    'PROTÉGER': { label: 'Protéger', color: 'bg-cop-proteger text-background' },
};

const NIVEAUX: { [key: number]: string } = {
    1: "Niveau 1",
    2: "Niveau 2-3",
    3: "Niveau 4-5",
}

export default function ContenuPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allCards, setAllCards] = useState<PedagogicalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();

  // --- Filtering State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [selectedNiveaux, setSelectedNiveaux] = useState<number[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  const allGrandThemes = useMemo(() => groupedThemes.flatMap(g => g.themes), []);

  const fetchData = async () => {
    setLoading(true);
    const cards = await getPedagogicalContent();
    setAllCards(cards);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCards = useMemo(() => {
    return allCards
      .filter(card => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm ? 
            card.question.toLowerCase().includes(searchTermLower) || 
            card.objectif.toLowerCase().includes(searchTermLower) : true;

        const matchesPillar = selectedPillars.length > 0 ? selectedPillars.includes(card.dimension) : true;
        const matchesNiveau = selectedNiveaux.length > 0 ? selectedNiveaux.includes(card.niveau) : true;
        
        const hasSelectedThemes = selectedThemes.length > 0;
        const matchesTheme = hasSelectedThemes ? selectedThemes.some(themeId => card.tags_theme.includes(themeId)) : true;
        
        return matchesSearch && matchesPillar && matchesNiveau && matchesTheme;
      })
      .sort((a,b) => a.question.localeCompare(b.question));
  }, [allCards, searchTerm, selectedPillars, selectedNiveaux, selectedThemes]);


  const getPillarInfo = (card: PedagogicalContent) => {
    const pillarKey = card.dimension as keyof typeof PILLARS;
    return PILLARS[pillarKey] || { label: 'Inconnu', color: 'bg-gray-500' };
  };
  
  const handlePillarToggle = (pillar: string) => {
      setSelectedPillars(prev => prev.includes(pillar) ? prev.filter(p => p !== pillar) : [...prev, pillar]);
  }

  const handleNiveauToggle = (niveau: number) => {
        setSelectedNiveaux(prev => prev.includes(niveau) ? prev.filter(n => n !== niveau) : [...prev, niveau]);
  }
  
  const handleThemeToggle = (themeId: string) => {
        setSelectedThemes(prev => prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]);
  }
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPillars([]);
    setSelectedNiveaux([]);
    setSelectedThemes([]);
  }
  
  const hasActiveFilters = searchTerm || selectedPillars.length > 0 || selectedNiveaux.length > 0 || selectedThemes.length > 0;
  
  const handleDelete = (id: number) => {
    startDeleteTransition(async () => {
      const success = await deletePedagogicalContent(id);
      if (success) {
        toast({ title: "Fiche supprimée" });
        fetchData();
      } else {
        toast({ title: "Erreur", description: "La suppression a échoué.", variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
        <aside className="hidden md:flex flex-col w-64 border-r shrink-0">
            <div className="p-4 pr-0">
                <h3 className="text-lg font-semibold tracking-tight">Thèmes</h3>
                <p className="text-sm text-muted-foreground">
                    Filtrez par thématique.
                </p>
            </div>
            <nav className="flex flex-col gap-1 py-4 pr-4 pl-2">
                {groupedThemes.map(group => (
                    <div key={group.label} className="space-y-1">
                        <h4 className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">{group.label}</h4>
                        <div className="flex flex-col gap-0.5">
                            {group.themes.map(theme => {
                                const isActive = selectedThemes.includes(theme.id);
                                const Icon = theme.icon;
                                return (
                                    <div 
                                        key={theme.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleThemeToggle(theme.id)}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleThemeToggle(theme.id)}
                                        className={cn(
                                            'flex items-center justify-start gap-2 h-auto py-1.5 px-2 rounded-md transition-colors cursor-pointer', 
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                            isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm">{theme.title}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
        <main className="flex-1 md:pl-6">
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground font-headline">Contenu Pédagogique</h1>
                        <p className="text-muted-foreground">Consultez, filtrez et gérez l'ensemble des fiches de contenu.</p>
                    </div>
                     <Button asChild>
                        <Link href="/admin/contenu/creer">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer une fiche
                        </Link>
                    </Button>
                </div>

                <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className='md:hidden'>
                             <Select onValueChange={(v) => handleThemeToggle(v)} value={selectedThemes[0] || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrer par thème" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groupedThemes.map(group => (
                                        <div key={group.label}>
                                            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                                            {group.themes.map(theme => (
                                                 <SelectItem key={theme.id} value={theme.id}>{theme.title}</SelectItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Rechercher par question ou objectif..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        <ListFilter className="mr-2 h-4 w-4" />
                                        Piliers {selectedPillars.length > 0 && `(${selectedPillars.length})`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filtrer par pilier</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {Object.entries(PILLARS).map(([key, { label }]) => (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={selectedPillars.includes(key)}
                                            onCheckedChange={() => handlePillarToggle(key)}
                                        >
                                            {label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        <ListFilter className="mr-2 h-4 w-4" />
                                        Niveaux {selectedNiveaux.length > 0 && `(${selectedNiveaux.length})`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filtrer par niveau</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {Object.entries(NIVEAUX).map(([key, label]) => (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={selectedNiveaux.includes(parseInt(key))}
                                            onCheckedChange={() => handleNiveauToggle(parseInt(key))}
                                        >
                                            {label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {hasActiveFilters && (
                                <Button variant="ghost" onClick={resetFilters}>
                                    <X className="mr-2 h-4 w-4" />
                                    Effacer
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        {filteredCards.length} sur {allCards.length} fiches affichées.
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Question / Objectif</TableHead>
                                    <TableHead className="w-[25%] hidden md:table-cell">Thèmes</TableHead>
                                    <TableHead>Pilier &amp; Niveau</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Chargement...</TableCell></TableRow>
                                ) : filteredCards.length > 0 ? (
                                    filteredCards.map(card => {
                                        const pillarInfo = getPillarInfo(card);
                                        return (
                                            <TableRow key={card.id}>
                                                <TableCell>
                                                    <Link href={`/admin/contenu/modifier/${card.id}`} className="hover:underline">
                                                        <div className="font-medium text-foreground">{card.question}</div>
                                                        <div className="text-muted-foreground text-xs mt-1">{card.objectif}</div>
                                                    </Link>
                                                </TableCell>
                                                 <TableCell className="hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {card.tags_theme.map(themeId => {
                                                            const theme = allGrandThemes.find(t => t.id === themeId);
                                                            return theme ? <Badge key={themeId} variant="secondary" className="font-normal">{theme.title}</Badge> : null;
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <Badge className={pillarInfo.color}>{pillarInfo.label}</Badge>
                                                        <Badge variant="outline">{NIVEAUX[card.niveau as keyof typeof NIVEAUX]}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Cette action est irréversible et supprimera la fiche.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(card.id)} disabled={isDeleting}>
                                                                    {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Aucun résultat pour vos filtres.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
