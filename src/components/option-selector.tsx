
'use client';

import React, { useState } from 'react';
import { BookOpen, Eye, Shield, SlidersHorizontal, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentCardsModal } from '@/components/content-cards-modal';
import type { Etage, SelectedContent, Theme, ContentCard, Option } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OptionSelectorProps {
  etage: Etage;
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

export function OptionSelector({ etage, selectedIndex, onSelect, selectedContent, onContentChange }: OptionSelectorProps) {
  if (!etage || !etage.options || etage.options.length === 0) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const IconComponent = ICONS[etage.id];
  const selectedOption = etage.options[selectedIndex];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleContentChangeForOption = (cardIds: string[]) => {
    onContentChange({
      ...selectedContent,
      [selectedOption.id]: cardIds,
    });
     setIsModalOpen(false);
  };

  const selectedCardsForOption = selectedOption && selectedContent[selectedOption.id] ? selectedContent[selectedOption.id] : [];

  const totalDuration = selectedOption?.contentCards
    .filter(c => selectedCardsForOption.includes(c.id))
    .reduce((sum, card) => sum + (card.duration || 0), 0) || 0;

  const colorClasses = {
    comprendre: {
      bg: 'bg-yellow-400',
      text: 'text-gray-800',
      iconBg: 'bg-yellow-500',
      iconText: 'text-white',
      ring: 'focus:ring-yellow-500',
      radio: 'border-yellow-600 text-yellow-600',
      activeBg: 'bg-yellow-500',
      activeText: 'text-white'
    },
    observer: {
      bg: 'bg-purple-400',
      text: 'text-white',
      iconBg: 'bg-purple-500',
      iconText: 'text-white',
      ring: 'focus:ring-purple-500',
      radio: 'border-purple-600 text-purple-600',
      activeBg: 'bg-purple-500',
      activeText: 'text-white'
    },
    proteger: {
      bg: 'bg-green-400',
      text: 'text-white',
      iconBg: 'bg-green-500',
      iconText: 'text-white',
      ring: 'focus:ring-green-500',
      radio: 'border-green-600 text-green-600',
      activeBg: 'bg-green-500',
      activeText: 'text-white'
    },
  };

  const colors = colorClasses[etage.id as keyof typeof colorClasses];

  if (!selectedOption) return null; // Add guard clause

  const allCardsForOption = selectedOption.contentCards.filter(card => card.type === 'Question');

  return (
    <>
      <Card className="overflow-hidden">
        <div className={`h-2 ${colors.bg}`} />
        <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-1.5 rounded-lg shadow-md", colors.iconBg, colors.iconText)}>
                {IconComponent && <IconComponent className="w-5 h-5" />}
              </div>
              <h3 className="font-semibold text-lg text-foreground">{etage.title}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {etage.options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => onSelect(index)}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
                        colors.ring,
                        index === selectedIndex
                        ? `${colors.activeBg} ${colors.activeText} shadow-md`
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
            </div>

            <div className="bg-card rounded-lg p-3 border space-y-2">
                <p className="text-sm text-foreground">{selectedOption.tip}</p>
                <div className="flex justify-between items-end">
                    <div className="text-xs text-muted-foreground flex items-center gap-4 pt-1">
                    {selectedOption.duration != null && (
                        <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {selectedOption.duration} min
                        </span>
                    )}
                    {selectedOption.group_size && (
                        <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        {selectedOption.group_size}
                        </span>
                    )}
                    </div>
                     {selectedOption.contentCards.length > 0 && (
                        <Button variant="link" size="sm" onClick={handleOpenModal} className="p-0 h-auto text-xs">
                            <SlidersHorizontal className="mr-1.5 h-3 w-3" />
                            Personnaliser ({selectedCardsForOption.length})
                        </Button>
                    )}
                </div>
            </div>

        </CardContent>
      </Card>

      <ContentCardsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allCards={allCardsForOption}
        selectedCardIds={selectedCardsForOption}
        onSelectedCardIdsChange={handleContentChangeForOption}
        theme={etage as Theme}
      />
    </>
  );
}

    