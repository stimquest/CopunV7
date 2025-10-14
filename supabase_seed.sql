-- supabase_seed.sql

-- This script provides the initial data for the application.
-- It's designed to be idempotent, so it can be run multiple times without causing errors.

-- 1. Structures (Clubs)
INSERT INTO public.structures (id, name, latitude, longitude)
VALUES
    ('cnp', 'Club Nautique des Passionnés', 49.05, -1.58),
    ('ycm', 'Yacht Club de la Mer', 48.85, 2.35),
    ('evb', 'Ecole de Voile de la Baie', 47.6, -2.76),
    ('sng', 'Société Nautique du Golfe', 47.55, -2.85)
ON CONFLICT (id) DO NOTHING;


-- 2. Etages (The main pedagogical stages)
INSERT INTO public.etages (id, title, icon, color, "order")
VALUES
    ('niveau', 'Niveau du Groupe', 'Target', 'blue', 1),
    ('comprendre', 'Comprendre', 'BookOpen', 'yellow', 2),
    ('observer', 'Observer', 'Eye', 'purple', 3),
    ('proteger', 'Protéger', 'Shield', 'green', 4)
ON CONFLICT (id) DO NOTHING;


-- 3. Options (Themes within each etage)
-- Note: The order column dictates the display order in the UI.

-- Options for 'Niveau'
INSERT INTO public.options (id, etage_id, label, duration, group_size, activities, safety, tip, materials, local_content, "order")
VALUES
    ('n1', 'niveau', 'Niveau 1 : Débutant', 15, '4-8 pers.', '{"Rappel des bases de sécurité en mer", "Identification des parties du bateau", "Jeu : trouver la direction du vent"}', '{"Port du gilet de sauvetage obligatoire", "Rester groupé autour du moniteur"}', 'Focus sur le plaisir de la découverte et la confiance en soi. Utiliser un vocabulaire simple et imagé.', '{"Cône de vent", "Tableau blanc"}', NULL, 1),
    ('n2', 'niveau', 'Niveau 2 : Initié', 15, '4-8 pers.', '{"Réglage simple de la voile", "Maintenir un cap de base", "Virer de bord (initiation)"}', '{"Anticiper les changements de vent", "Communication claire pendant les manoeuvres"}', 'Encourager l''autonomie dans les réglages simples. Introduire les notions de près et de largue.', '{"Lattes de visualisation", "Boussole simple"}', NULL, 2),
    ('n3', 'niveau', 'Niveau 3 : Confirmé', 15, '3-6 pers.', '{"Optimisation des réglages de voile", "Empannage (initiation)", "Coordination équipier-barreur"}', '{"Gérer la gîte", "Connaître la procédure de dessalage"}', 'Travailler sur la fluidité des manoeuvres et la communication au sein de l''équipage.', '{"Chronomètre", "GoPro pour débriefing"}', NULL, 3),
    ('n45', 'niveau', 'Niveau 4/5 : Expert', 15, '2-4 pers.', '{"Analyse du plan d''eau et stratégie", "Réglages fins (vrillage, creux)", "Techniques de régate (départs, passages de bouée)"}', '{"Gestion de la fatigue et de l''effort", "Respect des règles de priorité"}', 'Mettre en place des scénarios complexes (ex: régate, parcours technique) pour pousser à la prise de décision rapide.', '{"GPS tracker", "Carnet de notes étanche"}', NULL, 4)
ON CONFLICT (id) DO NOTHING;

-- Options for 'Comprendre'
INSERT INTO public.options (id, etage_id, label, tip, local_content, "order")
VALUES
    ('littoral', 'comprendre', 'Le Littoral', 'Connecter les formes du paysage avec les termes marins (plage, dune, falaise, baie).', 'Observer la forme de la plage de Sciotot et l''impact des courants sur le sable.', 1),
    ('faune_flore', 'comprendre', 'La Faune & Flore', 'Relier la présence de certains oiseaux ou algues à la qualité de l''eau ou à la saison.', 'Attention à la zone de nidification des gravelots à collier interrompu à l''est de la cale.', 2),
    ('meteo_marees', 'comprendre', 'Météo & Marées', 'Expliquer simplement l''effet du vent sur la mer (clapot, vagues) et le concept de marnage.', 'Le courant de la déroute des îles est particulièrement fort par coefficient supérieur à 90.', 3),
    ('activites', 'comprendre', 'Les Activités Humaines', 'Discuter de la cohabitation entre les différentes pratiques : plaisance, pêche, baignade, etc.', 'Repérer les casiers de pêcheurs signalés par des flotteurs colorés et garder ses distances.', 4)
