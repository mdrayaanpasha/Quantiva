export default function AuthenticationReminder() {
    return (
        <div className="flex items-center justify-center min-h-screen  font-sans p-4">
            <div className="w-full max-w-sm p-8  rounded-xl shadow-2xl text-center">
                <div className="mb-6">
                    <svg className="h-10 w-10 text-teal-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-black mb-3">Unlock Insights</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Your journey to smarter investments starts here.
                </p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="flex items-center justify-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 shadow-lg"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login
                    </button>
                    <button
                        onClick={() => window.location.href = "/register"}
                        className="flex items-center justify-center px-6 py-3 border border-gray-600 text-black rounded-lg hover:border-gray-500 hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 shadow-lg"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14c-1.474-1.284-3.208-2-5-2s-3.526.716-5 2v4h10v-4z" />
                        </svg>
                        Register
                    </button>
                </div>
            </div>
        </div>
    )
}