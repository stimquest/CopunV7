
'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import type { Defi, AssignedDefi, StageType, Exploit } from '@/lib/types';
import { allDefis } from '@/data/defis';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, CheckCircle, Plus, Camera, Check, Trophy, Wind, Fish, BookOpen, Map, Gamepad2, Users, GraduationCap, Waves, Shield, Microscope, LandPlot, Compass } from 'lucide-react';
import { allExploits } from '@/data/exploits';


interface DefisTabProps {
    stageId: number;
    stageType: StageType;
    stageThemes: string[];
}

type DefiLog = {
    defi_id: string;
    completed_at: string;
};

export function DefisTab({ stageId, stageType, stageThemes }: DefisTabProps) {
    const { toast } = useToast();
    const [isProcessing, startTransition] = useTransition();

    const [assignedDefis, setAssignedDefis] = useState<AssignedDefi[]>([]);
    const [justCompletedExploits, setJustCompletedExploits] = useState<Exploit[]>([]);
    const [defiToProve, setDefiToProve] = useState<{assignedDefi: AssignedDefi, defi: Defi} | null>(null);

    useEffect(() => {
        const storedAssignedDefis = localStorage.getItem(`assigned_defis_${stageId}`);
        setAssignedDefis(storedAssignedDefis ? JSON.parse(storedAssignedDefis) : []);
    }, [stageId]);

    const assignedDefiIds = useMemo(() => new Set(assignedDefis.map(am => am.defi_id)), [assignedDefis]);
    
    const availableDefis = useMemo(() => {
        return allDefis.filter(defi => {
            const isAssigned = assignedDefiIds.has(defi.id);
            if (isAssigned) return false;

            if (stageThemes.length === 0) {
                 return defi.stage_type.includes(stageType);
            }
            
            const hasCommonTheme = defi.tags_theme.some(theme => stageThemes.includes(theme));
            return hasCommonTheme && defi.stage_type.includes(stageType);
        });
    }, [assignedDefiIds, stageType, stageThemes]);

    const assignedDefisDetails = useMemo(() => {
        return assignedDefis
            .map(am => {
                const details = allDefis.find(m => m.id === am.defi_id);
                return details ? { ...am, details } : null;
            })
            .filter((am): am is AssignedDefi & { details: Defi } => am !== null);
    }, [assignedDefis]);


    const handleAssignDefi = (defiId: string) => {
        startTransition(() => {
            const defiToAdd = allDefis.find(e => e.id === defiId);
            if (!defiToAdd) return;
            
            const newAssignedDefi: AssignedDefi = {
                id: Date.now(),
                stage_id: stageId,
                defi_id: defiId,
                status: 'en_cours',
                completed_at: null,
                preuve_url: null
            };
            const updatedDefis = [...assignedDefis, newAssignedDefi];
            setAssignedDefis(updatedDefis);
            localStorage.setItem(`assigned_defis_${stageId}`, JSON.stringify(updatedDefis));
            toast({ title: "Défi assigné" });
        });
    };

    const handleUnassignDefi = (assignedDefiId: number) => {
        startTransition(() => {
            const updatedDefis = assignedDefis.filter(am => am.id !== assignedDefiId);
            setAssignedDefis(updatedDefis);
            localStorage.setItem(`assigned_defis_${stageId}`, JSON.stringify(updatedDefis));
            toast({ title: "Défi retiré" });
        });
    };

    const handleUpdateDefi = (assignedDefi: AssignedDefi, completed: boolean, preuveUrl?: string) => {
        startTransition(() => {
            const defiDetails = allDefis.find(m => m.id === assignedDefi.defi_id);
            if (!defiDetails) return;

            let justCompletedNow = false;
            
            const updatedDefis = assignedDefis.map(am => {
                if (am.id === assignedDefi.id) {
                     const wasCompleted = am.status === 'complete';
                     if (completed && !wasCompleted) {
                        justCompletedNow = true;
                     }
                    return {
                        ...am,
                        status: completed ? 'complete' : 'en_cours',
                        completed_at: completed ? new Date().toISOString() : null,
                        preuve_url: preuveUrl !== undefined ? preuveUrl : am.preuve_url,
                    };
                }
                return am;
            });
            
            setAssignedDefis(updatedDefis);
            localStorage.setItem(`assigned_defis_${stageId}`, JSON.stringify(updatedDefis));

            if (justCompletedNow) {
                 // Add defi to user's global log
                const storedLog = localStorage.getItem('user_completed_defis');
                const currentLog: DefiLog[] = storedLog ? JSON.parse(storedLog) : [];
                const newLogEntry: DefiLog = { defi_id: assignedDefi.defi_id, completed_at: new Date().toISOString() };
                const newLog = [...currentLog, newLogEntry];
                localStorage.setItem('user_completed_defis', JSON.stringify(newLog));

                toast({ title: `Défi terminé !`, description: `Bravo !` });

                // Check for new exploits
                 const defiCounts: Record<string, number> = newLog.reduce((acc, defi) => {
                    acc[defi.defi_id] = (acc[defi.defi_id] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const unlockedExploits = allExploits.filter(exploit => {
                    const currentCount = defiCounts[exploit.condition.defi_id] || 0;
                    // Check if the exploit is unlocked with this completion
                    return currentCount === exploit.condition.count;
                });

                if (unlockedExploits.length > 0) {
                    setJustCompletedExploits(unlockedExploits);
                }

            } else {
                 toast({ title: "Progression mise à jour" });
            }
            
            setDefiToProve(null);
        });
    };
    
    const iconMap: { [key: string]: React.ElementType } = {
        Shield, Trash2, Wind, Fish, Map, Gamepad2, BookOpen, Trophy, Camera, Microscope, LandPlot, Compass, Waves
    };

    const DefiCard = ({ defi, children }: { defi: Defi, children: React.ReactNode }) => {
        const IconComponent = iconMap[defi.icon] || Shield;
        return (
            <AccordionItem value={defi.id} className="border-b-0">
                <Card className="p-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-start gap-4 text-left">
                            <IconComponent className="w-8 h-8 text-primary mt-1 shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold">{defi.description}</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="border-t pt-4">
                            {children}
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
        );
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Défis Assignés</CardTitle>
                    <CardDescription>Les défis sélectionnés pour ce stage. Validez chaque défi une fois complété avec votre groupe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="space-y-3">
                        {assignedDefisDetails.length > 0 ? assignedDefisDetails.map(assignedDefi => {
                            const defiDetails = assignedDefi.details;
                            if (!defiDetails) return null;
                            const isCompleted = assignedDefi.status === 'complete';

                            return (
                                <DefiCard key={assignedDefi.id} defi={defiDetails}>
                                    <div className="flex justify-between items-center mb-4">
                                        <Badge variant={isCompleted ? "default" : "secondary"}>
                                            {isCompleted ? <CheckCircle className="w-4 h-4 mr-2"/> : null}
                                            {isCompleted ? "Défi Terminé !" : "En cours..."}
                                        </Badge>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="ghost" className="text-destructive" disabled={isProcessing}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Retirer
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Retirer le défi ?</AlertDialogTitle><AlertDialogDescription>La progression sera perdue.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleUnassignDefi(assignedDefi.id)}>Confirmer</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium leading-none">{defiDetails.instruction}</p>
                                            </div>
                                            
                                            {(defiDetails.type_preuve === 'checkbox' || defiDetails.type_preuve === 'action' || defiDetails.type_preuve === 'quiz') && (
                                                <div className="flex items-center gap-2 pl-2">
                                                    <span className="text-xs text-muted-foreground">{isCompleted ? 'Validé' : 'À faire'}</span>
                                                    <Checkbox
                                                        checked={isCompleted}
                                                        onCheckedChange={(checked) => handleUpdateDefi(assignedDefi, !!checked)}
                                                        disabled={isProcessing}
                                                    />
                                                </div>
                                            )}

                                            {defiDetails.type_preuve === 'photo' && (
                                                <div className="flex items-center gap-2 pl-2">
                                                    {isCompleted && assignedDefi.preuve_url && (
                                                         <img src={assignedDefi.preuve_url} alt={`Preuve pour ${defiDetails.description}`} width={40} height={40} className="rounded-md object-cover" />
                                                    )}
                                                    <Button size="sm" variant={isCompleted ? "secondary" : "outline"} onClick={() => setDefiToProve({ assignedDefi, defi: defiDetails })} disabled={isProcessing}>
                                                        <Camera className="w-4 h-4 mr-2" />
                                                        {isCompleted ? 'Modifier' : 'Valider'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DefiCard>
                            )
                        }) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun défi assigné. Choisissez-en dans la bibliothèque ci-dessous.</p>
                        )}
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bibliothèque de Défis</CardTitle>
                    <CardDescription>
                        Défis disponibles pour votre type de stage et les thèmes du programme.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="multiple" className="space-y-3">
                        {availableDefis.length > 0 ? availableDefis.map(defi => {
                            return (
                                <DefiCard key={defi.id} defi={defi}>
                                    <div className="space-y-3">
                                        <div className="text-sm text-foreground p-3 bg-muted/50 rounded-lg">
                                           <p className="font-semibold mb-1">Instruction :</p>
                                           <p>{defi.instruction}</p>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button size="sm" variant="outline" onClick={() => handleAssignDefi(defi.id)} disabled={isProcessing}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Assigner au stage
                                            </Button>
                                        </div>
                                    </div>
                                </DefiCard>
                            )
                        }) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Tous les défis disponibles pour ce type de stage ont été assignés, ou aucun thème de programme n'a été défini.
                            </p>
                        )}
                    </Accordion>
                </CardContent>
            </Card>
            
             <AlertDialog open={justCompletedExploits.length > 0} onOpenChange={() => setJustCompletedExploits([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="text-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, 0] }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
                            </motion.div>
                            <AlertDialogTitle className="text-2xl mt-4">Exploit Débloqué !</AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-lg">
                                Bravo, vous avez débloqué :<br/>
                                <span className="font-semibold text-foreground">{justCompletedExploits.map(t => t.title).join(', ')}</span>
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setJustCompletedExploits([])}>Génial !</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CameraProofModal
                defiToProve={defiToProve}
                setDefiToProve={setDefiToProve}
                onUpdateDefi={(am, m, completed, url) => handleUpdateDefi(am, completed, url)}
            />
        </div>
    );
}

const CameraProofModal = ({ defiToProve, setDefiToProve, onUpdateDefi }: {
    defiToProve: { assignedDefi: AssignedDefi; defi: Defi } | null;
    setDefiToProve: (data: { assignedDefi: AssignedDefi; defi: Defi } | null) => void;
    onUpdateDefi: (assignedDefi: AssignedDefi, defi: Defi, completed: boolean, preuveUrl?: string) => void;
}) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
            if (defiToProve && !photoDataUrl) {
                setHasCameraPermission(null); 
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    setHasCameraPermission(true);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (error) {
                    console.error('Error accessing camera:', error);
                    setHasCameraPermission(false);
                    toast({
                        variant: 'destructive',
                        title: 'Accès Caméra Refusé',
                        description: 'Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.',
                    });
                }
            }
        };
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [defiToProve, photoDataUrl, toast]);
    
    const handleClose = () => {
        setDefiToProve(null);
        setPhotoDataUrl(null);
    };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPhotoDataUrl(dataUrl);

             if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    };
    
    const handleValidate = () => {
        if (defiToProve && photoDataUrl) {
            onUpdateDefi(defiToProve.assignedDefi, defiToProve.defi, true, photoDataUrl);
            handleClose();
        }
    }

    if (!defiToProve) return null;

    return (
        <Dialog open={!!defiToProve} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Preuve par Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{defiToProve.defi.instruction}</p>
                    <div className="bg-muted rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                        {photoDataUrl ? (
                            <img src={photoDataUrl} alt="Aperçu de la preuve" className="object-contain" />
                        ) : (
                           <>
                            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                           </>
                        )}
                        {hasCameraPermission === false && (
                             <Alert variant="destructive">
                                <AlertTitle>Caméra requise</AlertTitle>
                                <AlertDescription>Veuillez autoriser l'accès.</AlertDescription>
                            </Alert>
                        )}
                         {hasCameraPermission === null && (
                            <div className="text-muted-foreground">Démarrage de la caméra...</div>
                         )}
                    </div>
                     <div className="flex justify-center gap-4">
                        {photoDataUrl ? (
                            <>
                                <Button variant="outline" onClick={() => setPhotoDataUrl(null)}>
                                    <Camera className="mr-2 h-4 w-4" /> Reprendre
                                </Button>
                                <Button onClick={handleValidate}>
                                    <Check className="mr-2 h-4 w-4" /> Valider le défi
                                </Button>
                            </>
                        ) : (
                            <Button onClick={takePicture} disabled={!hasCameraPermission}>
                                <Camera className="mr-2 h-4 w-4" /> Prendre la photo
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
