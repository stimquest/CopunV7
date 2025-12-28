

'use server';

import type { ContextData, GroupProfile, Sortie, Stage, ContentCard, EtagesData, SelectedNotions, SelectedContent, CardPriority, Observation, Game, GameData, GameCard, TriageCard, MotsEnRafaleCard, DilemmeDuMarinCard, DbGameCard, TriageItem, MotsEnRafaleItem, DilemmeDuMarinItem, QuizzCard, QuizzItem, GameCardType, DbGameCardData, ProgramAxe, ProgramSelections, Option, QuizAttempt, PedagogicalContent, DefiStatus, StageGameHistory } from '@/lib/types';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { format, parseISO, isSameDay, startOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { contextData, groupedThemes } from '@/data/etages';

export async function getStagePageData(stageId: number) {
    const [stage, sorties, games, etagesData, allPedagogicalContent, completedObjectivesIds] = await Promise.all([
        getStageById(stageId),
        getSortiesForStage(stageId),
        getGamesForStage(stageId),
        getEtagesData(),
        getPedagogicalContent(),
        getCompletedObjectives(stageId),
    ]);

    return {
        stage,
        sorties,
        games,
        etagesData,
        allPedagogicalContent,
        completedObjectivesIds,
    };
}

// STAGES
export async function getStages(): Promise<Stage[]> {
    // Note: This is a server action, but we'll try to use offline cache if available
    try {
        const { data, error } = await supabase.from('stages').select('*').order('start_date', { ascending: true });
        if (error) {
            console.error('Error fetching stages:', error);
            return [];
        }
        return data;
    } catch (error) {
        console.error('Error fetching stages:', error);
        return [];
    }
}

export async function getStageById(id: number): Promise<Stage | null> {
    try {
        const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
        if (error) {
            console.error('Error fetching stage:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error fetching stage:', error);
        return null;
    }
}


export async function createStage(stage: Omit<Stage, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('stages').insert({
        title: stage.title,
        type: stage.type,
        participants: stage.participants,
        start_date: stage.start_date,
        end_date: stage.end_date,
        sport_activity: stage.sport_activity || null,
        sport_level: stage.sport_level || null,
        sport_description: stage.sport_description || null,
    }).select().single();

    if (error) {
        console.error('Error creating stage:', error);
        return null;
    }
    revalidatePath('/stages');
    return data;
}

export async function updateStage(stage: Omit<Stage, 'created_at'>): Promise<Stage | null> {
    const { data, error } = await supabase.from('stages').update({
        title: stage.title,
        type: stage.type,
        participants: stage.participants,
        start_date: stage.start_date,
        end_date: stage.end_date,
        sport_activity: stage.sport_activity || null,
        sport_level: stage.sport_level || null,
        sport_description: stage.sport_description || null,
    }).eq('id', stage.id).select().single();

    if (error) {
        console.error('Error updating stage:', error);
        return null;
    }
    revalidatePath('/stages'); // Revalidate calendar page
    revalidatePath(`/stages/${stage.id}`); // Revalidate detail page
    return data;
}

export async function deleteStage(stageId: number) {
    // First, delete associated sorties
    const { error: sortiesError } = await supabase.from('sorties').delete().eq('stage_id', stageId);
    if (sortiesError) {
        console.error('Error deleting associated sorties:', sortiesError);
        return false;
    }

    // Then, delete the stage itself
    const { error: stageError } = await supabase.from('stages').delete().eq('id', stageId);
    if (stageError) {
        console.error('Error deleting stage:', stageError);
        return false;
    }
    revalidatePath('/stages');
    redirect('/stages');
}


// SORTIES
export async function getSortiesForStage(stageId: number): Promise<Sortie[]> {
    try {
        const { data, error } = await supabase.from('sorties').select('*').eq('stage_id', stageId).order('date', { ascending: false });
        if (error) {
            console.error('Error fetching sorties:', error);
            return [];
        }
        return data.map(s => ({
            ...s,
            selected_notions: (s.selected_notions || { niveau: 0, comprendre: 0, observer: 0, proteger: 0 }) as Partial<SelectedNotions>,
            selected_content: (s.selected_content || {}) as Partial<SelectedContent>,
        }));
    } catch (error) {
        console.error('Error fetching sorties:', error);
        return [];
    }
}

export async function getAllSorties(): Promise<Map<number, { id: number; stage_id: number; selected_content: Partial<SelectedContent> }[]>> {
    const { data, error } = await supabase
        .from('sorties')
        .select('id, stage_id, selected_content')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching all sorties:', error);
        return new Map();
    }

    const sortiesByStage = new Map<number, { id: number; stage_id: number; selected_content: Partial<SelectedContent> }[]>();
    data?.forEach(s => {
        const sortie = {
            id: s.id,
            stage_id: s.stage_id,
            selected_content: s.selected_content as Partial<SelectedContent>,
        };
        if (!sortiesByStage.has(s.stage_id)) {
            sortiesByStage.set(s.stage_id, []);
        }
        sortiesByStage.get(s.stage_id)!.push(sortie);
    });
    return sortiesByStage;
}

export async function getSortieById(sortieId: number): Promise<Sortie | null> {
    const { data, error } = await supabase.from('sorties').select('*').eq('id', sortieId).single();
    if (error) {
        console.error('Error fetching sortie:', error);
        return null;
    }
    return {
        ...data,
        selected_notions: (data.selected_notions || { niveau: 0, comprendre: 0, observer: 0, proteger: 0 }) as Partial<SelectedNotions>,
        selected_content: (data.selected_content || {}) as Partial<SelectedContent>,
    };
}

export async function createSortie(sortie: Omit<Sortie, 'id' | 'created_at'>) {
    const { error } = await supabase.from('sorties').insert(sortie);
    if (error) {
        console.error('Error creating sortie:', error);
        return false;
    }
    revalidatePath(`/stages/${sortie.stage_id}`);
    return true;
}


export async function deleteSortie(sortieId: number, stageId: number) {
    const { error } = await supabase.from('sorties').delete().eq('id', sortieId);
    if (error) {
        console.error('Error deleting sortie:', error);
        return false;
    }
    revalidatePath(`/stages/${stageId}`);
    return true;
}

async function generateMemoForProgram(stage: Stage, levelIndex: number, mainThemeLabels: string[], selectedCards: PedagogicalContent[], etagesData: EtagesData): Promise<string> {
    let content = ``;
    content += `Fiche Programme Pédagogique\n`;
    content += `================================\n`;
    content += `Stage: ${stage.title}\n\n`;

    content += `THÈMES PRINCIPAUX\n`;
    content += `--------------------------------\n`;
    content += `${mainThemeLabels.join(', ')}\n\n`;

    content += `CONDITIONS INDICATIVES (GÉNÉRIQUES)\n`;
    content += `--------------------------------\n`;
    content += `Météo: ${contextData.weather.condition}, ${contextData.weather.temp}\n`;
    content += `Vent: ${contextData.weather.wind}\n`;
    content += `Marée: ${contextData.tide.current} (Coeff: ${contextData.tide.coefficient}), Pleine mer à ${contextData.tide.high}\n\n`;

    const niveau = etagesData.niveau.options[levelIndex];
    content += `OBJECTIFS PÉDAGOGIQUES\n`;
    content += `--------------------------------\n`;
    content += `Niveau visé: ${niveau.label}\n`;

    const cardsByPillar: { [key: string]: PedagogicalContent[] } = {
        comprendre: [],
        observer: [],
        proteger: []
    };

    const pillarMap = {
        'COMPRENDRE': 'comprendre',
        'OBSERVER': 'observer',
        'PROTÉGER': 'proteger'
    }

    selectedCards.forEach(card => {
        const pillarKey = pillarMap[card.dimension as keyof typeof pillarMap];
        if (pillarKey && cardsByPillar[pillarKey]) {
            cardsByPillar[pillarKey].push(card);
        }
    });

    content += `\nDÉROULÉ & QUESTIONS CLÉS (CHECKLIST)\n`;
    content += `--------------------------------\n`;

    const axes = ['comprendre', 'observer', 'proteger'] as const;
    axes.forEach(axeId => {
        const pillarCards = cardsByPillar[axeId];
        if (pillarCards.length > 0) {
            content += `\n// ${axeId.toUpperCase()} //\n`;
            pillarCards.forEach(card => {
                content += `[ ] ? ${card.question}\n`;
                content += `      Pistes: ${card.objectif}\n\n`;
            });
        }
    });

    if (selectedCards.length === 0) {
        content += `Aucun contenu pédagogique sélectionné pour ce programme.\n`;
    }

    content += `MATÉRIEL & SÉCURITÉ\n`;
    content += `--------------------------------\n`;
    content += `Points de vigilance: ${niveau.safety?.join(', ') || 'Aucun point spécifique.'}\n\n`;

    return content;
}

export async function saveOrUpdateProgramForStage(
    stageId: number,
    stageLevel: number,
    mainThemeTitles: string[],
    selectedCardIds: string[]
) {
    const [stage, etagesData, allCards] = await Promise.all([
        getStageById(stageId),
        getEtagesData(),
        getPedagogicalContent()
    ]);

    if (!stage || !etagesData) {
        console.error("Stage or Etages data not found");
        return { success: false, error: "Données non trouvées" };
    }

    const { error: deleteError } = await supabase.from('sorties').delete().eq('stage_id', stageId);
    if (deleteError) {
        console.error("Error deleting old sorties:", deleteError);
        return { success: false, error: "Impossible de réinitialiser le programme existant." };
    }

    if (selectedCardIds.length === 0) {
        revalidatePath(`/stages/${stageId}`);
        // Note: /stages/${stageId}/programme n'est pas une route - supprimé
        return { success: true };
    }

    if (mainThemeTitles.length === 0) {
        return { success: false, error: "Thème principal non trouvé." };
    }

    const selectedCardsDetails = selectedCardIds.map(id =>
        allCards.find(c => c.id.toString() === id)
    ).filter((c): c is PedagogicalContent => !!c);

    const memoContent = await generateMemoForProgram(stage, stageLevel, mainThemeTitles, selectedCardsDetails, etagesData);
    const totalDuration = 0; // duration is deprecated
    const stageDays = eachDayOfInterval({ start: parseISO(stage.start_date), end: parseISO(stage.end_date) });

    const selectedNotions = { niveau: stageLevel, comprendre: 0, observer: 0, proteger: 0 };
    const selectedContent = { program: selectedCardIds, themes: mainThemeTitles };

    const sortieTitle = `Programme: ${mainThemeTitles.join(', ').substring(0, 50)}...`

    const promises = [];
    for (const day of stageDays) {
        const dateISO = format(day, 'yyyy-MM-dd');
        const sortieData = {
            stage_id: stage.id,
            date: dateISO,
            title: sortieTitle,
            themes: mainThemeTitles,
            duration: totalDuration,
            summary: memoContent.substring(0, 150) + (memoContent.length > 150 ? '...' : ''),
            content: memoContent,
            selected_notions: selectedNotions as any,
            selected_content: selectedContent as any,
        };
        promises.push(supabase.from('sorties').insert(sortieData));
    }


    const results = await Promise.all(promises);
    const errors = results.map(r => r.error).filter(Boolean);

    if (errors.length > 0) {
        console.error("Errors saving program:", errors);
        return { success: false, error: "Certains objectifs n'ont pas pu être sauvegardés." };
    }

    // --- Update stage title dynamically ---
    const levelLabel = etagesData.niveau.options[stageLevel]?.label || `Niveau ${stageLevel + 1}`;
    // Ensure we don't append to an already dynamic title
    const baseTitle = stage.title.split(' - ')[0].trim();
    const dynamicTitle = `${baseTitle} - ${levelLabel} - ${mainThemeTitles.join(' & ')}`;
    await updateStage({ ...stage, title: dynamicTitle });
    // --- End of title update ---

    revalidatePath(`/stages/${stageId}`);
    // Note: /stages/${stageId}/programme n'est pas une route - supprimé
    return { success: true };
}


// --- PEDAGOGICAL CONTENT (from Supabase) ---

export async function getPedagogicalContent(): Promise<PedagogicalContent[]> {
    try {
        const { data, error } = await supabase
            .from('pedagogical_content')
            .select('*')
            .order('id')
            .limit(500); // Limite raisonnable pour le contenu pédagogique
        if (error) {
            console.error("Error fetching pedagogical content:", error);
            return [];
        }
        return data;
    } catch (error) {
        console.error("Error fetching pedagogical content:", error);
        return [];
    }
}

export async function getPedagogicalContentById(id: number): Promise<PedagogicalContent | null> {
    try {
        const { data, error } = await supabase.from('pedagogical_content').select('*').eq('id', id).single();
        if (error) {
            console.error("Error fetching pedagogical content by id:", error);
            return null;
        }
        return data;
    } catch (error) {
        console.error("Error fetching pedagogical content by id:", error);
        return null;
    }
}

export async function getPedagogicalContentMinimal(): Promise<Pick<PedagogicalContent, 'id' | 'tags_theme' | 'dimension'>[]> {
    const { data, error } = await supabase
        .from('pedagogical_content')
        .select('id, tags_theme, dimension')
        .order('id');
    if (error) {
        console.error('Error fetching pedagogical content minimal:', error);
        return [];
    }
    return data || [];
}

export async function getAllGameCardsMinimal(): Promise<{ id: number; theme: string }[]> {
    const { data, error } = await supabase
        .from('game_cards')
        .select('id, data')
        .order('id');
    if (error) {
        console.error('Error fetching game cards minimal:', error);
        return [];
    }
    return (data || []).map(row => ({
        id: row.id,
        theme: (row.data as any)?.theme || 'Général'
    }));
}

export async function createPedagogicalContent(content: Omit<PedagogicalContent, 'id'>) {
    const { data, error } = await supabase.from('pedagogical_content').insert(content).select().single();
    if (error) {
        console.error('Error creating pedagogical content:', error);
        return null;
    }
    revalidatePath('/admin/contenu');
    return data;
}

export async function updatePedagogicalContent(content: PedagogicalContent) {
    const { error } = await supabase.from('pedagogical_content').update(content).eq('id', content.id);
    if (error) {
        console.error('Error updating pedagogical content:', error);
        return false;
    }
    revalidatePath('/admin/contenu');
    revalidatePath(`/admin/contenu/modifier/${content.id}`);
    return true;
}

export async function deletePedagogicalContent(id: number) {
    const { error } = await supabase.from('pedagogical_content').delete().eq('id', id);
    if (error) {
        console.error('Error deleting pedagogical content:', error);
        return false;
    }
    revalidatePath('/admin/contenu');
    return true;
}

// This function transforms the DB data into the structure the app uses
export async function getEtagesData(): Promise<EtagesData | null> {
    try {
        const allCards: PedagogicalContent[] = await getPedagogicalContent();

        const contentCards: ContentCard[] = allCards.map(q => ({
            id: `${q.id}`,
            question: q.question,
            answer: q.objectif,
            option_id: q.dimension.toLowerCase(),
            priority: 'essential',
            status: 'validated',
            type: 'Question',
            duration: 0,
            tags_theme: q.tags_theme || [],
            tags_filtre: q.tags_filtre || [],
            niveau: q.niveau,
            tags: q.tags_filtre || [],
            tip: q.tip || ''
        }));

        const etagesData: EtagesData = {
            niveau: {
                id: "niveau",
                title: "Niveau du Groupe",
                icon: "Target",
                color: "blue",
                options: [
                    { id: "niv1", label: "1 - Je prends conscience, je découvre", tip: "Objectifs pour prendre conscience de son environnement.", etage_id: 'niveau', order: 1, contentCards: [], duration: null, group_size: null, safety: [], materials: [] },
                    { id: "niv2", label: "2-3 - J'agis en conscience, je m’adapte", tip: "Objectifs pour agir en conscience et s'adapter.", etage_id: 'niveau', order: 2, contentCards: [], duration: null, group_size: null, safety: [], materials: [] },
                    { id: "niv3", label: "4-5 - J’agis de façon responsable, j'anticipe", tip: "Objectifs pour anticiper et agir de manière autonome et éclairée.", etage_id: 'niveau', order: 3, contentCards: [], duration: null, group_size: null, safety: [], materials: [] }
                ],
            },
            comprendre: {
                id: "comprendre",
                title: "Comprendre",
                icon: "BookOpen",
                color: "yellow",
                options: [],
            },
            observer: {
                id: "observer",
                title: "Observer",
                icon: "Eye",
                color: "blue",
                options: [],
            },
            proteger: {
                id: "proteger",
                title: "Protéger",
                icon: "Shield",
                color: "green",
                options: [],
            },
        };

        const pillarMap = {
            'COMPRENDRE': 'comprendre',
            'OBSERVER': 'observer',
            'PROTÉGER': 'proteger'
        }

        Object.entries(pillarMap).forEach(([jsonKey, etageKey]) => {
            const cardsForPillar = contentCards.filter(c => c.option_id === etageKey);
            etagesData[etageKey as keyof EtagesData].options.push({
                id: etageKey,
                etage_id: etageKey,
                label: `Toutes les notions - ${etageKey}`,
                tip: '',
                order: 1,
                contentCards: cardsForPillar,
                duration: null,
                group_size: null,
                safety: [],
                materials: []
            });
        });

        return etagesData;
    } catch (error) {
        console.error('Error processing etages data from DB:', error);
        return null;
    }
}

// OBSERVATIONS
export async function getObservations(): Promise<Observation[]> {
    const { data, error } = await supabase
        .from('observations')
        .select('*')
        .order('observation_date', { ascending: false })
        .limit(100); // Limite à 100 observations récentes
    if (error) {
        console.error('Error fetching observations:', error);
        return [];
    }
    return data;
}

export async function createObservation(observation: Omit<Observation, 'id' | 'created_at'>) {
    const { error } = await supabase.from('observations').insert({
        ...observation,
    });
    if (error) {
        console.error('Error creating observation', error);
        return false;
    }
    revalidatePath('/observations');
    return true;
}

export async function updateObservation(observation: Omit<Observation, 'created_at'>) {
    const { error } = await supabase.from('observations').update({
        title: observation.title,
        description: observation.description,
        category: observation.category,
        latitude: observation.latitude,
        longitude: observation.longitude,
        observation_date: observation.observation_date,
    }).eq('id', observation.id);

    if (error) {
        console.error('Error updating observation', error);
        return false;
    }
    revalidatePath('/observations');
    return true;
}

export async function deleteObservation(id: number) {
    const { error } = await supabase.from('observations').delete().eq('id', id);
    if (error) {
        console.error('Error deleting observation', error);
        return false;
    }
    revalidatePath('/observations');
    return true;
}

// --- GAME CARDS ---

// Flag pour éviter de seeder plusieurs fois par session serveur
// NOTE: Ce flag est réinitialisé à chaque redémarrage du serveur, mais évite
// les appels répétés pendant la même session (économise ~7 requêtes par appel)
let gameCardsSeeded = false;

// Function to seed initial game cards if they don't exist
// Optimisé: ne s'exécute qu'une fois par session serveur
async function seedInitialGameCards() {
    if (gameCardsSeeded) return; // Skip si déjà seedé cette session

    const tideQuizzCards: Omit<DbGameCard, 'id' | 'created_at'>[] = [
        {
            type: 'quizz',
            data: {
                question: "Quelle est la raison principale de l'existence de plusieurs marées par jour ?",
                answers: ["La rotation de la Terre", "L'attraction combinée de la Lune et du Soleil", "La force du vent", "Les courants marins profonds"],
                correctAnswerIndex: 1,
                theme: "Repères spatio-temporels",
                related_objective_id: "1"
            } as any
        },
        {
            type: 'quizz',
            data: {
                question: "Grâce à quoi les horaires de marées sont-ils prévisibles avec une grande précision ?",
                answers: ["L'observation des oiseaux", "Les calculs astronomiques basés sur les cycles lunaires et solaires", "La température de l'eau", "Les bulletins météo"],
                correctAnswerIndex: 1,
                theme: "Repères spatio-temporels",
                related_objective_id: "6"
            } as any
        },
        {
            type: 'quizz',
            data: {
                question: "Qu'est-ce que le coefficient de marée indique principalement ?",
                answers: ["La température de l'eau", "La vitesse du courant", "La hauteur de la vague", "L'amplitude de la marée (le marnage)"],
                correctAnswerIndex: 3,
                theme: "Repères spatio-temporels",
                related_objective_id: "7"
            } as any
        },
        {
            type: 'quizz',
            data: {
                question: "Quel est le nom de la zone découverte par la marée basse ?",
                answers: ["La dune", "L'estran", "La laisse de mer", "Le plateau continental"],
                correctAnswerIndex: 1,
                theme: "Caractéristiques du littoral",
                related_objective_id: "4"
            } as any
        },
        {
            type: 'quizz',
            data: {
                question: "Durant quelle phase le courant de marée est-il généralement le plus fort ?",
                answers: ["Au début de la marée montante", "À la pleine mer (étale)", "Au milieu de la marée (montante ou descendante)", "À la basse mer (étale)"],
                correctAnswerIndex: 2,
                theme: "Interactions des éléments climatiques",
                related_objective_id: "9"
            } as any
        },
        {
            type: 'quizz',
            data: {
                question: "Comment appelle-t-on le moment où la mer monte ?",
                answers: ["Le jusant", "Le courant", "L'étale", "Le flot"],
                correctAnswerIndex: 3,
                theme: "Repères spatio-temporels",
                related_objective_id: "10"
            } as any
        },
        {
            type: 'quizz',
            data: {
                question: "Quel est le meilleur indicateur visuel pour estimer le niveau de la prochaine pleine mer ?",
                answers: ["La hauteur des vagues", "La couleur de l'eau", "La laisse de haute mer", "La direction du vent"],
                correctAnswerIndex: 2,
                theme: "Lecture du paysage",
                related_objective_id: "14"
            } as any
        }
    ];

    for (const card of tideQuizzCards) {
        const cardData = card.data as any;
        const { data: existing, error: findError } = await supabase
            .from('game_cards')
            .select('id')
            .eq('data->>question', cardData.question)
            .maybeSingle();

        if (findError) {
            console.error('Error checking for existing game card:', findError);
            continue;
        }

        if (!existing) {
            const { error: insertError } = await supabase.from('game_cards').insert(card);
            if (insertError) {
                console.error('Error seeding game card:', insertError);
            }
        }
    }

    // Marquer comme seedé pour cette session
    gameCardsSeeded = true;
}


const convertDbToGameCard = (dbCard: DbGameCard): GameCard | null => {
    const cardData = dbCard.data as DbGameCardData;
    if (typeof cardData !== 'object' || cardData === null) {
        console.error('Invalid card data format', dbCard);
        return null;
    }

    // Ajouter un thème par défaut si manquant
    const enrichedData = {
        ...cardData,
        theme: (cardData as any).theme || 'Général', // Assurer qu'un thème est présent
    } as any; // Cast to any to allow dynamic properties like 'theme'

    return {
        id: dbCard.id,
        type: dbCard.type,
        ...enrichedData
    } as GameCard;
};


export async function getAllGameCardsFromDb(): Promise<GameCard[]> {
    // Paralléliser seed et requête
    const [, { data, error }] = await Promise.all([
        seedInitialGameCards(),
        supabase
            .from('game_cards')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200) // Limite pour éviter les requêtes trop lourdes
    ]);

    if (error) {
        console.error('Error fetching game cards:', error);
        return [];
    }
    try {
        return data.map(convertDbToGameCard).filter(Boolean) as GameCard[];
    } catch (e) {
        console.error("Error converting DB cards", e);
        return [];
    }
}

