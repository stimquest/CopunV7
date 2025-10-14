

'use client';

import React from 'react';
import { FileText, AlertTriangle, ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContextDisplay } from '@/components/context-display';
import { LevelSelector } from '@/components/level-selector';
import { ThemeSelector } from '@/components/theme-selector';
import type { EtagesData, ContextData, SelectedNotions, SelectedContent, Stage, Theme } from '@/lib/types';
import Link from 'next/link';

interface SelectionInterfaceProps {
  etagesData: EtagesData;
  contextData: ContextData;
  selectedNotions: SelectedNotions;
  setSelectedNotions: React.Dispatch<React.SetStateAction<SelectedNotions>>;
  selectedContent: SelectedContent;
  setSelectedContent: React.Dispatch<React.SetStateAction<SelectedContent>>;
  getCoherenceWarnings: () => string[];
  handleGenerateMemo: () => void;
  stage: Stage;
  isEditing: boolean;
}

export function SelectionInterface({
  etagesData,
  contextData,
  selectedNotions,
  setSelectedNotions,
  selectedContent,
  setSelectedContent,
  getCoherenceWarnings,
  handleGenerateMemo,
  stage,
  isEditing
}: SelectionInterfaceProps) {
  const coherenceWarnings = getCoherenceWarnings();
  const { niveau, comprendre, observer, proteger } = etagesData;

  return (
    <div className="space-y-6">
      <div className="mb-4">
         <Link href={`/stages/${stage.id}`} className="text-primary hover:underline flex items-center justify-start gap-1 text-sm mb-2">
           <ArrowLeft className="w-4 h-4" />
           Retour au stage "{stage.title}"
         </Link>
        <h1 className="text-2xl font-bold text-foreground font-headline">
          {isEditing ? "Modifier la sortie" : "Planifier une nouvelle sortie"}
        </h1>
      </div>
      
      <ContextDisplay contextData={contextData} />

      <LevelSelector
        etage={niveau}
        selectedIndex={selectedNotions.niveau}
        onSelect={(index) => setSelectedNotions(prev => ({ ...prev, niveau: index }))}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[comprendre, observer, proteger].map((theme) => (
          theme && (
            <ThemeSelector
              key={theme.id}
              theme={theme as Theme}
              selectedIndex={selectedNotions[theme.id as keyof SelectedNotions]}
              onSelect={(index) => setSelectedNotions(prev => ({ ...prev, [theme.id]: index }))}
              selectedContent={selectedContent}
              onContentChange={setSelectedContent}
            />
          )
        ))}
      </div>


      {coherenceWarnings.length > 0 && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800">
          <AlertTriangle className="h-4 w-4 !text-orange-600" />
          <AlertTitle className="font-medium !text-orange-800">Suggestions d'amélioration</AlertTitle>
          <AlertDescription className="!text-orange-700">
            <ul className="list-disc pl-5 space-y-1">
              {coherenceWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleGenerateMemo}
        size="lg"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
      >
        {isEditing ? <Pencil className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        {isEditing ? "Modifier la fiche de sortie" : "Créer la fiche de sortie"}
      </Button>
    </div>
  );
}
