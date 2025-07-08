const Error404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 select-none">404</h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Go Back Home
          </button>
          
          <div className="pt-4">
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              ← Go Back
            </button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-12 opacity-20">
          <div className="w-16 h-16 mx-auto border-4 border-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Error404