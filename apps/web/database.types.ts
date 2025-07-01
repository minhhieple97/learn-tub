export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_model_pricing: {
        Row: {
          created_at: string | null;
          id: string;
          input_cost_per_million_tokens: number;
          is_active: boolean | null;
          model_name: string;
          output_cost_per_million_tokens: number;
          provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          input_cost_per_million_tokens: number;
          is_active?: boolean | null;
          model_name: string;
          output_cost_per_million_tokens: number;
          provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          input_cost_per_million_tokens?: number;
          is_active?: boolean | null;
          model_name?: string;
          output_cost_per_million_tokens?: number;
          provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_model_pricing_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "ai_providers";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_providers: {
        Row: {
          created_at: string | null;
          display_name: string;
          id: string;
          is_active: boolean | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          display_name: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          display_name?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      ai_usage_logs: {
        Row: {
          ai_model_id: string | null;
          command: string;
          cost_usd: number | null;
          created_at: string | null;
          error_message: string | null;
          id: string;
          input_tokens: number | null;
          output_tokens: number | null;
          request_duration_ms: number | null;
          request_payload: Json | null;
          response_payload: Json | null;
          status: string;
          tokens_used: number | null;
          user_id: string;
        };
        Insert: {
          ai_model_id?: string | null;
          command: string;
          cost_usd?: number | null;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          request_duration_ms?: number | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status: string;
          tokens_used?: number | null;
          user_id: string;
        };
        Update: {
          ai_model_id?: string | null;
          command?: string;
          cost_usd?: number | null;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          request_duration_ms?: number | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status?: string;
          tokens_used?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_ai_model_id_fkey";
            columns: ["ai_model_id"];
            isOneToOne: false;
            referencedRelation: "ai_model_pricing";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_usage_logs_ai_model_id_fkey";
            columns: ["ai_model_id"];
            isOneToOne: false;
            referencedRelation: "ai_model_pricing_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          thumbnail_url: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_buckets: {
        Row: {
          created_at: string | null;
          credits_remaining: number | null;
          credits_total: number;
          credits_used: number;
          description: string | null;
          expires_at: string | null;
          id: string;
          metadata: Json | null;
          source_type: Database["public"]["Enums"]["credit_source_type_enum"];
          status: Database["public"]["Enums"]["credit_bucket_status_enum"];
          updated_at: string | null;
          user_id: string;
          user_subscription_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits_remaining?: number | null;
          credits_total: number;
          credits_used?: number;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          metadata?: Json | null;
          source_type: Database["public"]["Enums"]["credit_source_type_enum"];
          status?: Database["public"]["Enums"]["credit_bucket_status_enum"];
          updated_at?: string | null;
          user_id: string;
          user_subscription_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits_remaining?: number | null;
          credits_total?: number;
          credits_used?: number;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          metadata?: Json | null;
          source_type?: Database["public"]["Enums"]["credit_source_type_enum"];
          status?: Database["public"]["Enums"]["credit_bucket_status_enum"];
          updated_at?: string | null;
          user_id?: string;
          user_subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "credit_buckets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_user_subscription";
            columns: ["user_subscription_id"];
            isOneToOne: false;
            referencedRelation: "user_subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          related_action_id: string | null;
          stripe_payment_intent_id: string | null;
          type: Database["public"]["Enums"]["transaction_type_enum"];
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          related_action_id?: string | null;
          stripe_payment_intent_id?: string | null;
          type: Database["public"]["Enums"]["transaction_type_enum"];
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          related_action_id?: string | null;
          stripe_payment_intent_id?: string | null;
          type?: Database["public"]["Enums"]["transaction_type_enum"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_sessions: {
        Row: {
          completed: boolean | null;
          created_at: string | null;
          duration_seconds: number | null;
          id: string;
          progress_seconds: number | null;
          updated_at: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          progress_seconds?: number | null;
          updated_at?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          progress_seconds?: number | null;
          updated_at?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_sessions_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      media_files: {
        Row: {
          created_at: string | null;
          file_name: string;
          file_size: number;
          file_type: Database["public"]["Enums"]["file_type_enum"];
          height: number | null;
          id: string;
          metadata: Json | null;
          mime_type: string;
          public_url: string | null;
          storage_path: string;
          updated_at: string | null;
          user_id: string;
          width: number | null;
        };
        Insert: {
          created_at?: string | null;
          file_name: string;
          file_size: number;
          file_type: Database["public"]["Enums"]["file_type_enum"];
          height?: number | null;
          id?: string;
          metadata?: Json | null;
          mime_type: string;
          public_url?: string | null;
          storage_path: string;
          updated_at?: string | null;
          user_id: string;
          width?: number | null;
        };
        Update: {
          created_at?: string | null;
          file_name?: string;
          file_size?: number;
          file_type?: Database["public"]["Enums"]["file_type_enum"];
          height?: number | null;
          id?: string;
          metadata?: Json | null;
          mime_type?: string;
          public_url?: string | null;
          storage_path?: string;
          updated_at?: string | null;
          user_id?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_files_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      note_interactions: {
        Row: {
          ai_model_id: string | null;
          created_at: string | null;
          id: string;
          input_data: Json | null;
          note_id: string | null;
          output_data: Json | null;
          user_id: string;
        };
        Insert: {
          ai_model_id?: string | null;
          created_at?: string | null;
          id?: string;
          input_data?: Json | null;
          note_id?: string | null;
          output_data?: Json | null;
          user_id: string;
        };
        Update: {
          ai_model_id?: string | null;
          created_at?: string | null;
          id?: string;
          input_data?: Json | null;
          note_id?: string | null;
          output_data?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_interactions_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_interactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "note_interactions_ai_model_id_fkey";
            columns: ["ai_model_id"];
            isOneToOne: false;
            referencedRelation: "ai_model_pricing";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "note_interactions_ai_model_id_fkey";
            columns: ["ai_model_id"];
            isOneToOne: false;
            referencedRelation: "ai_model_pricing_view";
            referencedColumns: ["id"];
          },
        ];
      };
      note_media: {
        Row: {
          created_at: string | null;
          id: string;
          media_file_id: string;
          note_id: string;
          position_in_content: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          media_file_id: string;
          note_id: string;
          position_in_content?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          media_file_id?: string;
          note_id?: string;
          position_in_content?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "note_media_media_file_id_fkey";
            columns: ["media_file_id"];
            isOneToOne: false;
            referencedRelation: "media_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "note_media_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "notes";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          content: Json;
          content_version: number | null;
          created_at: string | null;
          id: string;
          rich_content: Json | null;
          tags: string[] | null;
          timestamp_seconds: number | null;
          updated_at: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          content: Json;
          content_version?: number | null;
          created_at?: string | null;
          id?: string;
          rich_content?: Json | null;
          tags?: string[] | null;
          timestamp_seconds?: number | null;
          updated_at?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          content?: Json;
          content_version?: number | null;
          created_at?: string | null;
          id?: string;
          rich_content?: Json | null;
          tags?: string[] | null;
          timestamp_seconds?: number | null;
          updated_at?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_history: {
        Row: {
          amount_cents: number;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          payment_type: string;
          status: string;
          stripe_invoice_id: string | null;
          stripe_payment_intent_id: string | null;
          user_id: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          payment_type: string;
          status: string;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          payment_type?: string;
          status?: string;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          learning_preferences: Json | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          learning_preferences?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          learning_preferences?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          answers: Json;
          completed_at: string | null;
          correct_answers: number;
          created_at: string | null;
          feedback: Json | null;
          id: string;
          quiz_session_id: string;
          score: number;
          time_taken_seconds: number | null;
          total_questions: number;
          user_id: string;
        };
        Insert: {
          answers: Json;
          completed_at?: string | null;
          correct_answers?: number;
          created_at?: string | null;
          feedback?: Json | null;
          id?: string;
          quiz_session_id: string;
          score?: number;
          time_taken_seconds?: number | null;
          total_questions: number;
          user_id: string;
        };
        Update: {
          answers?: Json;
          completed_at?: string | null;
          correct_answers?: number;
          created_at?: string | null;
          feedback?: Json | null;
          id?: string;
          quiz_session_id?: string;
          score?: number;
          time_taken_seconds?: number | null;
          total_questions?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_session_id_fkey";
            columns: ["quiz_session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_sessions: {
        Row: {
          ai_model_id: string | null;
          created_at: string | null;
          difficulty: string;
          id: string;
          question_count: number;
          questions: Json;
          title: string;
          topics: string[] | null;
          updated_at: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          ai_model_id?: string | null;
          created_at?: string | null;
          difficulty: string;
          id?: string;
          question_count?: number;
          questions: Json;
          title: string;
          topics?: string[] | null;
          updated_at?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          ai_model_id?: string | null;
          created_at?: string | null;
          difficulty?: string;
          id?: string;
          question_count?: number;
          questions?: Json;
          title?: string;
          topics?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_ai_model_id_fkey";
            columns: ["ai_model_id"];
            isOneToOne: false;
            referencedRelation: "ai_model_pricing";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_sessions_ai_model_id_fkey";
            columns: ["ai_model_id"];
            isOneToOne: false;
            referencedRelation: "ai_model_pricing_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_sessions_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_plans: {
        Row: {
          created_at: string | null;
          credits_per_month: number;
          features: Json | null;
          id: string;
          is_active: boolean | null;
          name: string;
          price_cents: number;
          stripe_price_id: string;
          stripe_product_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits_per_month: number;
          features?: Json | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          price_cents: number;
          stripe_price_id: string;
          stripe_product_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits_per_month?: number;
          features?: Json | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          price_cents?: number;
          stripe_price_id?: string;
          stripe_product_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      video_screenshots: {
        Row: {
          created_at: string | null;
          id: string;
          media_file_id: string;
          timestamp_seconds: number;
          user_id: string;
          video_id: string;
          video_thumbnail_url: string | null;
          video_title: string | null;
          youtube_timestamp: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          media_file_id: string;
          timestamp_seconds: number;
          user_id: string;
          video_id: string;
          video_thumbnail_url?: string | null;
          video_title?: string | null;
          youtube_timestamp?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          media_file_id?: string;
          timestamp_seconds?: number;
          user_id?: string;
          video_id?: string;
          video_thumbnail_url?: string | null;
          video_title?: string | null;
          youtube_timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_screenshots_media_file_id_fkey";
            columns: ["media_file_id"];
            isOneToOne: false;
            referencedRelation: "media_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_screenshots_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_screenshots_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      videos: {
        Row: {
          channel_name: string | null;
          course_id: string | null;
          created_at: string | null;
          description: string | null;
          duration: number | null;
          id: string;
          published_at: string | null;
          thumbnail_url: string | null;
          title: string;
          tutorial: string | null;
          updated_at: string | null;
          user_id: string;
          youtube_id: string;
        };
        Insert: {
          channel_name?: string | null;
          course_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          id?: string;
          published_at?: string | null;
          thumbnail_url?: string | null;
          title: string;
          tutorial?: string | null;
          updated_at?: string | null;
          user_id: string;
          youtube_id: string;
        };
        Update: {
          channel_name?: string | null;
          course_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          id?: string;
          published_at?: string | null;
          thumbnail_url?: string | null;
          title?: string;
          tutorial?: string | null;
          updated_at?: string | null;
          user_id?: string;
          youtube_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "videos_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          attempts: number;
          created_at: string | null;
          error_message: string | null;
          event_type: Database["public"]["Enums"]["webhook_event_type"];
          id: string;
          max_attempts: number;
          processed_at: string | null;
          raw_payload: Json;
          status: Database["public"]["Enums"]["webhook_event_status"];
          stripe_event_id: string;
          updated_at: string | null;
        };
        Insert: {
          attempts?: number;
          created_at?: string | null;
          error_message?: string | null;
          event_type: Database["public"]["Enums"]["webhook_event_type"];
          id?: string;
          max_attempts?: number;
          processed_at?: string | null;
          raw_payload: Json;
          status?: Database["public"]["Enums"]["webhook_event_status"];
          stripe_event_id: string;
          updated_at?: string | null;
        };
        Update: {
          attempts?: number;
          created_at?: string | null;
          error_message?: string | null;
          event_type?: Database["public"]["Enums"]["webhook_event_type"];
          id?: string;
          max_attempts?: number;
          processed_at?: string | null;
          raw_payload?: Json;
          status?: Database["public"]["Enums"]["webhook_event_status"];
          stripe_event_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      webhook_jobs: {
        Row: {
          created_at: string | null;
          delay_ms: number;
          id: string;
          priority: number;
          queue_name: string;
          updated_at: string | null;
          webhook_event_id: string;
        };
        Insert: {
          created_at?: string | null;
          delay_ms?: number;
          id?: string;
          priority?: number;
          queue_name?: string;
          updated_at?: string | null;
          webhook_event_id: string;
        };
        Update: {
          created_at?: string | null;
          delay_ms?: number;
          id?: string;
          priority?: number;
          queue_name?: string;
          updated_at?: string | null;
          webhook_event_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webhook_jobs_webhook_event_id_fkey";
            columns: ["webhook_event_id"];
            isOneToOne: false;
            referencedRelation: "webhook_events";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      ai_model_pricing_view: {
        Row: {
          created_at: string | null;
          id: string | null;
          input_cost_per_million_tokens: number | null;
          is_active: boolean | null;
          model_name: string | null;
          output_cost_per_million_tokens: number | null;
          provider_display_name: string | null;
          provider_name: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      content_type_enum: "plain_text" | "rich_text";
      credit_bucket_status_enum:
        | "active"
        | "exhausted"
        | "expired"
        | "cancelled";
      credit_source_type_enum:
        | "subscription"
        | "purchase"
        | "bonus"
        | "gift"
        | "refund"
        | "admin_adjustment"
        | "referral_bonus"
        | "promotional"
        | "compensation"
        | "cancelled_plan";
      file_type_enum: "image" | "video_screenshot";
      subscription_status: "active" | "exhausted" | "expired" | "cancelled";
      transaction_type_enum:
        | "monthly_reset"
        | "purchase"
        | "evaluate_note"
        | "generate_quizz_questions"
        | "evaluate_quizz_answers"
        | "refund"
        | "bonus"
        | "subscription_grant"
        | "admin_adjustment"
        | "switch_plan";
      webhook_event_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "retrying"
        | "cancelled";
      webhook_event_type:
        | "checkout.session.completed"
        | "customer.subscription.created"
        | "customer.subscription.updated"
        | "customer.subscription.deleted"
        | "invoice.payment_succeeded"
        | "invoice.payment_failed"
        | "invoice.paid";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      content_type_enum: ["plain_text", "rich_text"],
      credit_bucket_status_enum: [
        "active",
        "exhausted",
        "expired",
        "cancelled",
      ],
      credit_source_type_enum: [
        "subscription",
        "purchase",
        "bonus",
        "gift",
        "refund",
        "admin_adjustment",
        "referral_bonus",
        "promotional",
        "compensation",
        "cancelled_plan",
      ],
      file_type_enum: ["image", "video_screenshot"],
      subscription_status: ["active", "exhausted", "expired", "cancelled"],
      transaction_type_enum: [
        "monthly_reset",
        "purchase",
        "evaluate_note",
        "generate_quizz_questions",
        "evaluate_quizz_answers",
        "refund",
        "bonus",
        "subscription_grant",
        "admin_adjustment",
        "switch_plan",
      ],
      webhook_event_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "retrying",
        "cancelled",
      ],
      webhook_event_type: [
        "checkout.session.completed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_succeeded",
        "invoice.payment_failed",
        "invoice.paid",
      ],
    },
  },
} as const;
