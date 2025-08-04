import { put } from '@vercel/blob'
import { env } from './env'

export async function uploadToBlob(file: File): Promise<string> {
  try {
    console.log('Attempting to upload to Vercel Blob...')
    console.log('Token exists:', !!env.BLOB_READ_WRITE_TOKEN)
    console.log('Token length:', env.BLOB_READ_WRITE_TOKEN?.length)
    
    const { url } = await put(file.name, file, {
      access: 'public',
      token: env.BLOB_READ_WRITE_TOKEN,
    })
    
    console.log('Upload successful, URL:', url)
    return url
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw new Error('Failed to upload file to blob storage')
  }
} 