'use client'

import { useState } from 'react'
import axios from 'axios'

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
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('/api/summarize', { url })
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Blog Summarizer
          </h1>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter blog URL to summarize..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Summarize'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <h3 className="font-semibold">Error:</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {result.title}
                </h2>
                <p className="text-sm text-gray-600">
                  Source: <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {result.url}
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Word count: {result.wordCount} | Original length: {result.originalLength} characters
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  English Summary
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {result.summary}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Urdu Summary (اردو خلاصہ)
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg" dir="rtl">
                  {result.summaryUrdu}
                </p>
              </div>

              {result.keyPoints.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>✅ Saved to MongoDB (ID: {result.mongoId})</p>
                <p>✅ Saved to Supabase (ID: {result.supabaseId})</p>
                <p>📅 Processed: {new Date(result.scrapedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
