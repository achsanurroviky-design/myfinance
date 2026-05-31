import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async () => {
    const result = await signInWithPopup(auth, provider)
    const token = result._tokenResponse?.oauthAccessToken
    if (token) setAccessToken(token)
    return result
  }

  const logout = () => {
    setAccessToken(null)
    signOut(auth)
  }

  return { user, loading, login, logout, accessToken }
}