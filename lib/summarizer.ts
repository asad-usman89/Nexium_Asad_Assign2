import { geminiService } from './gemini'

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
}

export async function generateSummary(content: string): Promise<SummaryResult> {
  // Try AI-powered summarization first
  try {
    const geminiResult = await geminiService.generateSummary(content)
    return geminiResult
  } catch (error) {
    console.warn('Gemini summarization failed, falling back to static method:', error)
    // Fall back to static summarization
    return generateStaticSummary(content)
  }
}

export function generateStaticSummary(content: string): SummaryResult {
  // Clean and prepare the content
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?;:()]/g, '')
    .trim()

  // Split into sentences
  const sentences = cleanContent
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10) // Filter out very short sentences

  // Calculate original metrics
  const originalLength = cleanContent.length
  const wordCount = cleanContent.split(/\s+/).length

  // Simple scoring system for sentence importance
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0
    
    // Higher score for sentences at the beginning (intro) and end (conclusion)
    if (index < sentences.length * 0.2) score += 3
    if (index > sentences.length * 0.8) score += 2
    
    // Score based on sentence length (not too short, not too long)
    const words = sentence.split(/\s+/)
    if (words.length >= 8 && words.length <= 25) score += 2
    
    // Score based on common important words
    const importantWords = [
      'important', 'significant', 'key', 'main', 'primary', 'essential',
      'crucial', 'major', 'fundamental', 'critical', 'vital', 'necessary',
      'therefore', 'however', 'moreover', 'furthermore', 'consequently',
      'result', 'conclusion', 'summary', 'findings', 'discovered',
      'research', 'study', 'analysis', 'data', 'evidence', 'shows',
      'reveals', 'indicates', 'suggests', 'demonstrates', 'proves'
    ]
    
    const lowerSentence = sentence.toLowerCase()
    importantWords.forEach(word => {
      if (lowerSentence.includes(word)) score += 1
    })
    
    // Avoid sentences with too many numbers or special characters
    if ((sentence.match(/\d+/g)?.length || 0) > 3) score -= 1
    if ((sentence.match(/[()[\]{}]/g)?.length || 0) > 2) score -= 1
    
    return { sentence, score, index }
  })

  // Sort by score and take top sentences for summary
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)))
    .sort((a, b) => a.index - b.index) // Restore original order

  // Create summary
  const summary = topSentences
    .map(item => item.sentence)
    .join('. ')
    .replace(/\.\s*\./g, '.') // Clean up double periods
    + (topSentences.length > 0 && !topSentences[topSentences.length - 1].sentence.endsWith('.') ? '.' : '')

  // Generate key points (different approach - look for bullet points or numbered items)
  const keyPoints = extractKeyPoints(cleanContent, sentences)

  return {
    summary: summary || 'Unable to generate summary from the provided content.',
    keyPoints,
    wordCount,
    originalLength
  }
}

function extractKeyPoints(content: string, sentences: string[]): string[] {
  const keyPoints: string[] = []
  
  // Look for bullet points or numbered lists
  const bulletRegex = /[•·\-\*]\s*([^•·\-\*\n]+)/g
  const numberedRegex = /\d+[\.\)]\s*([^\d\n]+)/g
  
  let match
  while ((match = bulletRegex.exec(content)) !== null) {
    const point = match[1].trim()
    if (point.length > 10 && point.length < 150) {
      keyPoints.push(point)
    }
  }
  
  while ((match = numberedRegex.exec(content)) !== null) {
    const point = match[1].trim()
    if (point.length > 10 && point.length < 150) {
      keyPoints.push(point)
    }
  }
  
  // If no bullet points found, extract key sentences as points
  if (keyPoints.length === 0) {
    const keywordSentences = sentences
      .filter(sentence => {
        const lower = sentence.toLowerCase()
        return (
          lower.includes('key') ||
          lower.includes('important') ||
          lower.includes('main') ||
          lower.includes('significant') ||
          lower.includes('essential') ||
          lower.includes('crucial')
        )
      })
      .slice(0, 3)
    
    keyPoints.push(...keywordSentences)
  }
  
  // If still no key points, take first few sentences
  if (keyPoints.length === 0) {
    keyPoints.push(...sentences.slice(0, 3))
  }
  
  return keyPoints.slice(0, 5) // Limit to 5 key points
}