export async function getFilteredGameCards(types: GameCardType[], themes: string[], objectiveIds: string[] = []): Promise<GameCard[]> {
    // Paralléliser seed et requête
    const [, { data, error }] = await Promise.all([
        seedInitialGameCards(),
        (async () => {
            let query = supabase
                .from('game_cards')
                .select('*')
                .limit(100); // Limite pour les performances

            if (types.length > 0) {
                query = query.in('type', types);
            }

            if (themes.length > 0) {
                query = query.in('data->>theme', themes);
            }

            if (objectiveIds.length > 0) {
                query = query.in('data->>related_objective_id', objectiveIds);
            }

            return await query;
        })()
    ]);

    if (error) {
        console.error('Error fetching filtered game cards:', error);
        return [];
    }
    try {
        return data.map(convertDbToGameCard).filter(Boolean) as GameCard[];
    } catch (e) {
        console.error("Error converting filtered DB cards", e);
        return [];
    }
}


export async function createGameCard(type: GameCardType, cardData: DbGameCardData) {
    const { data, error } = await supabase.from('game_cards').insert({
        type: type,
        data: cardData as any,
    }).select().single();

    if (error) {
        console.error('Error creating game card:', error);
        return null;
    }
    revalidatePath('/admin/game-cards');
    return convertDbToGameCard(data);
}