ON CONFLICT (id) DO NOTHING;

-- Options for 'Observer'
INSERT INTO public.options (id, etage_id, label, tip, local_content, "order")
VALUES
    ('sensoriel', 'observer', 'Observation Sensorielle', 'Inciter à utiliser tous ses sens : sentir l''air salin, écouter le clapotis, regarder la couleur de l''eau.', 'Sentir l''odeur particulière des algues découvertes à marée basse près des rochers.', 1),
    ('paysage', 'observer', 'Lecture de Paysage', 'Apprendre à nommer ce qu''on voit : l''horizon, la côte, un cap, une amer (point de repère).', 'Utiliser le phare de Carteret comme amer pour se positionner.', 2),
    ('vivant', 'observer', 'Le Vivant', 'Chercher activement des signes de vie : un oiseau qui plonge, un poisson qui saute, des algues en surface.', 'Tenter de repérer les cormorans en train de sécher leurs ailes sur les rochers de la pointe.', 3),
    ('meteo', 'observer', 'Signes Météo', 'Observer la forme des nuages, la direction des vagues, la couleur du ciel pour anticiper une évolution.', 'Les nuages qui s''accrochent sur le cap de la Hague annoncent souvent un changement de temps.', 4)
ON CONFLICT (id) DO NOTHING;

-- Options for 'Protéger'
INSERT INTO public.options (id, etage_id, label, tip, local_content, "order")
VALUES
    ('dechets', 'proteger', 'Les Déchets', 'Apprendre à identifier les déchets et comprendre leur impact (ex: un sac plastique ressemble à une méduse).', 'Le courant porte souvent les déchets vers la plage des Dunes, une zone à surveiller.', 1),
    ('faune_flore_protection', 'proteger', 'Protéger Faune & Flore', 'Adopter les bons gestes : ne pas déranger les animaux, ne pas piétiner les zones fragiles.', 'Ne pas s''approcher à moins de 100m des phoques qui se reposent sur les bancs de sable.', 2),
    ('reglementation', 'proteger', 'La Réglementation', 'Connaître les règles de base : limitations de vitesse, zones interdites, balisage.', 'La vitesse est limitée à 3 noeuds dans la zone des 300 mètres.', 3),
    ('sciences', 'proteger', 'Sciences Participatives', 'Participer à des programmes de suivi (ex: compter une espèce, signaler une pollution).', 'Utiliser l''application "BioLit" pour signaler nos observations de la laisse de mer.', 4)
ON CONFLICT (id) DO NOTHING;


-- 4. Content Cards
-- These are the individual "flashcards" of content.

-- Cards for "Comprendre > Faune & Flore"
INSERT INTO public.content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status)
VALUES
    ('card_faune_cormoran', 'faune_flore', 'Le Grand Cormoran', 'Oiseau marin noir, excellent plongeur. On le voit souvent les ailes écartées sur un rocher pour les faire sécher, car son plumage n''est pas totalement imperméable.', 'https://placehold.co/600x400.png', 'cormorant rock', 5, 'national', 'validated'),
    ('card_faune_goeland', 'faune_flore', 'Le Goéland Argenté', 'Le goéland le plus commun sur nos côtes. Omnivore, il joue un rôle de "nettoyeur" du littoral. Attention, il peut être chapardeur !', 'https://placehold.co/600x400.png', 'seagull beach', 5, 'national', 'validated'),
    ('card_flore_zostere', 'faune_flore', 'L''Herbier de Zostère', 'Plante à fleurs sous-marine qui forme de véritables prairies. C''est une nurserie pour de nombreux poissons et un rempart contre l''érosion. Zone très importante à protéger.', 'https://placehold.co/600x400.png', 'seagrass underwater', 10, 'regional', 'validated'),
    ('card_faune_gravelot', 'faune_flore', 'Le Gravelot à collier interrompu', 'Petit oiseau qui niche directement sur le haut des plages. Son nid est un simple creux dans le sable, le rendant très vulnérable au piétinement. Ne pas fréquenter le haut de plage en période de nidification (avril-juillet).', 'https://placehold.co/600x400.png', 'plover beach', 10, 'local', 'validated')
