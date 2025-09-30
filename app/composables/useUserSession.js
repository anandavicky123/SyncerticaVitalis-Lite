import { v4 as uuidv4 } from 'uuid'
import { ref, readonly } from 'vue'

export const useUserSession = () => {
  const userId = ref('')

  const initializeUser = async () => {
    if (!import.meta.client) return;
    
    try {
      // FIRST: Check localStorage (most reliable)
      let storedUserId = localStorage.getItem('syncertica-user-id')
      
      if (storedUserId) {
        userId.value = storedUserId
        console.log('✅ Using localStorage user ID:', storedUserId)
        
        // Also set cookie as backup
        setCookie('syncertica-user-id', storedUserId, 365)
        return storedUserId
      }
      
      // SECOND: Check client-side cookie
      storedUserId = getCookie('syncertica-user-id')
      
      if (storedUserId) {
        userId.value = storedUserId
        localStorage.setItem('syncertica-user-id', storedUserId)
        console.log('✅ Using cookie user ID:', storedUserId)
        return storedUserId
      }
      
      // THIRD: Try server-side cookie
      try {
        const response = await fetch('/api/user-session')
        const data = await response.json()
        
        if (data.userId) {
          userId.value = data.userId
          localStorage.setItem('syncertica-user-id', data.userId)
          setCookie('syncertica-user-id', data.userId, 365)
          
          console.log(data.isNew ? '🆕 Generated new user ID:' : '✅ Server user ID:', data.userId)
          return data.userId
        }
      } catch (error) {
        console.warn('Server session failed:', error)
      }
      
      // FALLBACK: Generate new UUID
      const newUserId = uuidv4()
      userId.value = newUserId
      localStorage.setItem('syncertica-user-id', newUserId)
      setCookie('syncertica-user-id', newUserId, 365)
      console.log('🔄 Fallback new user ID:', newUserId)
      
      return newUserId
      
    } catch (error) {
      console.error('Failed to initialize user:', error)
      
      // Emergency fallback
      const emergencyId = uuidv4()
      userId.value = emergencyId
      localStorage.setItem('syncertica-user-id', emergencyId)
      console.log('🚨 Emergency user ID:', emergencyId)
      return emergencyId
    }
  }

  const getUserId = async () => {
    if (!userId.value && import.meta.client) {
      return await initializeUser()
    }
    return userId.value
  }

  const clearSession = async () => {
    if (import.meta.client) {
      // Clear localStorage and cookies
      localStorage.removeItem('syncertica-user-id')
      deleteCookie('syncertica-user-id')
      userId.value = ''
      
      try {
        // Regenerate new session on server
        await fetch('/api/user-session', { method: 'POST' })
        await initializeUser()
      } catch (error) {
        console.error('Failed to regenerate session:', error)
        // Fallback to client-side generation
        const newUserId = uuidv4()
        localStorage.setItem('syncertica-user-id', newUserId)
        setCookie('syncertica-user-id', newUserId, 365)
        userId.value = newUserId
      }
    }
  }

  // Cookie utility functions
  const setCookie = (name, value, days) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  const getCookie = (name) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }

  return {
    userId: readonly(userId),
    initializeUser,
    getUserId,
    clearSession
  }
}
