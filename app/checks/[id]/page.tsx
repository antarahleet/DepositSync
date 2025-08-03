'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function CheckDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [check, setCheck] = useState<Check | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Check>>({})

  useEffect(() => {
    if (params.id) {
      fetchCheck(params.id as string)
    }
  }, [params.id])

  const fetchCheck = async (id: string) => {
    try {
      const response = await fetch(`/api/checks/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch check')
      }

      setCheck(data.check)
      setEditData(data.check)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch check')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!check) return

    try {
      const response = await fetch(`/api/checks/${check.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update check')
      }

      setCheck(data.check)
      setEditData(data.check)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update check')
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading check...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !check) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Check not found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/checks"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              ← Back to Checks
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/checks"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Checks
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={check.imageUrl}
                alt="Check"
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Check #{check.checkNumber || 'N/A'}
                </h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  check.status === 'needs_review' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {check.status.replace('_', ' ')}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check Number
                    </label>
                    <input
                      type="text"
                      value={editData.checkNumber || ''}
                      onChange={(e) => setEditData({...editData, checkNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.amount || ''}
                      onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editData.date ? new Date(editData.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payor
                    </label>
                    <input
                      type="text"
                      value={editData.payor || ''}
                      onChange={(e) => setEditData({...editData, payor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payee
                    </label>
                    <input
                      type="text"
                      value={editData.payee || ''}
                      onChange={(e) => setEditData({...editData, payee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memo
                    </label>
                    <textarea
                      value={editData.memo || ''}
                      onChange={(e) => setEditData({...editData, memo: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditData(check)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Check Number</p>
                      <p className="text-sm text-gray-900">{check.checkNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-sm text-gray-900">
                        {check.amount ? formatAmount(check.amount) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-sm text-gray-900">
                        {check.date ? formatDate(check.date) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-sm text-gray-900 capitalize">
                        {check.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">From (Payor)</p>
                    <p className="text-sm text-gray-900">{check.payor || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">To (Payee)</p>
                    <p className="text-sm text-gray-900">{check.payee || 'N/A'}</p>
                  </div>
                  
                  {check.memo && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Memo</p>
                      <p className="text-sm text-gray-900">{check.memo}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Uploaded</p>
                    <p className="text-sm text-gray-900">{formatDate(check.createdAt)}</p>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Check
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 