export async function updateGameCard(id: number, cardData: DbGameCardData) {
    const { error } = await supabase.from('game_cards').update({
        data: cardData as any,
    }).eq('id', id);

    if (error) {
        console.error('Error updating game card:', error);
        return false;
    }
    revalidatePath('/admin/game-cards');
    return true;
}

export async function deleteGameCard(id: number) {
    const { error } = await supabase.from('game_cards').delete().eq('id', id);
    if (error) {
        console.error('Error deleting game card:', error);
        return false;
    }
    revalidatePath('/admin/game-cards');
    return true;
}


// --- GAMES ---
export async function createGame(title: string, theme: string, gameData: GameData, stageId: number | null): Promise<Game | null> {
    const { data, error } = await supabase.from('games').insert({
        title,
        theme,
        game_data: gameData as any, // Cast to any to handle JSON type mismatch
        stage_id: stageId,
    }).select().single();

    if (error) {
        console.error('Error creating game:', error);
        return null;
    }
    revalidatePath('/jeux');
    if (stageId) {
        revalidatePath(`/stages/${stageId}`);
    }
    return { ...data, game_data: data.game_data as unknown as GameData }; // Ensure return type is correct
}

export async function getGames(): Promise<Game[]> {
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limite à 50 jeux récents
    if (error) {
        console.error('Error fetching games:', error);
        return [];
    }
    return data.map(g => ({ ...g, game_data: g.game_data as any }));
}

