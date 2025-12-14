import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import TownScreen from './components/TownScreen'
import BattleScreen from './components/BattleScreen'
import CastleScreen from './components/CastleScreen'
import ShopScreen from './components/ShopScreen'
import { GameProvider } from './context/GameContext'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authenticated') === 'true'
  })

  useEffect(() => {
    // Check auth status on mount
    if (localStorage.getItem('authenticated') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem('authenticated', 'true')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('authenticated')
  }

  return (
    <GameProvider>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/town" replace />
            ) : (
              <LoginScreen onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/town" 
          element={
            isAuthenticated ? (
              <TownScreen onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/battle" 
          element={
            isAuthenticated ? (
              <BattleScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/castle" 
          element={
            isAuthenticated ? (
              <CastleScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/shop" 
          element={
            isAuthenticated ? (
              <ShopScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/town" : "/login"} replace />} />
      </Routes>
    </GameProvider>
  )
}

export default App

