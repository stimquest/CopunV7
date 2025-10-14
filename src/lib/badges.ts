import type { LucideIcon } from 'lucide-react';
import type { BadgeId, BadgeInfo } from './types';
import { Gamepad2, CheckCircle, Trophy } from 'lucide-react';

export const badgeConfig: Record<BadgeId, Omit<BadgeInfo, 'unlocked'>> = {
    badge_maitre_du_programme: {
        id: 'badge_maitre_du_programme',
        title: 'Maître du Programme',
        description: 'Création de votre premier programme pédagogique complet.',
    },
    badge_animateur_pedagogique: {
        id: 'badge_animateur_pedagogique',
        title: 'Animateur Pédagogique',
        description: 'Obtenu après avoir animé un jeu où le groupe a eu plus de 80% de bonnes réponses.',
    },
};
