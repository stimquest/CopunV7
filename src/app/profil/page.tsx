

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, ChevronsUpDown, Trophy, Shield, Star, Award, GraduationCap, Map, Waves, User, BrainCircuit, BookOpen, CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { structures } from '@/data/structures';
import { cn } from '@/lib/utils';
import type { Structure, Exploit, QuizAttempt, GrandTheme, Defi } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { rankConfig, getRankForDefis } from '@/lib/ranks';
import { Progress } from '@/components/ui/progress';
import { allExploits } from '@/data/exploits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getQuizAttemptsForUser } from '@/app/actions';
import { groupedThemes } from '@/data/etages';
import { allDefis } from '@/data/defis';
import { Badge } from '@/components/ui/badge';


// --- SCHEMAS & TYPES ---
const profileSchema = z.object({
  username: z.string().min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères." }),
  structureId: z.string({ required_error: 'Veuillez sélectionner une structure.'}),
  specialties: z.string().optional(),
  bio: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

type DefiLog = {
    defi_id: string;
    completed_at: string;
};

type Competency = {
  theme: GrandTheme;
  averageScore: number;
  attempts: number;
}


export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time for demo purposes
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-headline">Mon Profil & Progression</h1>
        <p className="text-muted-foreground">Gérez vos informations et suivez votre montée en compétence.</p>
      </div>

       <Tabs defaultValue="exploits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exploits"><Trophy className="w-4 h-4 mr-2"/>Mes Exploits</TabsTrigger>
            <TabsTrigger value="competences"><BrainCircuit className="w-4 h-4 mr-2"/>Compétences</TabsTrigger>
            <TabsTrigger value="infos"><User className="w-4 h-4 mr-2"/>Informations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exploits" className="mt-6">
            <ExploitsTab />
        </TabsContent>

        <TabsContent value="competences" className="mt-6">
            <CompetencesTab />
        </TabsContent>

        <TabsContent value="infos" className="mt-6">
            <InfosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}


// --- TABS COMPONENTS ---

const ExploitsTab = () => {
    const [completedDefisCount, setCompletedDefisCount] = useState(0);
    const [defiCounts, setDefiCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const storedDefis = localStorage.getItem('user_completed_defis');
        const completedDefis: DefiLog[] = storedDefis ? JSON.parse(storedDefis) : [];
        setCompletedDefisCount(completedDefis.length);

        const counts: Record<string, number> = completedDefis.reduce((acc, defi) => {
            acc[defi.defi_id] = (acc[defi.defi_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        setDefiCounts(counts);
    }, []);

    const currentRank = getRankForDefis(completedDefisCount);
    const nextRank = rankConfig.find(r => r.minDefis > completedDefisCount);
    const progressToNextRank = nextRank 
        ? Math.round(((completedDefisCount - currentRank.minDefis) / (nextRank.minDefis - currentRank.minDefis)) * 100)
        : 100;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ma Progression</CardTitle>
                    <CardDescription>Votre niveau en tant qu'ambassadeur de l'environnement.</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <currentRank.icon className="w-20 h-20 mx-auto" style={{color: currentRank.color}} />
                    <div>
                        <h3 className="text-2xl font-bold" style={{color: currentRank.color}}>{currentRank.name}</h3>
                        <p className="text-muted-foreground text-sm">{completedDefisCount} défis accomplis</p>
                    </div>
                    {nextRank ? (
                         <div>
                            <Progress value={progressToNextRank} />
                            <p className="text-xs text-muted-foreground mt-2">
                                Encore {nextRank.minDefis - completedDefisCount} défi(s) pour atteindre le rang <span className="font-semibold">{nextRank.name}</span>
                            </p>
                         </div>
                    ) : (
                        <p className="text-sm font-semibold text-primary">Vous avez atteint le plus haut rang, bravo !</p>
                    )}
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold font-headline">Exploits Principaux</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allExploits.map(exploit => {
                    const currentCount = defiCounts[exploit.condition.defi_id] || 0;
                    const isUnlocked = currentCount >= exploit.condition.count;
                    return (
                        <ExploitCard key={exploit.id} exploit={exploit} currentCount={currentCount} isUnlocked={isUnlocked} />
                    )
                })}
            </div>
        </div>
    )
}

