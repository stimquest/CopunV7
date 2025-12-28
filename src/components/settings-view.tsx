'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Settings, Trash2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateStage, deleteStage } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { Stage } from '@/lib/types';

const stageTypes = ['Journée', 'Hebdomadaire', 'Annuel', 'Libre'] as const;
const stageSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    type: z.enum(stageTypes),
    participants: z.number().min(1).max(50),
    start_date: z.date(),
    end_date: z.date(),
});
type StageFormValues = z.infer<typeof stageSchema>;

interface SettingsViewProps {
    stage: Stage;
    onStageUpdate: () => void;
}

export function SettingsView({ stage, onStageUpdate }: SettingsViewProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isUpdating, startUpdateTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();

    const form = useForm<StageFormValues>({
        resolver: zodResolver(stageSchema),
        defaultValues: {
            title: stage.title.split(' - ')[0],
            type: stage.type as typeof stageTypes[number],
            participants: stage.participants,
            start_date: new Date(stage.start_date),
            end_date: new Date(stage.end_date),
        },
    });

    const onSubmit = (data: StageFormValues) => {
        startUpdateTransition(async () => {
            const result = await updateStage({
                id: stage.id,
                title: data.title,
                type: data.type,
                participants: data.participants,
                start_date: data.start_date.toISOString(),
                end_date: data.end_date.toISOString(),
                sport_activity: stage.sport_activity,
                sport_level: stage.sport_level,
                sport_description: stage.sport_description,
            });
            if (result) {
                toast({ title: 'Stage mis à jour' });
                setOpen(false);
                onStageUpdate();
            } else {
                toast({ title: 'Erreur', description: 'Impossible de mettre à jour le stage', variant: 'destructive' });
            }
        });
    };

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const success = await deleteStage(stage.id);
            if (success) {
                toast({ title: 'Stage supprimé' });
                router.push('/stages');
            } else {
                toast({ title: 'Erreur', description: 'Impossible de supprimer le stage', variant: 'destructive' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Paramètres du stage</DialogTitle>
                    <DialogDescription>Modifier les informations du stage</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{stageTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="participants" render={({ field }) => (
                            <FormItem><FormLabel>Participants</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="start_date" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Début</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, 'PPP', { locale: fr }) : 'Date'}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="end_date" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Fin</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, 'PPP', { locale: fr }) : 'Date'}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={isDeleting}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button></AlertDialogTrigger>
                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. Le stage sera définitivement supprimé.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                            </AlertDialog>
                            <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Enregistrement...' : 'Enregistrer'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

