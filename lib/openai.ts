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

    console.log("Raw content from OpenAI:", content);

    // More robustly find the JSON block, even with markdown backticks
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not find a valid JSON object in the response.');
    }
    
    const jsonString = content.substring(startIndex, endIndex + 1);
    console.log("Extracted JSON string:", jsonString);

    // Parse the JSON response
    const extractedData = JSON.parse(jsonString) as ExtractedCheckData
    
    return extractedData
  } catch (error) {
    console.error('Error extracting check data:', error)
    throw new Error('Failed to extract check data')
  }
} 