export async function getGamesForStage(stageId: number): Promise<Game[]> {
    const { data, error } = await supabase.from('games').select('*').eq('stage_id', stageId).order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching games for stage:', error);
        return [];
    }
    return data.map(g => ({ ...g, game_data: g.game_data as any }));
}

// Nouvelle fonction pour charger tous les jeux en une seule requête
export async function getAllGames(): Promise<Map<number, Game[]>> {
    const start = performance.now();
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    const duration = performance.now() - start;

    if (error) {
        console.error('Error fetching all games:', error);
        return new Map();
    }

    const gamesByStage = new Map<number, Game[]>();
    data?.forEach(g => {
        if (g.stage_id === null) return; // Skip games without stage_id
        const game: Game = { ...g, game_data: g.game_data as any };
        if (!gamesByStage.has(g.stage_id)) {
            gamesByStage.set(g.stage_id, []);
        }
        gamesByStage.get(g.stage_id)!.push(game);
    });

    console.log(`[getAllGames] ⏱️ ${duration.toFixed(0)}ms - Loaded ${data?.length || 0} games for ${gamesByStage.size} stages`);
    return gamesByStage;
}


export async function getGameById(id: number): Promise<Game | null> {
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching game:', error);
        return null;
    }
    return { ...data, game_data: data.game_data as any };
}

