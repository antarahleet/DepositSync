import { put } from '@vercel/blob'
import { env } from './env'

export async function uploadToBlob(file: File): Promise<string> {
  try {
    const { url } = await put(file.name, file, {
      access: 'public',
      token: env.BLOB_READ_WRITE_TOKEN,
    })
    
    return url
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw new Error('Failed to upload file to blob storage')
  }
} 