import { useState, useRef } from 'react'
import {
  registerUser, loginUser,
  getCollection, saveCollection,
  getAllCollections, getMyTrades,
  sendTradeRequest, acceptTrade, rejectTrade, completeTrade,
} from './lib/db.js'

const PAGES = [
  { code:'FWC', name:'FIFA World Cup 2026', flag:'🌍',  n:20, start:0 },
  { code:'MEX', name:'México',              flag:'🇲🇽', n:20 },
  { code:'RSA', name:'Sudáfrica',           flag:'🇿🇦', n:20 },
  { code:'KOR', name:'Corea del Sur',       flag:'🇰🇷', n:20 },
  { code:'CZE', name:'Rep. Checa',          flag:'🇨🇿', n:20 },
  { code:'CAN', name:'Canadá',              flag:'🇨🇦', n:20 },
  { code:'BIH', name:'Bosnia-Herzegovina',  flag:'🇧🇦', n:20 },
  { code:'QAT', name:'Qatar',               flag:'🇶🇦', n:20 },
  { code:'SUI', name:'Suiza',               flag:'🇨🇭', n:20 },
  { code:'BRA', name:'Brasil',              flag:'🇧🇷', n:20 },
  { code:'MAR', name:'Marruecos',           flag:'🇲🇦', n:20 },
  { code:'HAI', name:'Haití',               flag:'🇭🇹', n:20 },
  { code:'SCO', name:'Escocia',             flag:'SCO',  n:20 },
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
  { code:'ENG', name:'Inglaterra',          flag:'ENG',  n:20 },
  { code:'CRO', name:'Croacia',             flag:'🇭🇷', n:20 },
  { code:'GHA', name:'Ghana',               flag:'🇬🇭', n:20 },
  { code:'PAN', name:'Panamá',              flag:'🇵🇦', n:20 },
  { code:'CC',  name:'Copa y Ceremonias',   flag:'🏆',   n:14 },
]
const TOTAL = PAGES.reduce((s, p) => s + p.n, 0)

const C = {
  bg:'#0c1220', surface:'#111827', card:'#162032',
  border:'#1e2d4a', border2:'#1e3a5f',
  gold:'#f59e0b', green:'#10b981', red:'#f87171', blue:'#3b82f6',
  text:'#e2e8f0', muted:'#64748b', dim:'#334155',
}
const navBtn = (active, accent = C.gold) => ({
  padding:'5px 13px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:active?600:400,
  background:active?`${accent}22`:'transparent', color:active?accent:C.muted,
  border:active?`1px solid ${accent}55`:'1px solid transparent', transition:'all 0.15s',
})
const INPUT = {
  padding:'11px 14px', borderRadius:10, background:'#0a0f1e',
  border:`1px solid ${C.border2}`, color:C.text, fontSize:14,
  outline:'none', width:'100%', boxSizing:'border-box',
}

// CHIP
function Chip({ num, owned, dupes, pending, onClick }) {
  const hasDupe = dupes > 0
  const isPending = !!pending && !owned
  const display = num === 0 ? '00' : num

  let bg, border, color, glow, label
  if (hasDupe)        { bg='linear-gradient(135deg,#92400e,#d97706)'; border='#d9770644'; color='#fff'; glow='0 0 10px #d9770633'; label=`×${dupes}` }
  else if (owned)     { bg='linear-gradient(135deg,#064e3b,#059669)'; border='#05966944'; color='#fff'; glow='0 0 8px #05966933';  label='✓' }
  else if (isPending) { bg='#1a2744'; border='#3b82f655'; color='#60a5fa'; glow='0 0 8px #3b82f622'; label='⏳' }
  else                { bg=C.card;    border=C.border;    color=C.dim;     glow='none';               label=null }

  return (
    <button onClick={onClick}
      title={isPending?`${display} · pendiente de intercambio`:hasDupe?`${display} · ×${dupes} rep.`:owned?`${display} · tengo`:`${display} · me falta`}
      style={{ width:40, height:40, borderRadius:7, cursor: isPending?'default':'pointer', flexShrink:0,
        border:`1px solid ${border}`, background:bg, color,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:0, lineHeight:1.1, fontWeight:700, transition:'transform 0.08s', boxShadow:glow }}
      onMouseEnter={e => { if(!isPending) e.currentTarget.style.transform='scale(1.18)' }}
      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
    >
      <span style={{ fontSize:13 }}>{display}</span>
      {label && <span style={{ fontSize:9, opacity:0.9 }}>{label}</span>}
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
  return <span style={{ background:`${color}20`, border:`1px solid ${color}44`, borderRadius:5, padding:'2px 6px', fontSize:11, color, whiteSpace:'nowrap' }}>{text}</span>
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'40px 20px', color:C.muted }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:17, fontWeight:700, color:'#475569', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13 }}>{sub}</div>
    </div>
  )
}

