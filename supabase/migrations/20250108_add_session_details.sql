-- Migration: Add Session Details (Objectives, Success Criteria, Materials)
-- Date: 2025-01-08
-- Description: Adds columns to sessions table for objectives, success criteria, and required materials

-- Add new columns to sessions table
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS success_criteria TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS required_materials TEXT[] DEFAULT '{}';

-- Add comment to explain the new columns
COMMENT ON COLUMN public.sessions.objectives IS 'Array of learning objectives for the session (e.g., ["Découvrir les éléments du catamaran", "Comprendre les règles de sécurité"])';
COMMENT ON COLUMN public.sessions.success_criteria IS 'Array of success criteria (e.g., ["Embarquer en sécurité", "Nommer les parties du bateau"])';
COMMENT ON COLUMN public.sessions.required_materials IS 'Array of required materials (e.g., ["5 gilets de sauvetage", "Catamaran inspecté"])';

