'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Session, SessionStructure, PedagogicalContent, AssignedDefi, Defi } from '@/lib/types';

type TechStatus = 'non_aborde' | 'en_cours' | 'acquis' | 'a_revoir';

interface TechnicalAssessment {
  id: string; // `${sessionId}:${stepId}`
  status: TechStatus;
  comment: string;
}

// IMPORTANT: on n'enregistre plus de font custom distante ici.
// On reste sur les polices de base supportées par @react-pdf/renderer
// (Helvetica, Times-Roman, Courier) pour éviter l'erreur "Unknown font format".

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    // Utiliser une police de base supportée nativement (évite l'erreur Font family not registered)
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
  },
  brand: {
    fontSize: 9,
    fontWeight: 700,
    color: '#2563EB',
  },
  brandSub: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 2,
  },
  titleBlock: {
    textAlign: 'right',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
  },
  subtitle: {
    fontSize: 8,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 4,
    color: '#111827',
  },
  sectionSub: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaItem: {
    width: '32%',
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: '#374151',
  },
  metaValue: {
    fontSize: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 4,
    marginTop: 1,
  },
  step: {
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepIndex: {
    fontSize: 8,
    fontWeight: 700,
    color: '#2563EB',
    marginRight: 3,
  },
  stepTitle: {
    fontSize: 8.5,
    fontWeight: 600,
    color: '#111827',
  },
  stepDuration: {
    fontSize: 7,
    color: '#6B7280',
  },
  stepDesc: {
    fontSize: 7,
    color: '#4B5563',
    marginTop: 1,
    marginBottom: 2,
  },
  notesLabel: {
    fontSize: 6.5,
    color: '#6B7280',
    marginTop: 1,
  },
  notesLine: {
    borderBottomWidth: 0.4,
    borderBottomColor: '#D1D5DB',
    marginTop: 1,
    marginBottom: 1,
  },
  footer: {
    marginTop: 8,
    fontSize: 6,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export interface SessionFichePdfProps {
  stageTitle: string;
  session: Session & { steps: SessionStructure[] };
  programObjectives?: PedagogicalContent[]; // objectifs environnementaux du programme à afficher
  techAssessments: Record<string, TechnicalAssessment>; // Notes techniques et statuts par étape
  assignedDefisDetails: (AssignedDefi & { details: Defi })[]; // Défis du stage avec détails
  ficheDate: string;
  ficheMeteo: string[]; // multi-sélection météo
  ficheVent: string[]; // multi-sélection vent
  ficheConditionsNotes?: string; // note libre optionnelle
}

/**
 * Composant pure React-PDF qui génère une belle fiche séance.
 * Utilisation:
 * - Dans SuiviBis, on ouvre un modal qui contient un PDFViewer ou un Blob généré à partir de ce Document.
 * - L'utilisateur peut imprimer ou sauvegarder en PDF ce rendu propre.
 */
export const SessionFichePdfDocument: React.FC<SessionFichePdfProps> = ({
  stageTitle,
  session,
  programObjectives = [],
  techAssessments,
  assignedDefisDetails,
  ficheDate,
  ficheMeteo,
  ficheVent,
  ficheConditionsNotes,
}) => {
  console.log('[PDF_DEBUG] SessionFichePdfDocument reçu - Vérification des données:', {
    stageTitle,
    sessionId: session?.id,
    sessionTitle: session?.title,
    sessionSteps: session?.steps?.length,
    programObjectives: programObjectives?.length,
    techAssessments: Object.keys(techAssessments || {}).length,
    assignedDefisDetails: assignedDefisDetails?.length,
    ficheDate,
    ficheMeteo,
    ficheVent
  });

  // Validation des données critiques
  if (!session) {
    console.error('[PDF_DEBUG] ERREUR: session est undefined');
    return null;
  }
  if (!session.steps) {
    console.warn('[PDF_DEBUG] AVERTISSEMENT: session.steps est undefined');
  }

  const steps = (session.steps || [])
    .slice()
    .sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0));

  console.log('[PDF_DEBUG] Steps après tri:', steps.map(s => ({ id: s.id, title: s.step_title, order: s.step_order })));

  const getStatusLabel = (status: TechStatus | undefined): string => {
    switch (status) {
      case 'acquis':
        return 'Évaluation: Acquis';
      case 'en_cours':
        return 'Évaluation: En cours';
      case 'a_revoir':
        return 'Évaluation: À revoir';
      default:
        return 'Évaluation: Non abordé';
    }
  };

  const sessionLabelParts: string[] = [];
  if (session.session_order != null)
    sessionLabelParts.push(`Séance n°${session.session_order}`);
  if (session.title) sessionLabelParts.push(session.title);
  const sessionLabel =
    sessionLabelParts.join(' - ') || `Séance #${session.id}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>COPUN</Text>
            <Text style={styles.brandSub}>Fiche séance Suivi BIS</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>FICHE SÉANCE</Text>
            <Text style={styles.subtitle}>{stageTitle}</Text>
            <Text style={styles.subtitle}>{sessionLabel}</Text>
          </View>
        </View>

        {/* Meta */}
        <Text style={styles.sectionTitle}>Informations séance</Text>
        <Text style={styles.sectionSub}>
          À compléter par le moniteur avant la séance.
        </Text>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{ficheDate || 'À renseigner'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Météo</Text>
            <Text style={styles.metaValue}>
              {Array.isArray(ficheMeteo) && ficheMeteo.length
                ? ficheMeteo.join(', ')
                : 'À renseigner'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Vent</Text>
            <Text style={styles.metaValue}>
              {Array.isArray(ficheVent) && ficheVent.length
                ? ficheVent.join(', ')
                : 'À renseigner'}
            </Text>
          </View>
        </View>
        {ficheConditionsNotes ? (
          <Text
            style={{
              fontSize: 6.5,
              color: '#4B5563',
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            Conditions : {ficheConditionsNotes}
          </Text>
        ) : null}

        {/* Steps */}
        <Text style={styles.sectionTitle}>Déroulé sportif / technique</Text>
        <Text style={styles.sectionSub}>
          Support de cours terrain: étapes clés, notes, et lien avec les objectifs environnementaux.
        </Text>

        {steps.length === 0 ? (
          <Text
            style={{
              fontSize: 7,
              color: '#9CA3AF',
              marginTop: 2,
            }}
          >
            Aucune étape structurée définie pour cette séance.
          </Text>
        ) : (
          steps.map((step, index) => {
            const linkedObjectives = (programObjectives || []).slice(0, 6);
            const assessment = techAssessments[`${session.id}:${step.id}`];

            return (
              <View key={step.id} style={styles.step}>
                <View style={styles.stepHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.stepIndex}>{index + 1}.</Text>
                    <Text style={styles.stepTitle}>
                      {step.step_title || 'Étape sans titre'}
                    </Text>
                  </View>
                  {step.step_duration_minutes && (
                    <Text style={styles.stepDuration}>
                      {step.step_duration_minutes} min
                    </Text>
                  )}
                </View>

                {step.step_description && (
                  <Text style={styles.stepDesc}>{step.step_description}</Text>
                )}

                {/* Évaluation technique */}
                <Text style={{ fontSize: 7, fontWeight: 700, color: '#374151', marginTop: 4 }}>
                  {getStatusLabel(assessment?.status)}
                </Text>

                {/* Objectifs environnementaux détaillés pour cette étape (issus du programme) */}
                {linkedObjectives.length > 0 && (
                  <>
                    <Text style={styles.notesLabel}>
                      Objectifs environnementaux à mobiliser :
                    </Text>
                    {linkedObjectives.map((obj, i) => (
                      <View
                        key={`${step.id}-${obj.id ?? i}`}
                        style={{ marginLeft: 4, marginBottom: 1 }}
                      >
                        <Text
                          style={{
                            fontSize: 6.8,
                            color: '#111827',
                            fontWeight: 600,
                          }}
                        >
                          • {obj.question || obj.objectif}
                        </Text>
                        {obj.objectif && (
                          <Text
                            style={{
                              fontSize: 6.4,
                              color: '#4B5563',
                              marginLeft: 6,
                            }}
                          >
                            Objectif: {obj.objectif}
                          </Text>
                        )}
                        {obj.tip && (
                          <Text
                            style={{
                              fontSize: 6.2,
                              color: '#6B7280',
                              marginLeft: 6,
                            }}
                          >
                            Conseil: {obj.tip}
                          </Text>
                        )}
                      </View>
                    ))}
                  </>
                )}

                <Text style={styles.notesLabel}>
                  Notes / observations (technique, sécurité, attitudes) :
                </Text>
                <Text style={{ fontSize: 7, color: '#4B5563', marginTop: 2 }}>
                  {techAssessments[`${session.id}:${step.id}`]?.comment ||
                    'Aucune note enregistrée.'}
                </Text>
                <View style={styles.notesLine} />
              </View>
            );
          })
        )}

        {/* Bloc objectifs globaux du programme */}
        {programObjectives && programObjectives.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Objectifs environnementaux du programme
            </Text>
            <Text style={styles.sectionSub}>
              Détail des fiches sélectionnées pour ce stage, avec objectifs et conseils tels que dans le Programme.
            </Text>
            {programObjectives.slice(0, 24).map((obj, idx) => (
              <View
                key={obj.id ?? idx}
                style={{ marginBottom: 3 }}
              >
                <Text
                  style={{
                    fontSize: 7,
                    color: '#111827',
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}. {obj.question || obj.objectif}
                </Text>
                {obj.objectif && (
                  <Text
                    style={{
                      fontSize: 6.5,
                      color: '#4B5563',
                      marginLeft: 6,
                    }}
                  >
                    Objectif: {obj.objectif}
                  </Text>
                )}
                {obj.tip && (
                  <Text
                    style={{
                      fontSize: 6.3,
                      color: '#6B7280',
                      marginLeft: 6,
                    }}
                  >
                    Conseil: {obj.tip}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Bloc Défis / Exploits liés au stage */}
        {assignedDefisDetails && assignedDefisDetails.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Défis / Exploits du stage</Text>
            <Text style={styles.sectionSub}>
              Détail des défis environnementaux assignés à ce stage.
            </Text>
            {assignedDefisDetails.map((defi, idx) => (
              <View key={defi.id} style={{ marginBottom: 3 }}>
                <Text
                  style={{
                    fontSize: 7,
                    color: '#111827',
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}. {defi.details.description}
                </Text>
                <Text
                  style={{
                    fontSize: 6.5,
                    color: '#4B5563',
                    marginLeft: 6,
                  }}
                >
                  Statut: {defi.status === 'complete' ? 'Validé' : 'En cours'}
                </Text>
                <Text
                  style={{
                    fontSize: 6.5,
                    color: '#4B5563',
                    marginLeft: 6,
                  }}
                >
                  Instruction: {defi.details.instruction}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Fiche générée depuis Copun — Imprimer ou exporter en PDF via le navigateur.
        </Text>
      </Page>
    </Document>
  );
};