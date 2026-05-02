import { supabase } from './supabase.js'

const hashPwd = async (password) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// AUTH
export const registerUser = async (username, password, name) => {
  const { data: existing } = await supabase.from('users').select('username').eq('username', username).maybeSingle()
  if (existing) throw new Error('Ese usuario ya existe, elegí otro')
  const hashed = await hashPwd(password)
  const { error } = await supabase.from('users').insert({ username, password: hashed, name })
  if (error) throw new Error('Error al crear usuario: ' + error.message)
  await supabase.from('collections').insert({ username, owned: {}, dupes: {}, pending: {} })
  return { username, name }
}

export const loginUser = async (username, password) => {
  const hashed = await hashPwd(password)
  const { data, error } = await supabase.from('users').select('username, name').eq('username', username).eq('password', hashed).maybeSingle()
  if (error) throw new Error('Error de conexión: ' + error.message)
  if (!data) throw new Error('Usuario o contraseña incorrectos')
  return data
}

// COLECCION
export const getCollection = async (username) => {
  const { data } = await supabase.from('collections').select('owned, dupes, pending').eq('username', username).maybeSingle()
  return data || { owned: {}, dupes: {}, pending: {} }
}

export const saveCollection = async (username, owned, dupes, pending) => {
  await supabase.from('collections').upsert(
    { username, owned, dupes, pending: pending || {}, updated_at: new Date().toISOString() },
    { onConflict: 'username' }
  )
}

// TODOS LOS USUARIOS PARA INTERCAMBIOS
export const getAllCollections = async (excludeUsername) => {
  const { data: users } = await supabase.from('users').select('username, name').neq('username', excludeUsername)
  if (!users || users.length === 0) return {}
  const { data: cols } = await supabase.from('collections').select('username, owned, dupes').in('username', users.map(u => u.username))
  const result = {}
  for (const u of users) {
    const col = cols?.find(c => c.username === u.username)
    if (col) result[u.username] = { name: u.name, col: { owned: col.owned || {}, dupes: col.dupes || {} } }
  }
  return result
}

// INTERCAMBIOS — carga todos los trades donde participo (enviados y recibidos)
const norm = (m) => ({
  id: m.id,
  from: m.from_user, fromName: m.from_name,
  to: m.to_user, toName: m.to_name,
  theyGiveMe: m.they_give_me || [],  // lo que el from_user da al to_user  (desde perspectiva del from)
  iGiveThem:  m.i_give_them  || [],  // lo que el to_user   da al from_user (desde perspectiva del from)
  status: m.status, ts: m.created_at,
})

export const getMyTrades = async (username) => {
  const { data } = await supabase.from('messages').select('*')
    .or(`from_user.eq.${username},to_user.eq.${username}`)
    .not('status', 'eq', 'rejected')
    .not('status', 'eq', 'completed')
    .order('created_at', { ascending: false })
  return (data || []).map(norm)
}

// Enviar solicitud de intercambio
export const sendTradeRequest = async ({ from, fromName, toUser, toName, theyGiveMe, iGiveThem }) => {
  const { error } = await supabase.from('messages').insert({
    id: Date.now().toString(),
    from_user: from, from_name: fromName,
    to_user: toUser, to_name: toName,
    message: '',
    they_give_me: theyGiveMe,   // lo que from da a to
    i_give_them:  iGiveThem,    // lo que to   da a from
    status: 'pending',
  })
  if (error) throw new Error('Error al enviar solicitud: ' + error.message)
}

// Aceptar → pone figuritas como pendientes en la colección del solicitante (from)
export const acceptTrade = async (message) => {
  await supabase.from('messages').update({ status: 'accepted' }).eq('id', message.id)
  // Las figuritas que el from_user va a recibir (theyGiveMe) quedan pendientes para él
  const col = await getCollection(message.from)
  const newPending = { ...col.pending }
  for (const s of message.theyGiveMe) newPending[s] = message.id
  await saveCollection(message.from, col.owned, col.dupes, newPending)
}

// Rechazar → cancela y limpia pendientes
export const rejectTrade = async (message) => {
  await supabase.from('messages').update({ status: 'rejected' }).eq('id', message.id)
  const col = await getCollection(message.from)
  const newPending = { ...col.pending }
  for (const s of message.theyGiveMe) { if (newPending[s] === message.id) delete newPending[s] }
  await saveCollection(message.from, col.owned, col.dupes, newPending)
}

// Realizado → actualiza colecciones de ambos
export const completeTrade = async (message) => {
  await supabase.from('messages').update({ status: 'completed' }).eq('id', message.id)

  // from_user: recibe theyGiveMe, entrega iGiveThem, limpia pending
  const fromCol = await getCollection(message.from)
  const fo = { ...fromCol.owned }, fd = { ...fromCol.dupes }, fp = { ...fromCol.pending }
  for (const s of message.theyGiveMe) { fo[s] = true; if (fp[s] === message.id) delete fp[s] }
  for (const s of message.iGiveThem)  { if ((fd[s]||0) > 1) fd[s]--; else delete fd[s] }
  await saveCollection(message.from, fo, fd, fp)

  // to_user: recibe iGiveThem, entrega theyGiveMe
  const toCol = await getCollection(message.to)
  const to2 = { ...toCol.owned }, td = { ...toCol.dupes }
  for (const s of message.iGiveThem)  to2[s] = true
  for (const s of message.theyGiveMe) { if ((td[s]||0) > 1) td[s]--; else delete td[s] }
  await saveCollection(message.to, to2, td, toCol.pending)
}
