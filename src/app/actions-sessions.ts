'use server';

import { supabase } from '@/lib/supabase';
import type { Session, SessionStructure, PedagogicalContent } from '@/lib/types';
import type { SessionTemplate } from '@/data/session-templates';
import { revalidatePath } from 'next/cache';

/**
 * ACTIONS SESSIONS / STRUCTURE
 * ----------------------------
 * Utilise les tables existantes:
 * - public.sessions
 * - public.session_structure
 *
 * Objectif:
 * - Rebrancher le constructeur de séances sur ces tables
 * - Sans toucher au reste du schéma ni recréer de tables.
 *
 * NOTE TYPE:
 * - Ton Database typé n'inclut pas encore "sessions" / "session_structure",
 *   donc TypeScript se plaint sur supabase.from(...).
 * - On force uncast (as any) sur supabase pour utiliser les bonnes tables
 *   réelles sans casser le build.
 */

/* ============================================================================
 * SESSIONS
 * ==========================================================================*/

export async function getSessionsForStage(stageId: number): Promise<Session[]> {
  const client = supabase as any;

  const { data, error } = await client
    .from('sessions')
    .select('*')
    .eq('stage_id', stageId)
    .order('session_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('[getSessionsForStage] error', error);
    return [];
  }

  return (data || []) as Session[];
}

/* ============================================================================
 * SESSION STRUCTURE
 * ==========================================================================*/

export async function getSessionStructure(
  sessionId: number
): Promise<SessionStructure[]> {
  const client = supabase as any;

  const { data, error } = await client
    .from('session_structure')
    .select('*')
    .eq('session_id', sessionId)
    .order('step_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('[getSessionStructure] error', error);
    return [];
  }

  return (data || []) as SessionStructure[];
}

/* ============================================================================
 * TEMPLATES → SESSIONS
 * ==========================================================================*/

/**
 * Crée une séance complète (sessions + session_structure) à partir d'un template.
 * Utilisé par le constructeur pour:
 *   "Séance 2h" → 1 row sessions + N rows session_structure.
 */
export async function createSessionFromTemplate(
  stageId: number,
  template: SessionTemplate,
  sessionOrder: number
): Promise<{ session: Session; steps: SessionStructure[] } | null> {
  const client = supabase as any;

  // 1) Créer la séance
  const { data: sessionData, error: sessionError } = await client
    .from('sessions')
    .insert({
      stage_id: stageId,
      title: template.title,
      description: template.description,
      session_order: sessionOrder,
    })
    .select('*')
    .single();

  if (sessionError || !sessionData) {
    console.error('[createSessionFromTemplate] error creating session', sessionError);
    return null;
  }

  const session = sessionData as Session;

  if (!template.steps || template.steps.length === 0) {
    return { session, steps: [] };
  }

  // 2) Créer les étapes associées
  const stepsPayload = template.steps.map((st) => ({
    session_id: session.id,
    step_order: st.order,
    step_title: st.title,
    step_duration_minutes: st.duration_minutes,
    step_description: st.description,
  }));

  const { data: stepsData, error: stepsError } = await client
    .from('session_structure')
    .insert(stepsPayload)
    .select('*');

  if (stepsError || !stepsData) {
    console.error('[createSessionFromTemplate] error creating steps', stepsError);
    return { session, steps: [] };
  }

  const steps = stepsData as SessionStructure[];

  // Revalidation légère: détail du stage et onglet programme/séances
  revalidatePath(`/stages/${stageId}`);
  revalidatePath(`/stages/${stageId}/programme`);

  return { session, steps };
}

/* ============================================================================
 * MISE À JOUR D'UNE ÉTAPE
 * ==========================================================================*/

/**
 * Met à jour le titre / durée / description d'une étape donnée.
 */
export async function updateSessionStep(
  stepId: number,
  payload: Partial<Pick<SessionStructure, 'step_title' | 'step_duration_minutes' | 'step_description'>>
): Promise<boolean> {
  const client = supabase as any;

  const { error } = await client
    .from('session_structure')
    .update({
      step_title: payload.step_title,
      step_duration_minutes: payload.step_duration_minutes,
      step_description: payload.step_description,
    })
    .eq('id', stepId);

  if (error) {
    console.error('[updateSessionStep] error', error);
    return false;
  }

  return true;
}

/* ============================================================================
 * LIENS OBJECTIFS / DÉFIS SUR ÉTAPES (via tables dédiées)
 * ==========================================================================*/

/**
 * Synchronise les objectifs pédagogiques liés à une étape
 * en utilisant la table session_step_pedagogical_links.
 *
 * Stratégie:
 * - On supprime les liens existants pour cette étape
 * - On insère les nouveaux (step_id, pedagogical_id)
 */
