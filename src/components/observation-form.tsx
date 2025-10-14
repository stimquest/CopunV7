
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Observation, ObservationCategory } from '@/lib/types';

const observationSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  description: z.string().min(10, { message: 'La description doit contenir au moins 10 caractères.' }),
  category: z.string({ required_error: 'Une catégorie est requise.'}).refine(val => val.length > 0, { message: 'Une catégorie est requise.' }),
  observation_date: z.date({ required_error: 'Une date est requise.' }),
  latitude: z.coerce.number().min(-90, { message: "Latitude invalide"}).max(90, { message: "Latitude invalide"}),
  longitude: z.coerce.number().min(-180, { message: "Longitude invalide"}).max(180, { message: "Longitude invalide"}),
});

type ObservationFormValues = z.infer<typeof observationSchema>;

interface ObservationFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (data: ObservationFormValues) => void;
  categories: ObservationCategory[];
  coords: { lat: number; lng: number } | null;
  setCoords: (coords: { lat: number; lng: number } | null) => void;
  observationToEdit: Observation | null;
  setObservationToEdit: (observation: Observation | null) => void;
}

export function ObservationForm({ 
    isOpen,
    setIsOpen,
    onSave, 
    categories,
    coords,
    setCoords,
    observationToEdit,
    setObservationToEdit
}: ObservationFormProps) {
    const isEditing = !!observationToEdit;

    const form = useForm<ObservationFormValues>({
        resolver: zodResolver(observationSchema),
        defaultValues: {
            title: '',
            description: '',
            observation_date: new Date(),
            latitude: 49.05,
            longitude: -1.58,
        },
    });

  React.useEffect(() => {
    if (isOpen) {
        if (observationToEdit) {
            form.reset({
                ...observationToEdit,
                observation_date: parseISO(observationToEdit.observation_date),
                latitude: parseFloat(observationToEdit.latitude.toFixed(6)),
                longitude: parseFloat(observationToEdit.longitude.toFixed(6)),
            });
        } else if (coords) {
            form.reset({
                title: '',
                description: '',
                category: undefined,
                observation_date: new Date(),
                latitude: parseFloat(coords.lat.toFixed(6)),
                longitude: parseFloat(coords.lng.toFixed(6)),
            });
        } else {
             form.reset({
                title: '',
                description: '',
                category: undefined,
                observation_date: new Date(),
                latitude: 49.05,
                longitude: -1.58,
            });
        }
    }
  }, [isOpen, observationToEdit, coords, form]);
  
  const onSubmit = (data: ObservationFormValues) => {
    onSave(data);
    handleClose();
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setCoords(null);
    setObservationToEdit(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'observation" : "Ajouter une observation"}</DialogTitle>
          <DialogDescription>
            {isEditing 
                ? "Modifiez les informations ci-dessous." 
                : "Remplissez les champs ci-dessous pour enregistrer un fait marquant."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Seiches sans tête" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value as string | undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Décrivez votre observation en détail..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="observation_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de l'observation</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: fr })
                          ) : (
                            <span>Choisissez une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button variant="outline" type="button" onClick={handleClose}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
