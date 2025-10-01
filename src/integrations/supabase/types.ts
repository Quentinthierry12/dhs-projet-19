export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_history: {
        Row: {
          access_granted: boolean
          access_reason: string | null
          access_type: string
          accessed_by: string | null
          id: string
          identity_id: string
          ip_address: unknown | null
          timestamp: string | null
          user_agent: string | null
          zone_id: string | null
        }
        Insert: {
          access_granted: boolean
          access_reason?: string | null
          access_type: string
          accessed_by?: string | null
          id?: string
          identity_id: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
          zone_id?: string | null
        }
        Update: {
          access_granted?: boolean
          access_reason?: string | null
          access_type?: string
          accessed_by?: string | null
          id?: string
          identity_id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_history_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "rp_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_history_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "security_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      access_logs: {
        Row: {
          action: string
          document_id: string
          id: string
          ip_address: unknown | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          document_id: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          document_id?: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      account_requests: {
        Row: {
          branch: string | null
          country: string | null
          created_at: string | null
          discord_handle: string | null
          full_name: string
          grade: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          request_reason: string | null
          requested_role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          country?: string | null
          created_at?: string | null
          discord_handle?: string | null
          full_name: string
          grade?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_reason?: string | null
          requested_role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          country?: string | null
          created_at?: string | null
          discord_handle?: string | null
          full_name?: string
          grade?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_reason?: string | null
          requested_role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_configurations: {
        Row: {
          alert_on_edit: boolean
          alert_on_view: boolean
          created_at: string
          created_by: string
          document_id: string
          id: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          alert_on_edit?: boolean
          alert_on_view?: boolean
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          alert_on_edit?: boolean
          alert_on_view?: boolean
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_configurations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_configurations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      con_candidate_answers: {
        Row: {
          answer: string
          candidate_id: string
          corrector_comment: string | null
          id: string
          score: number | null
          submitted_at: string
          test_id: string
        }
        Insert: {
          answer: string
          candidate_id: string
          corrector_comment?: string | null
          id?: string
          score?: number | null
          submitted_at?: string
          test_id: string
        }
        Update: {
          answer?: string
          candidate_id?: string
          corrector_comment?: string | null
          id?: string
          score?: number | null
          submitted_at?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_candidate_answers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "con_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_candidate_answers_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "con_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      con_candidate_results: {
        Row: {
          candidate_id: string
          contest_id: string
          created_at: string
          final_score: number
          id: string
          status: string
        }
        Insert: {
          candidate_id: string
          contest_id: string
          created_at?: string
          final_score?: number
          id?: string
          status?: string
        }
        Update: {
          candidate_id?: string
          contest_id?: string
          created_at?: string
          final_score?: number
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_candidate_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "con_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_candidate_results_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "con_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      con_candidates: {
        Row: {
          contest_id: string
          created_at: string
          discord_pseudo: string | null
          id: string
          motivation_letter: string | null
          password: string | null
          rp_first_name: string
          rp_name: string
          type: string
          username: string | null
        }
        Insert: {
          contest_id: string
          created_at?: string
          discord_pseudo?: string | null
          id?: string
          motivation_letter?: string | null
          password?: string | null
          rp_first_name: string
          rp_name: string
          type: string
          username?: string | null
        }
        Update: {
          contest_id?: string
          created_at?: string
          discord_pseudo?: string | null
          id?: string
          motivation_letter?: string | null
          password?: string | null
          rp_first_name?: string
          rp_name?: string
          type?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_candidates_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "con_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      con_contests: {
        Row: {
          classification: string | null
          created_at: string
          deadline: string
          id: string
          name: string
          number_of_tests: number
          organism: string
          status: string
          total_score: number
          type: string
          updated_at: string
        }
        Insert: {
          classification?: string | null
          created_at?: string
          deadline: string
          id?: string
          name: string
          number_of_tests?: number
          organism: string
          status?: string
          total_score?: number
          type: string
          updated_at?: string
        }
        Update: {
          classification?: string | null
          created_at?: string
          deadline?: string
          id?: string
          name?: string
          number_of_tests?: number
          organism?: string
          status?: string
          total_score?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      con_tests: {
        Row: {
          attachments: string[] | null
          contest_id: string
          created_at: string
          id: string
          order_number: number
          score: number
          statement: string
          type: string
        }
        Insert: {
          attachments?: string[] | null
          contest_id: string
          created_at?: string
          id?: string
          order_number: number
          score?: number
          statement: string
          type: string
        }
        Update: {
          attachments?: string[] | null
          contest_id?: string
          created_at?: string
          id?: string
          order_number?: number
          score?: number
          statement?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_tests_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "con_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      concour_quentin_admins: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      concour_quentin_candidate_answers: {
        Row: {
          answer: string
          attachments: string[] | null
          candidate_id: string
          corrector_comment: string | null
          id: string
          score: number | null
          submitted_at: string
          test_id: string
        }
        Insert: {
          answer: string
          attachments?: string[] | null
          candidate_id: string
          corrector_comment?: string | null
          id?: string
          score?: number | null
          submitted_at?: string
          test_id: string
        }
        Update: {
          answer?: string
          attachments?: string[] | null
          candidate_id?: string
          corrector_comment?: string | null
          id?: string
          score?: number | null
          submitted_at?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concour_quentin_candidate_answers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "concour_quentin_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concour_quentin_candidate_answers_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "concour_quentin_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      concour_quentin_candidate_results: {
        Row: {
          candidate_id: string
          comments: string | null
          completed_at: string | null
          contest_id: string
          created_at: string
          final_score: number
          id: string
          results_pdf_url: string | null
          status: Database["public"]["Enums"]["result_status"]
        }
        Insert: {
          candidate_id: string
          comments?: string | null
          completed_at?: string | null
          contest_id: string
          created_at?: string
          final_score?: number
          id?: string
          results_pdf_url?: string | null
          status?: Database["public"]["Enums"]["result_status"]
        }
        Update: {
          candidate_id?: string
          comments?: string | null
          completed_at?: string | null
          contest_id?: string
          created_at?: string
          final_score?: number
          id?: string
          results_pdf_url?: string | null
          status?: Database["public"]["Enums"]["result_status"]
        }
        Relationships: [
          {
            foreignKeyName: "concour_quentin_candidate_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "concour_quentin_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concour_quentin_candidate_results_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "concour_quentin_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      concour_quentin_candidates: {
        Row: {
          contest_id: string
          convocation_pdf_url: string | null
          created_at: string
          discord_pseudo: string | null
          email: string | null
          id: string
          motivation_letter: string | null
          password: string | null
          rp_first_name: string
          rp_name: string
          type: Database["public"]["Enums"]["candidate_type"]
          username: string | null
        }
        Insert: {
          contest_id: string
          convocation_pdf_url?: string | null
          created_at?: string
          discord_pseudo?: string | null
          email?: string | null
          id?: string
          motivation_letter?: string | null
          password?: string | null
          rp_first_name: string
          rp_name: string
          type: Database["public"]["Enums"]["candidate_type"]
          username?: string | null
        }
        Update: {
          contest_id?: string
          convocation_pdf_url?: string | null
          created_at?: string
          discord_pseudo?: string | null
          email?: string | null
          id?: string
          motivation_letter?: string | null
          password?: string | null
          rp_first_name?: string
          rp_name?: string
          type?: Database["public"]["Enums"]["candidate_type"]
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concour_quentin_candidates_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "concour_quentin_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      concour_quentin_contests: {
        Row: {
          classification: string | null
          created_at: string
          deadline: string
          description: string | null
          id: string
          is_recurring: boolean | null
          logo_url: string | null
          name: string
          number_of_tests: number
          organism: string
          recurring_interval: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contest_status"]
          total_score: number
          type: Database["public"]["Enums"]["contest_type"]
          updated_at: string
        }
        Insert: {
          classification?: string | null
          created_at?: string
          deadline: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          logo_url?: string | null
          name: string
          number_of_tests?: number
          organism: string
          recurring_interval?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contest_status"]
          total_score?: number
          type?: Database["public"]["Enums"]["contest_type"]
          updated_at?: string
        }
        Update: {
          classification?: string | null
          created_at?: string
          deadline?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          logo_url?: string | null
          name?: string
          number_of_tests?: number
          organism?: string
          recurring_interval?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contest_status"]
          total_score?: number
          type?: Database["public"]["Enums"]["contest_type"]
          updated_at?: string
        }
        Relationships: []
      }
      concour_quentin_site_settings: {
        Row: {
          deputy_director_name: string | null
          deputy_director_photo_url: string | null
          director_name: string | null
          director_photo_url: string | null
          id: string
          presentation_text: string | null
          specialties: Json | null
          updated_at: string | null
        }
        Insert: {
          deputy_director_name?: string | null
          deputy_director_photo_url?: string | null
          director_name?: string | null
          director_photo_url?: string | null
          id?: string
          presentation_text?: string | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Update: {
          deputy_director_name?: string | null
          deputy_director_photo_url?: string | null
          director_name?: string | null
          director_photo_url?: string | null
          id?: string
          presentation_text?: string | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      concour_quentin_tests: {
        Row: {
          answer_options: Json | null
          attachments: string[] | null
          auto_correct: boolean | null
          contest_id: string
          correct_answer: string | null
          created_at: string
          id: string
          order_number: number
          score: number
          statement: string
          time_limit: number | null
          type: Database["public"]["Enums"]["test_type"]
        }
        Insert: {
          answer_options?: Json | null
          attachments?: string[] | null
          auto_correct?: boolean | null
          contest_id: string
          correct_answer?: string | null
          created_at?: string
          id?: string
          order_number: number
          score?: number
          statement: string
          time_limit?: number | null
          type: Database["public"]["Enums"]["test_type"]
        }
        Update: {
          answer_options?: Json | null
          attachments?: string[] | null
          auto_correct?: boolean | null
          contest_id?: string
          correct_answer?: string | null
          created_at?: string
          id?: string
          order_number?: number
          score?: number
          statement?: string
          time_limit?: number | null
          type?: Database["public"]["Enums"]["test_type"]
        }
        Relationships: [
          {
            foreignKeyName: "concour_quentin_tests_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "concour_quentin_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_activity_logs: {
        Row: {
          author_email: string
          author_id: string | null
          created_at: string
          details: Json | null
          id: string
          role: string
          type: string
        }
        Insert: {
          author_email: string
          author_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          role: string
          type: string
        }
        Update: {
          author_email?: string
          author_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          role?: string
          type?: string
        }
        Relationships: []
      }
      dhs_agencies: {
        Row: {
          acronym: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          acronym: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          acronym?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      dhs_agent_logins: {
        Row: {
          agent_id: string
          badge_number: string
          created_at: string
          id: string
          is_active: boolean
          last_login: string | null
          password: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          badge_number: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          badge_number?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_agent_logins_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dhs_police_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_agent_specialties: {
        Row: {
          agent_id: string
          assigned_by: string
          assigned_date: string
          created_at: string
          id: string
          is_active: boolean
          specialty_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          assigned_by: string
          assigned_date?: string
          created_at?: string
          id?: string
          is_active?: boolean
          specialty_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          assigned_by?: string
          assigned_date?: string
          created_at?: string
          id?: string
          is_active?: boolean
          specialty_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_specialties_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dhs_police_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_specialties_specialty"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "dhs_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_agent_trainings: {
        Row: {
          agent_id: string
          assigned_by: string | null
          assigned_date: string | null
          completed_modules: string[] | null
          completion_date: string
          created_at: string
          id: string
          score: number | null
          status: string | null
          training_id: string
          updated_at: string
          validated_by: string
        }
        Insert: {
          agent_id: string
          assigned_by?: string | null
          assigned_date?: string | null
          completed_modules?: string[] | null
          completion_date: string
          created_at?: string
          id?: string
          score?: number | null
          status?: string | null
          training_id: string
          updated_at?: string
          validated_by: string
        }
        Update: {
          agent_id?: string
          assigned_by?: string | null
          assigned_date?: string | null
          completed_modules?: string[] | null
          completion_date?: string
          created_at?: string
          id?: string
          score?: number | null
          status?: string | null
          training_id?: string
          updated_at?: string
          validated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_agent_trainings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dhs_police_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_agent_trainings_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "dhs_specialized_trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_trainings_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dhs_police_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_trainings_training"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "dhs_specialized_trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_application_forms: {
        Row: {
          created_at: string
          created_by: string
          description: string
          fields: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          fields: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          fields?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      dhs_applications: {
        Row: {
          applicant_name: string
          created_at: string
          form_id: string
          form_name: string
          id: string
          max_possible_score: number | null
          responses: Json
          reviewed_by: string | null
          reviewer_comment: string | null
          server_id: string
          status: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          applicant_name: string
          created_at?: string
          form_id: string
          form_name: string
          id?: string
          max_possible_score?: number | null
          responses: Json
          reviewed_by?: string | null
          reviewer_comment?: string | null
          server_id: string
          status?: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          created_at?: string
          form_id?: string
          form_name?: string
          id?: string
          max_possible_score?: number | null
          responses?: Json
          reviewed_by?: string | null
          reviewer_comment?: string | null
          server_id?: string
          status?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_applications_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dhs_application_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_candidates: {
        Row: {
          certification_date: string | null
          certified_by: string | null
          class_ids: string[] | null
          created_at: string
          id: string
          is_certified: boolean | null
          name: string
          server_id: string
          updated_at: string
        }
        Insert: {
          certification_date?: string | null
          certified_by?: string | null
          class_ids?: string[] | null
          created_at?: string
          id?: string
          is_certified?: boolean | null
          name: string
          server_id: string
          updated_at?: string
        }
        Update: {
          certification_date?: string | null
          certified_by?: string | null
          class_ids?: string[] | null
          created_at?: string
          id?: string
          is_certified?: boolean | null
          name?: string
          server_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dhs_classes: {
        Row: {
          candidate_ids: string[] | null
          created_at: string
          id: string
          instructor_name: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          candidate_ids?: string[] | null
          created_at?: string
          id?: string
          instructor_name: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          candidate_ids?: string[] | null
          created_at?: string
          id?: string
          instructor_name?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dhs_competition_invitations: {
        Row: {
          candidate_email: string | null
          candidate_name: string
          competition_id: string
          created_at: string
          id: string
          login_identifier: string
          login_password: string
          status: string
          used_at: string | null
        }
        Insert: {
          candidate_email?: string | null
          candidate_name: string
          competition_id: string
          created_at?: string
          id?: string
          login_identifier: string
          login_password: string
          status?: string
          used_at?: string | null
        }
        Update: {
          candidate_email?: string | null
          candidate_name?: string
          competition_id?: string
          created_at?: string
          id?: string
          login_identifier?: string
          login_password?: string
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dhs_competition_invitations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "dhs_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_competition_participations: {
        Row: {
          answers: Json
          comment: string | null
          competition_id: string
          id: string
          max_possible_score: number
          participant_name: string
          participant_rio: string | null
          status: string | null
          submitted_at: string
          total_score: number
        }
        Insert: {
          answers: Json
          comment?: string | null
          competition_id: string
          id?: string
          max_possible_score?: number
          participant_name: string
          participant_rio?: string | null
          status?: string | null
          submitted_at?: string
          total_score?: number
        }
        Update: {
          answers?: Json
          comment?: string | null
          competition_id?: string
          id?: string
          max_possible_score?: number
          participant_name?: string
          participant_rio?: string | null
          status?: string | null
          submitted_at?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "dhs_competition_participations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "dhs_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_competition_questions: {
        Row: {
          competition_id: string
          correct_answer: string | null
          created_at: string
          id: string
          max_points: number | null
          options: Json | null
          order_number: number
          question: string
          type: string
        }
        Insert: {
          competition_id: string
          correct_answer?: string | null
          created_at?: string
          id?: string
          max_points?: number | null
          options?: Json | null
          order_number: number
          question: string
          type: string
        }
        Update: {
          competition_id?: string
          correct_answer?: string | null
          created_at?: string
          id?: string
          max_points?: number | null
          options?: Json | null
          order_number?: number
          question?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_competition_questions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "dhs_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_competitions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_entry_test: boolean | null
          max_score: number
          specialty: string | null
          start_date: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_entry_test?: boolean | null
          max_score?: number
          specialty?: string | null
          start_date?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_entry_test?: boolean | null
          max_score?: number
          specialty?: string | null
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      dhs_disciplinary_records: {
        Row: {
          agent_id: string
          created_at: string
          date: string
          id: string
          issued_at: string | null
          issued_by: string
          reason: string
          type: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          date: string
          id?: string
          issued_at?: string | null
          issued_by: string
          reason: string
          type: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          date?: string
          id?: string
          issued_at?: string | null
          issued_by?: string
          reason?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_disciplinary_records_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dhs_police_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_disciplinary_templates: {
        Row: {
          agency_id: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_disciplinary_templates_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_grades: {
        Row: {
          agency_id: string
          authority_level: number | null
          created_at: string
          id: string
          name: string
          order_number: number
          updated_at: string
        }
        Insert: {
          agency_id: string
          authority_level?: number | null
          created_at?: string
          id?: string
          name: string
          order_number: number
          updated_at?: string
        }
        Update: {
          agency_id?: string
          authority_level?: number | null
          created_at?: string
          id?: string
          name?: string
          order_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_grades_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_internal_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_group_message: boolean | null
          mailing_list_id: string | null
          read_by: string[] | null
          recipient_emails: string[]
          sender_email: string
          sender_id: string | null
          sent_at: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_group_message?: boolean | null
          mailing_list_id?: string | null
          read_by?: string[] | null
          recipient_emails: string[]
          sender_email: string
          sender_id?: string | null
          sent_at?: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_group_message?: boolean | null
          mailing_list_id?: string | null
          read_by?: string[] | null
          recipient_emails?: string[]
          sender_email?: string
          sender_id?: string | null
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_internal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "dhs_police_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_mailing_lists: {
        Row: {
          agency_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          member_emails: string[]
          name: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_emails?: string[]
          name: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_emails?: string[]
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_mailing_lists_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          instructor_in_charge: string | null
          name: string
          order_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          instructor_in_charge?: string | null
          name: string
          order_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          instructor_in_charge?: string | null
          name?: string
          order_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      dhs_police_agents: {
        Row: {
          address: string | null
          agency_id: string
          badge_number: string
          candidate_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          grade_id: string
          id: string
          name: string
          phone_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          agency_id: string
          badge_number: string
          candidate_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          grade_id: string
          id?: string
          name: string
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          agency_id?: string
          badge_number?: string
          candidate_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          grade_id?: string
          id?: string
          name?: string
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_police_agents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_police_agents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "dhs_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_police_agents_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "dhs_grades"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_quiz_attempts: {
        Row: {
          answers: Json
          candidate_id: string | null
          completed_at: string | null
          created_at: string
          external_login: string | null
          id: string
          is_completed: boolean
          max_possible_score: number
          participant_name: string
          percentage: number
          quiz_id: string
          score: number
          started_at: string
        }
        Insert: {
          answers?: Json
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          external_login?: string | null
          id?: string
          is_completed?: boolean
          max_possible_score: number
          participant_name: string
          percentage?: number
          quiz_id: string
          score?: number
          started_at?: string
        }
        Update: {
          answers?: Json
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          external_login?: string | null
          id?: string
          is_completed?: boolean
          max_possible_score?: number
          participant_name?: string
          percentage?: number
          quiz_id?: string
          score?: number
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_quiz_attempts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "dhs_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "dhs_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_quiz_participants: {
        Row: {
          candidate_id: string | null
          created_at: string
          external_login: string | null
          external_password: string | null
          id: string
          is_completed: boolean
          quiz_id: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string
          external_login?: string | null
          external_password?: string | null
          id?: string
          is_completed?: boolean
          quiz_id: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string
          external_login?: string | null
          external_password?: string | null
          id?: string
          is_completed?: boolean
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_quiz_participants_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "dhs_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_quiz_participants_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "dhs_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json | null
          order_number: number
          points: number
          question: string
          quiz_id: string
          type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: Json | null
          order_number: number
          points?: number
          question: string
          quiz_id: string
          type?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json | null
          order_number?: number
          points?: number
          question?: string
          quiz_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "dhs_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_quizzes: {
        Row: {
          allow_retakes: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          max_score: number
          module_id: string | null
          sub_module_id: string | null
          time_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_retakes?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_score?: number
          module_id?: string | null
          sub_module_id?: string | null
          time_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_retakes?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_score?: number
          module_id?: string | null
          sub_module_id?: string | null
          time_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dhs_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_quizzes_sub_module_id_fkey"
            columns: ["sub_module_id"]
            isOneToOne: false
            referencedRelation: "dhs_sub_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_resources: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      dhs_specialized_trainings: {
        Row: {
          agency_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_specialized_trainings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_specialties: {
        Row: {
          agency_id: string
          competition_ids: string[] | null
          created_at: string
          description: string | null
          id: string
          module_ids: string[] | null
          name: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          competition_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          module_ids?: string[] | null
          name: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          competition_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          module_ids?: string[] | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_specialties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_sub_module_appreciations: {
        Row: {
          appreciation: string | null
          candidate_id: string
          created_at: string | null
          id: string
          instructor_id: string | null
          sub_module_id: string
          updated_at: string | null
        }
        Insert: {
          appreciation?: string | null
          candidate_id: string
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          sub_module_id: string
          updated_at?: string | null
        }
        Update: {
          appreciation?: string | null
          candidate_id?: string
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          sub_module_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dhs_sub_module_scores: {
        Row: {
          candidate_id: string
          comment: string | null
          id: string
          instructor_id: string | null
          max_score: number
          score: number
          sub_module_id: string
          timestamp: string
        }
        Insert: {
          candidate_id: string
          comment?: string | null
          id?: string
          instructor_id?: string | null
          max_score?: number
          score?: number
          sub_module_id: string
          timestamp?: string
        }
        Update: {
          candidate_id?: string
          comment?: string | null
          id?: string
          instructor_id?: string | null
          max_score?: number
          score?: number
          sub_module_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_sub_module_scores_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "dhs_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dhs_sub_module_scores_sub_module_id_fkey"
            columns: ["sub_module_id"]
            isOneToOne: false
            referencedRelation: "dhs_sub_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_sub_modules: {
        Row: {
          appreciation: string | null
          created_at: string
          id: string
          is_optional: boolean | null
          max_score: number
          module_id: string
          name: string
          order_number: number
          updated_at: string
        }
        Insert: {
          appreciation?: string | null
          created_at?: string
          id?: string
          is_optional?: boolean | null
          max_score?: number
          module_id: string
          name: string
          order_number: number
          updated_at?: string
        }
        Update: {
          appreciation?: string | null
          created_at?: string
          id?: string
          is_optional?: boolean | null
          max_score?: number
          module_id?: string
          name?: string
          order_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_sub_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dhs_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_training_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_score: number | null
          order_number: number
          title: string
          training_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          order_number: number
          title: string
          training_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          order_number?: number
          title?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_training_modules_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "dhs_specialized_trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_uniforms: {
        Row: {
          agency_id: string | null
          badges_logos: string | null
          bags_parachutes: number | null
          body_armor_accessories: number | null
          created_at: string
          created_by: string
          description: string | null
          hands_upper_body: number | null
          hats_helmets: number | null
          id: string
          image_url: string | null
          legs_pants: number | null
          mask_facial_hair: number | null
          name: string
          neck_scarfs: number | null
          shirt_accessories: number | null
          shirt_overlay_jackets: number | null
          shoes: number | null
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          badges_logos?: string | null
          bags_parachutes?: number | null
          body_armor_accessories?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          hands_upper_body?: number | null
          hats_helmets?: number | null
          id?: string
          image_url?: string | null
          legs_pants?: number | null
          mask_facial_hair?: number | null
          name: string
          neck_scarfs?: number | null
          shirt_accessories?: number | null
          shirt_overlay_jackets?: number | null
          shoes?: number | null
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          badges_logos?: string | null
          bags_parachutes?: number | null
          body_armor_accessories?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          hands_upper_body?: number | null
          hats_helmets?: number | null
          id?: string
          image_url?: string | null
          legs_pants?: number | null
          mask_facial_hair?: number | null
          name?: string
          neck_scarfs?: number | null
          shirt_accessories?: number | null
          shirt_overlay_jackets?: number | null
          shoes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhs_uniforms_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dhs_users: {
        Row: {
          active: boolean | null
          created_at: string
          email: string
          id: string
          identifiant: string
          last_login: string | null
          nom: string
          password: string
          prenom: string
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email: string
          id?: string
          identifiant: string
          last_login?: string | null
          nom: string
          password?: string
          prenom: string
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string
          id?: string
          identifiant?: string
          last_login?: string | null
          nom?: string
          password?: string
          prenom?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      dhs_webhook_config: {
        Row: {
          class_creation_url: string | null
          config: Json | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          class_creation_url?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          class_creation_url?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          access_code: string | null
          classification_level: number
          content: string
          created_at: string | null
          created_by: string
          description: string | null
          doc_alias: string
          id: string
          min_grade_required: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          access_code?: string | null
          classification_level: number
          content: string
          created_at?: string | null
          created_by: string
          description?: string | null
          doc_alias: string
          id?: string
          min_grade_required: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string | null
          classification_level?: number
          content?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          doc_alias?: string
          id?: string
          min_grade_required?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fib_competition_candidates: {
        Row: {
          competition_id: string | null
          convocation_pdf_url: string | null
          created_at: string | null
          id: string
          identifier: string
          module_scores: Json | null
          name: string
          status: string | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          competition_id?: string | null
          convocation_pdf_url?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          module_scores?: Json | null
          name: string
          status?: string | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          competition_id?: string | null
          convocation_pdf_url?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          module_scores?: Json | null
          name?: string
          status?: string | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fib_competition_candidates_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "fib_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      fib_competitions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          modules: Json | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          modules?: Json | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          modules?: Json | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fib_most_wanted: {
        Row: {
          created_at: string | null
          crimes: string
          danger_level: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          priority_level: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crimes: string
          danger_level?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          priority_level?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crimes?: string
          danger_level?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          priority_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fib_site_settings: {
        Row: {
          deputy_director_name: string | null
          deputy_director_photo_url: string | null
          director_name: string | null
          director_photo_url: string | null
          id: string
          presentation_text: string | null
          updated_at: string | null
        }
        Insert: {
          deputy_director_name?: string | null
          deputy_director_photo_url?: string | null
          director_name?: string | null
          director_photo_url?: string | null
          id?: string
          presentation_text?: string | null
          updated_at?: string | null
        }
        Update: {
          deputy_director_name?: string | null
          deputy_director_photo_url?: string | null
          director_name?: string | null
          director_photo_url?: string | null
          id?: string
          presentation_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fib_specialties: {
        Row: {
          chief_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_displayed: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          chief_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_displayed?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          chief_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_displayed?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_specialty_chief"
            columns: ["chief_id"]
            isOneToOne: false
            referencedRelation: "fib_users"
            referencedColumns: ["id"]
          },
        ]
      }
      fib_users: {
        Row: {
          created_at: string | null
          discord_pseudo: string | null
          full_name: string
          id: string
          is_active: boolean | null
          password: string
          rank: number | null
          role: string
          specialty_id: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          discord_pseudo?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          password: string
          rank?: number | null
          role?: string
          specialty_id?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          discord_pseudo?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          password?: string
          rank?: number | null
          role?: string
          specialty_id?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_specialty"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "fib_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_badges: {
        Row: {
          badge_number: string
          download_count: number | null
          generated_at: string | null
          generated_by: string
          id: string
          identity_id: string
          last_downloaded: string | null
          qr_code_data: string
        }
        Insert: {
          badge_number: string
          download_count?: number | null
          generated_at?: string | null
          generated_by: string
          id?: string
          identity_id: string
          last_downloaded?: string | null
          qr_code_data: string
        }
        Update: {
          badge_number?: string
          download_count?: number | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          identity_id?: string
          last_downloaded?: string | null
          qr_code_data?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_badges_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "rp_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      internal_messages: {
        Row: {
          content: string
          created_at: string | null
          from_user_id: string
          id: string
          read_status: boolean | null
          subject: string
          to_user_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          from_user_id: string
          id?: string
          read_status?: boolean | null
          subject: string
          to_user_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          from_user_id?: string
          id?: string
          read_status?: boolean | null
          subject?: string
          to_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          updated_at: string | null
          user_agent: string | null
          username: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          updated_at?: string | null
          user_agent?: string | null
          username: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          updated_at?: string | null
          user_agent?: string | null
          username?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create_accounts: boolean | null
          can_manage_documents: boolean | null
          can_manage_support: boolean | null
          can_manage_users: boolean | null
          can_view_logs: boolean | null
          created_at: string | null
          id: string
          role_name: string
          updated_at: string | null
        }
        Insert: {
          can_create_accounts?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_support?: boolean | null
          can_manage_users?: boolean | null
          can_view_logs?: boolean | null
          created_at?: string | null
          id?: string
          role_name: string
          updated_at?: string | null
        }
        Update: {
          can_create_accounts?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_support?: boolean | null
          can_manage_users?: boolean | null
          can_view_logs?: boolean | null
          created_at?: string | null
          id?: string
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rp_identities: {
        Row: {
          agency_id: string | null
          clearance_level: number | null
          created_at: string | null
          email: string | null
          expiry_date: string | null
          grade_id: string | null
          id: string
          identity_type_id: string
          issue_date: string | null
          issued_by: string
          password: string
          rio: string
          roblox_user_id: number | null
          rp_first_name: string
          rp_last_name: string
          status: string | null
          unique_identifier: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          clearance_level?: number | null
          created_at?: string | null
          email?: string | null
          expiry_date?: string | null
          grade_id?: string | null
          id?: string
          identity_type_id: string
          issue_date?: string | null
          issued_by: string
          password: string
          rio: string
          roblox_user_id?: number | null
          rp_first_name: string
          rp_last_name: string
          status?: string | null
          unique_identifier: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          clearance_level?: number | null
          created_at?: string | null
          email?: string | null
          expiry_date?: string | null
          grade_id?: string | null
          id?: string
          identity_type_id?: string
          issue_date?: string | null
          issued_by?: string
          password?: string
          rio?: string
          roblox_user_id?: number | null
          rp_first_name?: string
          rp_last_name?: string
          status?: string | null
          unique_identifier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rp_identities_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "dhs_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_identities_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "dhs_grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_identities_identity_type_id_fkey"
            columns: ["identity_type_id"]
            isOneToOne: false
            referencedRelation: "identity_types"
            referencedColumns: ["id"]
          },
        ]
      }
      security_zones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          required_clearance_level: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          required_clearance_level?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          required_clearance_level?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      support_action_history: {
        Row: {
          action_details: Json | null
          action_type: string
          id: string
          new_value: string | null
          old_value: string | null
          performed_at: string | null
          performed_by: string | null
          ticket_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string | null
          performed_by?: string | null
          ticket_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string | null
          performed_by?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_action_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_action_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_agents: {
        Row: {
          created_at: string
          discord_id: string
          discord_username: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discord_id: string
          discord_username?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discord_id?: string
          discord_username?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          message_id: string | null
          ticket_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          message_id?: string | null
          ticket_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string | null
          ticket_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_keywords: {
        Row: {
          auto_priority: string | null
          auto_tags: string[] | null
          auto_team: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keyword: string
        }
        Insert: {
          auto_priority?: string | null
          auto_tags?: string[] | null
          auto_team?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
        }
        Update: {
          auto_priority?: string | null
          auto_tags?: string[] | null
          auto_team?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_keywords_auto_team_fkey"
            columns: ["auto_team"]
            isOneToOne: false
            referencedRelation: "support_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      support_merge_requests: {
        Row: {
          created_at: string | null
          id: string
          primary_ticket_id: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string
          requested_by: string | null
          secondary_ticket_ids: string[]
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          primary_ticket_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          requested_by?: string | null
          secondary_ticket_ids: string[]
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          primary_ticket_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          requested_by?: string | null
          secondary_ticket_ids?: string[]
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_merge_requests_primary_ticket_id_fkey"
            columns: ["primary_ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_merge_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_merge_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          edited_at: string | null
          edited_by: string | null
          id: string
          is_from_support: boolean
          is_internal_note: boolean | null
          mentioned_users: string[] | null
          message: string
          message_type: string | null
          template_id: string | null
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          is_from_support?: boolean
          is_internal_note?: boolean | null
          mentioned_users?: string[] | null
          message: string
          message_type?: string | null
          template_id?: string | null
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          is_from_support?: boolean
          is_internal_note?: boolean | null
          mentioned_users?: string[] | null
          message?: string
          message_type?: string | null
          template_id?: string | null
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "support_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_reasons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          order_number: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_number?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_number?: number
        }
        Relationships: []
      }
      support_sla: {
        Row: {
          created_at: string | null
          escalation_time_minutes: number
          id: string
          is_active: boolean | null
          priority: string
          resolution_time_minutes: number
          response_time_minutes: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          escalation_time_minutes: number
          id?: string
          is_active?: boolean | null
          priority: string
          resolution_time_minutes: number
          response_time_minutes: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          escalation_time_minutes?: number
          id?: string
          is_active?: boolean | null
          priority?: string
          resolution_time_minutes?: number
          response_time_minutes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      support_teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          members: string[] | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          members?: string[] | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          members?: string[] | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          actual_resolution_time: number | null
          assigned_team: string | null
          assigned_to: string | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          discord_pseudo: string | null
          escalation_level: number | null
          estimated_resolution_time: number | null
          id: string
          priority: string
          reason: string
          satisfaction_comment: string | null
          satisfaction_rating: number | null
          sla_breached: boolean | null
          sla_deadline: string | null
          status: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_resolution_time?: number | null
          assigned_team?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          discord_pseudo?: string | null
          escalation_level?: number | null
          estimated_resolution_time?: number | null
          id?: string
          priority?: string
          reason: string
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_resolution_time?: number | null
          assigned_team?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          discord_pseudo?: string | null
          escalation_level?: number | null
          estimated_resolution_time?: number | null
          id?: string
          priority?: string
          reason?: string
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_team_fkey"
            columns: ["assigned_team"]
            isOneToOne: false
            referencedRelation: "support_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      surveillance_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveillance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_modifications: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          id: string
          modified_by: string
          target_user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          id?: string
          modified_by: string
          target_user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          id?: string
          modified_by?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_modifications_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_modifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          custom_title: string | null
          discord_id: string | null
          email: string
          grade: number
          id: string
          is_surveilled: boolean
          is_suspended: boolean
          password: string
          role: Database["public"]["Enums"]["user_role"] | null
          surveilled_at: string | null
          surveilled_by: string | null
          suspended_at: string | null
          suspended_by: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          custom_title?: string | null
          discord_id?: string | null
          email: string
          grade: number
          id?: string
          is_surveilled?: boolean
          is_suspended?: boolean
          password?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          surveilled_at?: string | null
          surveilled_by?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          custom_title?: string | null
          discord_id?: string | null
          email?: string
          grade?: number
          id?: string
          is_surveilled?: boolean
          is_suspended?: boolean
          password?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          surveilled_at?: string | null
          surveilled_by?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_login_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      dhs_authenticate_user: {
        Args: { p_identifier: string; p_password: string }
        Returns: {
          active: boolean | null
          created_at: string
          email: string
          id: string
          identifiant: string
          last_login: string | null
          nom: string
          password: string
          prenom: string
          role: string
          updated_at: string
        }[]
      }
      dhs_check_user_active: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      dhs_log_activity: {
        Args: {
          activity_details?: Json
          activity_type: string
          author_email: string
          author_role: string
        }
        Returns: undefined
      }
      dhs_update_user_last_login: {
        Args: { login_time: string; user_id: string }
        Returns: undefined
      }
      generate_agent_email: {
        Args: { agent_name: string }
        Returns: string
      }
      generate_secure_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_identifier: {
        Args: { type_code: string }
        Returns: string
      }
      generate_unique_login_identifier: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      candidate_type: "public" | "invited"
      contest_status: "active" | "closed" | "archived"
      contest_type: "public" | "private"
      result_status: "pending" | "in_progress" | "completed" | "graded"
      test_type:
        | "qcm"
        | "open_question"
        | "scenario"
        | "image_analysis"
        | "audio_video"
      user_role: "admin" | "support" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      candidate_type: ["public", "invited"],
      contest_status: ["active", "closed", "archived"],
      contest_type: ["public", "private"],
      result_status: ["pending", "in_progress", "completed", "graded"],
      test_type: [
        "qcm",
        "open_question",
        "scenario",
        "image_analysis",
        "audio_video",
      ],
      user_role: ["admin", "support", "user"],
    },
  },
} as const
