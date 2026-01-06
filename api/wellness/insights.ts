import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const createInsightSchema = z.object({
  insight_type: z.enum(['productivity', 'mood', 'energy', 'pattern']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  recommendation: z.string().optional(),
  data: z.record(z.any()).optional(),
});

const querySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  unread_only: z.string().transform(Boolean).optional(),
  type: z.enum(['productivity', 'mood', 'energy', 'pattern']).optional(),
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
      const { limit = 20, unread_only = false, type } = querySchema.parse(req.query);

      // Build query
      let query = supabase
        .from('wellness_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (unread_only) {
        query = query.eq('is_read', false);
      }
      if (type) {
        query = query.eq('insight_type', type);
      }

      // Apply limit
      query = query.limit(limit);

      const { data: insights, error } = await query;

      if (error) {
        console.error('Insights fetch error:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch insights',
          code: 'INSIGHTS_FETCH_ERROR'
        });
      }

      return res.status(200).json({
        insights: insights || [],
        count: insights?.length || 0,
      });
    }

    if (req.method === 'POST') {
      // Validate request body
      const insightData = createInsightSchema.parse(req.body);

      // Create insight
      const { data: insight, error } = await supabase
        .from('wellness_insights')
        .insert({
          user_id: user.id,
          ...insightData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Insight creation error:', error);
        return res.status(500).json({ 
          error: 'Failed to create insight',
          code: 'INSIGHT_CREATION_ERROR'
        });
      }

      return res.status(201).json({
        insight,
        message: 'Insight created successfully',
      });
    }

  } catch (error) {
    console.error('Insights handler error:', error);
    
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