export async function deleteGame(id: number, stageId?: number): Promise<boolean> {
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) {
        console.error('Error deleting game:', error);
        return false;
    }
    revalidatePath('/jeux');
    if (stageId) {
        revalidatePath(`/stages/${stageId}`);
    }
    return true;
}

// --- QUIZ ATTEMPTS ---
export async function saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'attempted_at'>): Promise<QuizAttempt | null> {
    const { data, error } = await supabase.from('quiz_attempts').insert(attempt).select().single();
    if (error) {
        console.error('Error saving quiz attempt:', error);
        return null;
    }
    revalidatePath('/formation');
    return data;
}

export async function getQuizAttemptsForUser(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('attempted_at', { ascending: false });

    if (error) {
        console.error('Error fetching quiz attempts:', error);
        return [];
    }
    return data;
}

// --- STAGE PROGRESSION ACTIONS ---

// 1. OBJECTIVES COMPLETION
export async function getCompletedObjectives(stageId: number): Promise<string[]> {
    const { data, error } = await supabase
        .from('stage_objectives_completion')
        .select('objective_id')
        .eq('stage_id', stageId);

    if (error) {
        console.error('[getCompletedObjectives] Error fetching from Supabase:', error);
        return [];
    }

    const objectiveIds = data ? data.map(row => row.objective_id) : [];
    console.log(`[getCompletedObjectives] Loaded ${objectiveIds.length} objectives from DB for stage ${stageId}`);
    return objectiveIds;
}

