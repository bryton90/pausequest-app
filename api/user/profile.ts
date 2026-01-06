import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '../../src/lib/supabase';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
});

const updatePreferencesSchema = z.object({
  work_duration: z.number().min(1).max(120).optional(),
  break_duration: z.number().min(1).max(30).optional(),
  long_break_duration: z.number().min(1).max(60).optional(),
  sessions_until_long_break: z.number().min(1).max(10).optional(),
  auto_start_breaks: z.boolean().optional(),
  auto_start_work: z.boolean().optional(),
  sound_enabled: z.boolean().optional(),
  notification_enabled: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
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

  if (!['GET', 'PUT'].includes(req.method)) {
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
      // Get user profile with preferences
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          user_preferences (*)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return res.status(500).json({ 
          error: 'Failed to fetch user profile',
          code: 'PROFILE_FETCH_ERROR'
        });
      }

      return res.status(200).json({
        user: {
          id: profile.id,
          email: profile.email,
          email_verified: profile.email_verified,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        },
        preferences: profile.user_preferences || null,
      });
    }

    if (req.method === 'PUT') {
      const { profile: profileUpdates, preferences: preferenceUpdates } = req.body;

      // Validate profile updates if provided
      let validatedProfileUpdates: any = null;
      if (profileUpdates) {
        validatedProfileUpdates = updateProfileSchema.parse(profileUpdates);
      }

      // Validate preference updates if provided
      let validatedPreferenceUpdates: any = null;
      if (preferenceUpdates) {
        validatedPreferenceUpdates = updatePreferencesSchema.parse(preferenceUpdates);
      }

      // Update user profile if needed
      if (validatedProfileUpdates) {
        const { error: updateError } = await supabase
          .from('users')
          .update(validatedProfileUpdates)
          .eq('id', user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          return res.status(500).json({ 
            error: 'Failed to update user profile',
            code: 'PROFILE_UPDATE_ERROR'
          });
        }
      }

      // Update user preferences if needed
      let updatedPreferences = null;
      if (validatedPreferenceUpdates) {
        const { data, error: prefUpdateError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            ...validatedPreferenceUpdates,
          })
          .select()
          .single();

        if (prefUpdateError) {
          console.error('Preferences update error:', prefUpdateError);
          return res.status(500).json({ 
            error: 'Failed to update user preferences',
            code: 'PREFERENCES_UPDATE_ERROR'
          });
        }

        updatedPreferences = data;
      }

      // Get updated profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users')
        .select(`
          *,
          user_preferences (*)
        `)
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Updated profile fetch error:', fetchError);
        return res.status(500).json({ 
          error: 'Failed to fetch updated profile',
          code: 'FETCH_UPDATED_ERROR'
        });
      }

      return res.status(200).json({
        user: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          email_verified: updatedProfile.email_verified,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at,
        },
        preferences: updatedProfile.user_preferences || null,
        message: 'Profile updated successfully',
      });
    }

  } catch (error) {
    console.error('Profile handler error:', error);
    
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
