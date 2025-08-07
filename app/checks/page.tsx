"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useDebounce } from "use-debounce"
import Image from "next/image"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [amountMin, setAmountMin] = useState("")
  const [amountMax, setAmountMax] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const exportHref = useMemo(() => {
    const params = new URLSearchParams()
    if (debouncedSearchQuery) params.set("query", debouncedSearchQuery)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    if (amountMin) params.set("amountMin", amountMin)
    if (amountMax) params.set("amountMax", amountMax)
    const qs = params.toString()
    return "/api/checks/export" + (qs ? "?" + qs : "")
  }, [debouncedSearchQuery, dateFrom, dateTo, amountMin, amountMax])

  const fetchChecks = useCallback(
    async (query: string) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set("query", query)
        if (dateFrom) params.set("dateFrom", dateFrom)
        if (dateTo) params.set("dateTo", dateTo)
        if (amountMin) params.set("amountMin", amountMin)
        if (amountMax) params.set("amountMax", amountMax)
        params.set("page", String(page))
        params.set("pageSize", "12")
        const response = await fetch("/api/checks?" + params.toString())
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Failed to fetch checks" }))
          throw new Error(errorData.error || "Failed to fetch checks")
        }
        const data = await response.json()
        setChecks(data.checks || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch checks")
      } finally {
        setLoading(false)
      }
    },
    [amountMax, amountMin, dateFrom, dateTo, page]
  )

  useEffect(() => {
    fetchChecks(debouncedSearchQuery)
  }, [debouncedSearchQuery, fetchChecks])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString()
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checks</h1>
          <div className="flex items-center space-x-4 flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search checks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPage(1)
                setDateFrom(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPage(1)
                setDateTo(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Min $"
              value={amountMin}
              onChange={(e) => {
                setPage(1)
                setAmountMin(e.target.value)
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Max $"
              value={amountMax}
              onChange={(e) => {
                setPage(1)
                setAmountMax(e.target.value)
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            />
            <Link
              href="/checks/new"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload New Check
            </Link>
            <a
              href={exportHref}
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export CSV
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-600">Searching...</div>
        )}

        {!loading && checks.length === 0 ? (
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
              {debouncedSearchQuery
                ? `No results for "${debouncedSearchQuery}".`
                : "Get started by uploading your first check."}
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
              <div
                key={check.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div
                  className="aspect-w-16 aspect-h-9 bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setPreviewUrl(check.imageUrl)
                    setIsPreviewOpen(true)
                  }}
                >
                  <Image
                    src={check.imageUrl}
                    alt="Check"
                    width={640}
                    height={360}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Check #{check.checkNumber || "N/A"}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        check.status === "needs_review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {check.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {check.amount && (
                      <p>
                        <span className="font-medium">Amount:</span>{" "}
                        {formatAmount(check.amount)}
                      </p>
                    )}
                    {check.date && (
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(check.date)}
                      </p>
                    )}
                    {check.payor && (
                      <p>
                        <span className="font-medium">From:</span> {check.payor}
                      </p>
                    )}
                    {check.payee && (
                      <p>
                        <span className="font-medium">To:</span> {check.payee}
                      </p>
                    )}
                    {check.memo && (
                      <p>
                        <span className="font-medium">Memo:</span> {check.memo}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Uploaded:</span>{" "}
                      {formatDate(check.createdAt)}
                    </p>
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

        {!loading && checks.length > 0 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {isPreviewOpen && previewUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="max-w-5xl w-full max-h-[90vh] bg-white rounded shadow-lg p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button
                  className="px-3 py-1 text-sm border rounded"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="w-full h-[70vh] overflow-auto flex items-center justify-center bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Check preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
