

import type { ContextData, GrandTheme, GrandThemeGroup } from '@/lib/types';
import { Waves, Wind, Cloud, SwatchBook, LocateFixed, Globe, Fish, Users, Anchor, Trash2, Sailboat, Microscope, BookOpen, Factory, Ship, Mountain, Leaf, Shield, User, Info, PersonStanding, LandPlot, Sun, Route, GraduationCap, Compass } from 'lucide-react';

export const contextData: ContextData = {
  weather: { condition: 'Ensoleillé', wind: '15 kt NW', temp: '18°C' },
  tide: { current: 'Marée montante', high: '14h30', coefficient: 85 },
  alerts: ['Zone herbiers : éviter secteur Est', 'Migration sternes : observations possibles']
};

export const groupedThemes: GrandThemeGroup[] = [
    {
        label: "Comprendre le lieu géographique",
        themes: [
            { id: "caracteristiques_littoral", title: "Caractéristiques du littoral", icon: LandPlot, description: "Topographie, nature du sol, estran..." },
            { id: "activites_humaines", title: "Activités humaines", icon: Anchor, description: "Pêche, plaisance, cultures marines..." },
            { id: "biodiversite_saisonnalite", title: "Biodiversité et saisonnalité", icon: Fish, description: "Faune, flore, cycles de vie..." },
        ]
    },
    {
        label: "Observer l'espace d'évolution",
        themes: [
            { id: "lecture_paysage", title: "Lecture du paysage", icon: Mountain, description: "Amers, urbanisation, zones naturelles..." },
            { id: "reperes_spatio_temporels", title: "Repères spatio-temporels", icon: Compass, description: "Orientation, marées, météo..." },
            { id: "interactions_climatiques", title: "Interactions des éléments climatiques", icon: Wind, description: "Vent, courants, houle, thermique..." },
        ]
    },
    {
        label: "Protéger le site naturel",
        themes: [
            { id: "impact_presence_humaine", title: "Impact de la présence humaine", icon: Trash2, description: "Pollution, espèces invasives, dérangement..." },
            { id: "cohabitation_vivant", title: "Cohabitation avec le vivant", icon: Leaf, description: "Zones de nidification, reposoirs..." },
            { id: "sciences_participatives", title: "Sciences participatives", icon: Microscope, description: "Devenir acteur de la connaissance." },
        ]
    }
];
