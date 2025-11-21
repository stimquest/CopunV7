'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Users,
  Target,
  AlertCircle,
  Loader2,
  ListFilter,
  ChevronDown,
  Gamepad2,
  Trophy,
  Shield,
  Trash2,
  Wind,
  Fish,
  Map,
  BookOpen,
  Camera,
  Microscope,
  LandPlot,
  Compass,
  Waves,
  Leaf,
  Play,
  MessageSquare,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
import {
  getStageById,
  getSortiesForStage,
  getGamesForStage,
  getPedagogicalContent,
  getCompletedObjectives,
  toggleObjectiveCompletion,
  getStageExploits,
  updateStageExploitStatus,
  getStageGameHistory,
} from '@/app/actions';
import {
  getSessionsForStage,
  getSessionStructure,
  getStepObjectivesMap,
} from '@/app/actions-sessions';
import type {
  Stage,
  Sortie,
  Game,
  PedagogicalContent,
  Defi,
  AssignedDefi,
  DefiStatus,
  StageGameHistory,
  Session,
  SessionStructure,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { allDefis } from '@/data/defis';
import { groupedThemes } from '@/data/etages';

type AssignedDefiDetails = AssignedDefi & { details: Defi };

/**
 * SUIVI BIS
 * ----------
 * Exigences:
 * - Colonne DROITE:
 *   RENDU IDENTIQUE à l'onglet "Suivi" de StageDetailPage:
 *   - Objectifs regroupés par piliers (Comprendre / Observer / Protéger)
 *   - Icônes, couleurs, layout accordions, switch "vu"
 *   - Bloc "Défis à réaliser"
 *   - Bloc "Jeux & Quiz"
 * - Colonne GAUCHE:
 *   Suivi SPORTIF / TECHNIQUE simple (POC) pour voir la progression des compétences,
 *   sans toucher à la logique environnementale.
 *
 * Implémentation:
 * - On recopie le code de l'onglet Suivi (ObjectivesView + DefisSuivi + JeuxSuivi)
 *   sous forme de clones locaux, en ne changeant que le strict nécessaire.
 */

type TechStatus = 'non_aborde' | 'en_cours' | 'acquis' | 'a_revoir';

interface TechnicalItem {
  id: string;
  label: string;
}

interface TechnicalAssessment {
  id: string; // `${sessionId}:${stepId}`
  status: TechStatus;
  comment: string;
}

const TECH_ITEMS: TechnicalItem[] = [
  { id: 'empannage', label: 'Empannages' },
  { id: 'virement', label: 'Virements de bord' },
  { id: 'allures', label: 'Allures / cap' },
  { id: 'autonomie', label: 'Autonomie sur l’eau' },
];

const allGrandThemes = groupedThemes.flatMap((g) => g.themes);

const AXE_CONFIG: { [key: string]: { icon: React.ElementType; label: string } } =
  {
    comprendre: { icon: BookOpen, label: 'Comprendre' },
    observer: { icon: Compass, label: 'Observer' },
    proteger: { icon: Shield, label: 'Protéger' },
  };

const PILLAR_STYLES: {
  [key: string]: {
    badge: string;
    filterBadge: string;
    border: string;
    bg: string;
    text: string;
    icon: React.ElementType;
    hover: string;
  };
} = {
  comprendre: {
    badge:
      'bg-cop-comprendre text-background hover:bg-cop-comprendre',
    filterBadge: 'border-cop-comprendre text-cop-comprendre',
    border: 'border-cop-comprendre',
    bg: 'bg-cop-comprendre',
    text: 'text-cop-comprendre',
    icon: BookOpen,
    hover: 'hover:bg-cop-comprendre/10',
  },
  observer: {
    badge: 'bg-cop-observer text-background hover:bg-cop-observer',
    filterBadge: 'border-cop-observer text-cop-observer',
    border: 'border-cop-observer',
    bg: 'bg-cop-observer',
    text: 'text-cop-observer',
    icon: Compass,
    hover: 'hover:bg-cop-observer/10',
  },
  proteger: {
    badge: 'bg-cop-proteger text-background hover:bg-cop-proteger',
    filterBadge: 'border-cop-proteger text-cop-proteger',
    border: 'border-cop-proteger',
    bg: 'bg-cop-proteger',
    text: 'text-cop-proteger',
    icon: Shield,
    hover: 'hover:bg-cop-proteger/10',
  },
};

const technicalStorageKey = (stageId: number) =>
  `stage_${stageId}_technical_assessment_v1`;

const SuiviBisPage = () => {
  const params = useParams();
  const { toast } = useToast();
  const stageId = params?.stageId ? parseInt(params.stageId as string, 10) : null;

  const [stage, setStage] = useState<Stage | null>(null);
  const [techAssessments, setTechAssessments] = useState<
    Record<string, TechnicalAssessment>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!stageId) {
      setError('ID de stage manquant.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stageData = await getStageById(stageId);

      if (!stageData) {
        setError('Stage introuvable.');
        setLoading(false);
        return;
      }
      setStage(stageData);

      if (typeof window !== 'undefined') {
        const rawTech = window.localStorage.getItem(
          technicalStorageKey(stageId)
        );
        if (rawTech) {
          try {
            const parsed = JSON.parse(rawTech) as TechnicalAssessment[];
            const map: Record<string, TechnicalAssessment> = {};
            parsed.forEach((a) => {
              map[a.id] = a;
            });
            setTechAssessments(map);
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError(
        'Erreur lors du chargement des données Suivi BIS.'
      );
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateTech = (id: string, patch: Partial<TechnicalAssessment>) => {
    if (!stageId) return;
    setTechAssessments((prev) => {
      const current: TechnicalAssessment =
        prev[id] || { id, status: 'non_aborde', comment: '' };
      const updated: TechnicalAssessment = { ...current, ...patch };
      const next = { ...prev, [id]: updated };
      if (typeof window !== 'undefined') {
        const arr = Object.values(next);
        window.localStorage.setItem(
          technicalStorageKey(stageId),
          JSON.stringify(arr)
        );
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
          Chargement du Suivi BIS...
        </p>
      </div>
    );
  }

  if (error || !stage || !stageId) {
    return (
      <Card className="m-auto mt-10 max-w-lg text-center border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || 'Données du stage introuvables.'}
          </p>
        </CardContent>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/stages">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour aux stages
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const [mainTitle, ...subtitles] = stage.title.split(' - ');
  const subtitle = subtitles.join(' - ');
 
  // Suivi BIS doit être utilisé à L’INTÉRIEUR de l’onglet:
  // - aucune sidebar/menu ici
  // - pas de header stage dupliqué
  // - uniquement deux colonnes: gauche = SessionsPlanSuivi, droite = blocs environnement (Objectives/Defis/Jeux)
  return (
    <div className="grid gap-6 items-start lg:grid-cols-2">
      {/* Colonne gauche : Suivi sportif / technique par séance */}
      <div className="h-full">
        <SessionsPlanSuivi stageId={stage.id} />
      </div>
 
      {/* Colonne droite : Objectifs pédagogiques + Défis + Jeux */}
      <div className="space-y-4">
        <ObjectivesViewClone stageId={stage.id} />
        <DefisSuiviClone stageId={stage.id} />
        <JeuxSuiviClone stageId={stage.id} />
      </div>
    </div>
  );
};

/**
 * COLONNE GAUCHE - Suivi logique des séances
 * Utilise les vraies sessions/steps + permet:
 * - d’ouvrir un modal pour noter l’étape (texte + appréciation)
 * - d’afficher les objectifs environnementaux liés (session_step_pedagogical_links)
 *   et de les valider directement depuis la colonne gauche.
 * On obtient ainsi deux portes d’entrée cohérentes vers la même donnée:
 * - Colonne droite: vue "Objectifs"
 * - Colonne gauche: vue "Séances" qui pilote les mêmes objectifs.
 */
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SessionFichePdfDocument } from '@/components/session-fiche-pdf';

interface SessionFicheModalProps {
  session: Session & { steps: SessionStructure[] };
  programObjectives: PedagogicalContent[];
  techAssessments: Record<string, TechnicalAssessment>;
  assignedDefisDetails: AssignedDefiDetails[];
  ficheDate: string;
  ficheMeteo: string[];
  ficheVent: string[];
  ficheConditionsNotes: string;
  setFicheMeteo: (value: string[]) => void;
  setFicheVent: (value: string[]) => void;
  setFicheConditionsNotes: (value: string) => void;
}

const METEO_OPTIONS = [
  'Soleil',
  'Nuages épars',
  'Nuageux',
  'Pluie légère',
  'Pluie modérée',
  'Neige',
  'Bruine / Brouillard',
  'Orage',
  'Givre',
  'Brume',
];

const VENT_OPTIONS = [
  'Vent faible',
  'Vent modéré',
  'Vent fort',
  'Rafales',
  'Vent thermique',
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW',
];

const SessionFicheModalContent: React.FC<SessionFicheModalProps> = ({
  session,
  programObjectives,
  techAssessments,
  assignedDefisDetails,
  ficheDate,
  ficheMeteo,
  ficheVent,
  ficheConditionsNotes,
  setFicheMeteo,
  setFicheVent,
  setFicheConditionsNotes,
}) => {
  const linkedObjectives = programObjectives.slice(0, 6);

  return (
    <div className="px-4 pt-3 pb-4 space-y-4 text-sm text-slate-800">
      {/* 1. Meta Data (Date, Météo, Vent) */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="pb-1">
          <div className="font-semibold text-slate-800">Date</div>
          <div className="text-sm font-medium text-sky-700 mt-1">{ficheDate}</div>
        </div>
        <div className="pb-1">
          <div className="font-semibold text-slate-800 mb-1">Météo</div>
          <div className="flex flex-wrap gap-1">
            {METEO_OPTIONS.map((opt) => {
              const active = ficheMeteo.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const next = ficheMeteo.includes(opt)
                      ? ficheMeteo.filter((v) => v !== opt)
                      : [...ficheMeteo, opt];
                    setFicheMeteo(next);
                  }}
                  className={[
                    'px-2 py-0.5 rounded-full text-[10px] border transition-colors',
                    active
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700',
                  ].join(' ')}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pb-1">
          <div className="font-semibold text-slate-800 mb-1">Vent</div>
          <div className="flex flex-wrap gap-1">
            {VENT_OPTIONS.map((opt) => {
              const active = ficheVent.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const next = ficheVent.includes(opt)
                      ? ficheVent.filter((v) => v !== opt)
                      : [...ficheVent, opt];
                    setFicheVent(next);
                  }}
                  className={[
                    'px-2 py-0.5 rounded-full text-[10px] border transition-colors',
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700',
                  ].join(' ')}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-semibold text-slate-800 mb-1 text-xs">
          Notes conditions (optionnel)
        </div>
        <Textarea
          className="h-14 text-xs"
          placeholder="Ex: rafales d'ouest près du littoral, mer agitée..."
          value={ficheConditionsNotes}
          onChange={(e) =>
            setFicheConditionsNotes(e.target.value.slice(0, 200))
          }
        />
      </div>

      {/* 2. Déroulé sportif / technique avec notes et objectifs */}
      <div>
        <h3 className="mt-4 text-base font-semibold uppercase tracking-wide text-slate-700 border-b pb-1">
          Déroulé sportif / technique
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Étapes clés de la séance avec les notes de suivi et les objectifs environnementaux liés.
        </p>

        <div className="space-y-3">
          {session.steps.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Aucune étape structurée pour cette séance.
            </p>
          ) : (
            session.steps.map((step, index) => {
              const assessment = techAssessments[`${session.id}:${step.id}`];
              const comment = assessment?.comment || 'Aucune note enregistrée.';

              return (
                <div
                  key={step.id}
                  className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold text-sky-600 shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-slate-900">
                        {step.step_title || 'Étape sans titre'}
                        {step.step_duration_minutes && (
                          <span className="ml-2 text-xs text-slate-500">
                            ({step.step_duration_minutes} min)
                          </span>
                        )}
                      </p>
                      {step.step_description && (
                        <p className="mt-0.5 text-xs text-slate-600">
                          {step.step_description}
                        </p>
                      )}

                      {/* Notes / Observations */}
                      <div className="mt-2 pt-1 border-t border-dashed border-slate-200">
                        <p className="text-xs font-medium text-slate-600">
                          Notes / observations:
                        </p>
                        <p className="text-xs italic text-muted-foreground mt-0.5">
                          {comment}
                        </p>
                      </div>

                      {/* Objectifs liés */}
                      {linkedObjectives.length > 0 && (
                        <div className="mt-2 pt-1 border-t border-dashed border-slate-200">
                          <p className="text-xs font-medium text-slate-600">
                            Objectifs environnementaux à mobiliser:
                          </p>
                          <ul className="list-disc list-inside space-y-1 mt-1 text-xs text-slate-700">
                            {linkedObjectives.map((obj) => (
                              <li key={obj.id} className="ml-2">
                                <span className="font-semibold">
                                  {obj.question || obj.objectif}
                                </span>
                                {obj.tip && (
                                  <span className="text-xs text-slate-500 block ml-4">
                                    Conseil: {obj.tip}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Objectifs globaux du programme */}
      {programObjectives.length > 0 && (
        <div>
          <h3 className="mt-4 text-base font-semibold uppercase tracking-wide text-slate-700 border-b pb-1">
            Objectifs environnementaux du programme (Synthèse)
          </h3>
          <ul className="list-decimal list-inside space-y-2 mt-3 text-sm text-slate-700">
            {programObjectives.slice(0, 24).map((obj) => (
              <li key={obj.id} className="ml-4">
                <span className="font-semibold">
                  {obj.question || obj.objectif}
                </span>
                {obj.objectif && (
                  <span className="text-xs text-slate-600 block ml-4">
                    Objectif: {obj.objectif}
                  </span>
                )}
                {obj.tip && (
                  <span className="text-xs text-slate-500 block ml-4">
                    Conseil: {obj.tip}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Défis du stage */}
      {assignedDefisDetails.length > 0 && (
        <div>
          <h3 className="mt-4 text-base font-semibold uppercase tracking-wide text-slate-700 border-b pb-1">
            Défis / Exploits du stage
          </h3>
          <ul className="list-disc list-inside space-y-2 mt-3 text-sm text-slate-700">
            {assignedDefisDetails.map((defi) => (
              <li key={defi.id} className="ml-4">
                <span className="font-semibold">
                  {defi.details.description}
                </span>
                <span className="text-xs text-slate-600 block ml-4">
                  Statut: {defi.status === 'complete' ? 'Validé' : 'En cours'}
                </span>
                <span className="text-xs text-slate-600 block ml-4">
                  Instruction: {defi.details.instruction}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SessionsPlanSuivi = ({ stageId }: { stageId: number }) => {
  const [sessions, setSessions] = useState<
    (Session & { steps: SessionStructure[] })[]
  >([]);
  // Séance sélectionnée pour fiche PDF dans le modal
  const [selectedPrintable, _setSelectedPrintable] = useState<{
    session: Session & { steps: SessionStructure[] };
  } | null>(null);

  const setSelectedPrintable = (
    printable: { session: Session & { steps: SessionStructure[] } } | null
  ) => {
    _setSelectedPrintable(printable);
    // Réinitialiser l'état de génération PDF à la fermeture du modal
    if (!printable) {
      setStartPdfGeneration(false);
    }
  };
  // Objectifs globaux du programme pour alimenter la fiche PDF
  const [programObjectives, setProgramObjectives] =
    useState<PedagogicalContent[]>([]);
  const [completed, setCompleted] = useState<
    Record<string, TechnicalAssessment>
  >({});
  const [assignedDefisDetails, setAssignedDefisDetails] = useState<
    AssignedDefiDetails[]
  >([]);
  const [startPdfGeneration, setStartPdfGeneration] = useState(false);

  // Nouveaux états pour les métadonnées de la fiche séance
  const [ficheDate, setFicheDate] = useState(
    format(new Date(), 'dd/MM/yyyy', { locale: fr })
  );
  // Météo & vent: multi-sélection (liste de tags courts)
  const [ficheMeteo, setFicheMeteo] = useState<string[]>([]);
  const [ficheVent, setFicheVent] = useState<string[]>([]);
  const [ficheConditionsNotes, setFicheConditionsNotes] = useState('');

  // Modal uniquement pour le commentaire (retour d'info)
  const [selectedStep, setSelectedStep] = useState<{
    sessionId: number;
    stepId: number;
    title: string;
    comment: string;
  } | null>(null);
  const [stepObjectives, setStepObjectives] = useState<
    Record<
      number,
      {
        id: number;
        label: string;
        completed: boolean;
      }[]
    >
  >({});

  // Confirmation UI dédiée pour la validation d'objectifs liés à une étape
  const [objectiveConfirm, setObjectiveConfirm] = useState<{
    stepId: number;
    objectiveId: number;
    label: string;
    nextCompleted: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Clé locale dédiée au suivi technique par étape
  const key = useMemo(
    () => `stage_${stageId}_session_steps_tech_v1`,
    [stageId]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) Charger les séances réelles de ce stage
        const baseSessions = await getSessionsForStage(stageId);

        if (!baseSessions || baseSessions.length === 0) {
          setSessions([]);
          setStepObjectives({});
          setProgramObjectives([]);
        } else {
          // 2) Pour chaque séance, charger la vraie structure d'étapes
          const withSteps = await Promise.all(
            baseSessions.map(async (s) => {
              const steps = await getSessionStructure(s.id);
              return { ...s, steps };
            })
          );
          setSessions(withSteps);

          // Construire la liste globale des stepIds pour alimenter le mapping objectifs
          const allStepIds = withSteps
            .flatMap((s) => s.steps)
            .map((st) => st.id);

          if (allStepIds.length > 0) {
            const map = await getStepObjectivesMap(allStepIds);

            // 2.a) Adapter la forme pour l'UI (objectifs par étape)
            const uiMap: Record<
              number,
              { id: number; label: string; completed: boolean }[]
            > = {};

            Object.entries(map).forEach(([stepId, arr]) => {
              uiMap[Number(stepId)] = arr.map((it) => ({
                id: it.pedagogical_content_id,
                label: it.pedagogical_label,
                completed: false,
              }));
            });

            setStepObjectives(uiMap);

            // 2.b) Construire une liste unique d'objectifs utilisés dans le programme du stage
            const allPedago = await getPedagogicalContent();

            if (allPedago && Array.isArray(allPedago)) {
              // Indexer par id numérique: utiliser un simple objet pour éviter les soucis de Map typée
              const byId: Record<number, PedagogicalContent> = {};
              allPedago.forEach((p) => {
                // Assumer que p.id est le champ ID de la DB, qui est un nombre
                const idNum = Number(p.id);
                if (!Number.isNaN(idNum)) {
                  byId[idNum] = p;
                }
              });

              const usedIds = new Set<number>();
              Object.values(map).forEach((links) => {
                links.forEach((link) => {
                  usedIds.add(link.pedagogical_content_id);
                });
              });

              const used: PedagogicalContent[] = [];
              usedIds.forEach((id) => {
                const full = byId[id];
                if (full) {
                  used.push(full);
                }
              });

              setProgramObjectives(used);
            } else {
              setProgramObjectives([]);
            }
          } else {
            // Aucun lien step ↔ objectif: on laisse vide pour ne pas afficher du faux
            setStepObjectives({});
            setProgramObjectives([]);
          }
        }

        // 3) Charger les défis du stage (pour le PDF)
        const dbExploits = await getStageExploits(stageId);
        const assignedDefis: AssignedDefi[] = dbExploits.map((e) => ({
          id: e.id,
          stage_id: e.stage_id,
          defi_id: e.exploit_id,
          status: e.status as DefiStatus,
          completed_at: e.completed_at,
          preuve_url: (e.preuves_url as string[] | null)?.[0] || null,
        }));

        const details = assignedDefis
          .map((am) => {
            const details = allDefis.find((m) => m.id === am.defi_id);
            return details ? ({ ...am, details } as AssignedDefiDetails) : null;
          })
          .filter((am): am is AssignedDefiDetails => am !== null);

        setAssignedDefisDetails(details);

        // 4) Charger l'état local existant si présent
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(
                raw
              ) as Record<string, TechnicalAssessment>;
              setCompleted(parsed);
            } catch {
              // ignore
            }
          }
        }

        // (plus de fetch /api/session-step-objectives: on utilise getStepObjectivesMap côté serveur)
      } catch (e) {
        console.error(
          '[SessionsPlanSuivi] erreur chargement sessions via actions-sessions',
          e
        );
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key, stageId]);

  const saveLocal = (next: Record<string, TechnicalAssessment>) => {
    setCompleted(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(next));
    }
  };

  const updateStepStatus = (
    sessionId: number,
    stepId: number,
    patch: Partial<TechnicalAssessment>
  ) => {
    const id = `${sessionId}:${stepId}`;
    const current =
      completed[id] || {
        id,
        status: 'non_aborde' as TechStatus,
        comment: '',
      };
    const updated: TechnicalAssessment = {
      ...current,
      ...patch,
    };
    const next = { ...completed, [id]: updated };
    saveLocal(next);
  };

  // Validation d'un objectif environnemental depuis la colonne gauche
  const validateObjectiveFromStep = async (
    pedagoId: number,
    completed: boolean
  ) => {
    try {
      const ok = await toggleObjectiveCompletion(
        stageId,
        String(pedagoId),
        completed
      );
      if (!ok) {
        console.error(
          '[SessionsPlanSuivi] toggleObjectiveCompletion failed'
        );
      }
    } catch (e) {
      console.error(
        '[SessionsPlanSuivi] toggleObjectiveCompletion error',
        e
      );
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">
            Chargement des séances...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!sessions.length) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Suivi sportif / technique
          </CardTitle>
          <CardDescription className="text-xs">
            Configure d'abord tes séances dans le plan pour activer ce
            suivi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Aucune séance structurée trouvée. Utilise les templates dans
            le plan pour générer les étapes sportives.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl font-semibold">
              Suivi sportif / technique par séance
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Pour chaque étape prévue dans le plan, indique l'état atteint et ajoute un retour si besoin.
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            Clique sur "Fiche séance" pour ouvrir une vue détaillée prête à être imprimée ou exportée en PDF.
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto pr-1.5">
        {sessions
          .slice()
          .sort((a, b) => (a.session_order ?? 0) - (b.session_order ?? 0))
          .map((session) => (
            <div key={session.id} className="rounded-xl border bg-white overflow-hidden">
              {/* Header séance */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/60">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                    {session.session_order ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {session.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {session.steps.length} étape{session.steps.length > 1 && 's'}
                    </p>
                  </div>
                </div>

                {/* Bouton fiche: ouvre un MODAL avec prévisualisation + export PDF */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[9px]"
                    onClick={() => setSelectedPrintable({ session })}
                  >
                    Fiche séance
                  </Button>
                </div>
              </div>

              {/* Liste étapes */}
              <div className="px-3 py-2 space-y-1.5 bg-muted/10">
                {session.steps.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucune étape définie pour cette séance.
                  </p>
                ) : (
                  session.steps.map((step, idx) => {
                    const id = `${session.id}:${step.id}`;
                    const current =
                      completed[id] || {
                        id,
                        status: 'non_aborde' as TechStatus,
                        comment: '',
                      };

                    const linkedObjs = stepObjectives[step.id] || [];

                    // Base styles pour les boutons de statut
                    const badgeBase =
                      'px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap border transition-colors';

                    const getStatusClasses = (status: TechStatus): string => {
                      if (status === 'acquis') {
                        return 'bg-emerald-500 text-white border-emerald-500';
                      }
                      if (status === 'en_cours') {
                        return 'bg-amber-400 text-black border-amber-400';
                      }
                      if (status === 'a_revoir') {
                        return 'bg-red-500 text-white border-red-500';
                      }
                      // non_aborde (gris neutre)
                      return 'bg-gray-100 text-gray-500 border-gray-200';
                    };

                    const currentStatus: TechStatus =
                      current.status || 'non_aborde';

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col gap-1 rounded-lg bg-background border px-2 py-1.5"
                      >
                        {/* Ligne principale : index + titre + durée + statuts + bouton note */}
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full bg-blue-100 text-blue-700 text-[8px] flex items-center justify-center">
                            {idx + 1}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <p className="text-sm font-medium truncate">
                                {step.step_title}
                              </p>
                              {step.step_duration_minutes && (
                                <span className="text-[10px] text-muted-foreground">
                                  {step.step_duration_minutes} min
                                </span>
                              )}
                            </div>
                            {current.comment && (
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {current.comment}
                              </p>
                            )}
                          </div>

                          {/* Toggle de statut: 3 choix + neutre (gris par défaut) */}
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateStepStatus(session.id, step.id, {
                                  status:
                                    currentStatus === 'acquis'
                                      ? 'non_aborde'
                                      : 'acquis',
                                })
                              }
                              className={cn(
                                badgeBase,
                                currentStatus === 'acquis'
                                  ? getStatusClasses('acquis')
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300'
                              )}
                            >
                              Acquis
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateStepStatus(session.id, step.id, {
                                  status:
                                    currentStatus === 'en_cours'
                                      ? 'non_aborde'
                                      : 'en_cours',
                                })
                              }
                              className={cn(
                                badgeBase,
                                currentStatus === 'en_cours'
                                  ? getStatusClasses('en_cours')
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                              )}
                            >
                              En cours
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateStepStatus(session.id, step.id, {
                                  status:
                                    currentStatus === 'a_revoir'
                                      ? 'non_aborde'
                                      : 'a_revoir',
                                })
                              }
                              className={cn(
                                badgeBase,
                                currentStatus === 'a_revoir'
                                  ? getStatusClasses('a_revoir')
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                              )}
                            >
                              À revoir
                            </button>
                          </div>
                        </div>

                        {/* Ligne objectifs liés (si présents) */}
                        {linkedObjs.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pl-5">
                            {linkedObjs.slice(0, 3).map((o) => (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() =>
                                  setObjectiveConfirm({
                                    stepId: step.id,
                                    objectiveId: o.id,
                                    label: o.label,
                                    nextCompleted: !o.completed,
                                  })
                                }
                                className={cn(
                                  'text-[9px] px-1.5 py-0.5 rounded-full border transition-colors',
                                  o.completed
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                    : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                                )}
                              >
                                {o.completed ? '✓ ' : ''}
                                {o.label}
                              </button>
                            ))}
                            {linkedObjs.length > 3 && (
                              <span className="text-[9px] text-muted-foreground">
                                +{linkedObjs.length - 3} autres objectifs
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bouton Noter = uniquement retour d'info (commentaire) */}
                        <div className="flex justify-end pr-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-0.5 h-7 px-2 text-[9px] whitespace-nowrap"
                            onClick={() =>
                              setSelectedStep({
                                sessionId: session.id,
                                stepId: step.id,
                                title: step.step_title,
                                comment: current.comment || '',
                              })
                            }
                          >
                            Note / Retour
                          </Button>
                        </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
    </CardContent>

      {/* Modal confirmation validation objectif – version plus engageante */}
      {objectiveConfirm && (
        <Dialog
          open={!!objectiveConfirm}
          onOpenChange={(open: boolean) => {
            if (!open) setObjectiveConfirm(null);
          }}
        >
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-3 text-white flex items-center gap-3">
              <Target className="w-5 h-5" />
              <div>
                <DialogTitle className="text-sm font-semibold">
                  {objectiveConfirm.nextCompleted
                    ? "Valider cet objectif lié à l'étape ?"
                    : "Retirer la validation de cet objectif ?"}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-white/80">
                  Action appliquée au suivi environnemental de ce stage.
                </DialogDescription>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="bg-muted/60 border border-muted-foreground/10 rounded-md px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                  Objectif concerné
                </p>
                <p className="text-sm font-medium text-foreground">
                  {objectiveConfirm.label}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cette validation reste synchronisée avec la colonne Suivi (objectifs pédagogiques)
                et peut être modifiée à tout moment.
              </p>
            </div>
            <DialogFooter className="px-5 pb-4 pt-0 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setObjectiveConfirm(null)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="text-xs"
                onClick={async () => {
                  if (!objectiveConfirm) return;
                  await validateObjectiveFromStep(
                    objectiveConfirm.objectiveId,
                    objectiveConfirm.nextCompleted
                  );
                  setObjectiveConfirm(null);
                }}
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal: uniquement retour d'information (note texte) – version plus cohérente visuelle */}
      {selectedStep && (
        <Dialog
          open={!!selectedStep}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedStep(null);
          }}
        >
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-white flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <div>
                <DialogTitle className="text-sm font-semibold">
                  Note rapide sur l'étape
                </DialogTitle>
                <DialogDescription className="text-[11px] text-white/80">
                  {selectedStep.title}
                </DialogDescription>
              </div>
            </div>
            <div className="px-5 py-4 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Utilise cet encart pour garder une trace concrète (progression du groupe,
                points à retravailler, incidents, réussites marquantes). Ces notes restent
                locales au suivi BIS.
              </p>
              <Textarea
                className="h-28 text-sm"
                value={selectedStep.comment}
                onChange={(e) =>
                  setSelectedStep((prev) =>
                    prev
                      ? {
                          ...prev,
                          comment: e.target.value.slice(0, 400),
                        }
                      : prev
                  )
                }
                placeholder="Exemple: Groupe à l'aise sur les changements d'amure, difficulté sur le respect de la trajectoire au portant..."
              />
            </div>
            <DialogFooter className="px-5 pb-4 pt-0 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedStep(null)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (!selectedStep) return;
                  const { sessionId, stepId, comment } =
                    selectedStep;
                  updateStepStatus(sessionId, stepId, {
                    comment,
                  });
                  setSelectedStep(null);
                }}
              >
                Enregistrer la note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* MODAL FICHE SÉANCE + EXPORT PDF (React-PDF) */}
      {selectedPrintable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelectedPrintable(null)}
        >
          <div
            className="bg-white max-w-5xl w-full max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-start justify-between gap-4 p-4 border-b">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-sky-600 font-semibold">
                  COPUN — FICHE SÉANCE
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Suivi BIS — {selectedPrintable.session.title}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Vue détaillée prête pour impression ou export PDF.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right text-[10px] text-slate-500">
                  Stage #{stageId} • Séance n°
                  {selectedPrintable.session.session_order ?? '?'}
                </div>
                <div className="flex gap-2">
                  {/* Bouton d'export PDF riche via @react-pdf/renderer (SessionFichePdfDocument) */}
                  {startPdfGeneration ? (
                    <PDFDownloadLink
                      document={
                        <SessionFichePdfDocument
                          stageTitle={`Stage #${stageId}`}
                          session={selectedPrintable.session}
                          programObjectives={programObjectives}
                          techAssessments={completed}
                          assignedDefisDetails={assignedDefisDetails}
                          ficheDate={ficheDate}
                          ficheMeteo={ficheMeteo}
                          ficheVent={ficheVent}
                        />
                      }
                      fileName={`fiche-seance-stage-${stageId}-session-${selectedPrintable.session.id}.pdf`}
                    >
                      {({ loading, error, url }) => {
                        if (error) {
                          console.error('[PDF_DEBUG][UI] Erreur PDFDownloadLink:', error);
                        }
                        if (!loading && !url && !error) {
                          console.log(
                            '[PDF_DEBUG][UI]',
                            'Pas de URL ni erreur après génération: vérifier environnement React-PDF'
                          );
                        }
                        return (
                          <Button
                            asChild={false}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[9px]"
                            disabled={loading}
                          >
                            <span>
                              {loading
                                ? 'Génération...'
                                : error
                                ? 'Erreur génération PDF'
                                : 'Télécharger le PDF'}
                            </span>
                          </Button>
                        );
                      }}
                    </PDFDownloadLink>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[9px]"
                      onClick={() => {
                        console.log(
                          '[PDF_DEBUG] Premier clic: déclenche la préparation du document PDF'
                        );
                        setStartPdfGeneration(true);
                      }}
                    >
                      Générer le PDF
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[9px]"
                    onClick={() => window.print()}
                  >
                    Imprimer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[9px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPrintable(null);
                    }}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenu lisible à l'écran: résumé séance + étapes (version détaillée) */}
            <SessionFicheModalContent
              session={selectedPrintable.session}
              programObjectives={programObjectives}
              techAssessments={completed}
              assignedDefisDetails={assignedDefisDetails}
              ficheDate={ficheDate}
              ficheMeteo={ficheMeteo}
              ficheVent={ficheVent}
              ficheConditionsNotes={ficheConditionsNotes}
              setFicheMeteo={setFicheMeteo}
              setFicheVent={setFicheVent}
              setFicheConditionsNotes={setFicheConditionsNotes}
            />

            <div className="px-4 pb-3 pt-2 border-t flex items-center justify-between">
              <p className="text-[7px] text-slate-400">
                Fiche Suivi BIS — Utilise le bouton Exporter en PDF pour une version nette.
              </p>
              <p className="text-[7px] text-slate-400">Copun</p>
            </div>
          </div>
        </div>
      )}

    </Card>
  );
};

/**
 * CLONE DU BLOC OBJECTIFS / SUIVI ENVIRONNEMENT
 * Repris depuis StageDetailPage (onglet Suivi)
 */
const ObjectivesViewClone = ({ stageId }: { stageId: number }) => {
  const { toast } = useToast();
  const [objectives, setObjectives] = useState<PedagogicalContent[]>([]);
  const [completedObjectives, setCompletedObjectives] =
    useState<Set<string>>(new Set());
  const [activeThemeFilters, setActiveThemeFilters] = useState<string[]>([]);
  const [showOnlyNotSeen, setShowOnlyNotSeen] = useState(true);
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const sorties = await getSortiesForStage(stageId);
    const allPedago = await getPedagogicalContent();
    const completedIds = await getCompletedObjectives(stageId);

    const programSortie =
      sorties.find((s: any) => s.selected_content?.program?.length) ||
      sorties[0];

    if (programSortie?.selected_content?.program?.length) {
      const ids = new Set(
        programSortie.selected_content.program.map((id: any) =>
          id.toString()
        )
      );
      const used = (allPedago || []).filter((card: PedagogicalContent) =>
        ids.has(card.id.toString())
      );
      setObjectives(used);
    } else {
      setObjectives([]);
    }

    setCompletedObjectives(new Set(completedIds));
  }, [stageId]);

  useEffect(() => {
    load();
  }, [load]);

  const themesInProgram = useMemo(() => {
    const themeIds = new Set<string>();
    objectives.forEach((card) => {
      card.tags_theme.forEach((t) => themeIds.add(t));
    });
    return allGrandThemes.filter((t) => themeIds.has(t.id));
  }, [objectives]);

  const objectivesByPillar = useMemo(() => {
    const grouped: { [pillar: string]: PedagogicalContent[] } = {
      comprendre: [],
      observer: [],
      proteger: [],
    };

    let filtered = objectives;

    if (showOnlyNotSeen) {
      filtered = filtered.filter(
        (card) => !completedObjectives.has(card.id.toString())
      );
    }

    if (activeThemeFilters.length > 0) {
      filtered = filtered.filter((card) =>
        activeThemeFilters.some((id) => card.tags_theme.includes(id))
      );
    }

    filtered.forEach((card) => {
      const normalized = card.dimension
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      let pillar: keyof typeof grouped = 'comprendre';
      if (normalized.includes('observer')) pillar = 'observer';
      else if (normalized.includes('proteg')) pillar = 'proteger';

      if (!grouped[pillar].some((c) => c.id === card.id)) {
        grouped[pillar].push(card);
      }
    });

    return grouped;
  }, [objectives, activeThemeFilters, showOnlyNotSeen, completedObjectives]);

  const handleThemeFilterToggle = (themeId: string) => {
    setActiveThemeFilters((prev) =>
      prev.includes(themeId)
        ? prev.filter((id) => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleToggleObjectiveWithAnimation = (cardId: string) => {
    setAnimatingOut((prev) => new Set([...prev, cardId]));
    setTimeout(async () => {
      const isCompleted = completedObjectives.has(cardId);
      const next = new Set(completedObjectives);
      if (isCompleted) next.delete(cardId);
      else next.add(cardId);
      setCompletedObjectives(next);

      try {
        const ok = await toggleObjectiveCompletion(
          stageId,
          cardId,
          !isCompleted
        );
        if (!ok) {
          toast({
            title: 'Erreur de sauvegarde',
            description:
              "L'objectif est sauvegardé localement mais pas en base.",
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Erreur de sauvegarde',
          description:
            "L'objectif est sauvegardé localement mais pas en base.",
          variant: 'destructive',
        });
      }

      setAnimatingOut((prev) => {
        const n = new Set(prev);
        n.delete(cardId);
        return n;
      });
    }, 300);
  };

  if (objectives.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16 px-4">
          <h3 className="text-lg font-semibold">
            Le programme est vide
          </h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Allez dans l'onglet "Programme" pour définir les
            objectifs de ce stage.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">
              Objectifs Pédagogiques
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <ListFilter className="mr-2 h-4 w-4" />
                    Thèmes
                    {activeThemeFilters.length > 0 &&
                      ` (${activeThemeFilters.length})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    Filtrer par thème
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {themesInProgram.map((theme) => (
                    <DropdownMenuCheckboxItem
                      key={theme.id}
                      checked={activeThemeFilters.includes(theme.id)}
                      onCheckedChange={() =>
                        handleThemeFilterToggle(theme.id)
                      }
                    >
                      {theme.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-not-seen"
                  checked={showOnlyNotSeen}
                  onCheckedChange={(v) =>
                    setShowOnlyNotSeen(!!v)
                  }
                />
                <label
                  htmlFor="show-not-seen"
                  className="text-sm font-medium cursor-pointer"
                >
                  Non vus uniquement
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {Object.entries(objectivesByPillar).map(
        ([pillar, cards]) => {
          const cfg =
            AXE_CONFIG[pillar as keyof typeof AXE_CONFIG];
          const style =
            PILLAR_STYLES[pillar as keyof typeof PILLAR_STYLES];
          if (!cfg || !style || cards.length === 0) return null;

          const PillarIcon = style.icon || cfg.icon;

          return (
            <div key={pillar}>
              <h3
                className={cn(
                  'text-xl font-semibold flex items-center gap-3 mb-4',
                  style.text
                )}
              >
                <PillarIcon className="w-6 h-6" />
                {cfg.label}
              </h3>
              <Accordion
                type="multiple"
                className="w-full space-y-2"
              >
                {cards.map((card) => {
                  const id = card.id.toString();
                  const checked =
                    completedObjectives.has(id);
                  const isAnimating =
                    animatingOut.has(id);

                  return (
                    <div
                      key={id}
                      className={cn(
                        'overflow-hidden',
                        isAnimating &&
                          'opacity-0 h-0 mb-0 transition-all duration-300'
                      )}
                    >
                      <AccordionItem
                        value={id}
                        className="border-b-0"
                      >
                        <Card
                          className={cn(
                            'transition-all overflow-hidden bg-card',
                            checked
                              ? 'opacity-50'
                              : 'opacity-100'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-stretch p-1 justify-between gap-2 border-l-4 rounded-l-md',
                              style.border
                            )}
                          >
                            {card.icon_tag && (
                              <div className="p-3 pl-2 flex items-center justify-center shrink-0">
                                <Image
                                  src={`/assets/icons/${card.icon_tag}.png`}
                                  alt={card.icon_tag}
                                  width={60}
                                  height={60}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div
                              className={cn(
                                'flex-grow p-3 space-y-2',
                                !card.icon_tag && 'pl-4'
                              )}
                            >
                              <div className="flex flex-wrap gap-1">
                                {card.tags_theme.map(
                                  (themeId) => {
                                    const theme =
                                      allGrandThemes.find(
                                        (t) =>
                                          t.id ===
                                          themeId
                                      );
                                    return theme ? (
                                      <Badge
                                        key={themeId}
                                        variant="outline"
                                        className="font-normal"
                                      >
                                        {theme.title}
                                      </Badge>
                                    ) : null;
                                  }
                                )}
                              </div>
                              <p className="font-medium text-foreground text-sm">
                                {card.question}
                              </p>
                            </div>

                            <div className="flex flex-col items-center gap-2 pl-2 pr-1 shrink-0 pt-3">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  handleToggleObjectiveWithAnimation(
                                    id
                                  )
                                }
                                aria-label="Marquer comme vu"
                                className="h-4 w-4 rounded-full border-2 border-muted-foreground"
                              />
                              <AccordionTrigger className="p-1 hover:no-underline [&>svg]:mx-auto">
                                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                              </AccordionTrigger>
                            </div>
                          </div>
                          <AccordionContent>
                            <div className="border-t mx-3"></div>
                            <div className="px-3 pb-3 pt-2 text-muted-foreground text-sm space-y-2">
                              <p>
                                <span className="font-semibold text-foreground/80">
                                  Objectif:
                                </span>{' '}
                                {card.objectif}
                              </p>
                              {card.tip && (
                                <p>
                                  <span className="font-semibold text-foreground/80">
                                    Conseil:
                                  </span>{' '}
                                  {card.tip}
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    </div>
                  );
                })}
              </Accordion>
            </div>
          );
        }
      )}
    </div>
  );
};

/**
 * CLONE DU BLOC DEFIS SUIVI
 */
const DefisSuiviClone = ({ stageId }: { stageId: number }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedDefis, setAssignedDefis] =
    useState<AssignedDefi[]>([]);
  const [defiToProve, setDefiToProve] =
    useState<{ assignedDefi: AssignedDefi; defi: Defi } | null>(
      null
    );

  const fetchDefis = useCallback(async () => {
    const dbExploits = await getStageExploits(stageId);
    const mapped: AssignedDefi[] = dbExploits.map((e) => ({
      id: e.id,
      stage_id: e.stage_id,
      defi_id: e.exploit_id,
      status: e.status as DefiStatus,
      completed_at: e.completed_at,
      preuve_url:
        (e.preuves_url as string[] | null)?.[0] || null,
    }));
    setAssignedDefis(mapped);
  }, [stageId]);

  useEffect(() => {
    fetchDefis();
  }, [fetchDefis]);

  const assignedDefisDetails = useMemo(
    () =>
      assignedDefis
        .map((am) => {
          const details = allDefis.find(
            (m) => m.id === am.defi_id
          );
          return details ? { ...am, details } : null;
        })
        .filter(
          (am): am is AssignedDefi & { details: Defi } =>
            am !== null
        ),
    [assignedDefis]
  );

  const iconMap: { [key: string]: React.ElementType } = {
    Shield,
    Trash2,
    Wind,
    Fish,
    Map,
    Gamepad2,
    BookOpen,
    Trophy,
    Camera,
    Microscope,
    LandPlot,
    Compass,
    Waves,
    Leaf,
  };

  const handleUpdateDefi = (
    assignedDefi: AssignedDefi,
    completed: boolean,
    preuveUrl?: string
  ) => {
    setIsProcessing(true);
    (async () => {
      try {
        const newStatus: DefiStatus = completed
          ? 'complete'
          : 'en_cours';
        const finalPreuveUrl =
          preuveUrl !== undefined
            ? preuveUrl
            : assignedDefi.preuve_url;

        const success = await updateStageExploitStatus(
          assignedDefi.stage_id,
          assignedDefi.defi_id,
          newStatus,
          finalPreuveUrl
        );

        if (success) {
          toast({
            title: 'Progression du défi mise à jour',
          });
          await fetchDefis();
        } else {
          toast({
            title: 'Erreur',
            description:
              'Échec de la mise à jour du défi.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  if (assignedDefisDetails.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl text-amber-500">
          <Trophy className="w-6 h-6" />
          Défis à Réaliser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion
          type="multiple"
          className="w-full space-y-2"
        >
          {assignedDefisDetails.map((assignedDefi) => {
            const defiDetails = assignedDefi.details;
            const IconComponent =
              iconMap[defiDetails.icon] || Shield;
            const isCompleted =
              assignedDefi.status === 'complete';

            return (
              <AccordionItem
                value={defiDetails.id}
                key={defiDetails.id}
                className="border-b-0"
              >
                <Card
                  className={cn(
                    'transition-all overflow-hidden',
                    isCompleted
                      ? 'bg-card opacity-60'
                      : 'bg-card'
                  )}
                >
                  <AccordionTrigger className="flex w-full p-3 text-left hover:no-underline">
                    <div className="flex items-start gap-4 text-left flex-grow">
                      <IconComponent className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
                      <div className="flex-grow">
                        <p className="font-semibold text-foreground">
                          {defiDetails.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="border-t pt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {defiDetails.instruction}
                      </p>
                      {(defiDetails.type_preuve ===
                        'checkbox' ||
                        defiDetails.type_preuve ===
                          'action' ||
                        defiDetails.type_preuve ===
                          'quiz') && (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                          <Checkbox
                            id={`defi-${assignedDefi.id}`}
                            checked={isCompleted}
                            onCheckedChange={(checked) =>
                              handleUpdateDefi(
                                assignedDefi,
                                !!checked
                              )
                            }
                            disabled={isProcessing}
                          />
                          <label
                            htmlFor={`defi-${assignedDefi.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            Marquer comme terminé
                          </label>
                        </div>
                      )}
                      {defiDetails.type_preuve ===
                        'photo' && (
                        <div className="p-2 bg-muted/50 rounded-md">
                          {isCompleted &&
                            assignedDefi.preuve_url && (
                              <img
                                src={
                                  assignedDefi.preuve_url
                                }
                                alt={`Preuve pour ${defiDetails.description}`}
                                width={80}
                                height={80}
                                className="rounded-md object-cover mb-2"
                              />
                            )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDefiToProve({
                                assignedDefi,
                                defi: defiDetails,
                              })
                            }
                            disabled={isProcessing}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            {isCompleted
                              ? 'Modifier la preuve'
                              : 'Valider avec une photo'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

/**
 * CLONE DU BLOC JEUX & QUIZ
 */
const JeuxSuiviClone = ({
  stageId,
}: {
  stageId: number;
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [history, setHistory] =
    useState<StageGameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [g, h] = await Promise.all([
      getGamesForStage(stageId),
      getStageGameHistory(stageId),
    ]);
    setGames(g || []);
    setHistory(h || []);
    setLoading(false);
  }, [stageId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (!games.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-3 text-purple-400">
          <Gamepad2 className="w-6 h-6" />
          Jeux & Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          games.map((game) => {
            const r = history.find(
              (g) => g.game_id === game.id
            );
            return (
              <Card
                key={game.id}
                className="hover:bg-muted/50 transition-colors group relative"
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {game.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Thème: {game.theme}
                    </p>
                    {r && (
                      <Badge
                        variant={
                          r.percentage >= 75
                            ? 'default'
                            : 'secondary'
                        }
                        className="mt-2"
                      >
                        Score: {r.percentage}%
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={`/jeux/${game.id}`}
                    className={cn(
                      buttonVariants({
                        variant: 'secondary',
                        size: 'sm',
                      })
                    )}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Lancer
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default SuiviBisPage;