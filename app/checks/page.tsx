'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Check {
  id: string
  checkNumber?: string
  date?: string
  amount?: number
  memo?: string
  payor?: string
  payee?: string
  imageUrl: string
  status: string
  createdAt: string
}

export default function ChecksPage() {
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChecks()
  }, [])

  const fetchChecks = async () => {
    try {
      const response = await fetch('/api/checks')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch checks' }))
        throw new Error(errorData.error || 'Failed to fetch checks')
      }

      const data = await response.json()
      
      // Ensure we have a checks array, even if empty
      setChecks(data.checks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checks')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading checks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checks</h1>
          <Link
            href="/checks/new"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload New Check
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {checks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No checks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first check.
            </p>
            <div className="mt-6">
              <Link
                href="/checks/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload Check
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {checks.map((check) => (
              <div key={check.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={check.imageUrl}
                    alt="Check"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Check #{check.checkNumber || 'N/A'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      check.status === 'needs_review' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {check.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {check.amount && (
                      <p><span className="font-medium">Amount:</span> {formatAmount(check.amount)}</p>
                    )}
                    {check.date && (
                      <p><span className="font-medium">Date:</span> {formatDate(check.date)}</p>
                    )}
                    {check.payor && (
                      <p><span className="font-medium">From:</span> {check.payor}</p>
                    )}
                    {check.payee && (
                      <p><span className="font-medium">To:</span> {check.payee}</p>
                    )}
                    {check.memo && (
                      <p><span className="font-medium">Memo:</span> {check.memo}</p>
                    )}
                    <p><span className="font-medium">Uploaded:</span> {formatDate(check.createdAt)}</p>
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      href={`/checks/${check.id}`}
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 