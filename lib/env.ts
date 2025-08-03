import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  
  // Webhook (optional for future email integration)
  INBOUND_WEBHOOK_SECRET: z.string().optional(),
})

export function validateEnv() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
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