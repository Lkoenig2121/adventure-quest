import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const CastleScreen = () => {
  const navigate = useNavigate()
  const { player } = useGame()

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Castle Interior Background */}
      <div className="absolute inset-0">
        {/* Stone walls */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 opacity-80"></div>
        {/* Torches */}
        <div className="absolute top-20 left-20 w-4 h-16 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-20 right-20 w-4 h-16 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        {/* Windows */}
        <div className="absolute top-40 left-1/4 w-16 h-20 bg-blue-300 border-4 border-gray-600"></div>
        <div className="absolute top-40 right-1/4 w-16 h-20 bg-blue-300 border-4 border-gray-600"></div>
      </div>

      {/* Castle Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-yellow-400 mb-8 drop-shadow-2xl" style={{
          textShadow: '4px 4px 0px #8b6914, 6px 6px 20px rgba(0,0,0,0.8)',
          fontFamily: 'Georgia, serif'
        }}>
          Castle Interior
        </h1>
        
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl p-8 max-w-2xl mx-auto">
          <p className="text-amber-900 text-lg mb-6">
            Welcome to the castle, {player.name}! This is a place of power and mystery.
          </p>
          <p className="text-amber-900 text-lg mb-6">
            The castle holds many secrets and treasures. Explore the halls, speak with the guards, 
            and discover what lies within these ancient walls.
          </p>
          <p className="text-amber-900 text-lg mb-8">
            More features coming soon!
          </p>
          
          <button
            onClick={() => navigate('/town')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-red-800 shadow-lg transform transition hover:scale-105 text-xl"
          >
            Return to Town
          </button>
        </div>
      </div>
    </div>
  )
}

export default CastleScreen

