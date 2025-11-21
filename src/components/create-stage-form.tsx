
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Loader2, CalendarIcon } from 'lucide-react';
import { format, parse, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { Stage } from '@/lib/types';


const stageSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  type: z.string().min(1, { message: 'Le type est requis.' }),
  participants: z.coerce.number().int().positive({ message: 'Le nombre de participants doit être positif.' }),
  start_date: z.string().min(1, { message: 'Une date de début est requise.' }),
  end_date: z.string().min(1, { message: 'Une date de fin est requise.' }),
  sport_activity: z.string().optional().nullable(),
  sport_level: z.string().optional().nullable(),
  sport_description: z.string().optional().nullable(),
}).refine(data => {
    return data.end_date >= data.start_date;
}, { message: 'La date de fin doit être après ou égale à la date de début.', path: ['end_date'] });

type StageFormValues = z.infer<typeof stageSchema>;

const defaultValues: StageFormValues = {
  title: '',
  type: 'Hebdomadaire',
  participants: 8,
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
  sport_activity: null,
  sport_level: null,
  sport_description: null,
};


export function CreateStageForm({ onStageCreate, isCreating }: { onStageCreate: (data: Omit<Stage, 'id' | 'created_at'>) => void; isCreating: boolean; }) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues,
  });
  
  const type = form.watch('type');
  const startDate = form.watch('start_date');

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  React.useEffect(() => {
    const startDateObj = startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : new Date();
    if (type === 'Journée') {
        form.setValue('end_date', format(startDateObj, 'yyyy-MM-dd'));
    } else if (type === 'Hebdomadaire') {
        form.setValue('end_date', format(addDays(startDateObj, 4), 'yyyy-MM-dd'));
    }
  }, [type, startDate, form]);

  const onSubmit = (data: StageFormValues) => {
    onStageCreate(data);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Nouveau Stage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau stage</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer un nouveau stage.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du stage</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Stage Voile - Août" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Hebdomadaire">Hebdomadaire</SelectItem>
                        <SelectItem value="Journée">Journée</SelectItem>
                        <SelectItem value="Libre">Libre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participants</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date de début</FormLabel>
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
                                    format(parse(field.value, 'yyyy-MM-dd', new Date()), 'PPP', { locale: fr })
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
                                selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                initialFocus
                                locale={fr}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date de fin</FormLabel>
                         <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                )}
                                disabled={type === 'Journée' || type === 'Hebdomadaire'}
                                >
                                {field.value ? (
                                    format(parse(field.value, 'yyyy-MM-dd', new Date()), 'PPP', { locale: fr })
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
                                selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                disabled={(date) => {
                                  const startDateValue = form.getValues('start_date');
                                  return startDateValue ? date < parse(startDateValue, 'yyyy-MM-dd', new Date()) : false;
                                }}
                                initialFocus
                                locale={fr}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Sport Activity Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Structure Sportive (Optionnel)</h3>
              <FormField
                control={form.control}
                name="sport_activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activité sportive</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Voile, Kayak, Paddle..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sport_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau sportif</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Débutant, Intermédiaire, Avancé..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sport_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea placeholder="Description de l'activité sportive..." className="w-full px-3 py-2 border rounded-md text-sm" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le stage
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
