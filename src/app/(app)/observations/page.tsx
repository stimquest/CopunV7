
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Tag, Calendar, Filter, PlusCircle, X, Edit, Trash2, Pencil, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { ObservationForm } from '@/components/observation-form';
import type { Observation, ObservationCategory } from '@/lib/types';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { ObservationContext } from '@/components/map-wrapper';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getObservations, createObservation, updateObservation, deleteObservation } from '@/app/actions';

const MapWrapper = dynamic(() => import('@/components/map-wrapper'), { 
    ssr: false,
    loading: () => <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center"><p>Chargement de la carte...</p></div>
});

const categories: ObservationCategory[] = ["Faune", "Flore", "Pollution", "Phénomène inhabituel"];

const categoryColors: Record<ObservationCategory, string> = {
  "Faune": "bg-blue-100 text-blue-800 border-blue-200",
  "Flore": "bg-green-100 text-green-800 border-green-200",
  "Pollution": "bg-orange-100 text-orange-800 border-orange-200",
  "Phénomène inhabituel": "bg-purple-100 text-purple-800 border-purple-200",
};


export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedCategories, setSelectedCategories] = useState<ObservationCategory[]>(categories);
  const [isPlacingObservation, setIsPlacingObservation] = useState(false);
  const [newObservationCoords, setNewObservationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [observationToDelete, setObservationToDelete] = useState<Observation | null>(null);

  const fetchObservations = useCallback(async () => {
    setLoading(true);
    const data = await getObservations();
    setObservations(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);
  
  const handleSaveObservation = async (data: Omit<Observation, 'id' | 'created_at'> & { id?: number }) => {
    let success = false;
    const observationData = { ...data, observation_date: format(data.observation_date, 'yyyy-MM-dd') };

    if (observationData.id) { // Editing
      success = await updateObservation(observationData as Omit<Observation, 'created_at'>);
    } else { // Creating
      success = await createObservation(observationData);
    }
    
    if (success) {
      toast({ title: "Sauvegarde réussie", description: "Vos modifications ont été enregistrées." });
      fetchObservations(); // Re-fetch data
    } else {
      toast({ title: "Erreur", description: "La sauvegarde a échoué.", variant: 'destructive' });
    }
  };

  const handleEditClick = (observation: Observation) => {
    setEditingObservation(observation);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (observation: Observation) => {
    setObservationToDelete(observation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (observationToDelete) {
      const success = await deleteObservation(observationToDelete.id);
       if (success) {
            toast({ title: "Observation supprimée", description: "L'observation a été supprimée."});
            fetchObservations();
       } else {
            toast({ title: "Erreur de suppression", description: "La suppression a échoué", variant: 'destructive'});
       }
      setObservationToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const filteredObservations = useMemo(() => {
    return observations
      .filter(obs => {
        // Date filter
        if (!dateRange || !dateRange.from) return true;
        const to = dateRange.to || dateRange.from; // If only 'from' is selected, filter for that single day
        if (!isWithinInterval(parseISO(obs.observation_date), { start: dateRange.from, end: to })) {
          return false;
        }

        // Category filter
        if (selectedCategories.length === 0) return true; // Show all if no categories are explicitly selected
        return selectedCategories.includes(obs.category);
      })
      .sort((a, b) => parseISO(b.observation_date).getTime() - parseISO(a.observation_date).getTime());
  }, [observations, dateRange, selectedCategories]);

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (isPlacingObservation) {
      setNewObservationCoords(coords);
      setEditingObservation(null);
      setIsFormOpen(true);
      setIsPlacingObservation(false);
    }
  }

  const handleTogglePlacementMode = () => {
    setIsPlacingObservation(prev => !prev);
    setNewObservationCoords(null);
  }
  
  const toggleCategory = (category: ObservationCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Journal des Observations</h1>
          <p className="text-muted-foreground">Recensez et visualisez les faits marquants pour la connaissance du milieu.</p>
        </div>
        <Button onClick={handleTogglePlacementMode} variant={isPlacingObservation ? 'destructive' : 'default'}>
          {isPlacingObservation ? (
            <X className="mr-2 h-4 w-4" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          {isPlacingObservation ? "Annuler le placement" : "Placer une observation"}
        </Button>
        <ObservationForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          onSave={handleSaveObservation} 
          categories={categories}
          coords={newObservationCoords}
          setCoords={setNewObservationCoords}
          observationToEdit={editingObservation}
          setObservationToEdit={setEditingObservation}
        />
      </div>

      <Card className="mb-6">
          <CardHeader>
              <div className="flex justify-end items-center">
                 <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <ListFilter className="mr-2 h-4 w-4" />
                          Catégories ({selectedCategories.length})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Filtrer par catégorie</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {categories.map(category => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "d LLL", { locale: fr })} - {format(dateRange.to, "d LLL, y", { locale: fr })}
                                </>
                              ) : (
                                format(dateRange.from, "d LLL, y", { locale: fr })
                              )
                            ) : (
                              "Filtrer par date"
                            )}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarPicker
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                 </div>
              </div>
          </CardHeader>
          <CardContent>
            <ObservationContext.Provider value={filteredObservations}>
              <MapWrapper 
                isPlacingObservation={isPlacingObservation}
                onMapClick={handleMapClick}
                newObservationCoords={newObservationCoords}
              />
            </ObservationContext.Provider>
          </CardContent>
      </Card>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Observation</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Chargement des observations...
                    </TableCell>
                </TableRow>
            ) : filteredObservations.length > 0 ? (
              filteredObservations.map(obs => (
                <TableRow key={obs.id}>
                  <TableCell>
                    <div className="font-medium">{obs.title}</div>
                    <div className="text-sm text-muted-foreground hidden md:block">{obs.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryColors[obs.category]}>{obs.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(obs.observation_date), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(obs)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(obs)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Aucune observation pour la sélection actuelle.
                  <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres ou d'ajouter une observation.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette observation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'observation "{observationToDelete?.title}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setObservationToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
