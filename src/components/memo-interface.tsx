
import React, { useState, useTransition, useEffect } from 'react';
import { ChevronLeft, Save, Share2, BrainCircuit, Loader2, FileCheck2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast"
import type { ContextData, GroupProfile, Stage } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface MemoInterfaceProps {
  memo: string;
  setMemo: (memo: string) => void;
  handleBack: () => void;
  handleSave: () => void;
  stage: Stage;
  isEditing: boolean;
}

export function MemoInterface({ memo, setMemo, handleBack, handleSave, stage, isEditing }: MemoInterfaceProps) {
  const [isDownloading, startDownloadTransition] = useTransition();
  const { toast } = useToast();
  const [clubName, setClubName] = useState('Votre Club');

  useEffect(() => {
    const storedClubName = localStorage.getItem('econav_clubName');
    if (storedClubName) {
      setClubName(storedClubName);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fiche de sortie Cop'un de la mer pour ${stage.title}`,
          text: memo,
        });
        toast({ title: "Succès", description: "Fiche partagée." });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({ variant: "destructive", title: "Erreur", description: "Le partage a échoué." });
      }
    } else {
      navigator.clipboard.writeText(memo);
      toast({ title: "Copié!", description: "Fiche copiée dans le presse-papiers." });
    }
  };

  const handleDownloadPdf = () => {
    startDownloadTransition(() => {
        const doc = new jsPDF();
        
        // Simple text-to-pdf conversion with basic formatting
        const title = `Fiche de sortie: ${stage.title}`;
        const club = `Club: ${clubName}`;
        const date = `Date: ${new Date().toLocaleDateString('fr-FR')}`;

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        
        doc.setFontSize(10);
        doc.text(club, 14, 30);
        doc.text(date, 14, 35);

        doc.setLineWidth(0.5);
        doc.line(14, 40, 196, 40);

        doc.setFontSize(9);
        doc.setFont('courier');
        
        // Split text into lines to fit the page width
        const splitText = doc.splitTextToSize(memo, 182);
        doc.text(splitText, 14, 50);
        
        doc.save(`${stage.title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };
  
  const onSave = () => {
      handleSave();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Button>
        <h2 className="text-lg font-semibold font-headline">Fiche de sortie</h2>
        <div className="w-24" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full h-96 p-4 border-0 rounded-lg resize-none focus:ring-0 focus:outline-none text-sm font-mono bg-card"
            placeholder="Votre fiche apparaîtra ici..."
          />
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={onSave} variant="secondary" className="col-span-1">
            <FileCheck2 className="w-4 h-4 mr-2" />
            {isEditing ? "Enregistrer" : "Sauvegarder"}
          </Button>
          <Button onClick={handleDownloadPdf} variant="secondary" className="col-span-1" disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            PDF
          </Button>
          <Button onClick={handleShare} variant="secondary" className="col-span-1">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>
    </div>
  );
}

    