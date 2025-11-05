
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pedagogical_content: {
        Row: {
          id: number
          niveau: number
          dimension: string
          question: string
          objectif: string
          tip: string | null
          tags_theme: string[]
          tags_filtre: string[]
          icon_tag: string | null
        }
        Insert: {
          id?: number
          niveau: number
          dimension: string
          question: string
          objectif: string
          tip?: string | null
          tags_theme: string[]
          tags_filtre: string[]
          icon_tag?: string | null
        }
        Update: {
          id?: number
          niveau?: number
          dimension?: string
          question?: string
          objectif?: string
          tip?: string | null
          tags_theme?: string[]
          tags_filtre?: string[]
          icon_tag?: string | null
        }
        Relationships: []
      }
      content_cards: {
        Row: {
          id: string
          option_id: string
          title: string
          description: string
          image: string | null
          "data-ai-hint": string | null
          duration: number
          priority: "essential" | "complementary" | "personal"
          status: "validated" | "draft"
          type: string | null
        }
        Insert: {
          id: string
          option_id: string
          title: string
          description: string
          image?: string | null
          "data-ai-hint"?: string | null
          duration: number
          priority: "essential" | "complementary" | "personal"
          status?: "validated" | "draft"
          type?: string | null
        }
        Update: {
          id?: string
          option_id?: string
          title?: string
          description?: string
          image?: string | null
          "data-ai-hint"?: string | null
          duration?: number
          priority?: "essential" | "complementary" | "personal"
          status?: "validated" | "draft"
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_cards_option_id_fkey"
            columns: ["option_id"]
            referencedRelation: "options"
            referencedColumns: ["id"]
          }
        ]
      }
      content_card_tags: {
        Row: {
          card_id: string
          option_id: string
        }
        Insert: {
          card_id: string
          option_id: string
        }
        Update: {
          card_id?: string
          option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_card_tags_card_id_fkey"
            columns: ["card_id"]
            referencedRelation: "content_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_card_tags_option_id_fkey"
            columns: ["option_id"]
            referencedRelation: "options"
            referencedColumns: ["id"]
          }
        ]
      }
      etages: {
        Row: {
          id: string
          title: string
          icon: string
          color: string
          order: number
        }
        Insert: {
          id: string
          title: string
          icon: string
          color: string
          order: number
        }
        Update: {
          id?: string
          title?: string
          icon?: string
          color?: string
          order?: number
        }
        Relationships: []
      }
      exploits: {
        Row: {
          id: string
          title: string
          description: string
          points: number
          icon: string
          tags_theme: string[]
        }
        Insert: {
          id: string
          title: string
          description: string
          points: number
          icon: string
          tags_theme: string[]
        }
        Update: {
          id?: string
          title?: string
          description?: string
          points?: number
          icon?: string
          tags_theme?: string[]
        }
        Relationships: []
      }
      games: {
        Row: {
          id: number
          created_at: string
          title: string
          theme: string
          game_data: Json
          stage_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          theme: string
          game_data: Json
          stage_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          theme?: string
          game_data?: Json
          stage_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      game_cards: {
        Row: {
          id: number
          created_at: string
          type: "triage" | "mots" | "dilemme" | "quizz"
          data: Json
        }
        Insert: {
          id?: number
          created_at?: string
          type: "triage" | "mots" | "dilemme" | "quizz"
          data: Json
        }
        Update: {
          id?: number
          created_at?: string
          type?: "triage" | "mots" | "dilemme" | "quizz"
          data?: Json
        }
        Relationships: []
      }
      observations: {
        Row: {
          id: number
          created_at: string
          title: string
          description: string
          category: "Faune" | "Flore" | "Pollution" | "Phénomène inhabituel"
          observation_date: string
          latitude: number
          longitude: number
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          description: string
          category: "Faune" | "Flore" | "Pollution" | "Phénomène inhabituel"
          observation_date: string
          latitude: number
          longitude: number
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          description?: string
          category?: "Faune" | "Flore" | "Pollution" | "Phénomène inhabituel"
          observation_date?: string
          latitude?: number
          longitude?: number
        }
        Relationships: []
      }
      options: {
        Row: {
          id: string
          etage_id: string
          label: string
          duration: number | null
          group_size: string | null
          activities: string[] | null
          safety: string[] | null
          tip: string
          materials: string[] | null
          local_content: string | null
          order: number
        }
        Insert: {
          id: string
          etage_id: string
          label: string
          duration?: number | null
          group_size?: string | null
          activities?: string[] | null
          safety?: string[] | null
          tip: string
          materials?: string[] | null
          local_content?: string | null
          order: number
        }
        Update: {
          id?: string
          etage_id?: string
          label?: string
          duration?: number | null
          group_size?: string | null
          activities?: string[] | null
          safety?: string[] | null
          tip?: string
          materials?: string[] | null
          local_content?: string | null
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "options_etage_id_fkey"
            columns: ["etage_id"]
            referencedRelation: "etages"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_attempts: {
        Row: {
          id: number
          attempted_at: string
          user_id: string
          theme: string
          score: number
          total_questions: number
        }
        Insert: {
          id?: number
          attempted_at?: string
          user_id: string
          theme: string
          score: number
          total_questions: number
        }
        Update: {
          id?: number
          attempted_at?: string
          user_id?: string
          theme?: string
          score?: number
          total_questions?: number
        }
        Relationships: []
      }
      sorties: {
        Row: {
          id: number
          created_at: string
          stage_id: number
          date: string
          title: string
          themes: string[]
          duration: number
          summary: string
          content: string
          selected_notions: Json | null
          selected_content: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          stage_id: number
          date: string
          title: string
          themes: string[]
          duration: number
          summary: string
          content: string
          selected_notions?: Json | null
          selected_content?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          stage_id?: number
          date?: string
          title?: string
          themes?: string[]
          duration?: number
          summary?: string
          content?: string
          selected_notions?: Json | null
          selected_content?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sorties_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      stages: {
        Row: {
          id: number
          created_at: string
          title: string
          type: string
          participants: number
          start_date: string
          end_date: string
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          type: string
          participants: number
          start_date: string
          end_date: string
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          type?: string
          participants?: number
          start_date?: string
          end_date?: string
        }
        Relationships: []
      }
      stage_objectives_completion: {
        Row: {
          id: number
          stage_id: number
          objective_id: string
          completed_at: string
        }
        Insert: {
          id?: number
          stage_id: number
          objective_id: string
          completed_at?: string
        }
        Update: {
          id?: number
          stage_id?: number
          objective_id?: string
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_objectives_completion_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      },
      stage_game_history: {
        Row: {
          id: number
          created_at: string
          stage_id: number
          game_id: number
          score: number
          total: number
          percentage: number
          results: Json
        }
        Insert: {
          id?: number
          created_at?: string
          stage_id: number
          game_id: number
          score: number
          total: number
          percentage: number
          results: Json
        }
        Update: {
          id?: number
          created_at?: string
          stage_id?: number
          game_id?: number
          score?: number
          total?: number
          percentage?: number
          results?: Json
        }
        Relationships: [
          {
            foreignKeyName: "stage_game_history_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_game_history_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      },
      stages_exploits: {
        Row: {
          id: number
          created_at: string
          stage_id: number
          exploit_id: string
          status: "en_cours" | "complete"
          completed_at: string | null
          preuves_url: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          stage_id: number
          exploit_id: string
          status?: "en_cours" | "complete"
          completed_at?: string | null
          preuves_url?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          stage_id?: number
          exploit_id?: string
          status?: "en_cours" | "complete"
          completed_at?: string | null
          preuves_url?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "stages_exploits_exploit_id_fkey"
            columns: ["exploit_id"]
            referencedRelation: "exploits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stages_exploits_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      structures: {
        Row: {
          id: string
          name: string
          latitude: number
          longitude: number
        }
        Insert: {
          id: string
          name: string
          latitude: number
          longitude: number
        }
        Update: {
          id?: string
          name?: string
          latitude?: number
          longitude?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_priority: "essential" | "complementary" | "personal"
      card_status: "validated" | "draft"
      game_card_type: "triage" | "mots" | "dilemme" | "quizz"
      observation_category:
        | "Faune"
        | "Flore"
        | "Pollution"
        | "Phénomène inhabituel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
