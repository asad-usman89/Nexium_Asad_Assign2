import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  containsUrduScript, 
  normalizeUrduText, 
  extractUrduText, 
  validateUrduTranslation,
  postProcessUrduTranslation 
} from './urdu-utils'

// Initialize Gemini API with error handling
let genAI: GoogleGenerativeAI | null = null
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  } else {
    console.warn('GEMINI_API_KEY not found in environment variables')
  }
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error)
}

export interface GeminiSummaryResult {
  summary: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
}

export interface GeminiTranslationResult {
  originalText: string
  translatedText: string
  language: string
}

export class GeminiService {
  private model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" })

  /**
   * Check if Gemini API is available
   */
  private isAvailable(): boolean {
    return genAI !== null && this.model !== undefined
  }

  /**
   * Generate AI-powered summary using Gemini
   */
  async generateSummary(content: string): Promise<GeminiSummaryResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API is not available. Please check your API key.')
    }

    try {
      const prompt = `
Please analyze and summarize the following blog content. Provide:
1. A concise summary (3-5 sentences)
2. Key points (3-5 bullet points)
3. Make it informative and well-structured

Content:
${content}

Please format your response as JSON with the following structure:
{
  "summary": "your summary here",
  "keyPoints": ["point 1", "point 2", "point 3"]
}
`

      const result = await this.model!.generateContent(prompt)

      const response = await result.response
      const text = response.text()
      
      // Try to parse JSON response
      let parsedResponse
      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        parsedResponse = JSON.parse(cleanText)
        
        // Basic validation
        if (!parsedResponse.summary || !Array.isArray(parsedResponse.keyPoints)) {
          throw new Error('Invalid summary response structure')
        }
      } catch {
        // Fallback: extract summary and key points manually
        console.warn('Failed to parse JSON response, using fallback extraction')
        parsedResponse = this.extractSummaryFromText(text)
      }

      return {
        summary: parsedResponse.summary || 'Unable to generate summary',
        keyPoints: parsedResponse.keyPoints || [],
        wordCount: content.split(/\s+/).length,
        originalLength: content.length
      }
    } catch (error) {
      console.error('Gemini summarization error:', error)
      // Fallback to static summarization
      return this.fallbackSummary(content)
    }
  }

  /**
   * Translate text to Urdu using Gemini
   */
  async translateToUrdu(text: string): Promise<GeminiTranslationResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API is not available. Please check your API key.')
    }

    try {
      const prompt = `
You are an expert English to Urdu translator. Translate the following English text to Urdu with these guidelines:

1. Provide a natural, fluent Urdu translation that maintains the original meaning
2. Use appropriate Urdu vocabulary and sentence structure
3. Ensure the translation is grammatically correct in Urdu
4. Keep technical terms in their commonly understood form
5. Maintain the tone and style of the original text
6. Use proper Urdu script (Arabic script)
7. Provide ONLY the Urdu translation - no explanations, no original text, no additional commentary

English text to translate:
${text}

Urdu translation:
`

      const result = await this.model!.generateContent(prompt)
      const response = await result.response
      let translatedText = response.text().trim()

      // Clean up the response - remove any English text or explanations
      translatedText = this.cleanUrduTranslation(translatedText)

      // Validate the translation quality
      const validation = validateUrduTranslation(text, translatedText)
      
      if (!validation.isValid) {
        console.warn('Translation quality issues:', validation.issues)
        
        // If validation fails, try fallback translation
        if (validation.issues.includes('Translation does not contain Urdu script')) {
          translatedText = this.fallbackTranslation(text)
        }
      }

      return {
        originalText: text,
        translatedText: translatedText,
        language: 'urdu'
      }
    } catch (error) {
      console.error('Gemini translation error:', error)
      // Fallback to dictionary-based translation
      return {
        originalText: text,
        translatedText: this.fallbackTranslation(text),
        language: 'urdu'
      }
    }
  }

  /**
   * Translate text to Urdu with retry mechanism
   */
  async translateToUrduWithRetry(text: string, maxRetries: number = 2): Promise<GeminiTranslationResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.translateToUrdu(text)
      } catch (error) {
        lastError = error as Error
        console.warn(`Translation attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    console.error('All translation attempts failed, using fallback')
    return {
      originalText: text,
      translatedText: this.fallbackTranslation(text),
      language: 'urdu'
    }
  }

  /**
   * Generate both summary and translation in one call for efficiency
   */
  async generateSummaryAndTranslation(content: string): Promise<{
    summary: GeminiSummaryResult
    translation: GeminiTranslationResult
  }> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API is not available. Please check your API key.')
    }

    try {
      const prompt = `
You are an expert content analyzer and translator. Please analyze the following blog content and provide:

1. A concise English summary (3-5 sentences)
2. Key points (3-5 bullet points)  
3. A natural, fluent Urdu translation of the summary

Guidelines for Urdu translation:
- Use proper Urdu vocabulary and sentence structure
- Maintain the original meaning and tone
- Ensure grammatical correctness in Urdu
- Use appropriate Urdu script (Arabic script)
- Make it sound natural to native Urdu speakers

Content to analyze:
${content}

Please format your response as JSON with the following structure:
{
  "summary": "your concise English summary here",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "summaryUrdu": "آپ کا اردو خلاصہ یہاں"
}
`

      const result = await this.model!.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Try to parse JSON response
      let parsedResponse
      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        parsedResponse = JSON.parse(cleanText)
      } catch {
        console.warn('Failed to parse JSON response, using fallback extraction')
        parsedResponse = this.extractSummaryAndTranslationFromText(text)
      }

      const summary: GeminiSummaryResult = {
        summary: parsedResponse.summary || 'Unable to generate summary',
        keyPoints: parsedResponse.keyPoints || [],
        wordCount: content.split(/\s+/).length,
        originalLength: content.length
      }

      let urduTranslation = parsedResponse.summaryUrdu || 'Unable to translate'
      urduTranslation = this.cleanUrduTranslation(urduTranslation)
      
      // Validate the translation quality
      const validation = validateUrduTranslation(parsedResponse.summary || '', urduTranslation)
      
      if (!validation.isValid) {
        console.warn('Combined translation quality issues:', validation.issues)
        
        // If validation fails, try fallback translation
        if (validation.issues.includes('Translation does not contain Urdu script')) {
          urduTranslation = this.fallbackTranslation(parsedResponse.summary || '')
        }
      }

      const translation: GeminiTranslationResult = {
        originalText: parsedResponse.summary || 'Unable to generate summary',
        translatedText: urduTranslation,
        language: 'urdu'
      }

      return { summary, translation }
    } catch (error) {
      console.error('Gemini combined generation error:', error)
      // Fallback to separate calls
      const summary = await this.generateSummary(content)
      const translation = await this.translateToUrdu(summary.summary)
      
      return { summary, translation }
    }
  }

  /**
   * Fallback summary generation using extractive method
   */
  private fallbackSummary(content: string): GeminiSummaryResult {
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 5)

    return {
      summary: sentences.join('. ') + '.',
      keyPoints: sentences.slice(0, 3),
      wordCount: content.split(/\s+/).length,
      originalLength: content.length
    }
  }

  /**
   * Fallback translation using dictionary method
   */
  private fallbackTranslation(text: string): string {
    // Import the existing dictionary-based translation as fallback
    const words = text.toLowerCase().split(/\s+/)
    const basicDict: { [key: string]: string } = {
      'the': 'یہ',
      'and': 'اور',
      'is': 'ہے',
      'in': 'میں',
      'to': 'کو',
      'of': 'کا',
      'a': 'ایک',
      'that': 'یہ',
      'it': 'یہ',
      'with': 'کے ساتھ',
      'for': 'کے لیے',
      'as': 'جیسے',
      'was': 'تھا',
      'on': 'پر',
      'are': 'ہیں',
      'you': 'آپ',
      'this': 'یہ',
      'be': 'ہونا',
      'at': 'پر',
      'by': 'کے ذریعے',
      'not': 'نہیں',
      'or': 'یا',
      'have': 'ہے',
      'from': 'سے',
      'they': 'وہ',
      'we': 'ہم',
      'but': 'لیکن',
      'can': 'کر سکتے ہیں',
      'out': 'باہر',
      'other': 'دوسرے',
      'were': 'تھے',
      'all': 'تمام',
      'there': 'وہاں',
      'when': 'جب',
      'up': 'اوپر',
      'use': 'استعمال',
      'your': 'آپ کا',
      'how': 'کیسے',
      'our': 'ہمارا',
      'if': 'اگر',
      'no': 'نہیں',
      'had': 'تھا',
      'what': 'کیا',
      'so': 'تو',
      'about': 'کے بارے میں',
      'blog': 'بلاگ',
      'content': 'مواد',
      'article': 'مضمون',
      'summary': 'خلاصہ',
      'information': 'معلومات',
      'important': 'اہم',
      'main': 'بنیادی',
      'key': 'کلیدی',
      'point': 'نکتہ',
      'technology': 'ٹیکنالوجی',
      'development': 'ترقی'
    }
    
    return words.map(word => {
      const cleanWord = word.replace(/[.,!?;:()[\]{}'"]/g, '')
      return basicDict[cleanWord] || word
    }).join(' ')
  }

  /**
   * Extract summary from unstructured text response
   */
  private extractSummaryFromText(text: string): { summary: string; keyPoints: string[] } {
    const lines = text.split('\n').filter(line => line.trim())
    
    let summary = ''
    const keyPoints: string[] = []
    
    // Look for summary-like content
    for (const line of lines) {
      if (line.includes('summary') || line.includes('Summary')) {
        summary = line.replace(/summary:?/i, '').trim()
      } else if (line.match(/^\d+\.|^-|^\*|^•/)) {
        keyPoints.push(line.replace(/^\d+\.|^-|^\*|^•/, '').trim())
      }
    }
    
    // If no structured content found, use first few lines
    if (!summary && lines.length > 0) {
      summary = lines.slice(0, 3).join(' ')
    }
    
    return { summary, keyPoints }
  }

  /**
   * Extract both summary and translation from unstructured text response
   */
  private extractSummaryAndTranslationFromText(text: string): { 
    summary: string; 
    keyPoints: string[]; 
    summaryUrdu: string 
  } {
    const basic = this.extractSummaryFromText(text)
    
    // Look for Urdu content (contains Arabic script)
    const urduMatch = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+[^\n]*/g)
    const summaryUrdu = urduMatch ? urduMatch.join(' ') : this.fallbackTranslation(basic.summary)
    
    return {
      summary: basic.summary,
      keyPoints: basic.keyPoints,
      summaryUrdu
    }
  }

  /**
   * Clean up Urdu translation response to remove English text and explanations
   */
  private cleanUrduTranslation(text: string): string {
    // First, extract Urdu text from mixed content
    let cleanedText = extractUrduText(text)
    
    // If no Urdu text found, try to clean the original text
    if (!containsUrduScript(cleanedText)) {
      cleanedText = normalizeUrduText(text)
    }
    
    // Post-process the translation
    cleanedText = postProcessUrduTranslation(cleanedText)
    
    return cleanedText
  }
}

export const geminiService = new GeminiService()
