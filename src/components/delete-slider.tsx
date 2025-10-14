
'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronsRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteSliderProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function DeleteSlider({ onConfirm, disabled = false }: DeleteSliderProps) {
  const x = useMotionValue(0);
  const [confirmed, setConfirmed] = useState(false);

  // HSL values from globals.css
  const secondaryColor = 'hsl(220 13% 30%)'; // --secondary
  const destructiveColor = 'hsl(0 72% 51%)'; // --destructive

  const background = useTransform(
    x,
    [0, 260], // from 0px slide to 260px slide
    [secondaryColor, destructiveColor]
  );
  
  const handleDragEnd = () => {
    const sliderWidth = 260; // Approximate width of the slider track
    if (x.get() > sliderWidth * 0.75) {
      setConfirmed(true);
      onConfirm();
    } else {
      // Snap back
      x.set(0);
    }
  };

  return (
    <div className={cn("w-full max-w-xs mx-auto p-2 rounded-full relative overflow-hidden", disabled ? 'bg-muted' : 'bg-secondary')}>
      <motion.div
        className="h-12 w-full rounded-full flex items-center justify-center text-secondary-foreground font-medium"
        style={{ background }}
      >
        <span className={cn("absolute transition-opacity", x.get() > 10 && 'opacity-0')}>
          Glisser pour supprimer
        </span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 260 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className={cn(
            "absolute top-2 left-2 h-12 w-12 rounded-full bg-background shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing",
            disabled && 'cursor-not-allowed opacity-50'
        )}
        dragElastic={0.1}
        dragMomentum={false}
      >
        <ChevronsRight className="h-6 w-6 text-muted-foreground" />
      </motion.div>
    </div>
  );
}
