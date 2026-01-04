import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string | null>(null)

  // ✅ Listen to auth state changes (LOGIN / LOGOUT)
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setEmail(data.session?.user.email ?? null)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ✅ Proper logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setEmail(null) // immediately clear UI
    navigate('/')
  }

  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left */}
        <Link
          to={email ? '/logs' : '/'}
          style={{
            textDecoration: 'none',
            color: '#111827',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Appraisal Tracker
        </Link>

        {/* Center nav ONLY if logged in */}
        {email && (
          <div
            style={{
              background: '#f1f5f9',
              padding: 4,
              borderRadius: 999,
              display: 'flex',
              gap: 4,
            }}
          >
            <Link
              to="/logs"
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 13,
                textDecoration: 'none',
                color: '#111827',
              }}
            >
              Logs
            </Link>
            <Link
              to="/summary"
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 13,
                textDecoration: 'none',
                color: '#111827',
              }}
            >
              Summary
            </Link>
          </div>
        )}

        {/* Right auth UI ONLY if logged in */}
        {email && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: '#6b7280',
              }}
            >
              {email}
            </span>

            <button
              onClick={handleLogout}
              style={{
                fontSize: 13,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
