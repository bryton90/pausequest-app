import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const idSchema = z.object({
  id: z.string().uuid('Invalid session ID format'),
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

  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
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

    // Validate session ID
    const { id: sessionId } = idSchema.parse({ id: req.query.id });

    if (req.method === 'GET') {
      // Get session by ID
      const { data: session, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id) // Ensure user can only access their own sessions
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          });
        }
        console.error('Session fetch error:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch session',
          code: 'SESSION_FETCH_ERROR'
        });
      }

      return res.status(200).json({ session });
    }

    if (req.method === 'PUT') {
      // Validate update data
      const updateData = updateSessionSchema.parse(req.body);

      // First check if session exists and belongs to user
      const { data: existingSession, error: fetchError } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          });
        }
        console.error('Session fetch error:', fetchError);
        return res.status(500).json({ 
          error: 'Failed to fetch session',
          code: 'SESSION_FETCH_ERROR'
        });
      }

      // Update session
      const { data: updatedSession, error: updateError } = await supabase
        .from('pomodoro_sessions')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Session update error:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update session',
          code: 'SESSION_UPDATE_ERROR'
        });
      }

      // If session is being completed, update stats
      if (updateData.completed_at && existingSession.type === 'work') {
        try {
          const actualDuration = updateData.actual_duration || existingSession.planned_duration;
          await updateUserStatsAfterSessionCompletion(user.id, actualDuration, updateData.was_successful || false);
        } catch (statsError) {
          console.error('Stats update error:', statsError);
          // Don't fail the request, just log the error
        }
      }

      return res.status(200).json({
        session: updatedSession,
        message: 'Session updated successfully',
      });
    }

    if (req.method === 'DELETE') {
      // First check if session exists and belongs to user
      const { data: existingSession, error: fetchError } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          });
        }
        console.error('Session fetch error:', fetchError);
        return res.status(500).json({ 
          error: 'Failed to fetch session',
          code: 'SESSION_FETCH_ERROR'
        });
      }

      // Delete session
      const { error: deleteError } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Session delete error:', deleteError);
        return res.status(500).json({ 
          error: 'Failed to delete session',
          code: 'SESSION_DELETE_ERROR'
        });
      }

      // If it was a completed work session, update stats
      if (existingSession.type === 'work' && existingSession.completed_at) {
        try {
          await updateUserStatsAfterSessionDeletion(user.id, existingSession.actual_duration || existingSession.planned_duration);
        } catch (statsError) {
          console.error('Stats update error:', statsError);
          // Don't fail the request, just log the error
        }
      }

      return res.status(200).json({
        message: 'Session deleted successfully',
      });
    }

  } catch (error) {
    console.error('Session handler error:', error);
    
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

// Helper function to update user stats after session completion
async function updateUserStatsAfterSessionCompletion(userId: string, duration: number, wasSuccessful: boolean) {
  if (!wasSuccessful) return; // Only update stats for successful sessions

  // This is similar to the function in index.ts but handles completion
  // We could potentially adjust stats based on actual vs planned duration
  // For now, the stats are already updated when session is created
  console.log(`Session completed for user ${userId}: ${duration} minutes, successful: ${wasSuccessful}`);
}

// Helper function to update user stats after session deletion
async function updateUserStatsAfterSessionDeletion(userId: string, duration: number) {
  // Get current stats
  const { data: currentStats, error: fetchError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError || !currentStats) {
    console.error('Could not fetch stats for deletion update');
    return;
  }

  // Calculate new stats (subtract the deleted session)
  const newStats = {
    total_sessions: Math.max(0, currentStats.total_sessions - 1),
    total_focus_time: Math.max(0, currentStats.total_focus_time - duration),
    focus_points: Math.max(0, currentStats.focus_points - 10),
  };

  // Update stats
  const { error: updateError } = await supabase
    .from('user_stats')
    .update(newStats)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Stats update error after deletion:', updateError);
  }

  console.log(`Updated stats for user ${userId} after session deletion`);
}
