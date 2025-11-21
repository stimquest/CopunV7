'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  getStageById,
  getPedagogicalContent,
  getStageExploits,
} from '@/app/actions';
import {
  getSessionsForStage,
  getSessionStructure,
} from '@/app/actions-sessions';
import type {
  Stage,
  Session,
  SessionStructure as SessionStructureType,
  PedagogicalContent,
} from '@/lib/types';
import { allDefis } from '@/data/defis';

interface PrintableStep extends SessionStructureType {}

interface PrintableProps {}

const PrintableSuiviBisPage: React.FC<PrintableProps> = () => {
  const searchParams = useSearchParams();
  const params = useParams();

  const stageId = useMemo(() => {
    const fromUrl = params?.stageId
      ? parseInt(params.stageId as string, 10)
      : NaN;
    return Number.isFinite(fromUrl) ? fromUrl : null;
  }, [params]);

  const sessionId = useMemo(() => {
    const raw = searchParams.get('sessionId');
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const [stage, setStage] = useState<Stage | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [steps, setSteps] = useState<PrintableStep[]>([]);
  const [pedago, setPedago] = useState<PedagogicalContent[]>([]);
  const [defisText, setDefisText] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!stageId || !sessionId) {
          setError(
            "Paramètres manquants pour générer la fiche séance imprimable."
          );
          setReady(true);
          return;
        }

        // Charger stage
        const s = await getStageById(stageId);
        if (!s) {
          setError('Stage introuvable.');
          setReady(true);
          return;
        }
        setStage(s);

        // Charger séance ciblée
        const sessions = await getSessionsForStage(stageId);
        const target = (sessions || []).find((ss) => ss.id === sessionId);
        if (!target) {
          setError('Séance introuvable pour ce stage.');
          setReady(true);
          return;
        }
        setSession(target);

        // Étapes
        const st = await getSessionStructure(sessionId);
        const sortedSteps = (st || []).sort(
          (a, b) => (a.step_order ?? 0) - (b.step_order ?? 0)
        );
        setSteps(sortedSteps);

        // Objectifs pédagogiques (vue synthétique)
        const allP = await getPedagogicalContent();
        setPedago(allP || []);

        // Défis associés au stage (texte compact)
        const exploits = await getStageExploits(stageId);
        if (exploits && exploits.length > 0) {
          const lines: string[] = [];
          exploits.forEach((e: any, idx: number) => {
            const defi = allDefis.find((d) => d.id === e.exploit_id);
            const label =
              defi?.description || `Défi #${e.exploit_id}` || 'Défi';
            const status =
              e.status === 'complete'
                ? 'Validé'
                : e.status === 'en_cours'
                ? 'En cours'
                : 'À faire';
            lines.push(`${idx + 1}. ${label} (${status})`);
          });
          setDefisText(lines);
        }

        setReady(true);

        // Déclencher l'impression une fois que le DOM est prêt
        setTimeout(() => {
          window.print();
        }, 400);
      } catch (e) {
        console.error('[SuiviBis Printable] error', e);
        setError(
          "Erreur lors du chargement des données pour la fiche séance imprimable."
        );
        setReady(true);
      }
    };

    load();
  }, [stageId, sessionId]);

  const sessionLabel = useMemo(() => {
    if (!session) return '';
    const parts: string[] = [];
    if (session.session_order != null) {
      parts.push(`Séance n°${session.session_order}`);
    }
    if (session.title) parts.push(session.title);
    return parts.join(' - ') || `Séance #${session.id}`;
  }, [session]);

  // Styles dédiés impression directement dans la page
  // Design: sobre, lisible, adapté A4, sans couleurs criardes.
  return (
    <html>
      <head>
        <title>Fiche séance imprimable</title>
        <style>{`
          @page {
            size: A4;
            margin: 15mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11px;
            color: #111827;
            background: #ffffff;
          }
          .fiche-wrapper {
            max-width: 780px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .logo-block {
            font-weight: 700;
            font-size: 11px;
            color: #2563EB;
          }
          .title-block {
            text-align: right;
            font-size: 10px;
            color: #6B7280;
          }
          .title-block h1 {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .section-title {
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #111827;
            margin: 10px 0 4px;
          }
          .section-sub {
            font-size: 9px;
            color: #6B7280;
            margin-bottom: 4px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 2fr 2fr 2fr;
            gap: 6px;
            margin: 6px 0 8px;
            font-size: 9px;
          }
          .meta-label {
            font-weight: 600;
            color: #374151;
          }
          .meta-value {
            border-bottom: 1px dotted #D1D5DB;
            min-height: 12px;
          }
          .step {
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 6px;
            margin-bottom: 6px;
          }
          .step-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
          }
          .step-index {
            font-weight: 700;
            font-size: 9px;
            color: #2563EB;
            margin-right: 4px;
          }
          .step-title {
            font-weight: 600;
            font-size: 10px;
            color: #111827;
          }
          .step-duration {
            font-size: 9px;
            color: #6B7280;
          }
          .step-desc {
            font-size: 9px;
            color: #4B5563;
            margin-bottom: 2px;
          }
          .notes-label {
            font-size: 8px;
            color: #6B7280;
            margin-top: 2px;
          }
          .notes-line {
            border-bottom: 1px dotted #D1D5DB;
            height: 9px;
            margin-bottom: 2px;
          }
          .pill {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 999px;
            border: 1px solid #D1D5DB;
            font-size: 7px;
            color: #6B7280;
            margin-right: 4px;
            margin-top: 2px;
          }
          .defi-item {
            font-size: 9px;
            margin-bottom: 2px;
          }
          .footer {
            margin-top: 10px;
            font-size: 7px;
            color: #9CA3AF;
            text-align: center;
          }
          .error {
            margin-top: 40px;
            padding: 12px;
            border: 1px solid #F87171;
            color: #991B1B;
            font-size: 10px;
          }
          .loading {
            margin-top: 40px;
            font-size: 10px;
            color: #6B7280;
          }
          @media screen {
            body {
              background: #F3F4F6;
            }
            .fiche-wrapper {
              margin-top: 24px;
              margin-bottom: 24px;
              background: #ffffff;
              box-shadow: 0 10px 30px rgba(15,23,42,0.08);
              padding: 16px 18px;
              border-radius: 8px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="fiche-wrapper">
          {!ready && (
            <div className="loading">
              Préparation de la fiche séance imprimable...
            </div>
          )}

          {ready && error && (
            <div className="error">
              {error}
            </div>
          )}

          {ready && !error && stage && session && (
            <>
              {/* En-tête */}
              <div className="header">
                <div className="logo-block">
                  COPUN
                  <div style={{ fontSize: 8, fontWeight: 400, color: '#6B7280' }}>
                    Fiche séance imprimable
                  </div>
                </div>
                <div className="title-block">
                  <h1>Suivi BIS - Fiche Séance</h1>
                  <div>{stage.title}</div>
                  <div>{sessionLabel}</div>
                </div>
              </div>

              {/* Métadonnées rapides */}
              <div className="section-title">
                Informations séance
              </div>
              <div className="section-sub">
                À compléter par le moniteur avant la séance.
              </div>
              <div className="meta-grid">
                <div>
                  <div className="meta-label">Date / créneau</div>
                  <div className="meta-value"></div>
                </div>
                <div>
                  <div className="meta-label">Conditions météo / mer</div>
                  <div className="meta-value"></div>
                </div>
                <div>
                  <div className="meta-label">Groupe / niveau</div>
                  <div className="meta-value"></div>
                </div>
              </div>

              {/* Déroulé par étapes */}
              <div className="section-title">
                Déroulé sportif / technique
              </div>
              <div className="section-sub">
                Chaque bloc représente une étape clé. Utilisez l'espace notes
                pour tracer la progression réelle.
              </div>

              {steps.length === 0 && (
                <div style={{ fontSize: 9, color: '#9CA3AF' }}>
                  Aucune étape structurée n'est encore définie pour cette
                  séance.
                </div>
              )}

              {steps.map((step, index) => (
                <div key={step.id} className="step">
                  <div className="step-header">
                    <div>
                      <span className="step-index">
                        {index + 1}.
                      </span>
                      <span className="step-title">
                        {step.step_title || 'Étape sans titre'}
                      </span>
                    </div>
                    {step.step_duration_minutes && (
                      <div className="step-duration">
                        {step.step_duration_minutes} min
                      </div>
                    )}
                  </div>
                  {step.step_description && (
                    <div className="step-desc">
                      {step.step_description}
                    </div>
                  )}
                  <div className="notes-label">
                    Notes / observations (technique, sécurité, attitudes) :
                  </div>
                  <div className="notes-line"></div>
                  <div className="notes-line"></div>
                  <div className="notes-line"></div>
                  <div className="notes-label">
                    Objectifs pédagogiques / environnement (liés à cette étape) :
                  </div>
                  <div className="notes-line"></div>
                </div>
              ))}

              {/* Objectifs pédagogiques synthétiques */}
              <div className="section-title">
                Objectifs pédagogiques à mobiliser
              </div>
              <div className="section-sub">
                Liste synthétique issue du programme global (à ajuster selon la séance).
              </div>
              {pedago.slice(0, 8).map((card) => (
                <div key={card.id} style={{ fontSize: 8.5, marginBottom: 2 }}>
                  <span className="pill">
                    {card.dimension || 'Objectif'}
                  </span>
                  <span>
                    {card.question || card.objectif}
                  </span>
                </div>
              ))}
              {pedago.length === 0 && (
                <div style={{ fontSize: 8.5, color: '#9CA3AF' }}>
                  Aucun objectif chargé. Configurez le Programme pour ce stage
                  afin de les faire apparaître ici.
                </div>
              )}

              {/* Défis liés au stage */}
              <div className="section-title">
                Défis / Exploits environnementaux du stage
              </div>
              <div className="section-sub">
                À utiliser comme fils rouges pendant la séance.
              </div>
              {defisText.length > 0 ? (
                defisText.map((line, idx) => (
                  <div key={idx} className="defi-item">
                    {line}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 8.5, color: '#9CA3AF' }}>
                  Aucun défi spécifiquement associé pour ce stage.
                </div>
              )}

              {/* Bas de page */}
              <div className="footer">
                Fiche Suivi BIS générée depuis Copun — Optimisée pour impression A4.
              </div>
            </>
          )}
        </div>
      </body>
    </html>
  );
};

export default PrintableSuiviBisPage;