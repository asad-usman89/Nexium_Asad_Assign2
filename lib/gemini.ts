import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
  private model = genAI.getGenerativeModel({ model: "gemini-pro" })

  /**
   * Generate AI-powered summary using Gemini
   */
  async generateSummary(content: string): Promise<GeminiSummaryResult> {
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

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Try to parse JSON response
      let parsedResponse
      try {
        // Clean the response in case it has markdown formatting
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        parsedResponse = JSON.parse(cleanText)
      } catch (parseError) {
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
    try {
      const prompt = `
Translate the following English text to Urdu. 
Make sure the translation is accurate, natural, and maintains the meaning of the original text.
Please provide only the Urdu translation without any additional text or explanations.

Text to translate:
${text}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const translatedText = response.text().trim()

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
   * Generate both summary and translation in one call for efficiency
   */
  async generateSummaryAndTranslation(content: string): Promise<{
    summary: GeminiSummaryResult
    translation: GeminiTranslationResult
  }> {
    try {
      const prompt = `
Please analyze the following blog content and provide:
1. A concise English summary (3-5 sentences)
2. Key points (3-5 bullet points)
3. Urdu translation of the summary

Content:
${content}

Please format your response as JSON with the following structure:
{
  "summary": "your English summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "summaryUrdu": "your Urdu translation of the summary here"
}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Try to parse JSON response
      let parsedResponse
      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        parsedResponse = JSON.parse(cleanText)
      } catch (parseError) {
        console.warn('Failed to parse JSON response, using fallback extraction')
        parsedResponse = this.extractSummaryAndTranslationFromText(text)
      }

      const summary: GeminiSummaryResult = {
        summary: parsedResponse.summary || 'Unable to generate summary',
        keyPoints: parsedResponse.keyPoints || [],
        wordCount: content.split(/\s+/).length,
        originalLength: content.length
      }

      const translation: GeminiTranslationResult = {
        originalText: parsedResponse.summary || 'Unable to generate summary',
        translatedText: parsedResponse.summaryUrdu || 'Unable to translate',
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
      'for': 'کے لیے'
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
    let keyPoints: string[] = []
    
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
}

export const geminiService = new GeminiService()