const ExploitCard = ({ exploit, currentCount, isUnlocked }: { exploit: Exploit, currentCount: number, isUnlocked: boolean }) => {
    const IconComponent = useMemo(() => ({Map, Waves, Shield, GraduationCap, Trophy}[exploit.icon] || Award), [exploit.icon]);
    const progressPercentage = Math.min((currentCount / exploit.condition.count) * 100, 100);

    return (
         <Card className={cn(
             "border-2 flex flex-col transition-all duration-300", 
             isUnlocked ? "border-yellow-500/80 bg-yellow-500/10" : "border-border bg-card"
         )}>
            <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className={cn("p-2 rounded-lg", isUnlocked ? "bg-yellow-500/20" : "bg-muted")}>
                    <IconComponent className={cn("w-6 h-6", isUnlocked ? "text-yellow-400" : "text-muted-foreground")} />
                </div>
                <div className="flex-grow">
                    <CardTitle className="text-base">{exploit.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{exploit.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                {isUnlocked ? (
                    <div className="flex items-center justify-center gap-2 text-yellow-500 font-semibold">
                        <CheckCircle className="w-5 h-5"/>
                        <span>Terminé !</span>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                            <span>Progression</span>
                            <span>{currentCount} / {exploit.condition.count}</span>
                        </div>
                        <Progress value={progressPercentage} indicatorClassName={cn(progressPercentage === 100 && "bg-yellow-500")} />
                    </>
                )}
            </CardContent>
        </Card>
    );
};


const CompetencesTab = () => {
    const [loading, setLoading] = useState(true);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('econav_username');
        setUsername(storedUsername);

        const calculateCompetencies = async () => {
            if (!storedUsername) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const attempts = await getQuizAttemptsForUser(storedUsername);
            const allThemes = groupedThemes.flatMap(g => g.themes);
            
            const competencyData = allThemes.map(theme => {
                const attemptsForTheme = attempts.filter(a => a.theme === theme.title);
                const totalAttempts = attemptsForTheme.length;
                
                if (totalAttempts === 0) {
                    return { theme, averageScore: 0, attempts: 0 };
                }
                
                const totalScore = attemptsForTheme.reduce((sum, a) => sum + a.score, 0);
                const averageScore = Math.round(totalScore / totalAttempts);
                
                return { theme, averageScore, attempts: totalAttempts };
            });

            setCompetencies(competencyData.sort((a,b) => b.averageScore - a.averageScore));
            setLoading(false);
        }
        
        calculateCompetencies();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Tableau de Bord des Compétences
                </CardTitle>
                <CardDescription>
                    Votre progression sur les différents thèmes pédagogiques, basée sur les résultats de vos quiz de validation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!username ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Connectez-vous pour voir vos compétences.</p>
                    </div>
                ) : competencies.length > 0 ? (
                    <div className="space-y-4">
                        {competencies.map(({ theme, averageScore, attempts }) => (
                            <div key={theme.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <theme.icon className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{theme.title}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className="text-sm text-muted-foreground">{attempts > 0 ? `${averageScore}%` : 'N/A'}</span>
                                        {attempts > 0 && <Badge variant="outline">{attempts} test(s)</Badge>}
                                    </div>
                                </div>
                                <Progress value={averageScore} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Aucune donnée de progression.</p>
                        <p className="text-xs">Commencez par valider vos connaissances via un quiz à la fin de la création d'un programme.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const InfosTab = () => {
    const { toast } = useToast();
    const [popoverOpen, setPopoverOpen] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          username: '',
          structureId: undefined,
          specialties: '',
          bio: '',
        },
    });

    useEffect(() => {
        const storedUsername = localStorage.getItem('econav_username') || 'Moniteur_Demo';
        const storedStructureId = localStorage.getItem('econav_structureId') || structures[0]?.id;
        const storedSpecialties = localStorage.getItem('econav_specialties') || 'Moniteur Fédéral, Spécialité Catamaran';
        const storedBio = localStorage.getItem('econav_bio') || "Passionné de voile et d'environnement marin.";
        
        form.reset({
            username: storedUsername,
            structureId: storedStructureId,
            specialties: storedSpecialties,
            bio: storedBio,
        });
    }, [form]);

    const onSubmit = (data: ProfileFormValues) => {
        localStorage.setItem('econav_username', data.username);
        localStorage.setItem('econav_structureId', data.structureId);
        if (data.specialties) localStorage.setItem('econav_specialties', data.specialties);
        if (data.bio) localStorage.setItem('econav_bio', data.bio);
        
        const selectedStructure = structures.find(s => s.id === data.structureId);
        if (selectedStructure) {
            localStorage.setItem('econav_clubName', selectedStructure.name);
        }

        toast({
          title: 'Profil mis à jour',
          description: 'Vos informations ont été enregistrées avec succès.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informations du moniteur</CardTitle>
                <CardDescription>Ces informations peuvent être utilisées pour personnaliser vos fiches de sortie.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="structureId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Club / Structure</FormLabel>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value
                                        ? structures.find(s => s.id === field.value)?.name
                                        : "Sélectionnez votre structure"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher une structure..." />
                                        <CommandEmpty>Aucune structure trouvée.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {structures.map((structure) => (
                                                    <CommandItem
                                                        value={structure.name}
                                                        key={structure.id}
                                                        onSelect={() => {
                                                            form.setValue("structureId", structure.id)
                                                            setPopoverOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                            "mr-2 h-4 w-4",
                                                            structure.id === field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                            )}
                                                        />
                                                        {structure.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Spécialités / Diplômes</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: Moniteur Fédéral, Permis Côtier..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bio / Notes personnelles</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Quelques mots sur vous, vos méthodes, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
    );
};
