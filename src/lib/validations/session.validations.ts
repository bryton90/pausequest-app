import { z } from 'zod';

export const SessionDataSchema = z.object({
  userId: z.string().uuid(),
  mood: z.string().optional(),
  mood_emoji: z.string().optional(),
  notes: z.string().optional(),
  focus_duration: z.number().int().nonnegative(),
  break_duration: z.number().int().nonnegative(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const SessionUpdateSchema = SessionDataSchema.partial().extend({
  id: z.number().int().positive(),
});

export const SessionIdSchema = z.object({
  id: z.number().int().positive(),
});

export const validateSessionData = (data: unknown) => {
  return SessionDataSchema.parse(data);
};

export const validateSessionUpdate = (data: unknown) => {
  return SessionUpdateSchema.parse(data);
};

export const validateSessionId = (data: unknown) => {
  return SessionIdSchema.parse(data);
};
