

'use client';

import React from 'react';
import type { ProgramAxe, Option, ProgramSelections, ContentCard, CardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, Shield, Pencil, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProgramBlock {
    id: string;
    selections: ProgramSelections;
    selectedCards: string[];
}

interface ProgramAxeCardProps {
    axe: ProgramAxe;
    block: ProgramBlock;
    updateBlock: (blockId: string, updatedFields: Partial<ProgramBlock>) => void;
    handleOpenCardSelector: (blockId: string, axe: ProgramAxe, option: Option, cardTypeFilter: CardType) => void;
    stageLevel: number;
}

const ICONS: { [key: string]: React.ElementType } = {
  comprendre: BookOpen,
  observer: Eye,
  proteger: Shield,
};

const AXE_COLORS: { [key: string]: { text: string, border: string, bg: string, selectedButton: string, selectedButtonText:string } } = {
    comprendre: { text: 'text-yellow-800', border: 'border-yellow-400', bg: 'bg-yellow-50', selectedButton: 'bg-yellow-400 hover:bg-yellow-400/90', selectedButtonText: 'text-yellow-950' },
    observer: { text: 'text-blue-800', border: 'border-blue-400', bg: 'bg-blue-50', selectedButton: 'bg-blue-500 hover:bg-blue-500/90', selectedButtonText: 'text-white' },
    proteger: { text: 'text-green-800', border: 'border-green-400', bg: 'bg-green-50', selectedButton: 'bg-green-500 hover:bg-green-500/90', selectedButtonText: 'text-white'},
}

export function ProgramAxeCard({ axe, block, updateBlock, handleOpenCardSelector, stageLevel }: ProgramAxeCardProps) {
    const selectedOptionIndex = block.selections[axe.id];
    const selectedOption = typeof selectedOptionIndex === 'number' ? axe.options[selectedOptionIndex] : null;
    const Icon = ICONS[axe.id];
    const colors = AXE_COLORS[axe.id] || {};

    const handleSelectChange = (value: string) => {
        const index = parseInt(value, 10);
        const newSelections = {
            ...block.selections,
            [axe.id]: index,
        };
        updateBlock(block.id, { selections: newSelections });
    };

    return (
        <div key={axe.id} className={cn("rounded-lg p-4 flex flex-col items-start gap-4 border", colors.bg, colors.border)}>
            <div className="flex items-center gap-2">
                {Icon && <Icon className={cn("w-5 h-5", colors.text)} />}
                <h4 className={cn("font-semibold text-lg", colors.text)}>{axe.title}</h4>
            </div>
            
            <Select 
                onValueChange={handleSelectChange}
                value={selectedOptionIndex !== undefined ? String(selectedOptionIndex) : undefined}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Choisir un thème ${axe.title}`} />
                </SelectTrigger>
                <SelectContent>
                    {axe.options.map((option, index) => (
                        <SelectItem key={option.id} value={String(index)}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedOption && (
                <div className="w-full mt-2 space-y-2">
                    <div className="text-xs text-muted-foreground p-2 bg-background/30 rounded-md border">
                        {selectedOption.tip}
                    </div>
                     <div className="flex flex-col gap-1 items-start">
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-xs h-auto p-0"
                            onClick={() => handleOpenCardSelector(block.id, axe, selectedOption, 'Question')}
                        >
                            <Pencil className="w-3 h-3 mr-1.5" />
                            Gérer les questions ({block.selectedCards.filter(cId => selectedOption.contentCards.some(c => c.id === cId && c.type === 'Question')).length})
                        </Button>
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-xs h-auto p-0 text-muted-foreground"
                            onClick={() => handleOpenCardSelector(block.id, axe, selectedOption, 'Ressource')}
                        >
                            <FileText className="w-3 h-3 mr-1.5" />
                            Gérer les ressources ({block.selectedCards.filter(cId => selectedOption.contentCards.some(c => c.id === cId && c.type === 'Ressource')).length})
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
