import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export const REIGN_QUEST_ENEMIES = {
  1: {
    name: 'Sand Golem',
    icon: '🗿', element: 'Earth', elementIcon: '🌍', speed: 20, level: 42,
    hp: 2200, maxHp: 2200, mp: 100, maxMp: 100,
    xpReward: 900, goldReward: 280,
    elementResistances: { fire: 100, water: 150, wind: 200, ice: 100, earth: 0, energy: 150, light: 100, darkness: 100, physical: 50 },
  },
  2: {
    name: 'Desert Viper',
    icon: '🐍', element: 'Water', elementIcon: '💧', speed: 70, level: 44,
    hp: 2500, maxHp: 2500, mp: 250, maxMp: 250,
    xpReward: 1050, goldReward: 320,
    elementResistances: { fire: 150, water: 0, wind: 100, ice: 130, earth: 100, energy: 100, light: 100, darkness: 100, physical: 80 },
  },
  3: {
    name: 'Dune Raider',
    icon: '🏜️', element: 'Fire', elementIcon: '🔥', speed: 60, level: 46,
    hp: 2800, maxHp: 2800, mp: 300, maxMp: 300,
    xpReward: 1200, goldReward: 370,
    elementResistances: { fire: 0, water: 200, wind: 100, ice: 180, earth: 80, energy: 100, light: 100, darkness: 100, physical: 90 },
  },
  4: {
    name: 'Scorpion Brute',
    icon: '🦂', element: 'Earth', elementIcon: '🌍', speed: 45, level: 48,
    hp: 3200, maxHp: 3200, mp: 180, maxMp: 180,
    xpReward: 1400, goldReward: 430,
    elementResistances: { fire: 100, water: 130, wind: 150, ice: 100, earth: 0, energy: 120, light: 100, darkness: 100, physical: 60 },
  },
  5: {
    name: 'Sandstorm Drake',
    icon: '🌪️', element: 'Wind', elementIcon: '🌪️', speed: 85, level: 50,
    hp: 3700, maxHp: 3700, mp: 420, maxMp: 420,
    xpReward: 1650, goldReward: 500,
    elementResistances: { fire: 100, water: 100, wind: 0, ice: 130, earth: 200, energy: 100, light: 100, darkness: 100, physical: 80 },
  },
  6: {
    name: 'Reign Guardian',
    title: 'Keeper of the Golden Plate',
    icon: '👑', element: 'Light', elementIcon: '✨', speed: 55, level: 56,
    hp: 5500, maxHp: 5500, mp: 800, maxMp: 800,
    xpReward: 3500, goldReward: 1200,
    elementResistances: { fire: 130, water: 130, wind: 130, ice: 130, earth: 130, energy: 100, light: 0, darkness: 250, physical: 80 },
  },
}

const STAGE_LABELS = { 1: 'S1', 2: 'S2', 3: 'S3', 4: 'S4', 5: 'S5', 6: '👑' }

const PATH_NODES = [
  { stage: 1, label: 'Shifting Sands',   icon: '🗿', x: 10, y: 72 },
  { stage: 2, label: 'Oasis Ruins',      icon: '🐍', x: 28, y: 55 },
  { stage: 3, label: 'Raider Camp',      icon: '🏜️', x: 48, y: 42 },
  { stage: 4, label: 'Scorpion\'s Lair', icon: '🦂', x: 65, y: 55 },
  { stage: 5, label: 'Eye of the Storm', icon: '🌪️', x: 80, y: 42 },
  { stage: 6, label: 'Reign Sanctum',    icon: '👑', x: 90, y: 25 },
]

