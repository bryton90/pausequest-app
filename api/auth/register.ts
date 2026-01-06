import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('User check error:', checkError);
      return res.status(500).json({ 
        error: 'Failed to check existing user',
        code: 'USER_CHECK_ERROR'
      });
    }

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for development, set to false in production
    });

    if (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message.includes('User already registered')) {
        return res.status(409).json({ 
          error: 'User already exists',
          code: 'USER_EXISTS'
        });
      }
      
      return res.status(400).json({ 
        error: error.message,
        code: 'REGISTRATION_ERROR'
      });
    }

    // Create user profile in database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        email_verified: false, // Will be true after email confirmation
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Rollback auth user creation if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      
      return res.status(500).json({ 
        error: 'Failed to create user profile',
        code: 'PROFILE_CREATION_ERROR'
      });
    }

    // Sign in the user immediately after registration
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      // Don't fail the registration, just return without session
      return res.status(201).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          email_verified: false,
        },
        profile,
        message: 'Registration successful. Please check your email to verify your account.',
      });
    }

    return res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        email_verified: data.user.email_confirmed_at ? true : false,
      },
      session: sessionData.session,
      profile,
      message: 'Registration successful!',
    });

  } catch (error) {
    console.error('Registration handler error:', error);
    
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