// Nouvelle fonction pour charger tous les objectifs complétés en une seule requête
export async function getAllCompletedObjectives(): Promise<Map<number, string[]>> {
    const start = performance.now();
    const { data, error } = await supabase
        .from('stage_objectives_completion')
        .select('stage_id, objective_id');
    const duration = performance.now() - start;

    if (error) {
        console.error('[getAllCompletedObjectives] Error fetching from Supabase:', error);
        return new Map();
    }

    const objectivesByStage = new Map<number, string[]>();
    data?.forEach(row => {
        if (!objectivesByStage.has(row.stage_id)) {
            objectivesByStage.set(row.stage_id, []);
        }
        objectivesByStage.get(row.stage_id)!.push(row.objective_id);
    });

    console.log(`[getAllCompletedObjectives] ⏱️ ${duration.toFixed(0)}ms - Loaded ${data?.length || 0} objectives for ${objectivesByStage.size} stages`);
    return objectivesByStage;
}

export async function toggleObjectiveCompletion(stageId: number, objectiveId: string, isCompleted: boolean): Promise<boolean> {
    console.log(`[toggleObjectiveCompletion SERVER] stageId=${stageId}, objectiveId=${objectiveId}, isCompleted=${isCompleted}`);

    if (isCompleted) {
        // Insert completion record
        const { error } = await supabase
            .from('stage_objectives_completion')
            .insert({ stage_id: stageId, objective_id: objectiveId, completed_at: new Date().toISOString() });

        if (error) {
            console.error('[toggleObjectiveCompletion SERVER] Error inserting to Supabase:', error);
            return false;
        }
        console.log(`[toggleObjectiveCompletion SERVER] Successfully inserted to Supabase`);
    } else {
        // Delete completion record
        const { error } = await supabase
            .from('stage_objectives_completion')
            .delete()
            .eq('stage_id', stageId)
            .eq('objective_id', objectiveId);

        if (error) {
            console.error('[toggleObjectiveCompletion SERVER] Error deleting from Supabase:', error);
            return false;
        }
        console.log(`[toggleObjectiveCompletion SERVER] Successfully deleted from Supabase`);
    }

    revalidatePath(`/stages/${stageId}`);
    // Note: revalidatePath('/stages') supprimé - la liste recharge côté client
    return true;
}


