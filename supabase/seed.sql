-- Clear existing data
TRUNCATE TABLE etages, options, content_cards, content_card_tags RESTART IDENTITY CASCADE;

-- Insert Etages
INSERT INTO etages (id, title, icon, color, "order") VALUES
('niveau', 'Niveau du Groupe', 'Target', 'blue', 1),
('comprendre', 'Comprendre', 'BookOpen', 'yellow', 2),
('observer', 'Observer', 'Eye', 'blue', 3),
('proteger', 'Protéger', 'Shield', 'green', 4);

-- Insert Options for each Etage
INSERT INTO options (id, etage_id, label, tip, "order", duration, group_size, activities, safety, materials, local_content) VALUES
-- Niveau Options
('niv1', 'niveau', 'Niveau 1: Je découvre, je prends conscience', 'Les stagiaires sont initiés aux concepts de base et à l''observation simple.', 1, null, null, '{}', '{}', '{}', null),
('niv2', 'niveau', 'Niveau 2-3: J’agis en conscience, je m’adapte', 'Les stagiaires commencent à faire des liens et à adapter leur comportement.', 2, null, null, '{}', '{}', '{}', null),
('niv3', 'niveau', 'Niveau 4-5: J’agis de façon responsable, j’anticipe', 'Les stagiaires deviennent autonomes, responsables et capables d''anticiper les impacts.', 3, null, null, '{}', '{}', '{}', null),

-- Comprendre Options
('comp1', 'comprendre', 'Le lieu géographique', 'L''espace littoral, la biodiversité, les activités humaines', 1, null, null, '{}', '{}', '{}', null),
('comp2', 'comprendre', 'Biodiversité et saisonnalité', 'Migration, nidification, mue, hivernage, floraison, quelles espèces, à quel moment ?', 2, null, null, '{}', '{}', '{}', null),
('comp3', 'comprendre', 'Les activités humaines', 'Quelle est la diversité des pratiques ? (sport, loisir, tourisme, pêche en mer, pêche à pied, ostréiculture… ) qu''est ce qui rend la cohabitation harmonieuse ?', 3, null, null, '{}', '{}', '{}', null),

-- Observer Options
('obs1', 'observer', 'Lecture du paysage', 'Quels sont les amers possibles. Sont-ils toujours visibles de la même façon ?', 1, null, null, '{}', '{}', '{}', null),
('obs2', 'observer', 'Observation sensorielle', 'Observer ce qui bouge : Le vent, les vagues, le courant, le sable, les nuages. Dans quel sens, avec quelle force ?', 2, null, null, '{}', '{}', '{}', null),
('obs3', 'observer', 'Interaction des éléments climatiques', 'S''habituer à suivre l''évolution des paramètres météo pour choisir son matériel et adapter sa pratique au fil de la séance', 3, null, null, '{}', '{}', '{}', null),

-- Proteger Options
('prot1', 'proteger', 'Interdépendance du vivant', 'La présence de chaque espèce (végétale et animale) s''inscrit dans la notion de chaîne alimentaire où chacun est mangé par le suivant. Cela montre à quel point les êtres vivants dépendent les uns des autres. Mais Cela induit aussi la notion d''équilibre entre les espèces.', 1, null, null, '{}', '{}', '{}', null),
('prot2', 'proteger', 'Impacts de la présence humaine', 'Bonnes pratiques pour ne pas déranger, ni interférer avec le vivant (zones sensibles, espèces protégées). Limiter bruit, lumières, déchets, eau douce….', 2, null, null, '{}', '{}', '{}', null),
('prot3', 'proteger', 'Sciences participatives', 'Partager des informations avec des programmes de suivi, friands de données sur la présence ou non de telle ou telle espèce (coquillage, algue, flore..et éléments polluants)', 3, null, null, '{}', '{}', '{}', null);


