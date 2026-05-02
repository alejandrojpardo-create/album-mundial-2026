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
  const { error } = await supabase.from('collections').upsert(
    { username, owned, dupes, pending: pending || {}, updated_at: new Date().toISOString() },
    { onConflict: 'username' }
  )
  if (error) console.error('Error guardando colección:', error.message)
}

// INTERCAMBIOS
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

// MENSAJES
const norm = (m) => ({
  id: m.id, from: m.from_user, fromName: m.from_name, to: m.to_user,
  theyGiveMe: m.they_give_me || [], iGiveThem: m.i_give_them || [],
  status: m.status, ts: m.created_at,
})

export const getInbox = async (username) => {
  const { data } = await supabase.from('messages').select('*').eq('to_user', username)
    .not('status', 'eq', 'rejected').order('created_at', { ascending: false })
  return (data || []).map(norm)
}

export const sendTradeRequest = async ({ from, fromName, toUser, theyGiveMe, iGiveThem }) => {
  const { error } = await supabase.from('messages').insert({
    id: Date.now().toString(), from_user: from, from_name: fromName,
    to_user: toUser, message: '', they_give_me: theyGiveMe, i_give_them: iGiveThem, status: 'pending',
  })
  if (error) throw new Error('Error al enviar solicitud: ' + error.message)
}

export const acceptTrade = async (message) => {
  await supabase.from('messages').update({ status: 'accepted' }).eq('id', message.id)
  const col = await getCollection(message.from)
  const newPending = { ...col.pending }
  for (const s of message.theyGiveMe) newPending[s] = message.id
  await saveCollection(message.from, col.owned, col.dupes, newPending)
}

export const rejectTrade = async (message) => {
  await supabase.from('messages').update({ status: 'rejected' }).eq('id', message.id)
  const col = await getCollection(message.from)
  const newPending = { ...col.pending }
  for (const s of message.theyGiveMe) { if (newPending[s] === message.id) delete newPending[s] }
  await saveCollection(message.from, col.owned, col.dupes, newPending)
}

export const completeTrade = async (message, acceptorUsername) => {
  await supabase.from('messages').update({ status: 'completed' }).eq('id', message.id)
  // Actualiza solicitante (from): agrega owned, limpia pending, pierde dupes ofrecidos
  const fromCol = await getCollection(message.from)
  const fo = { ...fromCol.owned }, fd = { ...fromCol.dupes }, fp = { ...fromCol.pending }
  for (const s of message.theyGiveMe) { fo[s] = true; if (fp[s] === message.id) delete fp[s] }
  for (const s of message.iGiveThem) { if ((fd[s]||0) > 1) fd[s]--; else delete fd[s] }
  await saveCollection(message.from, fo, fd, fp)
  // Actualiza aceptante (to): agrega owned de lo recibido, pierde dupes dados
  const toCol = await getCollection(acceptorUsername)
  const to2 = { ...toCol.owned }, td = { ...toCol.dupes }
  for (const s of message.iGiveThem) to2[s] = true
  for (const s of message.theyGiveMe) { if ((td[s]||0) > 1) td[s]--; else delete td[s] }
  await saveCollection(acceptorUsername, to2, td, toCol.pending)
}
