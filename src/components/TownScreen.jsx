import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const TownScreen = ({ onLogout }) => {
  const navigate = useNavigate()
  const { player, startBattle, resetPlayerStats, fullHeal, getElementModifiers } = useGame()
  const [showNews, setShowNews] = useState(true)
  const [showTwillyMessage, setShowTwillyMessage] = useState(false)
  const [isHealing, setIsHealing] = useState(false)
  const [showStatsTooltip, setShowStatsTooltip] = useState(false)
  const [showTravelMap, setShowTravelMap] = useState(false)
  const portraitRef = useRef(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const MAP_LOCATIONS = [
    { name: 'Citadel',       x: 41, y:  8, icon: '🏰', bold: false },
    { name: 'Ruins',         x: 52, y:  5, icon: '💀', bold: false },
    { name: 'Bludrut Keep',  x: 63, y:  7, icon: '🏯', bold: false },
    { name: 'Vasalkar Lair', x: 88, y:  5, icon: '🐲', bold: false },
    { name: 'Marsh',         x: 46, y: 17, icon: '🔴', bold: false },
    { name: 'Guru Forest',   x: 60, y: 17, icon: '🔴', bold: false },
    { name: 'Death',         x: 17, y: 22, icon: '💀', bold: false },
    { name: 'Club House',    x: 37, y: 26, icon: '🦅', bold: false },
    { name: 'Cemetery',      x: 52, y: 31, icon: '💀', bold: false },
    { name: 'Lolosia',       x: 79, y: 29, icon: '☠️', bold: false },
    { name: 'Crash Site',    x: 19, y: 30, icon: '🏚️', bold: false },
    { name: 'Noobshire',     x: 32, y: 36, icon: '🔴', bold: false },
    { name: 'Cellar',        x: 62, y: 37, icon: '🔴', bold: false },
    { name: 'Bridge',        x:  7, y: 39, icon: '🔴', bold: false },
    { name: 'Farm',          x: 41, y: 43, icon: '🐓', bold: false },
    { name: 'Battleon',      x: 51, y: 45, icon: '🏰', bold: true  },
    { name: 'Shallow',       x: 70, y: 42, icon: '🔴', bold: false },
    { name: 'Swordhaven',    x: 13, y: 47, icon: '🏰', bold: true  },
    { name: 'Boxes',         x:  4, y: 53, icon: '🔴', bold: false },
    { name: 'Sewer',         x: 21, y: 52, icon: '🔴', bold: false },
    { name: 'River',         x: 63, y: 49, icon: '🔴', bold: false },
    { name: 'Willow Creek',  x: 29, y: 56, icon: '🔴', bold: false },
    { name: 'Forest',        x: 43, y: 53, icon: '🌲', bold: false },
    { name: 'Orc Town',      x: 68, y: 59, icon: '🔴', bold: false },
  ]

  // Dotted travel paths between locations [fromIndex, toIndex] using x/y coords
  const MAP_PATHS = [
    [[13,47],[41,43]],  // Swordhaven → Farm
    [[41,43],[51,45]],  // Farm → Battleon
    [[51,45],[62,37]],  // Battleon → Cellar
    [[51,45],[52,31]],  // Battleon → Cemetery
    [[52,31],[37,26]],  // Cemetery → Club House
    [[37,26],[32,36]],  // Club House → Noobshire
    [[32,36],[21,52]],  // Noobshire → Sewer
    [[21,52],[13,47]],  // Sewer → Swordhaven
    [[13,47],[7,39]],   // Swordhaven → Bridge
    [[7,39],[4,53]],    // Bridge → Boxes
    [[51,45],[43,53]],  // Battleon → Forest
    [[43,53],[29,56]],  // Forest → Willow Creek
    [[51,45],[63,49]],  // Battleon → River
    [[63,49],[70,42]],  // River → Shallow
    [[70,42],[68,59]],  // Shallow → Orc Town
    [[52,31],[46,17]],  // Cemetery → Marsh
    [[46,17],[41,8]],   // Marsh → Citadel
    [[46,17],[60,17]],  // Marsh → Guru Forest
    [[60,17],[52,5]],   // Guru Forest → Ruins
    [[52,5],[63,7]],    // Ruins → Bludrut Keep
    [[17,22],[19,30]],  // Death → Crash Site
    [[19,30],[13,47]],  // Crash Site → Swordhaven
  ]

  const handleTwillyClick = () => {
    fullHeal()
    setIsHealing(true)
    setShowTwillyMessage(true)
    setTimeout(() => {
      setShowTwillyMessage(false)
      setIsHealing(false)
    }, 3000)
  }

  const handleBattleClick = () => {
    const lv = player.level
    // Helper: scale HP, MP, XP, gold with player level
    // tier: 1=easy, 2=medium, 3=hard, 4=dragon, 5=boss
    const s = (base, scale) => Math.floor(base + lv * scale)

    const raw = [
      // ── Elemental Dragons ──────────────────────────────────────────────
      { name:'Fire Dragon',      icon:'🔥🐉', element:'Fire',     elementIcon:'🔥', speed:45, lvOff:18,
        hpB:300, hpS:70, mpB:80,  mpS:10, xpB:120, xpS:15, gB:60, gS:7,
        elementResistances:{ fire:0, water:200, wind:100, ice:200, earth:100, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Ice Dragon',       icon:'❄️🐉', element:'Ice',      elementIcon:'❄️', speed:40, lvOff:16,
        hpB:280, hpS:65, mpB:100, mpS:12, xpB:110, xpS:14, gB:55, gS:7,
        elementResistances:{ fire:200, water:50, wind:100, ice:0, earth:100, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Water Dragon',     icon:'💧🐉', element:'Water',    elementIcon:'💧', speed:55, lvOff:17,
        hpB:290, hpS:67, mpB:110, mpS:13, xpB:115, xpS:14, gB:58, gS:7,
        elementResistances:{ fire:200, water:0, wind:100, ice:50, earth:100, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Wind Dragon',      icon:'🌪️🐉', element:'Wind',     elementIcon:'🌪️', speed:80, lvOff:15,
        hpB:260, hpS:60, mpB:90,  mpS:11, xpB:105, xpS:13, gB:52, gS:6,
        elementResistances:{ fire:100, water:100, wind:0, ice:100, earth:150, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Earth Dragon',     icon:'🌍🐉', element:'Earth',    elementIcon:'🌍', speed:30, lvOff:19,
        hpB:380, hpS:80, mpB:70,  mpS:8,  xpB:130, xpS:16, gB:65, gS:8,
        elementResistances:{ fire:100, water:100, wind:150, ice:100, earth:0, energy:100, light:100, darkness:100, physical:60 } },
      { name:'Energy Dragon',    icon:'⚡🐉', element:'Energy',   elementIcon:'⚡', speed:65, lvOff:17,
        hpB:300, hpS:68, mpB:140, mpS:15, xpB:118, xpS:14, gB:59, gS:7,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:0, light:50, darkness:150, physical:80 } },
      { name:'Light Dragon',     icon:'✨🐉', element:'Light',    elementIcon:'✨', speed:60, lvOff:20,
        hpB:320, hpS:72, mpB:110, mpS:13, xpB:130, xpS:15, gB:65, gS:8,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:50, light:0, darkness:200, physical:80 } },
      { name:'Darkness Dragon',  icon:'🌑🐉', element:'Darkness', elementIcon:'🌑', speed:60, lvOff:20,
        hpB:340, hpS:75, mpB:120, mpS:14, xpB:130, xpS:15, gB:65, gS:8,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:150, light:200, darkness:0, physical:80 } },
      { name:'Void Wyrm',        icon:'🌌🐲', element:'Darkness', elementIcon:'🌑', speed:50, lvOff:25,
        hpB:450, hpS:95, mpB:160, mpS:18, xpB:170, xpS:18, gB:85, gS:9,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:100, light:200, darkness:0, physical:90 } },
      { name:'Zombie Dragon',    icon:'🧟🐲', element:'Darkness', elementIcon:'🌑', speed:35, lvOff:14,
        hpB:270, hpS:62, mpB:50,  mpS:5,  xpB:100, xpS:12, gB:50, gS:6,
        elementResistances:{ fire:150, water:100, wind:100, ice:100, earth:100, energy:100, light:200, darkness:0, physical:70 } },
      { name:'Acid Dragon',      icon:'🟢🐉', element:'Earth',    elementIcon:'🌍', speed:50, lvOff:17,
        hpB:295, hpS:66, mpB:80,  mpS:10, xpB:112, xpS:14, gB:56, gS:7,
        elementResistances:{ fire:100, water:50, wind:100, ice:100, earth:0, energy:100, light:100, darkness:100, physical:80 } },
      // ── Classic AQ Monsters ────────────────────────────────────────────
      { name:'Berserker (+20)',   icon:'🪓', element:'Fire',     elementIcon:'🔥', speed:60, lvOff:20,
        hpB:380, hpS:60, mpB:70,  mpS:8,  xpB:110, xpS:13, gB:55, gS:6,
        elementResistances:{ fire:50, water:130, wind:100, ice:150, earth:100, energy:100, light:130, darkness:100, physical:100 } },
      { name:'Goblin Warrior',   icon:'👺', element:'Earth',    elementIcon:'🌍', speed:55, lvOff:3,
        hpB:60,  hpS:28, mpB:25,  mpS:4,  xpB:35,  xpS:6,  gB:18, gS:3,
        elementResistances:{ fire:150, water:100, wind:120, ice:100, earth:50, energy:100, light:100, darkness:100, physical:100 } },
      { name:'Dark Knight',      icon:'🛡️', element:'Darkness', elementIcon:'🌑', speed:50, lvOff:10,
        hpB:180, hpS:40, mpB:100, mpS:12, xpB:80,  xpS:10, gB:40, gS:5,
        elementResistances:{ fire:100, water:100, wind:100, ice:130, earth:100, energy:100, light:200, darkness:0, physical:100 } },
      { name:'Undead Soldier',   icon:'💀', element:'Darkness', elementIcon:'🌑', speed:35, lvOff:7,
        hpB:120, hpS:32, mpB:30,  mpS:4,  xpB:55,  xpS:7,  gB:28, gS:4,
        elementResistances:{ fire:150, water:100, wind:100, ice:100, earth:100, energy:100, light:200, darkness:0, physical:80 } },
      { name:'Werewolf',         icon:'🐺', element:'Wind',     elementIcon:'🌪️', speed:75, lvOff:9,
        hpB:150, hpS:36, mpB:40,  mpS:5,  xpB:70,  xpS:8,  gB:35, gS:4,
        elementResistances:{ fire:100, water:100, wind:50, ice:130, earth:100, energy:100, light:150, darkness:100, physical:80 } },
      { name:'Vampire',          icon:'🧛', element:'Darkness', elementIcon:'🌑', speed:70, lvOff:12,
        hpB:190, hpS:42, mpB:90,  mpS:11, xpB:88,  xpS:10, gB:44, gS:5,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:100, light:200, darkness:0, physical:80 } },
      { name:'Stone Golem',      icon:'🗿', element:'Earth',    elementIcon:'🌍', speed:25, lvOff:13,
        hpB:250, hpS:48, mpB:20,  mpS:2,  xpB:92,  xpS:11, gB:46, gS:5,
        elementResistances:{ fire:100, water:130, wind:100, ice:100, earth:0, energy:100, light:100, darkness:100, physical:50 } },
      { name:'Sea Serpent',      icon:'🐍', element:'Water',    elementIcon:'💧', speed:60, lvOff:12,
        hpB:210, hpS:44, mpB:60,  mpS:7,  xpB:85,  xpS:10, gB:42, gS:5,
        elementResistances:{ fire:150, water:0, wind:100, ice:50, earth:100, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Thunder Phoenix',  icon:'🦅', element:'Energy',   elementIcon:'⚡', speed:85, lvOff:15,
        hpB:270, hpS:52, mpB:110, mpS:13, xpB:100, xpS:12, gB:50, gS:6,
        elementResistances:{ fire:100, water:150, wind:50, ice:150, earth:100, energy:0, light:50, darkness:150, physical:80 } },
      { name:'Frost Troll',      icon:'🧌', element:'Ice',      elementIcon:'❄️', speed:40, lvOff:8,
        hpB:140, hpS:34, mpB:30,  mpS:4,  xpB:60,  xpS:7,  gB:30, gS:4,
        elementResistances:{ fire:200, water:100, wind:100, ice:0, earth:100, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Magma Elemental',  icon:'🌋', element:'Fire',     elementIcon:'🔥', speed:45, lvOff:13,
        hpB:220, hpS:46, mpB:50,  mpS:6,  xpB:90,  xpS:11, gB:45, gS:5,
        elementResistances:{ fire:0, water:300, wind:100, ice:250, earth:80, energy:100, light:100, darkness:100, physical:80 } },
      { name:'Shadow Stalker',   icon:'🌚', element:'Darkness', elementIcon:'🌑', speed:90, lvOff:10,
        hpB:160, hpS:38, mpB:75,  mpS:9,  xpB:75,  xpS:9,  gB:38, gS:4,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:100, light:250, darkness:0, physical:90 } },
      { name:'Celestial Unicorn',icon:'🦄', element:'Light',    elementIcon:'✨', speed:70, lvOff:11,
        hpB:200, hpS:42, mpB:150, mpS:17, xpB:80,  xpS:9,  gB:40, gS:5,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:50, light:0, darkness:250, physical:80 } },
      { name:'Orc Warlord',      icon:'🪖', element:'Fire',     elementIcon:'🔥', speed:50, lvOff:14,
        hpB:260, hpS:50, mpB:50,  mpS:6,  xpB:95,  xpS:11, gB:48, gS:5,
        elementResistances:{ fire:50, water:100, wind:100, ice:100, earth:50, energy:100, light:100, darkness:100, physical:60 } },
      { name:'Grenwog',          icon:'🐸', element:'Earth',    elementIcon:'🌍', speed:60, lvOff:6,
        hpB:110, hpS:30, mpB:40,  mpS:5,  xpB:50,  xpS:6,  gB:25, gS:3,
        elementResistances:{ fire:100, water:50, wind:100, ice:130, earth:0, energy:100, light:100, darkness:100, physical:100 } },
      { name:'Zorbak the Moglin',icon:'😈', element:'Darkness', elementIcon:'🌑', speed:65, lvOff:9,
        hpB:150, hpS:35, mpB:140, mpS:16, xpB:68,  xpS:8,  gB:34, gS:4,
        elementResistances:{ fire:100, water:100, wind:100, ice:100, earth:100, energy:100, light:200, darkness:0, physical:80 } },
      { name:'Drakel Warrior',   icon:'🦖', element:'Energy',   elementIcon:'⚡', speed:55, lvOff:12,
        hpB:200, hpS:43, mpB:60,  mpS:7,  xpB:82,  xpS:10, gB:41, gS:5,
        elementResistances:{ fire:80, water:80, wind:80, ice:80, earth:80, energy:0, light:100, darkness:100, physical:80 } },
      { name:'Fungal Shambler',  icon:'🍄', element:'Earth',    elementIcon:'🌍', speed:20, lvOff:4,
        hpB:80,  hpS:26, mpB:15,  mpS:2,  xpB:38,  xpS:5,  gB:19, gS:3,
        elementResistances:{ fire:200, water:50, wind:100, ice:100, earth:0, energy:100, light:100, darkness:100, physical:100 } },
      { name:'Skeletal Archer',  icon:'🏹', element:'Darkness', elementIcon:'🌑', speed:65, lvOff:5,
        hpB:95,  hpS:29, mpB:25,  mpS:3,  xpB:44,  xpS:6,  gB:22, gS:3,
        elementResistances:{ fire:130, water:100, wind:100, ice:100, earth:100, energy:100, light:200, darkness:0, physical:80 } },
    ]

    const enemies = raw.map(({ hpB, hpS, mpB, mpS, xpB, xpS, gB, gS, lvOff, ...rest }) => {
      const hp = s(hpB, hpS), mp = s(mpB, mpS)
      return { ...rest, hp, maxHp: hp, mp, maxMp: mp, level: lv + lvOff,
        xpReward: s(xpB, xpS), goldReward: s(gB, gS) }
    })
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
    startBattle(randomEnemy)
    navigate('/battle')
  }

  const handleCastleClick = () => {
    navigate('/castle')
  }

  const handleShopClick = () => {
    navigate('/shop')
  }

  const handleSpellShopClick = () => {
    navigate('/spell-shop')
  }

  const handlePetShopClick = () => {
    navigate('/pet-shop')
  }

  const hpPercentage = (player.hp / player.maxHp) * 100
  const mpPercentage = (player.mp / player.maxMp) * 100
  const spPercentage = (player.sp / player.maxSp) * 100
  const elementModifiers = getElementModifiers()

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 relative overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-300">
        {/* Clouds */}
        <div className="absolute top-10 left-20 w-32 h-16 bg-white opacity-60 rounded-full blur-sm"></div>
        <div className="absolute top-20 right-32 w-40 h-20 bg-white opacity-60 rounded-full blur-sm"></div>
        <div className="absolute top-30 left-1/3 w-36 h-18 bg-white opacity-60 rounded-full blur-sm"></div>
        
        {/* Comet/Meteor */}
        <div className="absolute top-5 right-20 w-4 h-20 bg-gradient-to-b from-red-500 to-orange-400 rounded-full transform rotate-45 opacity-80"></div>
        <div className="absolute top-8 right-18 w-2 h-16 bg-yellow-300 rounded-full transform rotate-45 blur-sm"></div>

        {/* Sky Portal placeholder position — actual button moved to town content layer */}
        <button
          onClick={() => navigate('/stat-trainer')}
          className="absolute group flex flex-col items-center gap-1"
          title="Portal — visit the Stat Trainer"
          style={{ top: '6%', right: '18%', zIndex: 1, background: 'none', border: 'none', padding: 0, cursor: 'default', pointerEvents: 'none' }}
        >
          {/* Ambient glow behind the portal */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 110, height: 110,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.45) 0%, rgba(168,85,247,0.25) 50%, transparent 75%)',
            filter: 'blur(6px)',
            pointerEvents: 'none',
          }} />

          {/* SVG portal — layered jagged starburst */}
          <svg
            width="90" height="90" viewBox="0 0 100 100"
            style={{ display: 'block', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.9)) drop-shadow(0 0 16px rgba(168,85,247,0.7))' }}
            overflow="visible"
          >
            <defs>
              <radialGradient id="ptVortex" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="35%" stopColor="#7c3aed" />
                <stop offset="70%" stopColor="#2e1065" />
                <stop offset="100%" stopColor="#0f0020" />
              </radialGradient>
              <radialGradient id="ptCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </radialGradient>
              {/* Jagged outer burst — 12 spikes, R=46 r=32 */}
              <style>{`
                .pt-outer { animation: spin 5s linear infinite; transform-origin: 50px 50px; }
                .pt-mid   { animation: spin 3s linear infinite reverse; transform-origin: 50px 50px; }
                .pt-core  { animation: spin 1.8s linear infinite; transform-origin: 50px 50px; }
              `}</style>
            </defs>

            {/* Outer jagged ring — pinkish-purple */}
            <polygon
              className="pt-outer"
              points="50,4 58.3,19.1 73,10.2 72.6,27.4 89.8,27 80.9,41.7 96,50 80.9,58.3 89.8,73 72.6,72.6 73,89.8 58.3,80.9 50,96 41.7,80.9 27,89.8 27.4,72.6 10.2,73 19.1,58.3 4,50 19.1,41.7 10.2,27 27.4,27.4 27,10.2 41.7,19.1"
              fill="#be185d"
              opacity="0.85"
            />

            {/* Middle jagged burst — brighter violet, counter-spin */}
            <polygon
              className="pt-mid"
              points="50,16 55.2,30.7 67,20.6 64.1,35.9 79.4,33 69.3,44.8 84,50 69.3,55.2 79.4,67 64.1,64.1 67,79.4 55.2,69.3 50,84 44.8,69.3 33,79.4 35.9,64.1 20.6,67 30.7,55.2 16,50 30.7,44.8 20.6,33 35.9,35.9 33,20.6 44.8,30.7"
              fill="#a855f7"
              opacity="0.9"
            />

            {/* Dark vortex core */}
            <circle cx="50" cy="50" r="24" fill="url(#ptVortex)" />

            {/* Swirling inner light — co-spinning */}
            <circle cx="50" cy="50" r="13" fill="url(#ptCore)" className="pt-core" opacity="0.9" />

            {/* Bright centre pinpoint */}
            <circle cx="50" cy="50" r="4" fill="#f5d0fe" opacity="0.95" />
          </svg>

          {/* Notification badge when pending stat points */}
          {(player.pendingStatPoints || 0) > 0 && (
            <div style={{
              position: 'absolute',
              top: -6, right: -6,
              width: 22, height: 22,
              borderRadius: '50%',
              background: '#f59e0b',
              border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 'bold', color: '#1a1a1a',
              zIndex: 10,
              boxShadow: '0 0 6px rgba(245,158,11,0.8)',
            }}>
              !
            </div>
          )}

          {/* Label */}
          <span
            className="text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ color: '#f9a8d4', textShadow: '0 0 8px #ec4899, 0 1px 2px rgba(0,0,0,0.9)', letterSpacing: 1 }}
          >
            PORTAL
          </span>
        </button>
      </div>

      {/* Mountains */}
      <div className="absolute bottom-0 w-full h-64">
        <div className="absolute bottom-0 left-0 w-96 h-64 bg-gradient-to-t from-blue-600 to-blue-500 clip-path-mountain"></div>
        <div className="absolute bottom-0 right-0 w-80 h-56 bg-gradient-to-t from-blue-700 to-blue-600 clip-path-mountain"></div>
      </div>

      {/* Town Content */}
      <div className="relative z-20 w-full h-full" style={{ overflow: 'visible' }}>

        {/* Sky Portal — clickable layer (sits inside z-20 wrapper but below UI panels) */}
        <button
          onClick={() => navigate('/stat-trainer')}
          className="absolute group flex flex-col items-center gap-1"
          title="Portal — visit the Stat Trainer"
          style={{ top: '6%', right: '18%', zIndex: 25, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <svg
            width="90" height="90" viewBox="0 0 100 100"
            style={{ display: 'block', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.9)) drop-shadow(0 0 16px rgba(168,85,247,0.7))' }}
            overflow="visible"
          >
            <defs>
              <radialGradient id="ptVortex2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="35%" stopColor="#7c3aed" />
                <stop offset="70%" stopColor="#2e1065" />
                <stop offset="100%" stopColor="#0f0020" />
              </radialGradient>
              <radialGradient id="ptCore2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </radialGradient>
              <style>{`
                .pt-outer2 { animation: spin 5s linear infinite; transform-origin: 50px 50px; }
                .pt-mid2   { animation: spin 3s linear infinite reverse; transform-origin: 50px 50px; }
                .pt-core2  { animation: spin 1.8s linear infinite; transform-origin: 50px 50px; }
              `}</style>
            </defs>
            <polygon className="pt-outer2" points="50,4 58.3,19.1 73,10.2 72.6,27.4 89.8,27 80.9,41.7 96,50 80.9,58.3 89.8,73 72.6,72.6 73,89.8 58.3,80.9 50,96 41.7,80.9 27,89.8 27.4,72.6 10.2,73 19.1,58.3 4,50 19.1,41.7 10.2,27 27.4,27.4 27,10.2 41.7,19.1" fill="#be185d" opacity="0.85" />
            <polygon className="pt-mid2" points="50,16 55.2,30.7 67,20.6 64.1,35.9 79.4,33 69.3,44.8 84,50 69.3,55.2 79.4,67 64.1,64.1 67,79.4 55.2,69.3 50,84 44.8,69.3 33,79.4 35.9,64.1 20.6,67 30.7,55.2 16,50 30.7,44.8 20.6,33 35.9,35.9 33,20.6 44.8,30.7" fill="#a855f7" opacity="0.9" />
            <circle cx="50" cy="50" r="24" fill="url(#ptVortex2)" />
            <circle cx="50" cy="50" r="13" fill="url(#ptCore2)" className="pt-core2" opacity="0.9" />
            <circle cx="50" cy="50" r="4" fill="#f5d0fe" opacity="0.95" />
          </svg>
          {(player.pendingStatPoints || 0) > 0 && (
            <div style={{
              position: 'absolute', top: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: '#f59e0b', border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 'bold', color: '#1a1a1a',
              boxShadow: '0 0 6px rgba(245,158,11,0.8)',
            }}>!</div>
          )}
          <span className="text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ color: '#f9a8d4', textShadow: '0 0 8px #ec4899, 0 1px 2px rgba(0,0,0,0.9)', letterSpacing: 1 }}>
            PORTAL
          </span>
        </button>

        {/* Top UI — above portal (z-30) */}
        <div className="absolute top-4 left-4 right-4 flex justify-between" style={{ zIndex: 30 }}>
          {/* News Panel */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl w-96 flex flex-col max-h-96">
            <div className="bg-amber-900 text-yellow-200 font-bold text-lg px-4 py-2 border-b-2 border-amber-700 flex-shrink-0">
              BattleOn News!
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm text-amber-900 space-y-3 min-h-0">
              <p>
                <strong>Explore the town buildings and talk to everyone you see.</strong> Click on the mountains to battle monsters, with new enemies every level!
              </p>
              <p>
                <strong>THIS WEEK:</strong> The annual Grenwog Festival returns! This year the festival is running a little long, as the Grenwogs refuse to return home! As you set out to find what's wrong, Galanoth appears to be onto the cause! Plant Dragons... starting forest fires?
              </p>
              <p>
                <strong>LIMITED-TIME SHOP:</strong> Chibi Loco Pets are now available! During the month of April, this little guy can channel more of Loco's power, dealing a lot more damage!
              </p>
            </div>
            <div className="border-t-2 border-amber-700 p-2 space-y-1 flex-shrink-0">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-2 border-red-800 text-sm">
                TODAY'S EVENT
              </button>
              <button
                onClick={() => setShowTravelMap(true)}
                className="w-full bg-amber-800 hover:bg-amber-900 text-yellow-200 font-bold py-2 px-4 rounded border-2 border-amber-700 text-sm"
              >
                Travel Map
              </button>
            </div>
          </div>

          {/* Shop Buttons */}
          <div className="flex flex-col gap-3">
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg border-4 border-yellow-400 shadow-lg transform transition hover:scale-105">
              Elite Items!
            </button>
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg border-4 border-yellow-400 shadow-lg transform transition hover:scale-105 flex items-center gap-2">
              <span>⏰</span>
              Limited-Time Shop!
            </button>
          </div>
        </div>

        {/* Town Scene */}
        <div className="absolute bottom-24 sm:bottom-32 left-0 right-0 flex justify-center items-end gap-2 sm:gap-4 flex-wrap px-2">
          {/* Pet Shop (furthest left brown building) */}
          <button
            onClick={handlePetShopClick}
            className="relative transform transition hover:scale-110 cursor-pointer"
          >
            <div className="w-20 h-28 sm:w-24 sm:h-32 bg-amber-800 border-4 border-amber-900 relative">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-700 to-gray-600"></div>
              <div className="absolute top-2 left-2 w-4 h-4 bg-amber-200 rounded"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-amber-950 rounded-t"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 border border-black"></div>
              {/* Pet Shop sign */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-14 h-5 bg-yellow-300 border-2 border-amber-900 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-amber-900 leading-none">PETS</span>
              </div>
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl">🐾</div>
          </button>

          {/* Fountain */}
          <div className="relative">
            <div className="w-16 h-12 sm:w-20 sm:h-16 bg-blue-400 border-2 border-blue-600 rounded-t-full relative">
              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-4 right-3 w-2 h-2 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-4 bg-blue-300 rounded-full"></div>
            </div>
          </div>

          {/* Twilly - The Orange Healer */}
          <button
            onClick={handleTwillyClick}
            className="relative transform transition hover:scale-110 cursor-pointer z-5 flex-shrink-0"
          >
            {/* Healing glow effect */}
            {isHealing && (
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-50 animate-ping"></div>
            )}
            
            {/* Twilly's Body (Orange creature) */}
            <div className="relative">
              {/* Body */}
              <div className={`w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full border-2 border-orange-700 relative ${isHealing ? 'animate-pulse' : ''}`}>
                {/* Head */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-b from-orange-300 to-orange-500 rounded-full border-2 border-orange-600">
                  {/* Eyes */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full"></div>
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full"></div>
                  {/* Nose */}
                  <div className="absolute top-4 sm:top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-700 rounded-full"></div>
                  {/* Mouth */}
                  <div className="absolute top-5 sm:top-7 left-1/2 transform -translate-x-1/2 w-3 sm:w-4 h-1.5 sm:h-2 border-b-2 border-orange-700 rounded-b-full"></div>
                </div>
                {/* Ears */}
                <div className="absolute -top-1.5 sm:-top-2 left-1.5 sm:left-2 w-3 h-4 sm:w-4 sm:h-6 bg-orange-500 rounded-full transform rotate-12 border border-orange-600"></div>
                <div className="absolute -top-1.5 sm:-top-2 right-1.5 sm:right-2 w-3 h-4 sm:w-4 sm:h-6 bg-orange-500 rounded-full transform -rotate-12 border border-orange-600"></div>
                {/* Arms */}
                <div className="absolute top-3 sm:top-4 left-0 w-2 sm:w-3 h-6 sm:h-8 bg-orange-500 rounded-full transform -rotate-12"></div>
                <div className="absolute top-3 sm:top-4 right-0 w-2 sm:w-3 h-6 sm:h-8 bg-orange-500 rounded-full transform rotate-12"></div>
                {/* Staff */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 w-3 sm:w-4 h-9 sm:h-12 bg-amber-600 rounded-t-full"></div>
                <div className="absolute top-1.5 sm:top-2 left-0 w-0.5 sm:w-1 h-12 sm:h-16 bg-amber-800 transform -rotate-12"></div>
                <div className="absolute top-1.5 sm:top-2 right-0 w-0.5 sm:w-1 h-12 sm:h-16 bg-amber-800 transform rotate-12"></div>
                <div className="absolute top-9 sm:top-12 right-1.5 sm:right-2 w-3 sm:w-4 h-3 sm:h-4 bg-yellow-300 rounded-full border border-yellow-400"></div>
                <div className="absolute bottom-1.5 sm:bottom-2 right-0 w-6 sm:w-8 h-2 sm:h-3 bg-orange-500 rounded-full transform rotate-45"></div>
                {/* Exclamation mark */}
                <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl sm:text-3xl animate-bounce">!</div>
              </div>
            </div>

            {/* Twilly's Speech Bubble */}
            {showTwillyMessage && (
              <div className="absolute -top-28 sm:-top-32 left-1/2 transform -translate-x-1/2 animate-fade-in w-48 sm:w-auto" style={{ zIndex: 50 }}>
                <div className="bg-white border-4 border-yellow-400 rounded-lg shadow-2xl p-3 sm:p-4 min-w-40 sm:min-w-48 max-w-48 sm:max-w-64 relative">
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400"></div>
                  </div>
                  <p className="text-amber-900 font-bold text-xs sm:text-sm text-center">
                    "There you go! All healed up and ready for adventure!"
                  </p>
                  <p className="text-orange-600 text-xs text-center mt-1">- Twilly</p>
                </div>
              </div>
            )}
          </button>

          {/* Intellect Building / Spell Shop */}
          <button
            onClick={handleSpellShopClick}
            className="relative transform transition hover:scale-110 cursor-pointer"
          >
            {/* Tower body */}
            <div className="w-20 h-36 sm:w-24 sm:h-40 relative" style={{
              background: 'linear-gradient(to bottom, #3b0764, #4c1d95)',
              border: '4px solid #2e1065',
            }}>
              {/* Pointed roof */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2" style={{
                width: 0, height: 0,
                borderLeft: '18px solid transparent',
                borderRight: '18px solid transparent',
                borderBottom: '24px solid #6d28d9',
              }} />
              {/* Arched windows */}
              <div className="absolute top-4 left-2 w-5 h-7 rounded-t-full" style={{ background: '#a78bfa', border: '2px solid #6d28d9', boxShadow: '0 0 6px #a78bfa' }} />
              <div className="absolute top-4 right-2 w-5 h-7 rounded-t-full" style={{ background: '#a78bfa', border: '2px solid #6d28d9', boxShadow: '0 0 6px #a78bfa' }} />
              {/* Glowing orb in middle */}
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, #e9d5ff, #7c3aed)', boxShadow: '0 0 10px #a78bfa', animation: 'pulse 2s infinite' }} />
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-9 rounded-t-full" style={{ background: '#1e1b4b', border: '2px solid #4c1d95' }} />
              {/* Sign */}
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-16 h-5 flex items-center justify-center rounded" style={{ background: '#fde68a', border: '2px solid #92400e' }}>
                <span className="text-xs font-bold" style={{ color: '#4c1d95', fontSize: 8 }}>SPELLS</span>
              </div>
            </div>
            {/* Floating spell icon */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl" style={{ animation: 'bounce 1.5s infinite' }}>📚</div>
          </button>

          {/* Castle (clickable to enter) */}
          <button
            onClick={handleCastleClick}
            className="relative transform transition hover:scale-110 cursor-pointer"
          >
            <div className="w-32 h-48 bg-gradient-to-b from-gray-500 to-gray-600 border-4 border-gray-700 relative">
              <div className="absolute top-0 left-4 w-8 h-12 bg-gray-400 border-2 border-gray-600"></div>
              <div className="absolute top-0 right-4 w-8 h-12 bg-gray-400 border-2 border-gray-600"></div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gray-500 border-2 border-gray-700">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gray-800 rounded-t"></div>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 border border-black"></div>
              {/* Dragon statue on top */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-full">
                <div className="absolute top-1 left-1 w-1 h-1 bg-red-600 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl animate-bounce">🏰</div>
          </button>

          {/* Shop (clickable to enter) */}
          <button
            onClick={handleShopClick}
            className="relative transform transition hover:scale-110 cursor-pointer"
          >
            <div className="w-28 h-40 bg-gradient-to-b from-amber-600 to-amber-700 border-4 border-amber-800 relative">
              {/* Shop roof */}
              <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-red-600 to-red-700 border-2 border-red-800 transform -skew-x-12"></div>
              <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-red-600 to-red-700 border-2 border-red-800 transform skew-x-12"></div>
              {/* Shop windows */}
              <div className="absolute top-8 left-2 w-6 h-8 bg-yellow-200 border-2 border-amber-900">
                <div className="absolute top-1 left-1 right-1 bottom-1 bg-yellow-300 border border-amber-800"></div>
              </div>
              <div className="absolute top-8 right-2 w-6 h-8 bg-yellow-200 border-2 border-amber-900">
                <div className="absolute top-1 left-1 right-1 bottom-1 bg-yellow-300 border border-amber-800"></div>
              </div>
              {/* Shop door */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-16 bg-amber-800 border-2 border-amber-900 rounded-t">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-600 rounded-full"></div>
              </div>
              {/* Shop sign */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-300 border-2 border-amber-900 rounded">
                <div className="text-xs font-bold text-amber-900 text-center leading-tight">SHOP</div>
              </div>
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl animate-bounce">🏪</div>
          </button>

          {/* Tents */}
          <div className="relative">
            <div className="w-16 h-12 bg-gradient-to-br from-red-700 to-red-800 border-2 border-red-900 transform -skew-x-12"></div>
            <div className="absolute top-0 left-4 w-12 h-10 bg-gradient-to-br from-red-700 to-red-800 border-2 border-red-900 transform skew-x-12"></div>
            <div className="absolute top-1 left-6 w-3 h-3 bg-white border border-black text-xs flex items-center justify-center">X</div>
          </div>
        </div>

        {/* Ground/Path */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-green-400 to-green-500">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-700 to-amber-800 opacity-60"></div>
        </div>

        {/* Character Info Panel */}
        <div className="absolute bottom-4 left-4 bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 rounded-lg shadow-2xl p-4" style={{ zIndex: 10 }}>
          <div className="flex items-start gap-4">
            {/* Character Portrait */}
            <div 
              ref={portraitRef}
              className="relative w-20 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full border-4 border-amber-600 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
              style={{ zIndex: 1000 }}
              onMouseEnter={() => {
                if (portraitRef.current) {
                  const tooltipWidth = 500
                  const padding = 20
                  
                  // Position it at the very top center of the viewport
                  const finalLeft = Math.max(padding, (window.innerWidth - tooltipWidth) / 2)
                  const finalTop = 10 // Position at very top of viewport
                  
                  console.log('Tooltip position:', { 
                    top: finalTop, 
                    left: finalLeft,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    scrollY: window.scrollY
                  })
                  
                  setTooltipPosition({
                    top: finalTop,
                    left: finalLeft
                  })
                  setShowStatsTooltip(true)
                } else {
                  console.log('Portrait ref is null!')
                }
              }}
              onMouseLeave={() => {
                console.log('Mouse left portrait')
                setShowStatsTooltip(false)
              }}
            >
              <div className="text-4xl">🧙</div>
              
              {/* Stats Tooltip - Rendered via Portal */}
              {showStatsTooltip && tooltipPosition.top > 0 && createPortal(
                <div 
                  className="fixed animate-fade-in" 
                  style={{ 
                    position: 'fixed',
                    width: '500px',
                    maxWidth: '500px',
                    zIndex: 99999,
                    pointerEvents: 'none',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxHeight: 'calc(100vh - 20px)',
                    overflowY: 'auto'
                  }}
                >
                  <div 
                    className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl p-6 min-w-96"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => setShowStatsTooltip(true)}
                    onMouseLeave={() => setShowStatsTooltip(false)}
                  >
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-0 left-8 transform translate-y-full">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-800"></div>
                    </div>
                    
                    <div className="text-amber-900">
                      {/* Character Profile */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">Race:</span>
                          <span className="text-blue-800 font-semibold">Human</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">Class:</span>
                          <span className="text-purple-800 font-semibold">Warrior</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">Clan:</span>
                          <span className="text-gray-700 font-semibold">None</span>
                        </div>
                      </div>

                      {/* Information Section */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">Level:</span>
                          <span className="text-blue-700 font-bold">{player.level}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">Experience:</span>
                          <span className="text-purple-700 font-bold">{player.xp || 0} / {player.level * 1000} XP</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">Gold:</span>
                          <span className="text-yellow-700 font-bold">{player.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Tokens:</span>
                          <span className="text-green-700 font-bold">0</span>
                        </div>
                      </div>

                      {/* Combat Defense */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Combat Defense</h5>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Melee:</span>
                            <span className="font-bold text-red-700">{Math.floor(player.level * 2) + 30}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ranged:</span>
                            <span className="font-bold text-blue-700">{Math.floor(player.level * 1.8) + 25}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Magic:</span>
                            <span className="font-bold text-purple-700">{Math.floor(player.level * 1.8) + 25}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Attributes</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { label: 'Strength',  base: Math.floor(player.level * 10) + 50, bonus: (player.bonusStats?.strength  || 0), color: 'text-red-700'    },
                            { label: 'Dexterity', base: Math.floor(player.level * 7)  + 35, bonus: (player.bonusStats?.dexterity || 0), color: 'text-purple-700' },
                            { label: 'Intellect', base: Math.floor(player.level * 8)  + 40, bonus: (player.bonusStats?.intellect || 0), color: 'text-blue-700'   },
                            { label: 'Endurance', base: Math.floor(player.level * 9)  + 45, bonus: (player.bonusStats?.endurance || 0), color: 'text-orange-700' },
                            { label: 'Charisma',  base: Math.floor(player.level * 6)  + 30, bonus: (player.bonusStats?.charisma  || 0), color: 'text-pink-700'   },
                            { label: 'Luck',      base: Math.floor(player.level * 5)  + 25, bonus: (player.bonusStats?.luck      || 0), color: 'text-yellow-700' },
                          ].map(({ label, base, bonus, color }) => (
                            <div key={label} className="flex justify-between">
                              <span>{label}:</span>
                              <span className={`font-bold ${color}`}>{base + bonus}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Element Modifier */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Element Modifier</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Fire:</span>
                            <span className="font-bold text-red-600">{Math.round(elementModifiers.fire)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Water:</span>
                            <span className="font-bold text-blue-600">{Math.round(elementModifiers.water)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wind:</span>
                            <span className="font-bold text-green-600">{Math.round(elementModifiers.wind)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ice:</span>
                            <span className="font-bold text-cyan-600">{Math.round(elementModifiers.ice)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Earth:</span>
                            <span className="font-bold text-amber-600">{Math.round(elementModifiers.earth)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Energy:</span>
                            <span className="font-bold text-yellow-600">{Math.round(elementModifiers.energy)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Light:</span>
                            <span className="font-bold text-yellow-300">{Math.round(elementModifiers.light)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Darkness:</span>
                            <span className="font-bold text-gray-800">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Equipment */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Equipment</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { slot: 'weapon', defaultIcon: '⚔️', label: 'Weapon',  fallback: 'None' },
                            { slot: 'helmet', defaultIcon: '🪖', label: 'Helmet',  fallback: 'None' },
                            { slot: 'armor',  defaultIcon: '🛡️', label: 'Armor',   fallback: 'None' },
                            { slot: 'boots',  defaultIcon: '👢', label: 'Boots',   fallback: 'None' },
                          ].map(({ slot, defaultIcon, label, fallback }) => {
                            const item = (player.equipped || {})[slot]
                            return (
                              <div key={slot} className="flex items-center gap-2">
                                <span>{item ? item.icon : defaultIcon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-gray-600">{label}:</div>
                                  <div className="font-semibold truncate">{item ? item.name : fallback}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Consumables */}
                      <div>
                        <h5 className="font-bold mb-2 text-amber-800">Consumables</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">🧪</span>
                            <span>HP Potion:</span>
                            <span className="font-bold text-red-700">x{player.healthPotions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">💧</span>
                            <span>MP Potion:</span>
                            <span className="font-bold text-blue-700">x{player.manaPotions || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
            
            <div className="flex-1 min-w-48">
              <h3 className="text-yellow-200 font-bold text-lg mb-2">{player.name}</h3>
              
              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-yellow-200 mb-1">
                  <span>HP</span>
                  <span>{player.hp} / {player.maxHp}</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                    style={{ width: `${hpPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* MP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-yellow-200 mb-1">
                  <span>MP</span>
                  <span>{player.mp} / {player.maxMp}</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                    style={{ width: `${mpPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* SP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-yellow-200 mb-1">
                  <span>SP</span>
                  <span>{player.sp} / {player.maxSp}</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300"
                    style={{ width: `${spPercentage}%` }}
                  ></div>
                </div>
              </div>

              <button className="mt-2 w-full bg-amber-900 hover:bg-amber-950 text-yellow-200 font-bold py-1 px-3 rounded border-2 border-amber-700 text-xs">
                Options
              </button>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <h2 className="text-4xl font-bold text-yellow-400 drop-shadow-2xl" style={{
            textShadow: '3px 3px 0px #8b6914, 5px 5px 15px rgba(0,0,0,0.8)',
            fontFamily: 'Georgia, serif'
          }}>
            Adventure Quest
          </h2>
        </div>

        {/* Navigation Menu */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button 
            onClick={handleBattleClick}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2 px-6 rounded-lg border-4 border-yellow-400 shadow-lg transform transition hover:scale-105 text-sm"
          >
            Battle Monsters
          </button>
          <button 
            onClick={() => navigate('/character')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm"
          >
            Character Page
          </button>
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm">
            House
          </button>
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm">
            Ballyhoo and Upgrades
          </button>
          <button 
            onClick={onLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Click hint */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
          Click the castle or shop to enter, or use the navigation buttons!
        </div>
      </div>

      {/* Travel Map Modal */}
      {showTravelMap && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowTravelMap(false)}
        >
          <div
            className="relative animate-fade-in"
            style={{ width: '90vw', height: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Parchment map background */}
            <div
              className="w-full h-full rounded-xl border-8 border-amber-900 shadow-2xl overflow-hidden relative"
              style={{
                background: 'radial-gradient(ellipse at center, #f5e6c8 0%, #e8d5a3 40%, #d4b87a 100%)',
                backgroundImage: `radial-gradient(ellipse at center, #f5e6c8 0%, #e8d5a3 40%, #d4b87a 100%),
                  url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
              }}
            >
              {/* Title */}
              <div className="absolute top-3 left-4 z-10">
                <div className="font-semibold opacity-70" style={{ fontSize: 'clamp(0.85rem,1.5vw,1.1rem)', color: '#92400e' }}>Beautifully wrong map of</div>
                <div className="font-bold leading-none" style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(3.6rem, 8vw, 7rem)',
                  color: '#7c4f1a',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}>
                  LORE
                </div>
              </div>

              {/* Italic flavour text */}
              <div className="absolute z-10" style={{ right: '10%', top: '18%' }}>
                <div className="italic opacity-80 text-center leading-tight" style={{ fontSize: 'clamp(0.8rem,1.4vw,1.1rem)', color: '#1d4ed8' }}>
                  The great, um,<br/>Giant Puddle...?
                </div>
              </div>

              {/* SVG paths */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {MAP_PATHS.map(([[x1,y1],[x2,y2]], i) => (
                  <line
                    key={i}
                    x1={`${x1}%`} y1={`${y1}%`}
                    x2={`${x2}%`} y2={`${y2}%`}
                    stroke="#a07840"
                    strokeWidth="2.5"
                    strokeDasharray="6,5"
                    opacity="0.7"
                  />
                ))}
              </svg>

              {/* Locations */}
              {MAP_LOCATIONS.map(loc => (
                <div
                  key={loc.name}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${loc.x}%`,
                    top: `${loc.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                >
                  <div style={{ fontSize: loc.bold ? 'clamp(2.8rem,5vw,4rem)' : 'clamp(1.8rem,3.6vw,2.8rem)' }}>
                    {loc.icon}
                  </div>
                  <div
                    className="text-center mt-1 leading-tight"
                    style={{
                      fontSize: 'clamp(0.75rem, 1.4vw, 1.1rem)',
                      fontFamily: 'Georgia, serif',
                      fontWeight: loc.bold ? 'bold' : 'normal',
                      color: loc.bold ? '#4a2800' : '#6b4420',
                      textShadow: '0 0 4px rgba(245,230,200,0.9)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {loc.name}
                  </div>
                </div>
              ))}

              {/* Compass rose */}
              <div className="absolute z-10 flex flex-col items-center" style={{ right: '5%', bottom: '8%' }}>
                <div style={{ fontSize: '4rem' }}>🧭</div>
                <div className="grid grid-cols-3 font-bold text-amber-800 text-center" style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
                  <div></div><div>N</div><div></div>
                  <div>W</div><div style={{ fontSize: '1.4rem' }}>✦</div><div>E</div>
                  <div></div><div>S</div><div></div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowTravelMap(false)}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg border-4 border-red-900 shadow-lg z-20"
                style={{ fontSize: '1.5rem', padding: '10px 48px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default TownScreen

