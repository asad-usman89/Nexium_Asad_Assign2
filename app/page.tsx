'use client'

import { useState } from 'react'
import React from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Globe, FileText, Database, Languages, CheckCircle, XCircle, Brain, Sparkles } from 'lucide-react'

interface SummaryResult {
  title: string
  url: string
  summary: string
  summaryUrdu: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
  mongoId: string
  supabaseId: number
  scrapedAt: string
  aiPowered?: boolean
  optimizedMode?: boolean
  author?: string
  publishedDate?: string
  readTime?: string
  tags?: string[]
  content?: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [optimizedMode, setOptimizedMode] = useState(true)
  const [step, setStep] = useState(0)
  const [activeTab, setActiveTab] = useState('summary')

  const steps = [
    'Scraping blog content...',
    'Processing with Google Gemini...',
    'Translating to Urdu...',
    'Storing in MongoDB...',
    'Storing in Supabase...',
    'Complete!'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setStep(0)

    try {
      // Step 1: Scraping blog content
      setStep(1)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 2: Processing with Google Gemini
      setStep(2)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 3: Translating to Urdu
      setStep(3)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 4: Storing in MongoDB
      setStep(4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 5: Storing in Supabase
      setStep(5)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Make the API call
      const response = await axios.post('/api/summarize', { 
        url,
        useOptimized: optimizedMode
      })
      
      // Step 6: Complete
      setStep(6)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setResult(response.data.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.details || err.response?.data?.error || 'Failed to summarize blog post')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg animate-gradient p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Blog Summariser
            </h1>
            <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">
            Powered by Google Gemini AI • MongoDB • Supabase
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 shadow-lg border-0 glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="w-6 h-6 text-blue-600" />
              Enter Blog URL
            </CardTitle>
            <CardDescription className="text-lg">
              Paste any blog URL to get AI-powered summary in English and Urdu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://example.com/blog-post"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full h-12 text-lg transition-all duration-300 focus:scale-105"
                    disabled={loading}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={loading} 
                  className="h-12 px-8 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {steps[step - 1] || 'Processing...'}
                    </>
                  ) : (
                    'Analyze & Summarize'
                  )}
                </Button>
              </div>
              
              {/* AI Settings */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optimizedMode}
                    onChange={(e) => setOptimizedMode(e.target.checked)}
                    className="rounded transition-all duration-200"
                  />
                  <span>⚡ Optimized Mode (faster processing)</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Gemini AI Active</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        {loading && (
          <Card className="mb-8 shadow-lg border-0 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="w-6 h-6 text-purple-600" />
                Processing Your Request
              </CardTitle>
              <CardDescription>
                Step {step} of {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((stepText, index) => (
                  <div key={index} className="flex items-center gap-3 transition-all duration-500">
                    {index + 1 < step ? (
                      <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                    ) : index + 1 === step ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`transition-all duration-500 ${
                      index + 1 < step 
                        ? 'text-green-700 font-medium' 
                        : index + 1 === step 
                        ? 'text-blue-700 font-medium animate-pulse' 
                        : 'text-gray-500'
                    }`}>
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((step / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(step / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 shadow-lg glass-effect">
            <XCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800 text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Article Info */}
            <Card className="shadow-lg border-0 glass-effect">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">{result.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-4 text-lg">
                  <span>Source: <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline transition-colors">
                    {result.url}
                  </a></span>
                  {result.author && (
                    <>
                      <span>•</span>
                      <span>By {result.author}</span>
                    </>
                  )}
                  {result.publishedDate && (
                    <>
                      <span>•</span>
                      <span>{result.publishedDate}</span>
                    </>
                  )}
                  {result.readTime && (
                    <>
                      <span>•</span>
                      <span>{result.readTime}</span>
                    </>
                  )}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>Word count: {result.wordCount}</span>
                  <span>Original length: {result.originalLength} characters</span>
                  {result.aiPowered && (
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      AI-Powered
                    </span>
                  )}
                  {result.optimizedMode && (
                    <span className="text-blue-600">⚡ Optimized</span>
                  )}
                </div>
                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm transition-all duration-200 hover:scale-105">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Content Tabs */}
            <div className="w-full">
              <div className="grid w-full grid-cols-4 h-12 glass-effect rounded-lg p-1 mb-4">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`tab-button rounded-md text-lg font-medium transition-all duration-300 ${
                    activeTab === 'summary' 
                      ? 'active bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  English Summary
                </button>
                <button
                  onClick={() => setActiveTab('urdu')}
                  className={`tab-button rounded-md text-lg font-medium transition-all duration-300 ${
                    activeTab === 'urdu' 
                      ? 'active bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  اردو خلاصہ
                </button>
                <button
                  onClick={() => setActiveTab('keypoints')}
                  className={`tab-button rounded-md text-lg font-medium transition-all duration-300 ${
                    activeTab === 'keypoints' 
                      ? 'active bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Key Points
                </button>
                <button
                  onClick={() => setActiveTab('original')}
                  className={`tab-button rounded-md text-lg font-medium transition-all duration-300 ${
                    activeTab === 'original' 
                      ? 'active bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Original Text
                </button>
              </div>
              
              {activeTab === 'summary' && (
                <Card className="shadow-lg border-0 glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                      English Summary
                      <Badge variant="outline" className="ml-2">Google Gemini AI</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <p className="prose-custom text-gray-700 leading-relaxed text-lg">
                        {result.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'urdu' && (
                <Card className="shadow-lg border-0 glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Languages className="w-6 h-6 text-purple-600" />
                      اردو خلاصہ
                      <Badge variant="outline" className="ml-2">Google Gemini AI</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <p className="prose-custom text-gray-700 leading-relaxed text-lg text-right" dir="rtl">
                        {result.summaryUrdu}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'keypoints' && (
                <Card className="shadow-lg border-0 glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="w-6 h-6 text-green-600" />
                      Key Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg transition-all duration-300 hover:scale-105">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <p className="prose-custom text-gray-700 text-lg leading-relaxed flex-1">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'original' && (
                <Card className="shadow-lg border-0 glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Globe className="w-6 h-6 text-gray-600" />
                      Original Article Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <div className="prose-custom text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                        {result.content || 'Original content not available'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Database Storage Status */}
            <Card className="shadow-lg border-0 glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="w-6 h-6 text-orange-600" />
                  Storage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-green-800 text-lg">MongoDB</span>
                    </div>
                    <div className="space-y-2 text-sm text-green-700">
                      <p><strong>Document ID:</strong> {result.mongoId}</p>
                      <p><strong>Status:</strong> Full text + Summary stored</p>
                      <p><strong>Processed:</strong> {new Date(result.scrapedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                      <span className="font-bold text-blue-800 text-lg">Supabase</span>
                    </div>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>Record ID:</strong> {result.supabaseId}</p>
                      <p><strong>Status:</strong> Metadata + Summaries stored</p>
                      <p><strong>Features:</strong> English + Urdu summaries</p>
                      {result.aiPowered && <p><strong>AI-Powered:</strong> Google Gemini</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
