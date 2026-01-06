import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const createSessionSchema = z.object({
  type: z.enum(['work', 'break', 'long_break']),
  planned_duration: z.number().min(1).max(180), // 1 minute to 3 hours
  notes: z.string().optional(),
  mood_rating: z.number().min(1).max(5).optional(),
  energy_level: z.number().min(1).max(5).optional(),
  distractions_count: z.number().min(0).optional(),
});

const updateSessionSchema = z.object({
  actual_duration: z.number().min(0).optional(),
  completed_at: z.string().datetime().optional(),
  was_successful: z.boolean().optional(),
  notes: z.string().optional(),
  mood_rating: z.number().min(1).max(5).optional(),
  energy_level: z.number().min(1).max(5).optional(),
  distractions_count: z.number().min(0).optional(),
});

const querySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  type: z.enum(['work', 'break', 'long_break']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

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

  if (!['GET', 'POST'].includes(req.method)) {
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

    if (req.method === 'GET') {
      // Parse query parameters
      const { limit = 20, offset = 0, type, start_date, end_date } = querySchema.parse(req.query);

      // Build query
      let query = supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      // Apply filters
      if (type) {
        query = query.eq('type', type);
      }
      if (start_date) {
        query = query.gte('started_at', start_date);
      }
      if (end_date) {
        query = query.lte('started_at', end_date);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: sessions, error, count } = await query;

      if (error) {
        console.error('Sessions fetch error:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch sessions',
          code: 'SESSIONS_FETCH_ERROR'
        });
      }

      return res.status(200).json({
        sessions: sessions || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          has_more: (offset + limit) < (count || 0),
        },
      });
    }

    if (req.method === 'POST') {
      // Validate request body
      const sessionData = createSessionSchema.parse(req.body);

      // Create session
      const { data: session, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: user.id,
          ...sessionData,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Session creation error:', error);
        return res.status(500).json({ 
          error: 'Failed to create session',
          code: 'SESSION_CREATION_ERROR'
        });
      }

      // Update user stats asynchronously
      try {
        await updateUserStatsAfterSession(user.id, sessionData.type, sessionData.planned_duration);
      } catch (statsError) {
        console.error('Stats update error:', statsError);
        // Don't fail the request, just log the error
      }

      return res.status(201).json({
        session,
        message: 'Session created successfully',
      });
    }

  } catch (error) {
    console.error('Sessions handler error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

// Helper function to update user stats after session creation
async function updateUserStatsAfterSession(userId: string, sessionType: string, duration: number) {
  if (sessionType !== 'work') return; // Only update stats for work sessions

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Get current stats
  const { data: currentStats, error: fetchError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  // Calculate new stats
  const lastSessionDate = currentStats?.last_session_date;
  let newStreak = currentStats?.current_streak || 0;

  if (lastSessionDate) {
    const lastDate = new Date(lastSessionDate);
    const todayDate = new Date(today);
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (lastDate.toDateString() === todayDate.toDateString()) {
      // Same day, no streak change
      newStreak = currentStats.current_streak;
    } else if (lastDate.toDateString() === yesterdayDate.toDateString()) {
      // Yesterday, increment streak
      newStreak = currentStats.current_streak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
  } else {
    // First session
    newStreak = 1;
  }

  const newStats = {
    total_sessions: (currentStats?.total_sessions || 0) + 1,
    current_streak: newStreak,
    longest_streak: Math.max(currentStats?.longest_streak || 0, newStreak),
    total_focus_time: (currentStats?.total_focus_time || 0) + duration,
    focus_points: (currentStats?.focus_points || 0) + 10, // 10 points per session
    last_session_date: today,
  };

  // Update or insert stats
  const { error: updateError } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      ...newStats,
    });

  if (updateError) {
    throw updateError;
  }

  // Check for new achievements
  await checkAndUnlockAchievements(userId, newStats);
}

// Helper function to check and unlock achievements
async function checkAndUnlockAchievements(userId: string, stats: any) {
  // Get all achievements
  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*');

  if (achievementsError) {
    console.error('Achievements fetch error:', achievementsError);
    return;
  }

  // Get user's current achievements
  const { data: userAchievements, error: userAchievementsError } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (userAchievementsError) {
    console.error('User achievements fetch error:', userAchievementsError);
    return;
  }

  const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
  const newUnlocks: string[] = [];

  for (const achievement of allAchievements || []) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.requirement_type) {
      case 'sessions':
        shouldUnlock = stats.total_sessions >= achievement.requirement_value;
        break;
      case 'streak':
        shouldUnlock = stats.current_streak >= achievement.requirement_value;
        break;
      case 'focus_time':
        shouldUnlock = stats.total_focus_time >= achievement.requirement_value;
        break;
    }

    if (shouldUnlock) {
      const { error: unlockError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

      if (!unlockError) {
        newUnlocks.push(achievement.title);
      }
    }
  }

  if (newUnlocks.length > 0) {
    console.log(`User ${userId} unlocked achievements: ${newUnlocks.join(', ')}`);
  }
}
