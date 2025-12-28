'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AssignedDefi, Defi } from '@/lib/types';

interface CameraProofModalProps {
    defiToProve: { assignedDefi: AssignedDefi; defi: Defi } | null;
    setDefiToProve: (data: { assignedDefi: AssignedDefi; defi: Defi } | null) => void;
    onUpdateDefi: (assignedDefi: AssignedDefi, defi: Defi, completed: boolean, preuveUrl?: string) => void;
}

export function CameraProofModal({ defiToProve, setDefiToProve, onUpdateDefi }: CameraProofModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const checkIfMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsMobile(isMobileDevice || isTouchDevice);
        };
        checkIfMobile();
    }, []);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (defiToProve && !photoDataUrl && isMobile) {
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
                    toast({ variant: 'destructive', title: 'Accès Caméra Refusé', description: 'Veuillez autoriser l\'accès à la caméra.' });
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
    }, [defiToProve, photoDataUrl, isMobile, toast]);
    
    const handleClose = () => { setDefiToProve(null); setPhotoDataUrl(null); };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            setPhotoDataUrl(canvas.toDataURL('image/jpeg'));
            if (videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPhotoDataUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            toast({ variant: 'destructive', title: 'Fichier invalide', description: 'Veuillez sélectionner une image.' });
        }
    };

    const handleValidate = () => {
        if (defiToProve && photoDataUrl) {
            onUpdateDefi(defiToProve.assignedDefi, defiToProve.defi, true, photoDataUrl);
            handleClose();
        }
    };

    return (
        <Dialog open={!!defiToProve} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Preuve par Photo</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{defiToProve?.defi.instruction}</p>
                    <div className="bg-muted rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                        {photoDataUrl ? (
                            <img src={photoDataUrl} alt="Aperçu" className="object-contain w-full h-full" />
                        ) : isMobile ? (
                            <><video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline /><canvas ref={canvasRef} className="hidden" /></>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 p-8"><Camera className="w-16 h-16 text-muted-foreground" /><p className="text-sm text-muted-foreground text-center">Sélectionnez une image</p></div>
                        )}
                        {isMobile && hasCameraPermission === false && <Alert variant="destructive"><AlertTitle>Caméra requise</AlertTitle><AlertDescription>Veuillez autoriser l'accès.</AlertDescription></Alert>}
                        {isMobile && hasCameraPermission === null && <div className="text-muted-foreground">Démarrage de la caméra...</div>}
                    </div>
                    <div className="flex justify-center gap-4">
                        {photoDataUrl ? (
                            <><Button variant="outline" onClick={() => setPhotoDataUrl(null)}><Camera className="mr-2 h-4 w-4" /> Reprendre</Button><Button onClick={handleValidate}><Check className="mr-2 h-4 w-4" /> Valider</Button></>
                        ) : isMobile ? (
                            <Button onClick={takePicture} disabled={!hasCameraPermission}><Camera className="mr-2 h-4 w-4" /> Prendre la photo</Button>
                        ) : (
                            <><input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /><Button onClick={() => fileInputRef.current?.click()}><Camera className="mr-2 h-4 w-4" /> Choisir une image</Button></>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