// 2. DEFIS/EXPLOITS PROGRESS
export async function getStageExploits(stageId: number): Promise<Database['public']['Tables']['stages_exploits']['Row'][]> {
    const { data, error } = await supabase
        .from('stages_exploits')
        .select('*')
        .eq('stage_id', stageId);

    if (error) {
        console.error('Error fetching stage exploits:', error);
        return [];
    }
    return data;
}

// Nouvelle fonction pour charger tous les exploits en une seule requête
export async function getAllStageExploits(): Promise<Map<number, Database['public']['Tables']['stages_exploits']['Row'][]>> {
    const start = performance.now();
    const { data, error } = await supabase
        .from('stages_exploits')
        .select('*');
    const duration = performance.now() - start;

    if (error) {
        console.error('Error fetching all stage exploits:', error);
        return new Map();
    }

    const exploitsByStage = new Map<number, Database['public']['Tables']['stages_exploits']['Row'][]>();
    data?.forEach(row => {
        if (!exploitsByStage.has(row.stage_id)) {
            exploitsByStage.set(row.stage_id, []);
        }
        exploitsByStage.get(row.stage_id)!.push(row);
    });

    console.log(`[getAllStageExploits] ⏱️ ${duration.toFixed(0)}ms - Loaded ${data?.length || 0} exploits for ${exploitsByStage.size} stages`);
    return exploitsByStage;
}

