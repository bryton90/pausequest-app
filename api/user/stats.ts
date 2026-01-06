import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        code: 'MISSING_AUTH'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Get user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Stats fetch error:', statsError);
      return res.status(500).json({ 
        error: 'Failed to fetch user stats',
        code: 'STATS_FETCH_ERROR'
      });
    }

    // If no stats exist, return default stats
    const defaultStats = {
      total_sessions: 0,
      current_streak: 0,
      longest_streak: 0,
      total_focus_time: 0,
      focus_points: 0,
      last_session_date: null,
    };

    const userStats = stats || defaultStats;

    // Get user achievements with details
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievement_details')
      .select('*')
      .eq('user_id', user.id);

    if (achievementsError) {
      console.error('Achievements fetch error:', achievementsError);
      // Don't fail the request, just return empty achievements
    }

    // Get session statistics
    const { data: sessionStats, error: sessionStatsError } = await supabase
      .from('user_session_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (sessionStatsError && sessionStatsError.code !== 'PGRST116') {
      console.error('Session stats fetch error:', sessionStatsError);
      // Don't fail the request, just use default values
    }

    // Calculate additional stats
    const additionalStats = {
      average_session_length: sessionStats?.avg_work_session_length || 0,
      total_break_time: sessionStats?.break_sessions || 0,
      productivity_score: Math.min(100, Math.round((userStats.total_focus_time / 60) * 2)), // Simple productivity score
      weekly_goal_progress: Math.min(100, Math.round((userStats.current_streak / 7) * 100)), // Weekly goal based on streak
    };

    return res.status(200).json({
      stats: userStats,
      achievements: achievements || [],
      session_stats: sessionStats || {
        total_sessions: 0,
        work_sessions: 0,
        break_sessions: 0,
        total_work_minutes: 0,
        avg_work_session_length: 0,
        last_session_at: null,
      },
      additional_stats: additionalStats,
    });

  } catch (error) {
    console.error('Stats handler error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
