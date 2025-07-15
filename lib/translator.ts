import { geminiService } from './gemini'

// Simple English to Urdu dictionary for common words (kept as fallback)
export const englishToUrdu: { [key: string]: string } = {
  // Common words
  "the": "یہ",
  "and": "اور",
  "is": "ہے",
  "in": "میں",
  "to": "کو",
  "of": "کا",
  "a": "ایک",
  "that": "یہ",
  "it": "یہ",
  "with": "کے ساتھ",
  "for": "کے لیے",
  "as": "جیسے",
  "was": "تھا",
  "on": "پر",
  "are": "ہیں",
  "you": "آپ",
  "this": "یہ",
  "be": "ہونا",
  "at": "پر",
  "by": "کے ذریعے",
  "not": "نہیں",
  "or": "یا",
  "have": "ہے",
  "from": "سے",
  "they": "وہ",
  "we": "ہم",
  "but": "لیکن",
  "can": "کر سکتے ہیں",
  "out": "باہر",
  "other": "دوسرے",
  "were": "تھے",
  "all": "تمام",
  "there": "وہاں",
  "when": "جب",
  "up": "اوپر",
  "use": "استعمال",
  "your": "آپ کا",
  "how": "کیسے",
  "our": "ہمارا",
  "if": "اگر",
  "no": "نہیں",
  "had": "تھا",
  "what": "کیا",
  "so": "تو",
  "about": "کے بارے میں",
  "time": "وقت",
  "very": "بہت",
  "would": "گا",
  "has": "ہے",
  "more": "زیادہ",
  "go": "جانا",
  "see": "دیکھنا",
  "make": "بنانا",
  "get": "لینا",
  "come": "آنا",
  "know": "جاننا",
  "work": "کام",
  "people": "لوگ",
  "day": "دن",
  "way": "طریقہ",
  "good": "اچھا",
  "new": "نیا",
  "first": "پہلا",
  "great": "عظیم",
  "technology": "ٹیکنالوجی",
  "business": "کاروبار",
  "company": "کمپنی",
  "world": "دنیا",
  "life": "زندگی",
  "system": "نظام",
  "development": "ترقی",
  "software": "سافٹ ویئر",
  "data": "ڈیٹا",
  "information": "معلومات",
  "service": "خدمت",
  "management": "انتظام",
  "market": "بازار",
  "user": "صارف",
  "solution": "حل",
  "process": "عمل",
  "project": "منصوبہ",
  "application": "اپلیکیشن",
  "digital": "ڈیجیٹل",
  "online": "آن لائن",
  "internet": "انٹرنیٹ",
  "website": "ویب سائٹ",
  "computer": "کمپیوٹر",
  "mobile": "موبائل",
  "platform": "پلیٹ فارم",
  "network": "نیٹ ورک",
  "security": "سیکیورٹی",
  "future": "مستقبل",
  "innovation": "جدت",
  "artificial": "مصنوعی",
  "intelligence": "ذہانت",
  "machine": "مشین",
  "learning": "سیکھنا",
  "algorithm": "الگورتھم",
  "programming": "پروگرامنگ",
  "code": "کوڈ",
  "database": "ڈیٹابیس",
  "analysis": "تجزیہ",
  "design": "ڈیزائن",
  "content": "مواد",
  "media": "میڈیا",
  "communication": "رابطہ",
  "experience": "تجربہ",
  "performance": "کارکردگی",
  "quality": "معیار",
  "support": "سپورٹ",
  "product": "پروڈکٹ",
  "customer": "کسٹمر",
  "education": "تعلیم",
  "research": "تحقیق",
  "science": "سائنس",
  "health": "صحت",
  "medical": "طبی",
  "economic": "اقتصادی",
  "financial": "مالی",
  "political": "سیاسی",
  "social": "سماجی",
  "environmental": "ماحولیاتی",
  "global": "عالمی",
  "international": "بین الاقوامی",
  "national": "قومی",
  "local": "مقامی",
  "community": "کمیونٹی",
  "organization": "تنظیم",
  "government": "حکومت",
  "public": "عوامی",
  "private": "نجی",
  "personal": "ذاتی",
  "professional": "پیشہ ورانہ",
  "industry": "صنعت",
  "energy": "توانائی",
  "environment": "ماحول",
  "climate": "آب و ہوا",
  "change": "تبدیلی",
  "growth": "ترقی",
  "impact": "اثر",
  "challenge": "چیلنج",
  "opportunity": "موقع",
  "strategy": "حکمت عملی",
  "planning": "منصوبہ بندی",
  "implementation": "نافذ کرنا"
}

// Function to translate text to Urdu using Gemini AI (with dictionary fallback)
export async function translateToUrdu(text: string): Promise<string> {
  // Try AI-powered translation first with retry mechanism
  try {
    const geminiResult = await geminiService.translateToUrduWithRetry(text)
    return geminiResult.translatedText
  } catch (error) {
    console.warn('Gemini translation failed completely, falling back to dictionary method:', error)
    // Fall back to dictionary-based translation
    return translateToUrduStatic(text)
  }
}

// Function to translate text to Urdu using the dictionary (static method)
export function translateToUrduStatic(text: string): string {
  const words = text.toLowerCase().split(/\s+/)
  
  const translatedWords = words.map(word => {
    // Remove punctuation for lookup
    const cleanWord = word.replace(/[.,!?;:()[\]{}'"]/g, '')
    
    // Check if word exists in dictionary
    if (englishToUrdu[cleanWord]) {
      return englishToUrdu[cleanWord]
    }
    
    // If not found, return original word
    return word
  })
  
  return translatedWords.join(' ')
}
