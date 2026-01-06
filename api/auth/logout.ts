import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for logout request
const logoutSchema = z.object({
  refreshToken: z.string().optional(),
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

  if (req.method !== 'POST') {
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

    // Validate request body (optional refresh token)
    const { refreshToken } = logoutSchema.parse(req.body);

    // Sign out the user
    if (refreshToken) {
      const { error: signOutError } = await supabase.auth.admin.signOut(refreshToken);
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
        console.warn('Sign out had issues, but proceeding with logout response');
      }
    } else {
      // If no refresh token, we can still invalidate the session by signing out from the client side
      // The JWT will expire naturally
      console.log('No refresh token provided, client-side sign out recommended');
    }

    return res.status(200).json({ 
      message: 'Logout successful',
      code: 'LOGOUT_SUCCESS'
    });

  } catch (error) {
    console.error('Logout handler error:', error);
    
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
