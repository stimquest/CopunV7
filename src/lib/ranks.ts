
import { Medal, Shield, Gem, Crown, Rocket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Rank {
    name: string;
    minDefis: number;
    icon: LucideIcon;
    color: string;
}

export const rankConfig: Rank[] = [
    { name: 'Bronze', minDefis: 0, icon: Medal, color: '#cd7f32' },
    { name: 'Argent', minDefis: 10, icon: Shield, color: '#c0c0c0' },
    { name: 'Or', minDefis: 25, icon: Trophy, color: '#ffd700' },
    { name: 'Champion', minDefis: 50, icon: Crown, color: '#8a2be2' },
    { name: 'Elite', minDefis: 100, icon: Rocket, color: '#00ffff' },
];


export const getRankForDefis = (defiCount: number): Rank => {
    let currentRank: Rank = rankConfig[0];
    for (const rank of rankConfig) {
        if (defiCount >= rank.minDefis) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
};