export default function ReignQuestScreen() {
  const navigate = useNavigate()
  const { player, startBattle } = useGame()
  const progress = player.reignQuestProgress || 0
  const nextStage = Math.min(progress + 1, 6)
  const [selectedStage, setSelectedStage] = useState(nextStage)
  const questComplete = progress >= 6

  const sel = REIGN_QUEST_ENEMIES[selectedStage]
  const isBoss = selectedStage === 6

  const handleFight = () => {
    startBattle(REIGN_QUEST_ENEMIES[selectedStage], 'reignQuest', selectedStage)
    navigate('/battle')
  }

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #e8c96a 0%, #d4a030 40%, #a06820 100%)' }}>

      {/* Sun + heat haze */}
      <div style={{ position:'absolute', top:'5%', right:'8%', width:90, height:90, borderRadius:'50%',
        background:'radial-gradient(circle,#fff9c4,#fbbf24)', boxShadow:'0 0 50px 25px rgba(251,191,36,0.5)', zIndex:1 }} />
      <div style={{ position:'absolute', top:'48%', left:0, right:0, height:8,
        background:'linear-gradient(90deg,transparent,rgba(255,230,100,0.5),transparent)', filter:'blur(4px)', zIndex:1 }} />

      {/* Dunes */}
      {[
        { left:'-8%', w:'40%', h:'28%', b:'18%', op:0.6 },
        { left:'50%', w:'55%', h:'24%', b:'18%', op:0.5 },
      ].map((d,i)=>(
        <div key={i} style={{ position:'absolute', left:d.left, width:d.w, height:d.h, bottom:d.b,
          background:'radial-gradient(ellipse 100% 60% at 50% 100%,#c8902a,#f0c860)',
          borderRadius:'50% 50% 0 0', opacity:d.op }} />
      ))}

      <div className="relative z-10 flex gap-5 items-start w-full max-w-5xl mx-4">

        {/* LEFT — stage ladder */}
        <div style={{ width:160, flexShrink:0,
          background:'rgba(60,30,0,0.75)', border:'2px solid #c8a030',
          borderRadius:10, padding:'12px 8px', maxHeight:'90vh', overflowY:'auto' }}>
          <div style={{ color:'#ffd87a', fontFamily:'Georgia,serif', fontSize:13, fontWeight:'bold',
            textAlign:'center', marginBottom:10 }}>
            🏜️ Reign Quest
          </div>
          {[1,2,3,4,5,6].map(stage => {
            const cleared = progress >= stage
            const isNext = stage === nextStage
            const locked = stage > nextStage
            const node = PATH_NODES[stage - 1]
            return (
              <div key={stage}
                onClick={() => !locked && setSelectedStage(stage)}
                style={{
                  display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                  marginBottom:4, borderRadius:8, cursor: locked ? 'not-allowed' : 'pointer',
                  border: selectedStage===stage ? '2px solid #ffd87a' : '2px solid transparent',
                  background: selectedStage===stage
                    ? 'rgba(200,160,48,0.35)'
                    : cleared ? 'rgba(80,160,80,0.2)'
                    : isNext ? 'rgba(200,120,30,0.25)'
                    : 'rgba(0,0,0,0.2)',
                  opacity: locked ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize:18, minWidth:26 }}>
                  {cleared ? '✅' : isNext ? node.icon : '🔒'}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ color: cleared ? '#86efac' : isNext ? '#fde68a' : '#9ca3af',
                    fontSize:11, fontWeight:'bold' }}>
                    {STAGE_LABELS[stage]}
                    {stage===6 ? ' BOSS' : ''}
                  </div>
                  <div style={{ color:'#c4a87a', fontSize:9 }}>{node.label}</div>
                </div>
              </div>
            )
          })}
          <div style={{ marginTop:10, padding:'6px 8px', background:'rgba(0,0,0,0.3)',
            borderRadius:6, textAlign:'center' }}>
            <div style={{ color:'#ffd87a', fontSize:10, fontWeight:'bold' }}>
              Progress: {progress}/6
            </div>
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:4, height:6, marginTop:4 }}>
              <div style={{ background:'linear-gradient(to right,#f59e0b,#fbbf24)',
                width:`${(progress/6)*100}%`, height:'100%', borderRadius:4 }} />
            </div>
          </div>
        </div>

        {/* CENTRE — path map */}
        <div style={{ flex:1, position:'relative', height:420,
          background:'linear-gradient(135deg,#c8902a,#e8b84a)',
          border:'3px solid #a06020', borderRadius:12, overflow:'hidden' }}>

          {/* Sand texture dots */}
          {Array.from({length:40}).map((_,i)=>(
            <div key={i} style={{
              position:'absolute',
              left:`${(i*37)%100}%`, top:`${(i*23+i*7)%100}%`,
              width:3, height:3, borderRadius:'50%',
              background:'rgba(160,100,20,0.3)',
            }} />
          ))}

          {/* Path lines */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
            {PATH_NODES.slice(0,-1).map((node,i)=>{
              const next = PATH_NODES[i+1]
              return (
                <line key={i}
                  x1={`${node.x}%`} y1={`${node.y}%`}
                  x2={`${next.x}%`} y2={`${next.y}%`}
                  stroke={progress > i ? '#ffd87a' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={progress > i ? 3 : 2}
                  strokeDasharray={progress > i ? 'none' : '6 4'}
                />
              )
            })}
          </svg>

          {/* Stage nodes */}
          {PATH_NODES.map(node => {
            const cleared = progress >= node.stage
            const isNext = node.stage === nextStage
            const locked = node.stage > nextStage
            return (
              <div key={node.stage}
                onClick={() => !locked && setSelectedStage(node.stage)}
                style={{
                  position:'absolute', left:`${node.x}%`, top:`${node.y}%`,
                  transform:'translate(-50%,-50%)',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                }}>
                <div style={{
                  width: node.stage===6 ? 56 : 44, height: node.stage===6 ? 56 : 44,
                  borderRadius:'50%',
                  background: cleared ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : isNext ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                    : 'rgba(0,0,0,0.35)',
                  border: selectedStage===node.stage ? '3px solid #ffd87a'
                    : node.stage===6 ? '3px solid #fbbf24'
                    : '2px solid rgba(255,255,255,0.4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: node.stage===6 ? 26 : 20,
                  boxShadow: isNext ? '0 0 14px rgba(245,158,11,0.8)' : 'none',
                  animation: isNext && !cleared ? 'pulse 1.5s infinite' : 'none',
                }}>
                  {cleared ? '✅' : locked ? '🔒' : node.icon}
                </div>
                <div style={{ color:'#fff8dc', fontSize:9, fontWeight:'bold',
                  textShadow:'0 1px 2px rgba(0,0,0,0.8)', textAlign:'center', whiteSpace:'nowrap' }}>
                  {node.label}
                </div>
              </div>
            )
          })}

          {questComplete && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              background:'rgba(0,0,0,0.45)', borderRadius:12 }}>
              <div style={{ textAlign:'center', color:'#ffd87a', fontFamily:'Georgia,serif' }}>
                <div style={{ fontSize:48 }}>🏆</div>
                <div style={{ fontSize:20, fontWeight:'bold', marginTop:8 }}>Quest Complete!</div>
                <div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>The Reign Armoury is unlocked.</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — enemy detail */}
        <div style={{ width:220, flexShrink:0,
          background:'rgba(60,30,0,0.75)', border:'2px solid #c8a030',
          borderRadius:10, overflow:'hidden' }}>

          {/* Banner */}
          <div style={{ background:'linear-gradient(to bottom,#8B5E3C,#5c3410)',
            borderBottom:'2px solid #c8a030', padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:40 }}>{sel.icon}</div>
            <div style={{ color:'#ffd87a', fontFamily:'Georgia,serif', fontWeight:'bold',
              fontSize:14, marginTop:4 }}>{sel.name}</div>
            {sel.title && <div style={{ color:'#c4a87a', fontSize:10, marginTop:2 }}>{sel.title}</div>}
            {isBoss && <div style={{ color:'#f59e0b', fontSize:11, fontWeight:'bold', marginTop:4 }}>⚠️ BOSS</div>}
          </div>

          {/* Stats parchment */}
          <div style={{ padding:'10px 12px', background:'linear-gradient(160deg,#f5e6c8,#e8d0a0)',
            margin:8, borderRadius:6, border:'2px solid #8B6914', fontSize:12, lineHeight:1.8 }}>
            <div><span style={{ color:'#5c3410', fontWeight:'bold' }}>Element: </span>
              <span>{sel.elementIcon} {sel.element}</span></div>
            <div><span style={{ color:'#5c3410', fontWeight:'bold' }}>HP: </span>
              <span style={{ color:'#c00', fontWeight:'bold' }}>{sel.hp.toLocaleString()}</span></div>
            <div><span style={{ color:'#5c3410', fontWeight:'bold' }}>Level: </span>{sel.level}</div>
            <div><span style={{ color:'#5c3410', fontWeight:'bold' }}>XP: </span>
              <span style={{ color:'#7c3aed' }}>{sel.xpReward.toLocaleString()}</span></div>
            <div><span style={{ color:'#5c3410', fontWeight:'bold' }}>Gold: </span>
              <span style={{ color:'#b45309' }}>🪙 {sel.goldReward}</span></div>
            {isBoss && (
              <div style={{ marginTop:6, padding:'4px 6px', background:'rgba(245,158,11,0.2)',
                borderRadius:4, color:'#92400e', fontSize:10, textAlign:'center' }}>
                🏆 Defeat to unlock<br/>the Reign Armoury!
              </div>
            )}
          </div>

          {/* Fight button */}
          <div style={{ padding:'0 12px 14px' }}>
            {questComplete && selectedStage === 6 ? (
              <button
                onClick={() => navigate('/reign-shop')}
                style={{ width:'100%', padding:'10px 0', borderRadius:8, fontWeight:'bold',
                  fontSize:14, cursor:'pointer', color:'#fff8dc',
                  background:'linear-gradient(to bottom,#d4a030,#8B6010)',
                  border:'3px solid #ffd87a', boxShadow:'0 3px 0 #4a2c0a' }}>
                🏆 Reign Armoury
              </button>
            ) : (
              <button
                onClick={handleFight}
                disabled={selectedStage > nextStage}
                style={{ width:'100%', padding:'10px 0', borderRadius:8, fontWeight:'bold',
                  fontSize:14, cursor: selectedStage > nextStage ? 'not-allowed' : 'pointer',
                  color: selectedStage > nextStage ? '#999' : '#fff2cc',
                  background: selectedStage > nextStage
                    ? 'linear-gradient(to bottom,#888,#555)'
                    : isBoss
                      ? 'linear-gradient(to bottom,#d4a030,#8B6010)'
                      : 'linear-gradient(to bottom,#c8860a,#8B5E0A)',
                  border: isBoss ? '3px solid #ffd87a' : '2px solid #4a2c0a',
                  boxShadow: selectedStage > nextStage ? 'none' : '0 3px 0 #4a2c0a' }}>
                {selectedStage > nextStage ? '🔒 Locked' : isBoss ? '⚔️ Challenge Boss' : '⚔️ Fight!'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/swordhaven')}
        style={{
          position:'absolute', top:16, left:16, zIndex:40,
          background:'linear-gradient(to bottom,#c8860a,#8B5E0A)',
          border:'2px solid #4a2c0a', borderRadius:8, padding:'8px 16px',
          color:'#fff2cc', fontWeight:'bold', fontSize:13, cursor:'pointer',
        }}>
        ← Swordhaven
      </button>
    </div>
  )
}
