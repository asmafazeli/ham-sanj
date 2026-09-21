import { createWorker } from 'tesseract.js'

/**
 * Client-side OCR (Persian + English). No API keys required.
 * Accuracy depends on screenshot clarity, contrast, and font size.
 */
export async function extractTextFromImage(image: File | Blob | string): Promise<string> {
  const worker = await createWorker(['fas', 'eng'])
  try {
    const {
      data: { text },
    } = await worker.recognize(image)
    return text.trim()
  } finally {
    await worker.terminate()
  }
}

export function isImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.type.startsWith('image/'))
}
