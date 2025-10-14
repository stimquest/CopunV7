
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Plus, X, RotateCcw, BookOpen, Eye, Shield, ArrowDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ContentCard, Theme, CardType, CardPriority } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import type { Swiper as SwiperType } from 'swiper';

const ICONS: { [key: string]: React.ElementType } = {
  comprendre: BookOpen,
  observer: Eye,
  proteger: Shield,
};

const typeConfig: { [key in CardType]: { label: string } } = {
  "Question": { label: "Question" },
  "Ressource": { label: "Ressource" },
};

const priorityConfig: { [key in CardPriority]: { label: string } } = {
  essential: { label: 'Essentiel' },
  complementary: { label: 'Complémentaire' },
  personal: { label: 'Personnel' },
};

interface ContentCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: ContentCard[];
  selectedCardIds: string[];
  onSelectedCardIdsChange: (newlySelectedCardIds: string[]) => void;
  theme: Theme;
}

export function ContentCardsModal({
  isOpen,
  onClose,
  allCards,
  selectedCardIds,
  onSelectedCardIdsChange,
  theme,
}: ContentCardsModalProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  
  // Internal state for the modal
  const [available, setAvailable] = useState<ContentCard[]>([]);
  const [selected, setSelected] = useState<ContentCard[]>([]);

  useEffect(() => {
    if (isOpen) {
      const selectedIdsSet = new Set(selectedCardIds);
      const initialSelected = allCards.filter(c => selectedIdsSet.has(c.id));
      const initialAvailable = allCards.filter(c => !selectedIdsSet.has(c.id));
      
      setAvailable(initialAvailable);
      setSelected(initialSelected);

      if (swiper) {
        swiper?.slideTo(0);
      }
    }
  }, [isOpen, allCards, selectedCardIds, swiper]);
  
  const onCardAction = (card: ContentCard, action: 'accept' | 'reject') => {
    if (action === 'accept') {
        setSelected(prev => [card, ...prev]);
    }
    setAvailable(prev => prev.filter(c => c.id !== card.id));
  };
  
  const onDeselectCard = (cardId: string) => {
    const cardToDeselect = selected.find(c => c.id === cardId);
    if (cardToDeselect) {
        setSelected(prev => prev.filter(c => c.id !== cardId));
        setAvailable(prev => [...prev, cardToDeselect].sort((a,b) => a.question.localeCompare(b.question)));
    }
  };
  
  const onReset = () => {
      const selectedIdsSet = new Set(selectedCardIds);
      const initialSelected = allCards.filter(c => selectedIdsSet.has(c.id));
      const initialAvailable = allCards.filter(c => !selectedIdsSet.has(c.id));
      setAvailable(initialAvailable);
      setSelected(initialSelected);
  };
  
  const handleSave = () => {
    onSelectedCardIdsChange(selected.map(c => c.id));
  };

  const totalDuration = selected.reduce((sum, card) => sum + (card.duration || 0), 0);

  if (!isOpen) return null;
  
  const IconComponent = ICONS[theme.id as keyof typeof ICONS];
  const title = "Sélection des Questions";
  const description = "Glissez vers le bas pour ajouter une question à votre séance.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 flex flex-col h-full md:h-auto md:max-h-[95vh] overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-3">
             <div className={cn("p-1.5 rounded-lg", `bg-${theme.color}-500`)}>
                {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
            </div>
            <div>
                {title} - <span className="text-muted-foreground">{theme.title}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow px-6 flex flex-col gap-4 overflow-y-auto">
          {/* Swiper Card Stack */}
          <div className="h-[420px] flex items-center justify-center">
             {available.length > 0 ? (
                <Swiper
                    onSwiper={setSwiper}
                    effect={'cards'}
                    grabCursor={true}
                    modules={[EffectCards]}
                    className="w-[280px] h-[400px]"
                >
                    {available.map((card) => (
                        <SwiperSlide key={card.id}>
                            <DraggableCard onAction={(action) => onCardAction(card, action)}>
                                <CardDisplay card={card} />
                            </DraggableCard>
                        </SwiperSlide>
                    ))}
                </Swiper>
              ) : (
                <Card className="h-[400px] w-[280px] flex flex-col items-center justify-center text-center p-4 bg-muted/50 border-dashed">
                  <CardHeader>
                    <CardTitle>Pioche terminée !</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={onReset}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Recommencer
                    </Button>
                  </CardContent>
                </Card>
              )}
          </div>
          
          {/* Selection List */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Votre Sélection ({selected.length})</h3>
            <ScrollArea className="bg-muted/50 p-2 rounded-lg border h-48">
              {selected.length > 0 ? (
                <div className="space-y-2">
                  {selected.map(card => (
                    <MiniCard key={card.id} card={card} onAction={() => onDeselectCard(card.id)} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
                  Les cartes que vous ajoutez apparaîtront ici.
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t flex-col sm:flex-row sm:justify-between w-full items-center shrink-0 gap-4">
          <Badge variant="outline" className="text-base order-2 sm:order-1">
            Durée estimée: <span className="font-bold ml-1.5">{totalDuration} min</span>
          </Badge>
          <Button onClick={handleSave} className="w-full sm:w-auto order-1 sm:order-2">
            Valider ma sélection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DraggableCard = ({ children, onAction }: { children: React.ReactNode, onAction: (action: 'accept' | 'reject') => void }) => {
    const y = useMotionValue(0);
    const scale = useTransform(y, [0, 150], [1, 0.95]);
    const rotate = useTransform(y, [0, 150], [0, -5]);
    const downArrowOpacity = useTransform(y, [0, 75], [0, 1]);

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.y > 100) {
            onAction('accept'); // Swipe down to accept
        } else if (info.offset.y < -100) {
            onAction('reject'); // Swipe up to reject
        }
    };

    return (
        <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            style={{ y, scale, rotate }}
            onDragEnd={handleDragEnd}
            className="w-full h-full relative"
        >
            {React.cloneElement(children as React.ReactElement, { downArrowOpacity })}
        </motion.div>
    );
};


const CardDisplay = ({ card, downArrowOpacity }: { card: ContentCard, downArrowOpacity?: any }) => {
    const typeInfo = card.type ? typeConfig[card.type] : null;
    const priority = card.priority || 'personal';
    const priorityInfo = priorityConfig[priority];
    
    return (
      <Card className="w-full h-full p-0 flex flex-col justify-between shadow-2xl border-2 cursor-grab active:cursor-grabbing relative overflow-hidden">
        {downArrowOpacity && (
          <motion.div 
            className="absolute inset-x-0 top-6 z-10 flex justify-center text-muted-foreground"
            style={{ opacity: downArrowOpacity }}
          >
            <ArrowDown className="w-8 h-8" />
          </motion.div>
        )}
        <CardHeader className="p-4 pb-2">
          <div className="relative w-full h-32 rounded-md overflow-hidden bg-muted">
            {card.image && <Image src={card.image} alt={card.question} fill style={{objectFit: 'cover'}} data-ai-hint={card['data-ai-hint']} />}
          </div>
          <CardTitle className="mt-2 text-lg">{card.question}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow overflow-y-auto">
          <ScrollArea className="h-full">
            <p className="text-sm text-muted-foreground pr-4">{card.answer}</p>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 pt-0 shrink-0 border-t mt-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
               {priorityInfo && <Badge variant='outline'>{priorityInfo.label}</Badge>}
               {typeInfo && <Badge variant="outline">{typeInfo.label}</Badge>}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{card.duration || 0} min</span>
            </div>
        </CardFooter>
      </Card>
    );
};

function MiniCard({ card, onAction }: { card: ContentCard; onAction: () => void }) {
  return (
    <Card className="flex items-center p-2 transition-all bg-card">
      <div className="relative w-12 h-10 rounded-md overflow-hidden mr-3 shrink-0 bg-muted">
        {card.image && <Image src={card.image} alt={card.question} fill style={{objectFit: 'cover'}} data-ai-hint={card['data-ai-hint']} />}
      </div>
      <div className="flex-grow">
        <p className="font-medium text-sm leading-tight">{card.question}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{card.duration || 0} min</span>
          {card.type && <span>&middot;</span>}
          {card.type && <span>{typeConfig[card.type].label}</span>}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 text-muted-foreground hover:bg-muted shrink-0" onClick={onAction}>
        <X className="w-4 h-4 text-destructive" />
      </Button>
    </Card>
  );
}

    