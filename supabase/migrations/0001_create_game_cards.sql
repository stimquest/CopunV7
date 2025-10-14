
-- Create the ENUM type for game card types
CREATE TYPE public.game_card_type AS ENUM ('triage', 'mots', 'dilemme', 'quizz');

-- Create the game_cards table
CREATE TABLE public.game_cards (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type public.game_card_type NOT NULL,
  data jsonb NOT NULL,
  CONSTRAINT game_cards_pkey PRIMARY KEY (id)
);
