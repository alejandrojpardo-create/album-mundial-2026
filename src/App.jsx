import { useState, useEffect, useRef } from 'react'
import {
  registerUser, loginUser,
  getCollection, saveCollection,
  getAllCollections,
  getInbox, sendMessage,
} from './lib/db.js'

// ─── DATOS DEL ÁLBUM ─────────────────────────────────────────────────────────

const PAGES = [
  { code:'FWC', name:'FIFA World Cup 2026', flag:'🌍',  n:19 },
  { code:'MEX', name:'México',              flag:'🇲🇽', n:20 },
  { code:'RSA', name:'Sudáfrica',           flag:'🇿🇦', n:20 },
  { code:'KOR', name:'Corea del Sur',       flag:'🇰🇷', n:20 },
  { code:'CAN', name:'Canadá',              flag:'🇨🇦', n:20 },
  { code:'BIH', name:'Bosnia-Herzegovina',  flag:'🇧🇦', n:20 },
  { code:'QAT', name:'Qatar',               flag:'🇶🇦', n:20 },
  { code:'SUI', name:'Suiza',               flag:'🇨🇭', n:20 },
  { code:'BRA', name:'Brasil',              flag:'🇧🇷', n:20 },
  { code:'MAR', name:'Marruecos',           flag:'🇲🇦', n:20 },
  { code:'HAI', name:'Haití',               flag:'🇭🇹', n:20 },
  { code:'SCO', name:'Escocia',             flag:'🏴',   n:20 },
  { code:'USA', name:'Estados Unidos',      flag:'🇺🇸', n:20 },
  { code:'PAR', name:'Paraguay',            flag:'🇵🇾', n:20 },
  { code:'AUS', name:'Australia',           flag:'🇦🇺', n:20 },
  { code:'TUR', name:'Turquía',             flag:'🇹🇷', n:20 },
  { code:'GER', name:'Alemania',            flag:'🇩🇪', n:20 },
  { code:'CUW', name:'Curazao',             flag:'🇨🇼', n:20 },
  { code:'CIV', name:'Costa de Marfil',     flag:'🇨🇮', n:20 },
  { code:'ECU', name:'Ecuador',             flag:'🇪🇨', n:20 },
  { code:'NED', name:'Países Bajos',        flag:'🇳🇱', n:20 },
  { code:'JPN', name:'Japón',               flag:'🇯🇵', n:20 },
  { code:'SWE', name:'Suecia',              flag:'🇸🇪', n:20 },
  { code:'TUN', name:'Túnez',               flag:'🇹🇳', n:20 },
  { code:'BEL', name:'Bélgica',             flag:'🇧🇪', n:20 },
  { code:'CZE', name:'Rep. Checa',          flag:'🇨🇿', n:20 },
  { code:'EGY', name:'Egipto',              flag:'🇪🇬', n:20 },
  { code:'IRN', name:'Irán',                flag:'🇮🇷', n:20 },
  { code:'NZL', name:'Nueva Zelanda',       flag:'🇳🇿', n:20 },
  { code:'ESP', name:'España',              flag:'🇪🇸', n:20 },
  { code:'CPV', name:'Cabo Verde',          flag:'🇨🇻', n:20 },
  { code:'KSA', name:'Arabia Saudita',      flag:'🇸🇦', n:20 },
  { code:'URU', name:'Uruguay',             flag:'🇺🇾', n:20 },
  { code:'FRA', name:'Francia',             flag:'🇫🇷', n:20 },
  { code:'SEN', name:'Senegal',             flag:'🇸🇳', n:20 },
  { code:'IRQ', name:'Irak',                flag:'🇮🇶', n:20 },
  { code:'NOR', name:'Noruega',             flag:'🇳🇴', n:20 },
  { code:'ARG', name:'Argentina',           flag:'🇦🇷', n:20 },
  { code:'ALG', name:'Argelia',             flag:'🇩🇿', n:20 },
  { code:'AUT', name:'Austria',             flag:'🇦🇹', n:20 },
  { code:'JOR', name:'Jordania',            flag:'🇯🇴', n:20 },
  { code:'POR', name:'Portugal',            flag:'🇵🇹', n:20 },
  { code:'COD', name:'Congo DR',            flag:'🇨🇩', n:20 },
  { code:'UZB', name:'Uzbekistán',          flag:'🇺🇿', n:20 },
  { code:'COL', name:'Colombia',            flag:'🇨🇴', n:20 },
  { code:'ENG', name:'Inglaterra',          flag:'🏴',   n:20 },
  { code:'CRO', name:'Croacia',             flag:'🇭🇷', n:20 },
  { code:'GHA', name:'Ghana',               flag:'🇬🇭', n:20 },
  { code:'PAN', name:'Panamá',              flag:'🇵🇦', n:20 },
  { code:'CC',  name:'Copa y Ceremonias',   flag:'🏆',   n:14 },
]
const TOTAL = PAGES.reduce((s, p) => s + p.n, 0) // 987

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────

