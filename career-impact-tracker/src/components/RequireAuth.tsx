import { supabase } from '../lib/supabase'
import { useEffect, useState, type JSX } from 'react'
import { Navigate } from 'react-router-dom'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  if (!authenticated) return <Navigate to="/" />

  return children
}
