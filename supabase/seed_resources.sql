-- Seed data for Resource-type content cards

-- Ressources pour Comprendre (Niveau 1)
INSERT INTO content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status, type) VALUES
('res-c1-maree', 'comp1', 'Ressource: Annuaire des Marées', 'L''annuaire des marées est un outil essentiel. Il est publié par le SHOM (Service hydrographique et océanographique de la Marine) et donne les prédictions officielles. On peut le trouver en version papier ou numérique (application, site web).', 'https://placehold.co/600x400.png', 'map tide', 0, 'national', 'validated', 'Ressource');

-- Ressources pour Observer (Niveau 2-3)
INSERT INTO content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status, type) VALUES
('res-o2-amers', 'obs1', 'Ressource: Utiliser les Amers', 'Un amer est un point de repère fixe et identifiable (clocher, phare, château d''eau). En visant deux amers, on peut connaître sa position (alignement) ou une limite de sécurité à ne pas franchir. C''est la base de la navigation côtière.', 'https://placehold.co/600x400.png', 'lighthouse landscape', 0, 'regional', 'validated', 'Ressource');

-- Ressources pour Protéger (Niveau 2-3)
INSERT INTO content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status, type) VALUES
('res-p2-sciences', 'prot3', 'Ressource: Sciences Participatives', 'Des plateformes comme Plages Vivantes Pro ou BioLit permettent à chacun de signaler des observations (espèces, pollutions). Ces données, validées par des scientifiques, aident à mieux comprendre et protéger le littoral. C''est une façon concrète de devenir un acteur de la préservation.', 'https://placehold.co/600x400.png', 'phone beach', 0, 'regional', 'validated', 'Ressource');

-- Ressource pour Protéger (Niveau 4-5)
INSERT INTO content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status, type) VALUES
('res-p3-consommation', 'prot2', 'Ressource: Consommation Durable', 'Protéger l''océan commence à la maison. Choisir des produits avec moins d''emballage plastique, utiliser des crèmes solaires non-toxiques pour les coraux, et soutenir la pêche durable sont des gestes qui ont un impact direct.', 'https://placehold.co/600x400.png', 'plastic bottle', 0, 'local', 'validated', 'Ressource');

-- Ressource Personnelle (Local / Personnel)
INSERT INTO content_cards (id, option_id, title, description, image, "data-ai-hint", duration, level, status, type) VALUES
('res-perso-courants', 'obs1', 'Ressource: Courants du spot de la Baie', 'Note perso : Ne pas oublier que le courant de jusant porte fortement vers le rocher de la Tortue. Toujours commencer la séance en partant face au courant pour un retour facilité, surtout avec les débutants.', 'https://placehold.co/600x400.png', 'sea waves', 0, 'personal', 'draft', 'Ressource');
