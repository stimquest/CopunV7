'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookOpen, Telescope, Shield, Plus, Undo2, GripVertical } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PedagogicalContent } from '@/lib/types';

export const PILLAR_STYLES: { [key: string]: { badge: string; filterBadge: string, border: string, bg: string, text: string, icon: React.ElementType, hover: string } } = {
    comprendre: { badge: 'bg-cop-comprendre text-background hover:bg-cop-comprendre', filterBadge: 'border-cop-comprendre text-cop-comprendre', border: 'border-cop-comprendre', bg: 'bg-cop-comprendre', text: 'text-cop-comprendre', icon: BookOpen, hover: 'hover:bg-cop-comprendre/10' },
    observer:   { badge: 'bg-cop-observer text-background hover:bg-cop-observer', filterBadge: 'border-cop-observer text-cop-observer', border: 'border-cop-observer', bg: 'bg-cop-observer', text: 'text-cop-observer', icon: Telescope, hover: 'hover:bg-cop-observer/10' },
    proteger:   { badge: 'bg-cop-proteger text-background hover:bg-cop-proteger', filterBadge: 'border-cop-proteger text-cop-proteger', border: 'border-cop-proteger', bg: 'bg-cop-proteger', text: 'text-cop-proteger', icon: Shield, hover: 'hover:bg-cop-proteger/10' },
};

export const ActionableCard = ({ card, onAdd }: { card: PedagogicalContent, onAdd: () => void }) => {
    // Normaliser la dimension pour enlever les accents
    const pillarKey = card.dimension
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
    const styleInfo = PILLAR_STYLES[pillarKey] || {};

    return (
        <AccordionItem value={card.id.toString()} className="border-b-0">
            <div className={cn("p-0 bg-card flex items-start justify-between gap-2 rounded-md shadow-sm border-l-4", styleInfo.border)}>
                 <AccordionTrigger className="flex-grow p-3 text-left hover:no-underline">
                    <p className="text-sm font-semibold text-left">{card.question}</p>
                </AccordionTrigger>
                <div className="flex items-center shrink-0 pr-2 pt-3 gap-2">
                    <Badge className={cn(styleInfo.badge, "pointer-events-none")}>{pillarKey.charAt(0).toUpperCase() + pillarKey.slice(1)}</Badge>
                    <Button size="icon" variant="ghost" onClick={onAdd} className="h-8 w-8 shrink-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <AccordionContent className="bg-card rounded-b-md px-3 pb-3 -mt-1">
                 <div className="border-t pt-2 text-muted-foreground text-xs space-y-1">
                    <p><span className="font-semibold text-foreground/80">Objectif:</span> {card.objectif}</p>
                    {card.tip && <p><span className="font-semibold text-foreground/80">Conseil:</span> {card.tip}</p>}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export const DraggableCard = ({ card, onRemove }: { card: PedagogicalContent, onRemove: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: card.id.toString()});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };
    // Normaliser la dimension pour enlever les accents
    const pillarKey = card.dimension
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
    const styleInfo = PILLAR_STYLES[pillarKey] || {};

    return (
        <AccordionItem value={card.id.toString()} ref={setNodeRef} style={style} className="border-b-0">
            <div className={cn("p-0 bg-card flex items-start justify-between gap-2 rounded-md shadow-sm border-l-4", styleInfo.border)}>
                <div className="flex items-center flex-grow">
                    <span {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-3 shrink-0 self-stretch flex items-center">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <AccordionTrigger className="flex-grow p-3 pl-0 text-left hover:no-underline">
                        <p className="text-sm font-semibold text-left">{card.question}</p>
                    </AccordionTrigger>
                </div>
                <div className="flex items-center shrink-0 pr-1 pt-3 gap-2">
                    <Badge className={cn(styleInfo.badge, "pointer-events-none")}>{pillarKey.charAt(0).toUpperCase() + pillarKey.slice(1)}</Badge>
                    <Button size="icon" variant="ghost" onClick={onRemove} className="h-8 w-8 shrink-0 text-destructive-foreground/70 hover:text-destructive-foreground">
                        <Undo2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <AccordionContent className="bg-card rounded-b-md px-3 pb-3 -mt-1">
                 <div className="border-t pt-2 text-muted-foreground text-xs space-y-1">
                    <p><span className="font-semibold text-foreground/80">Objectif:</span> {card.objectif}</p>
                    {card.tip && <p><span className="font-semibold text-foreground/80">Conseil:</span> {card.tip}</p>}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

