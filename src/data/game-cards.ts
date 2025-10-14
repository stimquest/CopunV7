import type { GameCard } from '@/lib/types';

export const staticGameCards: GameCard[] = [
  // Triage Cards
  {
    type: 'triage',
    statement: "Le soleil est plus dangereux en mer à cause de la réverbération de l'eau.",
    isTrue: true,
  },
  {
    type: 'triage',
    statement: "Une méduse n'est plus urticante une fois échouée sur la plage.",
    isTrue: false,
  },
  {
    type: 'triage',
    statement: "Il est conseillé de mettre du vinaigre sur une piqûre de vive.",
    isTrue: false,
  },
  {
    type: 'triage',
    statement: "Le vent de terre (qui souffle de la terre vers la mer) est idéal pour les débutants.",
    isTrue: false,
  },
  {
    type: 'triage',
    statement: "Les coefficients de marée indiquent la hauteur de l'eau.",
    isTrue: false,
  },
  // Mots en Rafale Cards
  {
    type: 'mots',
    definition: "Partie arrière d'un bateau.",
    answer: "Poupe",
  },
  {
    type: 'mots',
    definition: "Côté du bateau qui reçoit le vent.",
    answer: "Au vent",
  },
  {
    type: 'mots',
    definition: "Terme marin pour désigner le côté gauche du bateau.",
    answer: "Bâbord",
  },
  {
    type: 'mots',
    definition: "Action de retourner un bateau (chavirer).",
    answer: "Dessaler",
  },
  {
    type: 'mots',
    definition: "Zone où la mer monte et descend.",
    answer: "Estran",
  },
  // Dilemme du Marin Cards
  {
    type: 'dilemme',
    optionA: "Partir naviguer avec un gilet de sauvetage mal ajusté.",
    optionB: "Partir naviguer sans crème solaire.",
    explanation: "La sécurité prime toujours ! Un gilet mal ajusté peut être inefficace. Le soleil est dangereux, mais un gilet est vital.",
  },
  {
    type: 'dilemme',
    optionA: "Jeter un tout petit papier de bonbon par-dessus bord.",
    optionB: "Naviguer très près d'un nid d'oiseaux marins pour bien les voir.",
    explanation: "Les deux sont mauvais pour l'environnement. Le déchet pollue, mais le dérangement de la faune peut avoir des conséquences graves sur leur reproduction.",
  },
  {
    type: 'dilemme',
    optionA: "Avoir le mal de mer pendant toute la sortie.",
    optionB: "Devoir démêler un énorme noeud dans les écoutes.",
    explanation: "Un dilemme entre le confort personnel et un problème technique. Le mal de mer est très désagréable mais le noeud peut être un risque pour la sécurité.",
  },
  {
    type: 'dilemme',
    optionA: "Oublier le nom de 3 manoeuvres essentielles.",
    optionB: "Oublier le nom de 3 espèces d'oiseaux locaux.",
    explanation: "Un choix entre la connaissance technique (sécurité) et la connaissance de l'environnement (culture). L'un est crucial, l'autre est enrichissant.",
  },
   {
    type: 'dilemme',
    optionA: "Naviguer dans une zone avec beaucoup de méduses.",
    optionB: "Naviguer dans une zone avec beaucoup d'algues.",
    explanation: "Les méduses présentent un risque de piqûre, tandis que les algues peuvent gêner la navigation mais sont généralement inoffensives.",
  },
];
