import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          email_verified: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          email_verified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          email_verified?: boolean;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          work_duration: number;
          break_duration: number;
          long_break_duration: number;
          sessions_until_long_break: number;
          auto_start_breaks: boolean;
          auto_start_work: boolean;
          sound_enabled: boolean;
          notification_enabled: boolean;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          work_duration?: number;
          break_duration?: number;
          long_break_duration?: number;
          sessions_until_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_work?: boolean;
          sound_enabled?: boolean;
          notification_enabled?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          work_duration?: number;
          break_duration?: number;
          long_break_duration?: number;
          sessions_until_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_work?: boolean;
          sound_enabled?: boolean;
          notification_enabled?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          user_id: string;
          type: 'work' | 'break' | 'long_break';
          planned_duration: number;
          actual_duration: number | null;
          started_at: string;
          completed_at: string | null;
          was_successful: boolean;
          notes: string | null;
          mood_rating: number | null;
          energy_level: number | null;
          distractions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'work' | 'break' | 'long_break';
          planned_duration: number;
          actual_duration?: number | null;
          started_at?: string;
          completed_at?: string | null;
          was_successful?: boolean;
          notes?: string | null;
          mood_rating?: number | null;
          energy_level?: number | null;
          distractions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'work' | 'break' | 'long_break';
          planned_duration?: number;
          actual_duration?: number | null;
          started_at?: string;
          completed_at?: string | null;
          was_successful?: boolean;
          notes?: string | null;
          mood_rating?: number | null;
          energy_level?: number | null;
          distractions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_sessions: number;
          current_streak: number;
          longest_streak: number;
          total_focus_time: number;
          focus_points: number;
          last_session_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_sessions?: number;
          current_streak?: number;
          longest_streak?: number;
          total_focus_time?: number;
          focus_points?: number;
          last_session_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_sessions?: number;
          current_streak?: number;
          longest_streak?: number;
          total_focus_time?: number;
          focus_points?: number;
          last_session_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          requirement_type?: string;
          requirement_value?: number;
          points?: number;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      wellness_insights: {
        Row: {
          id: string;
          user_id: string;
          insight_type: string;
          title: string;
          description: string;
          recommendation: string | null;
          data: any;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight_type: string;
          title: string;
          description: string;
          recommendation?: string | null;
          data?: any;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          insight_type?: string;
          title?: string;
          description?: string;
          recommendation?: string | null;
          data?: any;
          created_at?: string;
          is_read?: boolean;
        };
      };
    };
    Views: {
      user_session_stats: {
        Row: {
          user_id: string;
          email: string;
          total_sessions: number;
          work_sessions: number;
          break_sessions: number;
          total_work_minutes: number;
          avg_work_session_length: number | null;
          last_session_at: string | null;
        };
      };
      user_achievement_details: {
        Row: {
          user_id: string;
          title: string;
          description: string;
          icon: string;
          points: number;
          unlocked_at: string;
        };
      };
    };
  };
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Real-time subscription helper
export const subscribeToTable = <T extends keyof Database['public']['Tables']>(
  table: T,
  filter: { userId: string },
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: `user_id=eq.${filter.userId}`,
      },
      callback
    )
    .subscribe();
};

export default supabase;
