import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  // Handle CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type')

  if (getMethod(event) === 'OPTIONS') {
    return ''
  }

  if (getMethod(event) === 'GET') {
    // Debug: Log all cookies received
    const allCookies = parseCookies(event)
    console.log('🍪 All cookies received by server:', allCookies)
    
    // Get user ID from cookie or generate new one
    const existingUserId = getCookie(event, 'syncertica-user-id')
    console.log('🔍 Looking for syncertica-user-id cookie, found:', existingUserId)
    
    if (existingUserId) {
      console.log('✅ Returning existing user ID from server cookie:', existingUserId)
      return { userId: existingUserId, isNew: false }
    }
    
    // Generate new UUID
    const newUserId = uuidv4()
    
    // Set secure cookie (365 days expiration)
    setCookie(event, 'syncertica-user-id', newUserId, {
      maxAge: 365 * 24 * 60 * 60, // 365 days in seconds
      httpOnly: false, // Allow client-side access
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      path: '/'
    })
    
    console.log('🆕 Generated new server-side user ID:', newUserId)
    return { userId: newUserId, isNew: true }
  }

  if (getMethod(event) === 'POST') {
    // Force regenerate user ID
    const newUserId = uuidv4()
    
    setCookie(event, 'syncertica-user-id', newUserId, {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/'
    })
    
    console.log('🔄 Regenerated user ID:', newUserId)
    return { userId: newUserId, isNew: true }
  }

  return { error: 'Method not allowed' }
})