const C = {
  bg:'#0c1220', surface:'#111827', card:'#162032',
  border:'#1e2d4a', border2:'#1e3a5f',
  gold:'#f59e0b', green:'#10b981', red:'#f87171', blue:'#3b82f6',
  text:'#e2e8f0', muted:'#64748b', dim:'#334155',
}
const navBtn = (active, accent = C.gold) => ({
  padding:'5px 13px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:active?600:400,
  background:active?`${accent}22`:'transparent',
  color:active?accent:C.muted,
  border:active?`1px solid ${accent}55`:'1px solid transparent',
  transition:'all 0.15s',
})
const INPUT = {
  padding:'11px 14px', borderRadius:10, background:'#0a0f1e',
  border:`1px solid ${C.border2}`, color:C.text, fontSize:14,
  outline:'none', width:'100%', boxSizing:'border-box',
}

// ─── COMPONENTES UI ──────────────────────────────────────────────────────────

function Chip({ num, owned, dupes, onClick }) {
  const hasDupe = dupes > 0
  return (
    <button
      onClick={onClick}
      title={hasDupe ? `${num} · ×${dupes} repetida(s)` : owned ? `${num} · tengo` : `${num} · me falta`}
      style={{
        width:40, height:40, borderRadius:7, cursor:'pointer', flexShrink:0,
        border:`1px solid ${hasDupe?'#d9770644':owned?'#05966944':C.border}`,
        background: hasDupe ? 'linear-gradient(135deg,#92400e,#d97706)'
                  : owned   ? 'linear-gradient(135deg,#064e3b,#059669)'
                  : C.card,
        color:(owned||hasDupe)?'#fff':C.dim,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:0, lineHeight:1.1, fontWeight:700, transition:'transform 0.08s',
        boxShadow: hasDupe?'0 0 10px #d9770633':owned?'0 0 8px #05966933':'none',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.18)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{ fontSize:13 }}>{num}</span>
      {hasDupe && <span style={{ fontSize:9, opacity:0.9 }}>×{dupes}</span>}
      {owned && !hasDupe && <span style={{ fontSize:9 }}>✓</span>}
    </button>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ flex:1, textAlign:'center', padding:'8px 4px' }}>
      <div style={{ fontSize:22, fontWeight:800, color, fontFamily:'monospace' }}>{value}</div>
      <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{label}</div>
    </div>
  )
}

function Tag({ text, color }) {
  return (
    <span style={{ background:`${color}20`, border:`1px solid ${color}44`, borderRadius:5, padding:'2px 7px', fontSize:11, color, whiteSpace:'nowrap' }}>
      {text}
    </span>
  )
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'50px 20px', color:C.muted }}>
      <div style={{ fontSize:44, marginBottom:14 }}>{icon}</div>
      <div style={{ fontSize:18, fontWeight:700, color:'#475569', marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:13 }}>{sub}</div>
    </div>
  )
}

// ─── PANTALLA AUTH ───────────────────────────────────────────────────────────

