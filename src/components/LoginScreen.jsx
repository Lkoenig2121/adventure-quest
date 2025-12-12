import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim() && password.trim()) {
      onLogin()
      navigate('/town')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Game Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-yellow-400 mb-4 drop-shadow-2xl" style={{
            textShadow: '4px 4px 0px #8b6914, 6px 6px 20px rgba(0,0,0,0.8)',
            fontFamily: 'Georgia, serif'
          }}>
            Adventure Quest
          </h1>
          <p className="text-xl text-white font-semibold drop-shadow-lg">Version 34.2</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg shadow-2xl border-4 border-amber-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-yellow-200 font-semibold mb-2 text-lg">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-amber-950 border-2 border-amber-700 rounded-lg text-white placeholder-amber-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-200 font-semibold mb-2 text-lg">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-amber-950 border-2 border-amber-700 rounded-lg text-white placeholder-amber-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-yellow-200 text-sm">
              New player? Just enter any username and password to start!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen

