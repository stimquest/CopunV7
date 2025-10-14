

'use server';

import type { ContextData, GroupProfile, Sortie, Stage, ContentCard, EtagesData, SelectedNotions, SelectedContent, CardPriority, Observation, Game, GameData, GameCardGeneratorOutput, GameCard, TriageCard, MotsEnRafaleCard, DilemmeDuMarinCard, DbGameCard, TriageItem, MotsEnRafaleItem, DilemmeDuMarinItem, QuizzCard, QuizzItem, GameCardType, DbGameCardData, ProgramAxe, ProgramSelections, Option, QuizAttempt, PedagogicalContent } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { format, parseISO, isSameDay, startOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { contextData, groupedThemes } from '@/data/etages';

// STAGES
export async function getStages(): Promise<Stage[]> {
  const { data, error } = await supabase.from('stages').select('*').order('start_date', { ascending: true });
  if (error) {
    console.error('Error fetching stages:', error);
    return [];
  }
  return data;
}

export async function getStageById(id: number): Promise<Stage | null> {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching stage:', error);
        return null;
    }
    return data;
}


export async function createStage(stage: Omit<Stage, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('stages').insert({
        title: stage.title,
        type: stage.type,
        participants: stage.participants,
        start_date: stage.start_date,
        end_date: stage.end_date,
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
        console.error('Error deleting stage:', error);
        return false;
    }
    revalidatePath('/stages');
    redirect('/stages');
}


// SORTIES
export async function getSortiesForStage(stageId: number): Promise<Sortie[]> {
    const { data, error } = await supabase.from('sorties').select('*').eq('stage_id', stageId).order('date', { ascending: false });
    if (error) {
        console.error('Error fetching sorties:', error);
        return [];
    }
    return data.map(s => ({ 
        ...s, 
        selected_notions: s.selected_notions || { niveau: 0, comprendre: 0, observer: 0, proteger: 0 },
        selected_content: s.selected_content || {},
    }));
}

export async function getSortieById(sortieId: number): Promise<Sortie | null> {
    const { data, error } = await supabase.from('sorties').select('*').eq('id', sortieId).single();
    if (error) {
        console.error('Error fetching sortie:', error);
        return null;
    }
    return { 
        ...data, 
        selected_notions: data.selected_notions || { niveau: 0, comprendre: 0, observer: 0, proteger: 0 },
        selected_content: data.selected_content || {},
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
    if(deleteError) {
        console.error("Error deleting old sorties:", deleteError);
        return { success: false, error: "Impossible de réinitialiser le programme existant." };
    }
    
    if (selectedCardIds.length === 0) {
        revalidatePath(`/stages/${stageId}`);
        revalidatePath(`/stages/${stageId}/programme`);
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
    
    const selectedNotions = { niveau: stageLevel, comprendre: 0, observer: 0, proteger: 0};
    const selectedContent = { program: selectedCardIds, themes: mainThemeTitles };

    const sortieTitle = `Programme: ${mainThemeTitles.join(', ').substring(0,50)}...`

    const promises: Promise<any>[] = [];
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
    revalidatePath(`/stages/${stageId}/programme`);
    return { success: true };
}


// --- PEDAGOGICAL CONTENT (from Supabase) ---

export async function getPedagogicalContent(): Promise<PedagogicalContent[]> {
    const { data, error } = await supabase.from('pedagogical_content').select('*').order('id');
    if (error) {
        console.error("Error fetching pedagogical content:", error);
        return [];
    }
    return data;
}

export async function getPedagogicalContentById(id: number): Promise<PedagogicalContent | null> {
    const { data, error } = await supabase.from('pedagogical_content').select('*').eq('id', id).single();
    if (error) {
        console.error("Error fetching pedagogical content by id:", error);
        return null;
    }
    return data;
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
          { id: "niv1", label: "1 - Je prends conscience, je découvre", tip: "Objectifs pour prendre conscience de son environnement.", etage_id: 'niveau', order:1, contentCards:[], duration:null, group_size:null, safety:[], materials:[] },
          { id: "niv2", label: "2-3 - J'agis en conscience, je m’adapte", tip: "Objectifs pour agir en conscience et s'adapter.", etage_id: 'niveau', order:2, contentCards:[], duration:null, group_size:null, safety:[], materials:[] },
          { id: "niv3", label: "4-5 - J’agis de façon responsable, j'anticipe", tip: "Objectifs pour anticiper et agir de manière autonome et éclairée.", etage_id: 'niveau', order:3, contentCards:[], duration:null, group_size:null, safety:[], materials:[] }
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
    const { data, error } = await supabase.from('observations').select('*').order('observation_date', { ascending: false });
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

// Function to seed initial game cards if they don't exist
// This is a simplified approach for demonstration. In a real app, you might use migrations.
async function seedInitialGameCards() {
    const tideQuizzCards: Omit<DbGameCard, 'id' | 'created_at'>[] = [
        {
            type: 'quizz',
            data: {
                question: "Quelle est la raison principale de l'existence de plusieurs marées par jour ?",
                answers: ["La rotation de la Terre", "L'attraction combinée de la Lune et du Soleil", "La force du vent", "Les courants marins profonds"],
                correctAnswerIndex: 1,
                theme: "Repères spatio-temporels",
                related_objective_id: "1"
            } as QuizzItem
        },
        {
            type: 'quizz',
            data: {
                question: "Grâce à quoi les horaires de marées sont-ils prévisibles avec une grande précision ?",
                answers: ["L'observation des oiseaux", "Les calculs astronomiques basés sur les cycles lunaires et solaires", "La température de l'eau", "Les bulletins météo"],
                correctAnswerIndex: 1,
                theme: "Repères spatio-temporels",
                related_objective_id: "6"
            } as QuizzItem
        },
        {
            type: 'quizz',
            data: {
                question: "Qu'est-ce que le coefficient de marée indique principalement ?",
                answers: ["La température de l'eau", "La vitesse du courant", "La hauteur de la vague", "L'amplitude de la marée (le marnage)"],
                correctAnswerIndex: 3,
                theme: "Repères spatio-temporels",
                related_objective_id: "7"
            } as QuizzItem
        },
        {
            type: 'quizz',
            data: {
                question: "Quel est le nom de la zone découverte par la marée basse ?",
                answers: ["La dune", "L'estran", "La laisse de mer", "Le plateau continental"],
                correctAnswerIndex: 1,
                theme: "Caractéristiques du littoral",
                related_objective_id: "4"
            } as QuizzItem
        },
        {
            type: 'quizz',
            data: {
                question: "Durant quelle phase le courant de marée est-il généralement le plus fort ?",
                answers: ["Au début de la marée montante", "À la pleine mer (étale)", "Au milieu de la marée (montante ou descendante)", "À la basse mer (étale)"],
                correctAnswerIndex: 2,
                theme: "Interactions des éléments climatiques",
                related_objective_id: "9"
            } as QuizzItem
        },
        {
            type: 'quizz',
            data: {
                question: "Comment appelle-t-on le moment où la mer monte ?",
                answers: ["Le jusant", "Le courant", "L'étale", "Le flot"],
                correctAnswerIndex: 3,
                theme: "Repères spatio-temporels",
                related_objective_id: "10"
            } as QuizzItem
        },
        {
            type: 'quizz',
            data: {
                question: "Quel est le meilleur indicateur visuel pour estimer le niveau de la prochaine pleine mer ?",
                answers: ["La hauteur des vagues", "La couleur de l'eau", "La laisse de haute mer", "La direction du vent"],
                correctAnswerIndex: 2,
                theme: "Lecture du paysage",
                related_objective_id: "14"
            } as QuizzItem
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
}


const convertDbToGameCard = (dbCard: DbGameCard): GameCard => {
    const cardData = dbCard.data as DbGameCardData;
    if (typeof cardData !== 'object' || cardData === null || !('theme' in cardData)) {
        console.error('Invalid card data format', dbCard);
        throw new Error(`Invalid data for card ID ${dbCard.id}`);
    }
    return {
        id: dbCard.id,
        type: dbCard.type,
        ...cardData
    } as GameCard;
};


export async function getAllGameCardsFromDb(): Promise<GameCard[]> {
  await seedInitialGameCards();

  const { data, error } = await supabase.from('game_cards').select('*').order('created_at', { ascending: false });
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
    await seedInitialGameCards();
    let query = supabase.from('game_cards').select('*');

    if (types.length > 0) {
        query = query.in('type', types);
    }
    
    if (themes.length > 0) {
        query = query.in('data->>theme', themes);
    }

    if (objectiveIds.length > 0) {
       query = query.in('data->>related_objective_id', objectiveIds);
    }

    const { data, error } = await query;

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
        game_data: gameData,
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
    return data;
}

export async function getGames(): Promise<Game[]> {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
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
