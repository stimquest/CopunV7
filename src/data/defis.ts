
import type { Defi } from '@/lib/types';

export const allDefis: Defi[] = [
    // --- Thème : Caractéristiques du littoral ---
    {
        id: 'defi_littoral_1',
        description: 'Cartographier l\'estran',
        instruction: 'Avec votre groupe, dessinez une carte simple de l\'estran à marée basse, en identifiant les zones rocheuses, sableuses et les laisses de mer. Prenez une photo de votre carte.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'photo',
        icon: 'LandPlot',
        tags_theme: ['caracteristiques_littoral', 'lecture_paysage'],
    },

    // --- Thème : Activités humaines ---
    {
        id: 'defi_activites_1',
        description: 'Recenser les activités locales',
        instruction: 'Observez et listez 3 activités humaines différentes sur votre site de pratique (pêche, plaisance, kayak, etc.). Validez en cochant la case.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'checkbox',
        icon: 'BookOpen',
        tags_theme: ['activites_humaines'],
    },

    // --- Thème : Biodiversité et saisonnalité ---
    {
        id: 'defi_bio_1',
        description: 'Identifier 3 espèces locales',
        instruction: 'Prenez en photo 3 espèces (animales ou végétales) distinctes rencontrées durant votre sortie et essayez de les nommer.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'photo',
        icon: 'Fish',
        tags_theme: ['biodiversite_saisonnalite', 'cohabitation_vivant'],
    },

    // --- Thème : Lecture du paysage ---
    {
        id: 'defi_paysage_1',
        description: 'Définir 3 amers',
        instruction: 'Identifiez 3 points de repère fixes et utiles (amers) sur la côte et prenez-les en photo.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'photo',
        icon: 'Map',
        tags_theme: ['lecture_paysage', 'reperes_spatio_temporels'],
    },
    
    // --- Thème : Repères spatio-temporels ---
     {
        id: 'defi_reperes_1',
        description: 'Observer la marée',
        instruction: 'Marquez le niveau de l\'eau à un instant T sur un rocher ou un poteau. Revenez 30 minutes plus tard et cochez cette case pour valider que vous avez constaté le changement.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'checkbox',
        icon: 'Compass',
        tags_theme: ['reperes_spatio_temporels'],
    },

    // --- Thème : Interactions climatiques ---
     {
        id: 'defi_meteo_1',
        description: 'Estimer la force du vent',
        instruction: 'Après avoir observé le plan d\'eau (moutons, risées), estimez la force du vent sur l\'échelle de Beaufort. Cochez pour valider votre estimation.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'checkbox',
        icon: 'Wind',
        tags_theme: ['interactions_climatiques'],
    },

    // --- Thème : Impact de la présence humaine ---
     {
        id: 'defi_pollution_1',
        description: 'Collecte de déchets ciblée',
        instruction: 'Ramassez 5 déchets d\'origine humaine sur la plage et prenez-les en photo avant de les jeter dans une poubelle.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'photo',
        icon: 'Trash2',
        tags_theme: ['impact_presence_humaine'],
    },

    // --- Thème : Cohabitation avec le vivant ---
    {
        id: 'defi_cohabitation_1',
        description: 'Observation à distance',
        instruction: 'Observez un groupe d\'oiseaux ou d\'autres animaux marins à distance (avec des jumelles si possible) pendant 5 minutes sans les déranger. Cochez pour valider.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'checkbox',
        icon: 'Shield',
        tags_theme: ['cohabitation_vivant'],
    },
    
    // --- Thème : Sciences participatives ---
    {
        id: 'defi_sciences_1',
        description: 'Contribuer à une base de données',
        instruction: 'Utilisez une application de sciences participatives (comme OBSenMER ou iNaturalist) pour signaler une de vos observations. Prenez une capture d\'écran de votre signalement.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'photo',
        icon: 'Microscope',
        tags_theme: ['sciences_participatives'],
    },
    
    // --- Défis transverses (Jeu) ---
    {
        id: 'defi_jeu_1',
        description: 'Animer un jeu pédagogique',
        instruction: 'Créez un jeu (Quiz, Vrai/Faux...) à partir des thèmes de votre programme et jouez-y avec votre groupe. Cochez pour valider.',
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel', 'scolaire'],
        type_preuve: 'checkbox',
        icon: 'Gamepad2',
        tags_theme: ['activites_humaines', 'reperes_spatio_temporels', 'biodiversite_saisonnalite'],
    },
];