export async function setStepObjectives(
  stepId: number,
  pedagogicalIds: number[]
): Promise<boolean> {
  const client = supabase as any;

  try {
    // 1) Supprimer les liens existants pour cette étape
    const { error: delError } = await client
      .from('session_step_pedagogical_links')
      .delete()
      .eq('session_step_id', stepId);

    if (delError) {
      console.error('[setStepObjectives] delete error', delError);
      return false;
    }

    // 2) S'il n'y a plus d'objectifs à lier, on s'arrête là
    if (!pedagogicalIds || pedagogicalIds.length === 0) {
      return true;
    }

    // 3) Insérer les nouveaux liens (en évitant les doublons)
    const uniqueIds = Array.from(new Set(pedagogicalIds.map((id) => Number(id))));
    const rows = uniqueIds.map((pid) => ({
      session_step_id: stepId,
      pedagogical_content_id: pid,
    }));

    const { error: insError } = await client
      .from('session_step_pedagogical_links')
      .insert(rows);

    if (insError) {
      console.error('[setStepObjectives] insert error', insError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[setStepObjectives] unexpected error', error);
    return false;
  }
}

/**
 * Récupère les objectifs pédagogiques liés à une liste d'étapes.
 * Utilise la table session_step_pedagogical_links.
 */
export async function getStepObjectivesMap(
  stepIds: number[]
): Promise<
  Record<
    number,
    {
      pedagogical_content_id: number;
      pedagogical_label: string;
    }[]
  >
> {
  if (!stepIds || stepIds.length === 0) {
    return {};
  }

  const client = supabase as any;
  const uniqueStepIds = Array.from(new Set(stepIds));

  const { data, error } = await client
    .from('session_step_pedagogical_links')
    .select(
      `
      session_step_id,
      pedagogical_content_id,
      pedagogical_content:pedagogical_content_id (
        id,
        question,
        objectif
      )
    `
    )
    .in('session_step_id', uniqueStepIds);

  if (error) {
    console.error('[getStepObjectivesMap] error', error);
    return {};
  }

  const map: Record<
    number,
    {
      pedagogical_content_id: number;
      pedagogical_label: string;
    }[]
  > = {};

  (data || []).forEach((row: any) => {
    const stepId = row.session_step_id as number;
    const pedagoId = row.pedagogical_content_id as number;
    const pedago = row.pedagogical_content as
      | (Pick<PedagogicalContent, 'id' | 'question' | 'objectif'> | null)
      | undefined;

    const label =
      pedago?.question ||
      pedago?.objectif ||
      `Objectif ${pedagoId}`;

    if (!map[stepId]) map[stepId] = [];
    map[stepId].push({
      pedagogical_content_id: pedagoId,
      pedagogical_label: label,
    });
  });

  return map;
}

/**
 * Synchronise les défis liés à une étape.
 *
 * Hypothèse: table session_step_defis_links avec:
 * - session_step_id bigint REFERENCES session_structure(id)
 * - defi_id text ou bigint (selon ton modèle de défis)
 *
 * Si la table n'existe pas encore, cette fonction retournera false
 * et les toasts côté UI indiqueront l'échec.
 */
export async function setStepDefis(
  stepId: number,
  defiIds: (number | string)[]
): Promise<boolean> {
  const client = supabase as any;

  try {
    // 1) Supprimer les liens existants pour cette étape
    const { error: delError } = await client
      .from('session_step_defis_links')
      .delete()
      .eq('session_step_id', stepId);

    if (delError) {
      console.error('[setStepDefis] delete error', delError);
      return false;
    }

    // 2) Si aucun défi sélectionné, on s'arrête là
    if (!defiIds || defiIds.length === 0) {
      return true;
    }

    // 3) Insérer les nouveaux liens (IDs uniques, cast en texte pour compatibilité)
    const uniqueIds = Array.from(
      new Set(
        defiIds.map((id) => (typeof id === 'number' ? String(id) : String(id)))
      )
    );

    const rows = uniqueIds.map((did) => ({
      session_step_id: stepId,
      defi_id: did,
    }));

    const { error: insError } = await client
      .from('session_step_defis_links')
      .insert(rows);

    if (insError) {
      console.error('[setStepDefis] insert error', insError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[setStepDefis] unexpected error', error);
    return false;
  }
}

/* ============================================================================
 * SUPPRESSION: SESSION + ÉTAPES
 * ==========================================================================*/

/**
 * Supprime une séance et toutes ses étapes associées pour un stage donné.
 * Utilisé par le SessionsManager.
 */
export async function deleteSessionWithSteps(
  stageId: number,
  sessionId: number
): Promise<boolean> {
  const client = supabase as any;

  // 1) Supprimer les steps liés
  const { error: stepsError } = await client
    .from('session_structure')
    .delete()
    .eq('session_id', sessionId);

  if (stepsError) {
    console.error('[deleteSessionWithSteps] error deleting steps', stepsError);
    return false;
  }

  // 2) Supprimer la session elle-même, sécurisée par stage_id
  const { error: sessionError } = await client
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('stage_id', stageId);

  if (sessionError) {
    console.error('[deleteSessionWithSteps] error deleting session', sessionError);
    return false;
  }

  revalidatePath(`/stages/${stageId}`);
  revalidatePath(`/stages/${stageId}/programme`);
  return true;
}

/* ============================================================================
 * BASIC CRUD (Added for compatibility)
 * ==========================================================================*/

export async function createSession(
  stageId: number,
  data: { title: string; description?: string | null; session_order: number }
): Promise<Session | null> {
  const client = supabase as any;
  const { data: session, error } = await client
    .from('sessions')
    .insert({
      stage_id: stageId,
      title: data.title,
      description: data.description,
      session_order: data.session_order,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createSession] error', error);
    return null;
  }

  revalidatePath(`/stages/${stageId}`);
  return session as Session;
}

export async function updateSession(
  sessionId: number,
  data: Partial<Pick<Session, 'title' | 'description' | 'objectives' | 'success_criteria' | 'required_materials'>>
): Promise<boolean> {
  const client = supabase as any;
  const { error } = await client
    .from('sessions')
    .update(data)
    .eq('id', sessionId);

  if (error) {
    console.error('[updateSession] error', error);
    return false;
  }
  return true;
}

export async function deleteSession(sessionId: number, stageId: number): Promise<boolean> {
  return deleteSessionWithSteps(stageId, sessionId);
}

// Alias for compatibility
export const getSessions = getSessionsForStage;