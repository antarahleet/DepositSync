import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧾 DepositSync
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Automated check processing and logging for real estate brokerages
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to DepositSync
            </h2>
            <p className="text-gray-600 mb-6">
              This system automatically processes emailed check scans, extracts data using AI, 
              and provides a searchable dashboard for review and management.
            </p>
            <Link 
              href="/checks" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Checks Dashboard →
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📧 Email Processing</h3>
            <p className="text-gray-600">Automatically receives and processes check images via email</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI Extraction</h3>
            <p className="text-gray-600">Uses OpenAI to extract check details with high accuracy</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Dashboard</h3>
            <p className="text-gray-600">Searchable interface to review and manage all processed checks</p>
          </div>
        </div>
      </div>
    </main>
  )
} 