function StickerList({ stickers, color, label }) {
  if (!stickers || stickers.length === 0) return null
  return (
    <div style={{ marginBottom:6 }}>
      <div style={{ fontSize:12, color, fontWeight:600, marginBottom:4 }}>{label} ({stickers.length}):</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
        {stickers.slice(0,24).map(k => <Tag key={k} text={k} color={color} />)}
        {stickers.length>24 && <span style={{color:C.muted,fontSize:11,alignSelf:'center'}}>+{stickers.length-24}</span>}
      </div>
    </div>
  )
}

// AUTH
function AuthScreen({ mode, setMode, form, setForm, onSubmit, error, loading }) {
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.bg},#0c2a50,${C.bg})`, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'rgba(10,15,30,0.97)', borderRadius:20, padding:'40px 32px', width:'100%', maxWidth:420, border:`1px solid ${C.border2}`, boxShadow:'0 25px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:52 }}>⚽</div>
          <h1 style={{ fontSize:30, fontWeight:900, color:C.gold, letterSpacing:3, margin:'10px 0 6px', textTransform:'uppercase' }}>MUNDIAL 2026</h1>
          <p style={{ color:C.muted, fontSize:13 }}>Organizá tu álbum de figuritas</p>
        </div>
        <div style={{ display:'flex', background:'#0a0f1e', borderRadius:12, padding:3, marginBottom:24, gap:3 }}>
          {[['login','Iniciar sesión'],['register','Registrarse']].map(([m,l]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'9px', borderRadius:9, border:'none', cursor:'pointer', fontSize:14, fontWeight:500, transition:'all 0.15s', background:mode===m?C.gold:'transparent', color:mode===m?'#0a0f1e':C.muted }}>{l}</button>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mode==='register' && <input placeholder="Nombre completo" value={form.name} onChange={e => setForm({...form, name:e.target.value})} style={INPUT} />}
          <input placeholder="Usuario (sin espacios)" value={form.username} onChange={e => setForm({...form, username:e.target.value.toLowerCase().replace(/\s/g,'')})} onKeyDown={e => e.key==='Enter'&&onSubmit()} style={INPUT} />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password:e.target.value})} onKeyDown={e => e.key==='Enter'&&onSubmit()} style={INPUT} />
          {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid #7f1d1d', borderRadius:8, padding:'8px 12px', color:'#fca5a5', fontSize:13, textAlign:'center' }}>{error}</div>}
          <button onClick={onSubmit} disabled={loading} style={{ padding:'13px', borderRadius:12, background:loading?'#1e2d4a':`linear-gradient(135deg,#b45309,${C.gold})`, color:loading?C.muted:'#0a0f1e', fontWeight:800, border:'none', cursor:loading?'not-allowed':'pointer', letterSpacing:2, fontSize:17, marginTop:4, textTransform:'uppercase' }}>
            {loading ? 'Verificando...' : mode==='login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ALBUM
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
          <span>💡 1er clic = <span style={{color:C.green}}>✓ tengo</span> · 2do = <span style={{color:C.gold}}>×1 repetida</span> · Más clics = más repetidas · A ×10 vuelve a "me falta" · <span style={{color:C.blue}}>⏳ intercambio pendiente</span></span>
          <button onClick={() => setHint(false)} style={{ marginLeft:'auto', background:'transparent', border:'none', color:C.muted, cursor:'pointer', fontSize:16, flexShrink:0 }}>✕</button>
        </div>
      )}
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {[['all','Todas'],['owned','✓ Tengo'],['missing','✗ Me faltan'],['dupes','× Repetidas'],['pending','⏳ Pendientes']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding:'5px 14px', borderRadius:99, fontSize:13, cursor:'pointer', fontWeight:500, border:'none', background:filter===v?C.gold:C.surface, color:filter===v?'#0a0f1e':C.muted, transition:'all 0.15s' }}>{l}</button>
        ))}
      </div>
      {PAGES.map(p => {
        const nums = Array.from({length:p.n}, (_,i) => (p.start??1)+i)
        const ownedCount = nums.filter(n => col.owned[`${p.code}-${n}`]).length
        const hasDupesInPage = nums.some(n => (col.dupes[`${p.code}-${n}`]||0)>0)
        const hasPendingInPage = nums.some(n => col.pending[`${p.code}-${n}`] && !col.owned[`${p.code}-${n}`])
        if (filter==='owned'   && ownedCount===0)    return null
        if (filter==='missing' && ownedCount===p.n)  return null
        if (filter==='dupes'   && !hasDupesInPage)   return null
        if (filter==='pending' && !hasPendingInPage) return null
        const visible = nums.filter(n => {
          const k=`${p.code}-${n}`
          if (filter==='owned')   return !!col.owned[k]
          if (filter==='missing') return !col.owned[k]
          if (filter==='dupes')   return (col.dupes[k]||0)>0
          if (filter==='pending') return !!col.pending[k] && !col.owned[k]
          return true
        })
        if (visible.length===0) return null
        const full = ownedCount===p.n
        return (
          <div key={p.code} style={{ marginBottom:12, background:C.surface, borderRadius:12, overflow:'hidden', border:`1px solid ${full?'#065f46':C.border}` }}>
            <div style={{ padding:'8px 12px', background:C.card, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:15, fontWeight:700, color:C.text }}>
                <span style={{ fontSize:12, color:C.muted, marginRight:6, fontFamily:'monospace' }}>{p.code}</span>
                {p.flag} {p.name}
              </span>
              <span style={{ fontSize:12, fontWeight:600, color:full?C.green:C.muted, background:full?'rgba(16,185,129,0.12)':'transparent', padding:full?'2px 8px':'0', borderRadius:99 }}>
                {ownedCount}/{p.n}{full?' ✓':''}
              </span>
            </div>
            <div style={{ padding:'10px', display:'flex', flexWrap:'wrap', gap:5 }}>
              {visible.map(n => {
                const k=`${p.code}-${n}`
                return <Chip key={n} num={n} owned={!!col.owned[k]} dupes={col.dupes[k]||0} pending={!!col.pending[k]} onClick={() => toggle(p.code,n)} />
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// CARD DE INTERCAMBIO (reutilizable)
function TradeCard({ trade, currentUser, onAccept, onReject, onComplete }) {
  const isFrom = trade.from === currentUser
  const otherName = isFrom ? (trade.toName||trade.to) : trade.fromName
  const otherUser = isFrom ? trade.to : trade.from
  // Desde mi perspectiva:
  const iReceive = isFrom ? trade.theyGiveMe : trade.iGiveThem
  const iGive    = isFrom ? trade.iGiveThem  : trade.theyGiveMe

  const statusStyle = {
    pending:  { bg:'rgba(245,158,11,0.08)',  border:`1px solid ${C.gold}44`,  label:'🟡 Pendiente' },
    accepted: { bg:'rgba(59,130,246,0.08)',  border:`1px solid ${C.blue}44`,  label:'🔵 Aceptado' },
    waiting:  { bg:'rgba(100,116,139,0.08)', border:`1px solid #47556944`,    label:'⏳ Esperando respuesta' },
  }
  const st = isFrom && trade.status==='pending' ? statusStyle.waiting : statusStyle[trade.status] || statusStyle.pending

  return (
    <div style={{ background:C.surface, border:st.border, borderRadius:12, padding:14, background:st.bg }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:6 }}>
        <div>
          <span style={{ fontWeight:700, fontSize:15, color:C.text }}>{otherName}</span>
          <span style={{ color:C.muted, fontSize:12, marginLeft:8 }}>@{otherUser}</span>
        </div>
        <span style={{ fontSize:12, fontWeight:600, color:C.muted }}>{st.label}</span>
      </div>

      <StickerList stickers={iReceive} color={C.green} label="Vas a recibir" />
      <StickerList stickers={iGive}    color={C.gold}  label="Vas a dar" />

      {/* Botones según estado y rol */}
      <div style={{ display:'flex', gap:8, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, flexWrap:'wrap' }}>
        {/* El receptor puede Aceptar o Rechazar cuando está pendiente */}
        {!isFrom && trade.status==='pending' && <>
          <button onClick={() => onAccept(trade)} style={{ flex:1, padding:'8px', background:'rgba(16,185,129,0.15)', color:C.green, border:`1px solid ${C.green}55`, borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>✅ Aceptar</button>
          <button onClick={() => onReject(trade)} style={{ flex:1, padding:'8px', background:'rgba(248,113,113,0.12)', color:C.red, border:`1px solid ${C.red}44`, borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>❌ Rechazar</button>
        </>}
        {/* Cualquiera puede marcar como realizado cuando está aceptado */}
        {trade.status==='accepted' && <>
          <button onClick={() => onComplete(trade)} style={{ flex:1, padding:'8px', background:'rgba(16,185,129,0.15)', color:C.green, border:`1px solid ${C.green}55`, borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>✔ Realizado</button>
          <button onClick={() => onReject(trade)} style={{ flex:1, padding:'8px', background:'rgba(248,113,113,0.12)', color:C.red, border:`1px solid ${C.red}44`, borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>❌ Cancelar</button>
        </>}
        {/* El emisor puede cancelar su solicitud pendiente */}
        {isFrom && trade.status==='pending' && (
          <button onClick={() => onReject(trade)} style={{ padding:'6px 14px', background:'transparent', color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, cursor:'pointer', fontSize:12 }}>Cancelar solicitud</button>
        )}
      </div>
    </div>
  )
}

// INTERCAMBIOS — pantalla principal
function TradesScreen({ user, col, tradeData, myTrades, loading, onIntercambiar, onAccept, onReject, onComplete, onRefresh }) {
  const receivedPending = myTrades.filter(t => t.to===user.username && t.status==='pending')
  const sentPending     = myTrades.filter(t => t.from===user.username && t.status==='pending')
  const accepted        = myTrades.filter(t => t.status==='accepted')
  const activeTrades    = new Set(myTrades.map(t => t.from===user.username ? t.to : t.from))

  // Solo matches MUTUOS: ambos tienen algo para dar al otro
  const matches = []
  if (tradeData?.users && !loading) {
    const myMissing = new Set(), myDupes = new Set()
    for (const p of PAGES) for (let i=(p.start??1); i<(p.start??1)+p.n; i++) {
      const k=`${p.code}-${i}`
      if (!col.owned[k]) myMissing.add(k)
      if ((col.dupes[k]||0)>0) myDupes.add(k)
    }
    for (const [uname, uinfo] of Object.entries(tradeData.users)) {
      if (activeTrades.has(uname)) continue // ya hay un intercambio activo con este usuario
      const theirDupes   = new Set(Object.entries(uinfo.col.dupes||{}).filter(([,v])=>v>0).map(([k])=>k))
      const theirMissing = new Set()
      for (const p of PAGES) for (let i=(p.start??1); i<(p.start??1)+p.n; i++) { const k=`${p.code}-${i}`; if (!uinfo.col.owned[k]) theirMissing.add(k) }
      const give = [...theirDupes].filter(k => myMissing.has(k))  // lo que él me da
      const take = [...myDupes].filter(k => theirMissing.has(k))  // lo que yo le doy
      // Solo mostrar si ES MUTUO: ambos tienen algo para el otro
      if (give.length>0 && take.length>0)
        matches.push({ username:uname, name:uinfo.name, give, take })
    }
    matches.sort((a,b) => (b.give.length+b.take.length)-(a.give.length+a.take.length))
  }

  const pendingCount = receivedPending.length

  return (
    <div style={{ padding:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.gold, textTransform:'uppercase', letterSpacing:1 }}>🔄 Intercambios</h2>
        <button onClick={onRefresh} style={{ background:C.surface, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13 }}>🔄 Actualizar</button>
      </div>

      {/* Solicitudes recibidas */}
      {receivedPending.length>0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.gold, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ background:`${C.gold}22`, border:`1px solid ${C.gold}44`, borderRadius:99, padding:'2px 10px' }}>🔔 {receivedPending.length} solicitud{receivedPending.length>1?'es':''} recibida{receivedPending.length>1?'s':''}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {receivedPending.map(t => <TradeCard key={t.id} trade={t} currentUser={user.username} onAccept={onAccept} onReject={onReject} onComplete={onComplete}/>)}
          </div>
        </div>
      )}

      {/* Intercambios aceptados */}
      {accepted.length>0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.blue, marginBottom:8 }}>
            <span style={{ background:`${C.blue}22`, border:`1px solid ${C.blue}44`, borderRadius:99, padding:'2px 10px' }}>🔵 {accepted.length} aceptado{accepted.length>1?'s':''} — coordinar entrega</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {accepted.map(t => <TradeCard key={t.id} trade={t} currentUser={user.username} onAccept={onAccept} onReject={onReject} onComplete={onComplete}/>)}
          </div>
        </div>
      )}

      {/* Solicitudes enviadas esperando */}
      {sentPending.length>0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.muted, marginBottom:8 }}>
            <span style={{ background:'#1e2d4a', border:`1px solid ${C.border}`, borderRadius:99, padding:'2px 10px' }}>⏳ {sentPending.length} esperando respuesta</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {sentPending.map(t => <TradeCard key={t.id} trade={t} currentUser={user.username} onAccept={onAccept} onReject={onReject} onComplete={onComplete}/>)}
          </div>
        </div>
      )}

      {/* Posibles intercambios mutuos */}
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8 }}>Posibles intercambios mutuos</div>
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:C.muted }}>
            <div style={{ fontSize:32, marginBottom:10 }}>⚽</div>
            <div>Buscando...</div>
          </div>
        ) : matches.length===0 ? (
          <Empty icon="🔍" title="Sin coincidencias mutuas" sub="Para aparecer acá, ambos usuarios tienen que tener repetidas que el otro necesita" />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {matches.map(m => (
              <div key={m.username} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:15, color:C.text }}>{m.name}</span>
                    <span style={{ color:C.muted, fontSize:12, marginLeft:8 }}>@{m.username}</span>
                  </div>
                  <button onClick={() => onIntercambiar(m.username, m.name, m.give, m.take)}
                    style={{ padding:'6px 16px', background:`linear-gradient(135deg,#065f46,${C.green})`, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                    🔄 Intercambiar
                  </button>
                </div>
                <StickerList stickers={m.give} color={C.green} label="Vas a recibir" />
                <StickerList stickers={m.take} color={C.gold}  label="Vas a dar" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// APP
export default function App() {
  const [screen, setScreen]           = useState('auth')
  const [authMode, setAuthMode]       = useState('login')
  const [form, setForm]               = useState({username:'', password:'', name:''})
  const [authError, setAuthError]     = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [user, setUser]               = useState(null)
  const [col, setCol]                 = useState({owned:{}, dupes:{}, pending:{}})
  const [filter, setFilter]           = useState('all')
  const [saving, setSaving]           = useState(false)
  const [tradeData, setTradeData]     = useState(null)
  const [tradeLoading, setTradeLoading] = useState(false)
  const [myTrades, setMyTrades]       = useState([])

  const saveTimer = useRef(null)
  const userRef   = useRef(null)
  const colRef    = useRef({owned:{}, dupes:{}, pending:{}})
  const setUserAndRef = (u) => { userRef.current = u; setUser(u) }

  const scheduleSave = (newCol) => {
    colRef.current = newCol; setSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (userRef.current) await saveCollection(userRef.current.username, colRef.current.owned, colRef.current.dupes, colRef.current.pending)
      setSaving(false)
    }, 800)
  }

  const toggle = (code, num) => {
    const key=`${code}-${num}`
    setCol(prev => {
      if (prev.pending[key]) return prev // bloqueado
      const next={owned:{...prev.owned},dupes:{...prev.dupes},pending:{...prev.pending}}
      if (!next.owned[key])          { next.owned[key]=true }
      else if (!(next.dupes[key]>0)) { next.dupes[key]=1 }
      else if (next.dupes[key]>=10)  { delete next.owned[key]; delete next.dupes[key] }
      else                           { next.dupes[key]++ }
      scheduleSave(next); return next
    })
  }

  const handleAuth = async () => {
    setAuthError(''); setAuthLoading(true)
    try {
      if (authMode==='register') {
        if (!form.name.trim()||!form.username.trim()||!form.password) { setAuthError('Completá todos los campos'); return }
        if (/\s/.test(form.username)) { setAuthError('Usuario sin espacios'); return }
        const u = await registerUser(form.username, form.password, form.name.trim())
        setUserAndRef(u); setCol({owned:{},dupes:{},pending:{}}); setScreen('album')
      } else {
        if (!form.username.trim()||!form.password) { setAuthError('Ingresá usuario y contraseña'); return }
        const u  = await loginUser(form.username, form.password)
        const c  = await getCollection(u.username)
        const tr = await getMyTrades(u.username)
        setUserAndRef(u); setCol(c); setMyTrades(tr); setScreen('album')
      }
    } catch(err) { setAuthError(err.message) }
    finally { setAuthLoading(false) }
  }

  const logout = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setUser(null); setCol({owned:{},dupes:{},pending:{}}); setForm({username:'',password:'',name:''})
    setScreen('auth'); setTradeData(null); setMyTrades([])
  }

  const goTrades = async () => {
    setScreen('trades'); setTradeLoading(true)
    // Recarga colección propia para tener pending actualizado
    const myCol = await getCollection(userRef.current.username)
    setCol(myCol)
    const [users, trades] = await Promise.all([
      getAllCollections(userRef.current.username),
      getMyTrades(userRef.current.username),
    ])
    setTradeData({users}); setMyTrades(trades); setTradeLoading(false)
  }

  const refreshTrades = async () => {
    const myCol = await getCollection(userRef.current.username)
    setCol(myCol)
    const [users, trades] = await Promise.all([
      getAllCollections(userRef.current.username),
      getMyTrades(userRef.current.username),
    ])
    setTradeData({users}); setMyTrades(trades)
  }

  const handleIntercambiar = async (toUser, toName, give, take) => {
    try {
      await sendTradeRequest({ from:user.username, fromName:user.name, toUser, toName, theyGiveMe:give, iGiveThem:take })
      await refreshTrades()
    } catch(err) { alert('Error: '+err.message) }
  }

  const handleAccept = async (trade) => {
    try {
      await acceptTrade(trade)
      await refreshTrades()
    } catch(err) { alert('Error: '+err.message) }
  }

  const handleReject = async (trade) => {
    if (!confirm('¿Cancelar este intercambio?')) return
    try { await rejectTrade(trade); await refreshTrades() }
    catch(err) { alert('Error: '+err.message) }
  }

  const handleComplete = async (trade) => {
    if (!confirm('¿Marcar como realizado? Se actualizarán las colecciones de ambos.')) return
    try {
      await completeTrade(trade)
      const newCol = await getCollection(user.username)
      setCol(newCol)
      await refreshTrades()
      alert('✅ ¡Intercambio realizado! Las colecciones fueron actualizadas.')
    } catch(err) { alert('Error: '+err.message) }
  }

  const stats = (() => {
    const owned = Object.keys(col.owned).length
    const dupeCount = Object.values(col.dupes).reduce((s,v)=>s+(v||0),0)
    return { owned, missing:TOTAL-owned, dupeCount, pct:Math.round(owned/TOTAL*100) }
  })()

  const pendingTrades = myTrades.filter(t => t.to===user?.username && t.status==='pending').length

  if (screen==='auth') return <AuthScreen mode={authMode} setMode={setAuthMode} form={form} setForm={setForm} onSubmit={handleAuth} error={authError} loading={authLoading} />

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:C.bg, minHeight:'100vh', color:C.text }}>
      <header style={{ background:'#0a0f1e', borderBottom:`2px solid ${C.border2}`, padding:'8px 14px', position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:18, fontWeight:900, color:C.gold, letterSpacing:2, flexShrink:0, textTransform:'uppercase' }}>⚽ Mundial 2026</span>
        <div style={{ flex:'1 1 100px', minWidth:100 }}>
          <div style={{ background:C.border, borderRadius:99, height:5 }}>
            <div style={{ background:`linear-gradient(90deg,${C.green},${C.gold})`, width:`${stats.pct}%`, height:'100%', borderRadius:99, transition:'width 0.6s' }}/>
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{stats.owned}/{TOTAL} · {stats.pct}%</div>
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={() => setScreen('album')} style={navBtn(screen==='album')}>📋 Álbum</button>
          <button onClick={goTrades} style={navBtn(screen==='trades', pendingTrades>0?C.gold:C.gold)}>
            🔄 Intercambios{pendingTrades>0?` (${pendingTrades})`:''}
          </button>
          <button onClick={logout} style={{ ...navBtn(false), borderLeft:`1px solid ${C.border}`, paddingLeft:12, marginLeft:4 }}>
            👤 {user.name.split(' ')[0]} · Salir
          </button>
        </div>
        {saving && <span style={{ fontSize:11, color:C.gold }}>💾</span>}
      </header>

      {screen==='album' && <AlbumScreen col={col} filter={filter} setFilter={setFilter} toggle={toggle} stats={stats}/>}
      {screen==='trades' && <TradesScreen user={user} col={col} tradeData={tradeData} myTrades={myTrades} loading={tradeLoading} onIntercambiar={handleIntercambiar} onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} onRefresh={refreshTrades}/>}
    </div>
  )
}