function AuthScreen({ mode, setMode, form, setForm, onSubmit, error, loading }) {
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.bg},#0c2a50,${C.bg})`, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'rgba(10,15,30,0.97)', borderRadius:20, padding:'40px 32px', width:'100%', maxWidth:420, border:`1px solid ${C.border2}`, boxShadow:'0 25px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:52 }}>⚽</div>
          <h1 style={{ fontSize:30, fontWeight:900, color:C.gold, letterSpacing:3, margin:'10px 0 6px', textTransform:'uppercase' }}>MUNDIAL 2026</h1>
          <p style={{ color:C.muted, fontSize:13 }}>Organizá tu álbum de figuritas</p>
        </div>

        <div style={{ display:'flex', background:'#0a0f1e', borderRadius:12, padding:3, marginBottom:24, gap:3 }}>
          {[['login','Iniciar sesión'],['register','Registrarse']].map(([m,l]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'9px', borderRadius:9, border:'none', cursor:'pointer', fontSize:14, fontWeight:500, transition:'all 0.15s', background:mode===m?C.gold:'transparent', color:mode===m?'#0a0f1e':C.muted }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mode === 'register' && (
            <input placeholder="Nombre completo (ej: Juan Pérez)" value={form.name} onChange={e => setForm({...form, name:e.target.value})} style={INPUT} />
          )}
          <input
            placeholder="Usuario (sin espacios, minúsculas)"
            value={form.username}
            onChange={e => setForm({...form, username:e.target.value.toLowerCase().replace(/\s/g,'')})}
            onKeyDown={e => e.key==='Enter' && onSubmit()}
            style={INPUT}
          />
          <input
            type="password" placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({...form, password:e.target.value})}
            onKeyDown={e => e.key==='Enter' && onSubmit()}
            style={INPUT}
          />
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid #7f1d1d', borderRadius:8, padding:'8px 12px', color:'#fca5a5', fontSize:13, textAlign:'center' }}>
              {error}
            </div>
          )}
          <button onClick={onSubmit} disabled={loading} style={{ padding:'13px', borderRadius:12, background:loading?'#1e2d4a':`linear-gradient(135deg,#b45309,${C.gold})`, color:loading?C.muted:'#0a0f1e', fontWeight:800, border:'none', cursor:loading?'not-allowed':'pointer', letterSpacing:2, fontSize:17, marginTop:4, transition:'all 0.2s', textTransform:'uppercase' }}>
            {loading ? 'Verificando...' : mode==='login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ÁLBUM ───────────────────────────────────────────────────────────────────

function AlbumScreen({ col, filter, setFilter, toggle, stats }) {
  const [hint, setHint] = useState(true)
  return (
    <div style={{ padding:14 }}>
      <div style={{ display:'flex', gap:10, marginBottom:14, background:C.surface, borderRadius:12, padding:'10px 14px', border:`1px solid ${C.border}` }}>
        <Stat label="Tengo"      value={stats.owned}     color={C.green} />
        <Stat label="Me faltan"  value={stats.missing}   color={C.red}   />
        <Stat label="Repetidas"  value={stats.dupeCount} color={C.gold}  />
        <Stat label="Completado" value={`${stats.pct}%`} color={C.blue}  />
      </div>

      {hint && (
        <div style={{ background:'#162032', border:`1px solid ${C.border2}`, borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:12, color:C.muted, display:'flex', gap:10, alignItems:'center' }}>
          <span>
            💡 <strong style={{color:C.text}}>Cómo marcar:</strong>{' '}
            1er clic = <span style={{color:C.green}}>✓ la tengo</span> ·{' '}
            2do clic = <span style={{color:C.gold}}>×1 repetida</span> ·{' '}
            Más clics = más repetidas · Al llegar a ×10 vuelve a "me falta"
          </span>
          <button onClick={() => setHint(false)} style={{ marginLeft:'auto', background:'transparent', border:'none', color:C.muted, cursor:'pointer', fontSize:16, flexShrink:0 }}>✕</button>
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {[['all','Todas'],['owned','✓ Tengo'],['missing','✗ Me faltan'],['dupes','× Repetidas']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding:'5px 14px', borderRadius:99, fontSize:13, cursor:'pointer', fontWeight:500, border:'none', background:filter===v?C.gold:C.surface, color:filter===v?'#0a0f1e':C.muted, transition:'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {PAGES.map(p => {
        const nums = Array.from({length:p.n}, (_,i) => i+1)
        const ownedCount = nums.filter(n => col.owned[`${p.code}-${n}`]).length
        const hasDupesInPage = nums.some(n => (col.dupes[`${p.code}-${n}`]||0) > 0)

        if (filter==='owned'  && ownedCount===0)   return null
        if (filter==='missing' && ownedCount===p.n) return null
        if (filter==='dupes'  && !hasDupesInPage)  return null

        const visible = nums.filter(n => {
          const k = `${p.code}-${n}`
          if (filter==='owned')   return  !!col.owned[k]
          if (filter==='missing') return !col.owned[k]
          if (filter==='dupes')   return (col.dupes[k]||0) > 0
          return true
        })
        if (visible.length===0) return null

        const full = ownedCount===p.n
        return (
          <div key={p.code} style={{ marginBottom:12, background:C.surface, borderRadius:12, overflow:'hidden', border:`1px solid ${full?'#065f46':C.border}` }}>
            <div style={{ padding:'8px 12px', background:C.card, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{p.flag} {p.name}</span>
              <span style={{ fontSize:12, fontWeight:600, color:full?C.green:C.muted, background:full?'rgba(16,185,129,0.12)':'transparent', padding:full?'2px 8px':'0', borderRadius:99 }}>
                {ownedCount}/{p.n}{full?' ✓':''}
              </span>
            </div>
            <div style={{ padding:'10px', display:'flex', flexWrap:'wrap', gap:5 }}>
              {visible.map(n => (
                <Chip
                  key={n}
                  num={n}
                  owned={!!col.owned[`${p.code}-${n}`]}
                  dupes={col.dupes[`${p.code}-${n}`]||0}
                  onClick={() => toggle(p.code, n)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── INTERCAMBIOS ─────────────────────────────────────────────────────────────

function TradesScreen({ col, tradeData, loading, onContact }) {
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:60, color:C.muted }}>
      <div style={{ fontSize:40, marginBottom:16 }}>⚽</div>
      <div style={{ fontSize:18, fontWeight:700, color:'#475569' }}>Buscando usuarios...</div>
    </div>
  )

  const myMissing = new Set()
  const myDupes   = new Set()
  for (const p of PAGES) for (let i=1; i<=p.n; i++) {
    const k = `${p.code}-${i}`
    if (!col.owned[k])          myMissing.add(k)
    if ((col.dupes[k]||0) > 0)  myDupes.add(k)
  }

  const matches = []
  if (tradeData?.users) {
    for (const [uname, uinfo] of Object.entries(tradeData.users)) {
      const theirDupes   = new Set(Object.entries(uinfo.col.dupes||{}).filter(([,v])=>v>0).map(([k])=>k))
      const theirMissing = new Set()
      for (const p of PAGES) for (let i=1;i<=p.n;i++) { const k=`${p.code}-${i}`; if (!uinfo.col.owned[k]) theirMissing.add(k) }

      const give = [...theirDupes].filter(k => myMissing.has(k))
      const take = [...myDupes].filter(k => theirMissing.has(k))
      if (give.length>0 || take.length>0)
        matches.push({ username:uname, name:uinfo.name, give, take, score:give.length+take.length })
    }
    matches.sort((a,b) => b.score-a.score)
  }

  const noUsers = !tradeData?.users || Object.keys(tradeData.users).length===0

  return (
    <div style={{ padding:14 }}>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.gold, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>🔄 Intercambios</h2>
        <div style={{ display:'flex', gap:16, fontSize:13, color:C.muted, flexWrap:'wrap' }}>
          <span>📦 <strong style={{color:C.gold}}>{myDupes.size}</strong> repetidas disponibles</span>
          <span>🔍 <strong style={{color:C.red}}>{myMissing.size}</strong> figuritas que necesito</span>
        </div>
      </div>

      {noUsers
        ? <Empty icon="👥" title="Aún no hay otros usuarios registrados" sub="¡Invitá a tus amigos a usar la app!" />
        : matches.length===0
          ? <Empty icon="🔍" title="Sin coincidencias por ahora" sub="Marcá más figuritas como repetidas (×) para encontrar intercambios" />
          : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {matches.map(m => (
                <div key={m.username} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                    <div>
                      <span style={{ fontWeight:700, fontSize:16, color:C.text }}>{m.name}</span>
                      <span style={{ color:C.muted, fontSize:12, marginLeft:8 }}>@{m.username}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:C.green }}>{m.give.length+m.take.length} figus en común</span>
                      <button onClick={() => onContact(m.username, m.name)} style={{ padding:'5px 14px', background:`linear-gradient(135deg,#1d4ed8,${C.blue})`, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                        ✉️ Contactar
                      </button>
                    </div>
                  </div>

                  {m.give.length > 0 && (
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:12, color:C.green, fontWeight:700, marginBottom:5 }}>✅ Te puede dar ({m.give.length}):</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {m.give.slice(0,30).map(k => <Tag key={k} text={k} color={C.green} />)}
                        {m.give.length>30 && <span style={{color:C.muted,fontSize:11,alignSelf:'center'}}>+{m.give.length-30} más</span>}
                      </div>
                    </div>
                  )}
                  {m.take.length > 0 && (
                    <div>
                      <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:5 }}>🎁 Vos le podés dar ({m.take.length}):</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {m.take.slice(0,30).map(k => <Tag key={k} text={k} color={C.gold} />)}
                        {m.take.length>30 && <span style={{color:C.muted,fontSize:11,alignSelf:'center'}}>+{m.take.length-30} más</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
      }
    </div>
  )
}

// ─── MENSAJES ─────────────────────────────────────────────────────────────────

function InboxScreen({ inbox, onRefresh }) {
  return (
    <div style={{ padding:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.gold, textTransform:'uppercase', letterSpacing:1 }}>📬 Mensajes</h2>
        <button onClick={onRefresh} style={{ background:C.surface, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13 }}>🔄 Actualizar</button>
      </div>
      {inbox.length===0
        ? <Empty icon="📭" title="No tenés mensajes" sub="Cuando alguien quiera intercambiar figuritas con vos, aparecerá acá" />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {inbox.map(msg => (
              <div key={msg.id} style={{ background:C.surface, border:`1px solid ${msg.status==='pending'?'#1e40af':C.border}`, borderRadius:12, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, flexWrap:'wrap', gap:4 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:15, color:C.text }}>{msg.fromName}</span>
                    <span style={{ color:C.muted, fontSize:12, marginLeft:8 }}>@{msg.from}</span>
                  </div>
                  <span style={{ fontSize:11, color:C.muted }}>{new Date(msg.ts).toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit',year:'2-digit'})}</span>
                </div>
                {msg.msg && <p style={{ color:'#94a3b8', fontSize:14, fontStyle:'italic', marginBottom:8, borderLeft:`3px solid ${C.border2}`, paddingLeft:10 }}>"{msg.msg}"</p>}
                {msg.theyGiveMe?.length>0 && (
                  <div style={{ fontSize:12, color:C.green, marginBottom:4 }}>
                    ✅ <strong>Puede darte:</strong> {msg.theyGiveMe.slice(0,15).join(', ')}{msg.theyGiveMe.length>15?` y ${msg.theyGiveMe.length-15} más`:''}
                  </div>
                )}
                {msg.iGiveThem?.length>0 && (
                  <div style={{ fontSize:12, color:C.gold }}>
                    🎁 <strong>Necesita de vos:</strong> {msg.iGiveThem.slice(0,15).join(', ')}{msg.iGiveThem.length>15?` y ${msg.iGiveThem.length-15} más`:''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ─── PANTALLA SOLICITUD ───────────────────────────────────────────────────────

function RequestScreen({ toUser, toName, onSend, onBack }) {
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    await onSend(msg)
    setSending(false)
  }

  return (
    <div style={{ padding:14, maxWidth:520 }}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.muted, cursor:'pointer', fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:4 }}>
        ← Volver
      </button>
      <div style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.border2}` }}>
        <h3 style={{ fontSize:20, fontWeight:800, color:C.gold, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>Solicitar intercambio</h3>
        <p style={{ color:C.muted, fontSize:14, marginBottom:20 }}>
          Para: <strong style={{color:C.text}}>{toName}</strong> <span style={{color:C.muted}}>(@{toUser})</span>
        </p>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, color:C.muted, marginBottom:6, display:'block' }}>Mensaje (opcional)</label>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Ej: Hola! Puedo encontrarme el sábado en plaza Independencia o en el Mercado del Puerto 🤝"
            style={{ ...INPUT, height:90, resize:'vertical', display:'block' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          style={{ width:'100%', padding:'12px', background:sending?'#1e2d4a':`linear-gradient(135deg,#1d4ed8,${C.blue})`, color:sending?C.muted:'#fff', border:'none', borderRadius:10, cursor:sending?'not-allowed':'pointer', fontSize:15, fontWeight:700 }}
        >
          {sending ? 'Enviando...' : '✉️ Enviar solicitud'}
        </button>
        <p style={{ textAlign:'center', fontSize:12, color:C.muted, marginTop:12 }}>
          La otra persona verá tu solicitud junto con la lista de figuritas a intercambiar.
        </p>
      </div>
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]         = useState('auth')
  const [authMode, setAuthMode]     = useState('login')
  const [form, setForm]             = useState({username:'', password:'', name:''})
  const [authError, setAuthError]   = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [user, setUser]             = useState(null)
  const [col, setCol]               = useState({owned:{}, dupes:{}})
  const [filter, setFilter]         = useState('all')
  const [saving, setSaving]         = useState(false)

  const [tradeData, setTradeData]   = useState(null)
  const [tradeLoading, setTradeLoading] = useState(false)
  const [inbox, setInbox]           = useState([])
  const [requestTarget, setRequestTarget] = useState(null)

  const saveTimer = useRef(null)
  const userRef   = useRef(null)
  const colRef    = useRef({owned:{}, dupes:{}})
  useEffect(() => { userRef.current = user }, [user])

  // Guarda con debounce cada vez que se modifica la colección
  const scheduleSave = (newCol) => {
    colRef.current = newCol
    setSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (userRef.current) {
        await saveCollection(userRef.current.username, colRef.current.owned, colRef.current.dupes)
      }
      setSaving(false)
    }, 800)
  }

  const toggle = (code, num) => {
    const key = `${code}-${num}`
    setCol(prev => {
      const next = { owned:{...prev.owned}, dupes:{...prev.dupes} }
      if (!next.owned[key]) {
        next.owned[key] = true
      } else if (!(next.dupes[key] > 0)) {
        next.dupes[key] = 1
      } else if (next.dupes[key] >= 10) {
        delete next.owned[key]; delete next.dupes[key]
      } else {
        next.dupes[key]++
      }
      scheduleSave(next)
      return next
    })
  }

  const handleAuth = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      if (authMode === 'register') {
        if (!form.name.trim() || !form.username.trim() || !form.password) {
          setAuthError('Completá todos los campos'); return
        }
        if (/\s/.test(form.username)) {
          setAuthError('El usuario no puede tener espacios'); return
        }
        const u = await registerUser(form.username, form.password, form.name.trim())
        setUser(u)
        setCol({owned:{}, dupes:{}})
        setScreen('album')
      } else {
        if (!form.username.trim() || !form.password) {
          setAuthError('Ingresá usuario y contraseña'); return
        }
        const u  = await loginUser(form.username, form.password)
        const c  = await getCollection(u.username)
        const msgs = await getInbox(u.username)
        setUser(u); setCol(c); setInbox(msgs)
        setScreen('album')
      }
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setUser(null); setCol({owned:{}, dupes:{}}); setForm({username:'', password:'', name:''})
    setScreen('auth'); setTradeData(null); setRequestTarget(null)
  }

  const goTrades = async () => {
    setScreen('trades'); setTradeLoading(true); setTradeData(null); setRequestTarget(null)
    try {
      const users = await getAllCollections(user.username)
      setTradeData({users})
    } finally {
      setTradeLoading(false)
    }
  }

  const loadInbox = async () => {
    const msgs = await getInbox(user.username)
    setInbox(msgs); setScreen('inbox'); setRequestTarget(null)
  }

  const handleSendRequest = async (toUser, toName, msg) => {
    const myMissing = new Set()
    const myDupeSet = new Set()
    for (const p of PAGES) for (let i=1;i<=p.n;i++) {
      const k=`${p.code}-${i}`
      if (!col.owned[k])          myMissing.add(k)
      if ((col.dupes[k]||0) > 0)  myDupeSet.add(k)
    }
    const theirInfo = tradeData?.users[toUser]
    const theirDupes = new Set(Object.entries(theirInfo?.col?.dupes||{}).filter(([,v])=>v>0).map(([k])=>k))
    const theirMissing = new Set()
    if (theirInfo) for (const p of PAGES) for (let i=1;i<=p.n;i++) { const k=`${p.code}-${i}`; if (!theirInfo.col.owned[k]) theirMissing.add(k) }

    await sendMessage({
      id: Date.now().toString(),
      from: user.username, fromName: user.name,
      toUser, msg,
      theyGiveMe: [...theirDupes].filter(k => myMissing.has(k)),
      iGiveThem:  [...myDupeSet].filter(k => theirMissing.has(k)),
    })
    setRequestTarget(null)
    alert(`✅ Solicitud enviada a ${toName}!`)
  }

  const stats = (() => {
    const owned = Object.keys(col.owned).length
    const dupeCount = Object.values(col.dupes).reduce((s,v) => s+(v||0), 0)
    return { owned, missing:TOTAL-owned, dupeCount, pct:Math.round(owned/TOTAL*100) }
  })()

  const pendingCount = inbox.filter(m => m.status==='pending').length

  if (screen==='auth') return (
    <AuthScreen mode={authMode} setMode={setAuthMode} form={form} setForm={setForm} onSubmit={handleAuth} error={authError} loading={authLoading} />
  )

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:C.bg, minHeight:'100vh', color:C.text }}>
      {/* Barra de navegación */}
      <header style={{ background:'#0a0f1e', borderBottom:`2px solid ${C.border2}`, padding:'8px 14px', position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:18, fontWeight:900, color:C.gold, letterSpacing:2, flexShrink:0, textTransform:'uppercase' }}>⚽ Mundial 2026</span>

        <div style={{ flex:'1 1 100px', minWidth:100 }}>
          <div style={{ background:C.border, borderRadius:99, height:5 }}>
            <div style={{ background:`linear-gradient(90deg,${C.green},${C.gold})`, width:`${stats.pct}%`, height:'100%', borderRadius:99, transition:'width 0.6s' }} />
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{stats.owned}/{TOTAL} · {stats.pct}%</div>
        </div>

        <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={() => { setScreen('album'); setRequestTarget(null) }} style={navBtn(screen==='album' && !requestTarget)}>📋 Álbum</button>
          <button onClick={goTrades}  style={navBtn(screen==='trades')}>🔄 Intercambios</button>
          <button onClick={loadInbox} style={navBtn(screen==='inbox', pendingCount>0?C.blue:C.gold)}>
            📬 Mensajes{pendingCount>0?` (${pendingCount})`:''}
          </button>
          <button onClick={logout} style={{ ...navBtn(false), borderLeft:`1px solid ${C.border}`, paddingLeft:12, marginLeft:4 }}>
            👤 {user.name.split(' ')[0]} · Salir
          </button>
        </div>
        {saving && <span style={{ fontSize:11, color:C.gold }}>💾 guardando...</span>}
      </header>

      {screen==='album' && (
        <AlbumScreen col={col} filter={filter} setFilter={setFilter} toggle={toggle} stats={stats} />
      )}
      {screen==='trades' && !requestTarget && (
        <TradesScreen col={col} tradeData={tradeData} loading={tradeLoading} onContact={(tu,tn) => setRequestTarget({toUser:tu, toName:tn})} />
      )}
      {screen==='trades' && requestTarget && (
        <RequestScreen
          toUser={requestTarget.toUser} toName={requestTarget.toName}
          onSend={(msg) => handleSendRequest(requestTarget.toUser, requestTarget.toName, msg)}
          onBack={() => setRequestTarget(null)}
        />
      )}
      {screen==='inbox' && (
        <InboxScreen inbox={inbox} onRefresh={loadInbox} />
      )}
    </div>
  )
}
