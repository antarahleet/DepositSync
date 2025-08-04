import OpenAI from 'openai'
import { env } from './env'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export interface ExtractedCheckData {
  checkNumber?: string
  date?: string
  amount?: number
  memo?: string
  payor?: string
  payee?: string
}

export async function extractCheckData(imageUrl: string): Promise<ExtractedCheckData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the following information from this check image and return it as JSON:
              - checkNumber: The check number (if visible)
              - date: The date on the check (in YYYY-MM-DD format if possible)
              - amount: The amount as a number (e.g., 1500.00 for $1,500.00)
              - memo: Any memo or note on the check
              - payor: The person/entity writing the check
              - payee: The person/entity the check is made out to
              
              Return only valid JSON with these fields. If a field is not found, omit it from the response.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Clean up the response to ensure it is valid JSON
    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim()

    // Parse the JSON response
    const extractedData = JSON.parse(cleanedContent) as ExtractedCheckData
    
    return extractedData
  } catch (error) {
    console.error('Error extracting check data:', error)
    throw new Error('Failed to extract check data')
  }
} 