

'use client';

import React, { useState } from 'react';
import { BookOpen, Eye, Shield, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentCardsModal } from '@/components/content-cards-modal';
import type { Theme, SelectedContent, ContentCard } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThemeSelectorProps {
  theme: Theme;
  selectedIndex: number;
  onSelect: (index: number) => void;
  selectedContent: SelectedContent;
  onContentChange: (newContent: SelectedContent) => void;
}

const ICONS: { [key: string]: React.ElementType } = {
  comprendre: BookOpen,
  observer: Eye,
  proteger: Shield,
};

const colorClasses = {
    comprendre: {
      text: 'text-yellow-600',
      border: 'border-yellow-500/50',
      iconBg: 'bg-yellow-500 text-white',
    },
    observer: {
      text: 'text-blue-600',
      border: 'border-blue-500/50',
      iconBg: 'bg-blue-500 text-white',
    },
    proteger: {
      text: 'text-green-600',
      border: 'border-green-500/50',
      iconBg: 'bg-green-500 text-white',
    },
};


export function ThemeSelector({ theme, selectedIndex, onSelect, selectedContent, onContentChange }: ThemeSelectorProps) {
  if (!theme || !theme.options || theme.options.length === 0) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const IconComponent = ICONS[theme.id as keyof typeof ICONS];
  const selectedOption = theme.options[selectedIndex];

  const handleOpenModal = () => setIsModalOpen(true);
  
  const handleContentChangeForOption = (cardIds: string[]) => {
    onContentChange({
      ...selectedContent,
      [selectedOption.id]: cardIds,
    });
    setIsModalOpen(false);
  };

  const selectedCardsForOption = selectedOption && selectedContent[selectedOption.id] ? selectedContent[selectedOption.id] : [];
  const colors = colorClasses[theme.id as keyof typeof colorClasses] || colorClasses.comprendre;

  // This is a workaround since we removed jsonQuestions, the cards are in the options.
  const allCards: ContentCard[] = theme.options.flatMap(option => option.contentCards || []);

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
             <div className={cn("p-1.5 rounded-lg", colors.iconBg)}>
              {IconComponent && <IconComponent className="w-5 h-5" />}
            </div>
            {theme.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow gap-4">
            <Select value={selectedIndex?.toString()} onValueChange={(value) => onSelect(parseInt(value, 10))}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un thème..." />
              </SelectTrigger>
              <SelectContent>
                {theme.options.map((option, index) => (
                  <SelectItem key={option.id} value={index.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedOption && (
              <>
                <div className={cn("bg-muted/50 text-sm text-muted-foreground p-3 rounded-lg border", colors.border)}>
                  {selectedOption.tip}
                </div>
                {selectedOption.contentCards.length > 0 && (
                   <div className="mt-auto pt-4 text-center">
                      <Button variant="outline" size="sm" onClick={handleOpenModal} className="w-full">
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          Personnaliser les activités ({selectedCardsForOption.length})
                      </Button>
                   </div>
                )}
              </>
            )}
        </CardContent>
      </Card>

      {selectedOption && (
        <ContentCardsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          allCards={allCards}
          selectedCardIds={selectedCardsForOption}
          onSelectedCardIdsChange={handleContentChangeForOption}
          theme={theme}
        />
      )}
    </>
  );
}