export async function addStageExploit(stageId: number, exploitId: string): Promise<boolean> {
    // Check if already exists
    const { data: existing } = await supabase
        .from('stages_exploits')
        .select('id')
        .eq('stage_id', stageId)
        .eq('exploit_id', exploitId)
        .single();

    if (existing) {
        console.log('Exploit already assigned to stage');
        return true; // Already exists, no error
    }

    const { error } = await supabase
        .from('stages_exploits')
        .insert({
            stage_id: stageId,
            exploit_id: exploitId,
            status: 'en_cours',
        });

    if (error) {
        console.error('Error adding stage exploit:', error);
        return false;
    }
    revalidatePath(`/stages/${stageId}`);
    return true;
}

export async function removeStageExploit(stageId: number, exploitId: string): Promise<boolean> {
    const { error } = await supabase
        .from('stages_exploits')
        .delete()
        .eq('stage_id', stageId)
        .eq('exploit_id', exploitId);

    if (error) {
        console.error('Error removing stage exploit:', error);
        return false;
    }
    revalidatePath(`/stages/${stageId}`);
    return true;
}

export async function updateStageExploitStatus(stageId: number, exploitId: string, status: DefiStatus, preuveUrl: string | null = null): Promise<boolean> {
    const { error } = await supabase
        .from('stages_exploits')
        .update({
            status: status,
            completed_at: status === 'complete' ? new Date().toISOString() : null,
            preuves_url: preuveUrl ? [preuveUrl] : null,
        })
        .eq('stage_id', stageId)
        .eq('exploit_id', exploitId);

    if (error) {
        console.error('Error updating stage exploit status:', error);
        return false;
    }
    revalidatePath(`/stages/${stageId}`);
    return true;
}

// 3. GAME HISTORY
export async function getStageGameHistory(stageId: number): Promise<StageGameHistory[]> {
    const { data, error } = await supabase
        .from('stage_game_history')
        .select('*')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching stage game history:', error);
        return [];
    }
    return data;
}

// Nouvelle fonction pour charger tout l'historique des jeux en une seule requête
export async function getAllStageGameHistory(): Promise<Map<number, StageGameHistory[]>> {
    const { data, error } = await supabase
        .from('stage_game_history')
        .select('stage_id, score, total, results')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all stage game history:', error);
        return new Map();
    }

    const historyByStage = new Map<number, StageGameHistory[]>();
    data?.forEach(row => {
        if (!historyByStage.has(row.stage_id)) {
            historyByStage.set(row.stage_id, []);
        }
        historyByStage.get(row.stage_id)!.push(row as StageGameHistory);
    });
    return historyByStage;
}

export async function saveStageGameResult(stageId: number, gameId: number, score: number, total: number, percentage: number, results: any): Promise<boolean> {
    console.log('[saveStageGameResult] Attempting to save:', { stageId, gameId, score, total, percentage, resultsCount: results?.length });

    const { data, error } = await supabase
        .from('stage_game_history')
        .insert({
            stage_id: stageId,
            game_id: gameId,
            score: score,
            total: total,
            percentage: percentage,
            results: results,
        })
        .select();

    if (error) {
        console.error('[saveStageGameResult] Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        return false;
    }

    console.log('[saveStageGameResult] Successfully saved:', data);
    revalidatePath(`/stages/${stageId}`);
    return true;
}
