
-- Vider les tables dans le bon ordre pour éviter les conflits de clés étrangères
DELETE FROM content_card_tags;
DELETE FROM content_cards;
DELETE FROM options;
DELETE FROM etages;

-- Remplir la table `etages`
INSERT INTO etages (id, title, icon, color, "order") VALUES
('niveau', 'Niveau Technique', 'Target', 'blue-500', 1),
('comprendre', 'Comprendre le Milieu', 'BookOpen', 'yellow-500', 2),
('observer', 'Observer la Nature', 'Eye', 'purple-500', 3),
('proteger', 'Protéger l''Environnement', 'Shield', 'green-500', 4);

-- Remplir la table `options` (les thèmes/tags)
INSERT INTO options (id, etage_id, label, tip, duration, group_size, safety, "order") VALUES
-- Niveaux
('niv_1', 'niveau', 'Niveau 1 - Découverte', 'Apprentissage des bases dans un environnement sûr.', 120, '8 participants', ARRAY['Vérifier la météo', 'Gilet de sauvetage obligatoire'], 1),
('niv_2', 'niveau', 'Niveau 2 - Progression', 'Développement de l''autonomie et des manœuvres.', 150, '6 participants', ARRAY['Anticiper les changements de vent', 'Zone de navigation définie'], 2),
('niv_3', 'niveau', 'Niveau 3 - Maîtrise', 'Navigation en autonomie, gestion des conditions variées.', 180, '4 participants', ARRAY['Connaître les règles de priorité', 'Savoir effectuer un virement de bord rapide'], 3),
-- Comprendre
('comp_meteo', 'comprendre', 'Météo & Vents', 'Comprendre les bases de la météo marine et l''influence du vent.', null, null, null, 1),
('comp_marees', 'comprendre', 'Marées & Courants', 'Appréhender les phénomènes de marées et leur impact sur la navigation.', null, null, null, 2),
('comp_materiel', 'comprendre', 'Matériel & Sécurité', 'Connaître son équipement et les règles de sécurité essentielles.', null, null, null, 3),
-- Observer
('obs_faune_flore', 'observer', 'Faune & Flore Marine', 'Identifier les espèces locales et comprendre leur mode de vie.', null, null, null, 1),
('obs_estran', 'observer', 'Vie sur l''Estran', 'Découvrir l''écosystème particulier de la zone de marée.', null, null, null, 2),
('obs_pollution', 'observer', 'Signes de Pollution', 'Savoir reconnaître les différents types de pollution et leurs sources.', null, null, null, 3),
-- Protéger
('prot_dechets', 'proteger', 'Gestion des Déchets', 'Adopter les bons gestes pour ne laisser aucune trace.', null, null, null, 1),
('prot_zones', 'proteger', 'Zones de Protection', 'Connaître et respecter les zones de quiétude et les réglementations.', null, null, null, 2),
('prot_ancrage', 'proteger', 'Ancrage Écologique', 'Apprendre les techniques d''ancrage qui préservent les fonds marins.', null, null, null, 3);

-- Remplir la table `content_cards`
-- J'inclus une valeur pour `option_id` pour la rétro-compatibilité, même si la vérité est dans la table de jointure.
INSERT INTO content_cards (id, option_id, title, description, duration, level, status, type) VALUES
('card_secu_01', 'comp_materiel', 'Vérification du matériel', 'Avant chaque départ, effectuer une vérification complète de l''état du bateau, des voiles, et de l''équipement de sécurité.', 10, 'national', 'validated', 'Théorie'),
('card_secu_02', 'comp_materiel', 'Les nœuds marins essentiels', 'Apprentissage et révision de 3 nœuds indispensables : le nœud de huit, le nœud de taquet et le nœud de chaise.', 15, 'national', 'validated', 'Animation'),
('card_meteo_01', 'comp_meteo', 'Lire les nuages', 'Apprendre à identifier les principaux types de nuages (cumulus, cirrus, stratus) et ce qu''ils indiquent sur la météo à venir.', 20, 'regional', 'validated', 'Observation'),
('card_maree_01', 'comp_marees', 'Comprendre le coefficient de marée', 'Explication simple de ce qu''est un coefficient de marée et de son impact sur le courant et la hauteur d''eau.', 10, 'regional', 'validated', 'Théorie'),
('card_faune_01', 'obs_faune_flore', 'Qui vit ici ?', 'Jeu d''observation : à l''aide de fiches illustrées, identifier les oiseaux et les mammifères marins rencontrés pendant la sortie.', 25, 'local', 'validated', 'Jeu'),
('card_flore_01', 'obs_estran', 'Chasse au trésor sur l''estran', 'À marée basse, identifier les différentes algues (vertes, brunes, rouges) et les coquillages présents sur la plage.', 30, 'local', 'validated', 'Jeu'),
('card_dechets_01', 'prot_dechets', 'Le défi "Zéro Déchet"', 'Le groupe s''engage à ne produire aucun déchet non recyclable pendant la sortie et à ramasser ceux rencontrés.', 5, 'national', 'validated', 'Discussion'),
('card_eco_01', 'prot_ancrage', 'Ancrer sans abîmer', 'Démonstration des bonnes pratiques pour jeter l''ancre en minimisant l''impact sur les herbiers et les fonds marins.', 15, 'regional', 'validated', 'Animation'),
('card_eco_02', 'prot_zones', 'Cartographie des zones sensibles', 'Sur une carte locale, les participants identifient et colorient les zones de protection (réserves, zones de quiétude, etc.).', 20, 'local', 'validated', 'Animation');


-- Remplir la table de jointure `content_card_tags`
INSERT INTO content_card_tags (card_id, option_id) VALUES
-- Carte Vérification du matériel
('card_secu_01', 'comp_materiel'),
('card_secu_01', 'niv_1'),
-- Carte Nœuds marins
('card_secu_02', 'comp_materiel'),
('card_secu_02', 'niv_2'),
-- Carte Lire les nuages
('card_meteo_01', 'comp_meteo'),
('card_meteo_01', 'niv_2'),
('card_meteo_01', 'obs_faune_flore'),
-- Carte Coefficient de marée
('card_maree_01', 'comp_marees'),
('card_maree_01', 'niv_1'),
-- Carte Qui vit ici ?
('card_faune_01', 'obs_faune_flore'),
('card_faune_01', 'niv_1'),
('card_faune_01', 'prot_zones'),
-- Carte Chasse au trésor sur l'estran
('card_flore_01', 'obs_estran'),
('card_flore_01', 'niv_1'),
-- Carte Défi Zéro Déchet
('card_dechets_01', 'prot_dechets'),
('card_dechets_01', 'niv_1'),
('card_dechets_01', 'niv_2'),
('card_dechets_01', 'niv_3'),
-- Carte Ancrer sans abîmer
('card_eco_01', 'prot_ancrage'),
('card_eco_01', 'niv_3'),
-- Carte Cartographie des zones sensibles
('card_eco_02', 'prot_zones'),
('card_eco_02', 'niv_2');