ON CONFLICT (id) DO NOTHING;

-- Cards for "Comprendre > Littoral"
INSERT INTO public.content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status)
VALUES
    ('card_littoral_laisse', 'littoral', 'La Laisse de Mer', 'C''est l''accumulation naturelle d''éléments (algues, bois flotté, coquillages) déposés par la marée sur le haut de la plage. C''est un écosystème riche et non un déchet !', 'https://placehold.co/600x400.png', 'seaweed shoreline', 10, 'national', 'validated'),
    ('card_littoral_dune', 'littoral', 'La Dune, rempart vivant', 'Formée par le vent qui transporte le sable, la dune est stabilisée par des plantes comme l''oyat. Elle protège l''intérieur des terres de la mer. Il est crucial de ne pas la piétiner.', 'https://placehold.co/600x400.png', 'sand dune', 10, 'regional', 'validated'),
    ('card_littoral_baille', 'littoral', 'Les Bâches (ou baïnes)', 'Dépressions formées par les vagues sur la plage. À marée montante, elles se remplissent rapidement et créent de forts courants de sortie. Très dangereux pour les baigneurs.', 'https://placehold.co/600x400.png', 'riptide beach', 15, 'local', 'validated')
ON CONFLICT (id) DO NOTHING;

-- Cards for "Observer > Le Vivant"
INSERT INTO public.content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status)
VALUES
    ('card_observer_foudebassan', 'vivant', 'Repérer le Fou de Bassan', 'Grand oiseau marin blanc et noir. Sa technique de pêche est spectaculaire : il plonge en piqué à très haute vitesse dans l''eau pour attraper des poissons.', 'https://placehold.co/600x400.png', 'gannet diving', 15, 'regional', 'validated'),
    ('card_observer_phoque', 'vivant', 'Observer un phoque', 'Le phoque veau-marin est commun dans la région. Si vous en voyez un sur un banc de sable, gardez une distance d''au moins 300 mètres pour ne pas le déranger.', 'https://placehold.co/600x400.png', 'seal sandbar', 10, 'local', 'validated')
ON CONFLICT (id) DO NOTHING;

-- Cards for "Protéger > Les Déchets"
INSERT INTO public.content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status)
VALUES
    ('card_proteger_microplastiques', 'dechets', 'Le fléau des microplastiques', 'Fragments de plastique de moins de 5mm. Ils proviennent de la dégradation de plus gros déchets et sont ingérés par la faune marine, contaminant toute la chaîne alimentaire.', 'https://placehold.co/600x400.png', 'microplastic sand', 15, 'national', 'validated'),
    ('card_proteger_filet', 'dechets', 'Filet de pêche fantôme', 'Filet de pêche perdu ou abandonné en mer. Il continue de piéger et de tuer des animaux marins pendant des années. Si vous en trouvez un, signalez-le aux autorités.', 'https://placehold.co/600x400.png', 'ghost net', 10, 'regional', 'validated')
ON CONFLICT (id) DO NOTHING;

-- Personal card example
INSERT INTO public.content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status)
VALUES
    ('card_perso_spotsecret', 'vivant', 'Mon spot à crevettes', 'A marée basse, près du gros rocher en forme de champignon. Utiliser une épuisette et regarder sous les algues. Parfait pour une animation rapide avec les plus jeunes.', 'https://placehold.co/600x400.png', 'rockpool shrimp', 20, 'personal', 'draft')
ON CONFLICT (id) DO NOTHING;
