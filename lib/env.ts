import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Webhook
  INBOUND_WEBHOOK_SECRET: z.string().min(1),
})

export function validateEnv() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    INBOUND_WEBHOOK_SECRET: process.env.INBOUND_WEBHOOK_SECRET,
  }

  const result = envSchema.safeParse(env)
  
  if (!result.success) {
    const missingVars = result.error.issues.map(issue => issue.path.join('.'))
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return result.data
}

// Type for validated environment variables
export type Env = z.infer<typeof envSchema> 