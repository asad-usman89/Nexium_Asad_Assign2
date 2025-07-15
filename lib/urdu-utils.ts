/**
 * Utility functions for Urdu text processing and translation
 */

/**
 * Check if text contains Urdu/Arabic script
 */
export function containsUrduScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
}

/**
 * Clean and normalize Urdu text
 */
export function normalizeUrduText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s*["""]|["""]\s*$/g, '') // Remove surrounding quotes
    .replace(/^(اردو ترجمہ:|ترجمہ:|یہ اردو ترجمہ ہے:)/i, '') // Remove common prefixes
    .trim()
}

/**
 * Extract Urdu text from mixed language content
 */
export function extractUrduText(text: string): string {
  const lines = text.split('\n')
  const urduLines = lines.filter(line => containsUrduScript(line))
  
  if (urduLines.length > 0) {
    return urduLines.join('\n').trim()
  }
  
  return text
}

/**
 * Validate if the translation quality is acceptable
 */
export function validateUrduTranslation(originalText: string, translatedText: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check if translation contains Urdu script
  if (!containsUrduScript(translatedText)) {
    issues.push('Translation does not contain Urdu script')
  }
  
  // Check if translation is too short compared to original
  if (translatedText.length < originalText.length * 0.3) {
    issues.push('Translation seems too short')
  }
  
  // Check if translation is mostly English
  const englishWords = translatedText.match(/[a-zA-Z]+/g) || []
  if (englishWords.length > originalText.split(' ').length * 0.7) {
    issues.push('Translation contains too many English words')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Common Urdu phrases and their English equivalents
 */
export const urduPhrases = {
  'خلاصہ': 'Summary',
  'اہم نکات': 'Key Points',
  'تفصیلات': 'Details',
  'معلومات': 'Information',
  'تجزیہ': 'Analysis',
  'نتیجہ': 'Conclusion',
  'مقدمہ': 'Introduction',
  'اختتام': 'Conclusion',
  'مثال': 'Example',
  'وضاحت': 'Explanation'
}

/**
 * Post-process Urdu translation to improve quality
 */
export function postProcessUrduTranslation(text: string): string {
  let processed = normalizeUrduText(text)
  
  // Fix common spacing issues with Urdu text
  processed = processed.replace(/(\u0600-\u06FF)\s+(\u0600-\u06FF)/g, '$1$2')
  
  // Ensure proper punctuation spacing
  processed = processed.replace(/([۔؟!])\s*([^\s])/g, '$1 $2')
  
  return processed
}
