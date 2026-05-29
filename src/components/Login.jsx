import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4">💰</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">MyFinance</h1>
        <p className="text-gray-500 mb-8">Catat keuangan kamu dengan mudah</p>
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Masuk dengan Google
        </button>
      </div>
    </div>
  )
}