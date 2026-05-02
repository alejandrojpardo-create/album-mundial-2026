import { supabase } from './supabase.js'

// Hashea la contraseña con SHA-256 en el navegador (Web Crypto API)
const hashPwd = async (password) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const registerUser = async (username, password, name) => {
  const { data: existing } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .maybeSingle()

  if (existing) throw new Error('Ese usuario ya existe, elegí otro')

  const hashed = await hashPwd(password)

  const { error: userError } = await supabase
    .from('users')
    .insert({ username, password: hashed, name })

  if (userError) throw new Error('Error al crear usuario: ' + userError.message)

  // Colección vacía inicial
  await supabase
    .from('collections')
    .insert({ username, owned: {}, dupes: {} })

  return { username, name }
}

export const loginUser = async (username, password) => {
  const hashed = await hashPwd(password)

  const { data, error } = await supabase
    .from('users')
    .select('username, name')
    .eq('username', username)
    .eq('password', hashed)
    .maybeSingle()

  if (error) throw new Error('Error de conexión: ' + error.message)
  if (!data) throw new Error('Usuario o contraseña incorrectos')

  return data
}

// ─── COLECCIÓN ───────────────────────────────────────────────────────────────

export const getCollection = async (username) => {
  const { data } = await supabase
    .from('collections')
    .select('owned, dupes')
    .eq('username', username)
    .maybeSingle()

  return data || { owned: {}, dupes: {} }
}

export const saveCollection = async (username, owned, dupes) => {
  const { error } = await supabase
    .from('collections')
    .upsert(
      { username, owned, dupes, updated_at: new Date().toISOString() },
      { onConflict: 'username' }
    )

  if (error) console.error('Error guardando colección:', error.message)
}

// ─── INTERCAMBIOS ────────────────────────────────────────────────────────────

export const getAllCollections = async (excludeUsername) => {
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('username, name')
    .neq('username', excludeUsername)

  if (uErr || !users || users.length === 0) return {}

  const usernames = users.map(u => u.username)

  const { data: cols } = await supabase
    .from('collections')
    .select('username, owned, dupes')
    .in('username', usernames)

  const result = {}
  for (const u of users) {
    const col = cols?.find(c => c.username === u.username)
    if (col) {
      result[u.username] = {
        name: u.name,
        col: { owned: col.owned || {}, dupes: col.dupes || {} }
      }
    }
  }
  return result
}

// ─── MENSAJES ────────────────────────────────────────────────────────────────

export const getInbox = async (username) => {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('to_user', username)
    .order('created_at', { ascending: false })

  // Normaliza los nombres de campo para que App.jsx no cambie
  return (data || []).map(m => ({
    id:         m.id,
    from:       m.from_user,
    fromName:   m.from_name,
    to:         m.to_user,
    msg:        m.message,
    theyGiveMe: m.they_give_me || [],
    iGiveThem:  m.i_give_them  || [],
    status:     m.status,
    ts:         m.created_at,
  }))
}

export const sendMessage = async ({ id, from, fromName, toUser, msg, theyGiveMe, iGiveThem }) => {
  const { error } = await supabase.from('messages').insert({
    id,
    from_user:    from,
    from_name:    fromName,
    to_user:      toUser,
    message:      msg || '',
    they_give_me: theyGiveMe,
    i_give_them:  iGiveThem,
    status:       'pending',
  })

  if (error) throw new Error('Error al enviar mensaje: ' + error.message)
}