-- Insert Content Cards (Questions)
-- Niveau 1: Je découvre, je prends conscience
INSERT INTO content_cards (id, option_id, title, description, level, status, type, duration) VALUES
-- Comprendre - Niveau 1
('c1q1', 'comp1', 'Pourquoi y a t-il plusieurs marées par jour ?', 'Piste : Pensez à l''attraction de la Lune et du Soleil, et à la rotation de la Terre.', 'national', 'validated', 'Question', 0),
('c1q2', 'comp1', 'Comment connaît-on les heures de marée ?', 'Piste : Il existe des outils précis, papier ou numériques, basés sur des calculs astronomiques.', 'national', 'validated', 'Question', 0),
('c1q3', 'comp1', 'Pourquoi l’heure de la marée n’est pas la même partout ?', 'Piste : La forme des côtes et la profondeur des fonds marins influencent la propagation de l''onde de marée.', 'national', 'validated', 'Question', 0),
('c1q4', 'comp1', 'Comment s’appelle la zone qui se couvre et se découvre avec la marée ?', 'On l''appelle l''estran. C''est un milieu de vie très riche et spécifique.', 'national', 'validated', 'Question', 0),
('c1q5', 'comp1', 'Pourquoi le moment entre deux marées s’appelle l’étale', 'Piste : C''est le moment où le courant de marée s''inverse. Le niveau de l''eau semble stagner.', 'national', 'validated', 'Question', 0),
('c1q6', 'comp1', 'Comment s’appelle la bande colorée sur le sable, quand la mer se retire', 'C''est la laisse de mer. Elle est composée d''éléments naturels (algues, coquillages) mais aussi de déchets.', 'national', 'validated', 'Question', 0),
('c1q7', 'comp1', 'Pourquoi y a t’il beaucoup de vie humaine, animale et végétale sur l’espace littoral ', 'Piste : C''est une interface riche en nutriments et en habitats variés, ce qui attire de nombreuses espèces, y compris l''homme.', 'national', 'validated', 'Question', 0),

-- Observer - Niveau 1
('o1q1', 'obs1', 'Comment sait-on que l’eau monte et descend', 'Piste : En choisissant un repère fixe (rocher, piquet) et en observant la position de l''eau par rapport à ce repère à différents moments.', 'national', 'validated', 'Question', 0),
('o1q2', 'obs1', 'Comment sait-on jusqu’où la mer va monter', 'Piste : La laisse de mer la plus haute, les traces d''humidité sur les rochers ou les murs, et les informations de l''annuaire des marées donnent des indices.', 'national', 'validated', 'Question', 0),
('o1q3', 'obs1', 'Comment repère t-on d’où vient le vent ?', 'Piste : En regardant les drapeaux, la fumée, les vagues sur l''eau, ou en sentant le vent sur son visage.', 'national', 'validated', 'Question', 0),
('o1q4', 'obs1', 'Comment repère t-on le sens du courant ?', 'Piste : En observant le déplacement d''un objet flottant, les algues, ou les remous autour d''une bouée ou d''un poteau.', 'national', 'validated', 'Question', 0),
('o1q5', 'obs1', 'Comment décrirais-tu l’état de la plage ?', 'Piste : Est-elle propre, sale, large, étroite, en sable fin, en galets ?', 'national', 'validated', 'Question', 0),
('o1q6', 'obs1', 'Comment décrirais-tu l’état de la mer ?', 'Piste : Est-elle calme, agitée, avec des vagues, plate comme un lac ?', 'national', 'validated', 'Question', 0),
('o1q7', 'obs1', 'Comment décrirais-tu l’état du ciel ?', 'Piste : Est-il bleu, nuageux, gris, menaçant ?', 'national', 'validated', 'Question', 0),
('o1q8', 'obs1', 'Comment peux-t on repérer des traces de présence animale sur ce site ?', 'Piste : Cherchez des empreintes dans le sable, des plumes, des coquilles vides, des cris d''oiseaux.', 'national', 'validated', 'Question', 0),

-- Proteger - Niveau 1
('p1q1', 'prot1', 'Pourquoi, les dunes sont fragiles', 'Piste : Le sable est maintenu par les racines de plantes spéciales. Que se passe-t-il si on arrache ces plantes en marchant dessus ?', 'national', 'validated', 'Question', 0),
('p1q2', 'prot1', 'Pourquoi je peux observer tout en étant discret', 'Piste : Pour ne pas effrayer les animaux et les voir dans leur comportement naturel. Le silence et la distance sont des alliés.', 'national', 'validated', 'Question', 0),
('p1q3', 'prot1', 'Pourquoi un dérangement peut causer du tort au « vivant » ?', 'Piste : Déranger un animal l''oblige à fuir, ce qui lui fait dépenser de l''énergie. Cette énergie ne sera pas utilisée pour se nourrir ou s''occuper de ses petits.', 'national', 'validated', 'Question', 0);
