import { supabase } from '../lib/supabase'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Header() {
  const [email, setEmail] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const navLinkStyle = (path: string) => ({
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 10px',
    borderRadius: 6,
    color: location.pathname === path ? '#2563eb' : '#374151',
    background: location.pathname === path ? '#e0e7ff' : 'transparent',
    transition: 'all 0.15s ease',
  })

  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
      }}
    >
      <div
  style={{
    maxWidth: 1100,
    margin: '0 auto',
    padding: '14px 16px',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
  }}
>
  {/* Left: Brand */}
  <Link
    to="/logs"
    style={{
      textDecoration: 'none',
      color: '#111827',
      fontWeight: 700,
      fontSize: 18,
      justifySelf: 'start',
    }}
  >
    Appraisal Tracker
  </Link>

  {/* Center: Navigation */}
  <nav
    style={{
      display: 'flex',
      gap: 8,
      justifySelf: 'center',
      background: '#f1f5f9',
      padding: '4px',
      borderRadius: 10,
    }}
  >
    <Link to="/logs" style={navLinkStyle('/logs')}>
      Logs
    </Link>
    <Link to="/summary" style={navLinkStyle('/summary')}>
      Summary
    </Link>
  </nav>

  {/* Right: User */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      justifySelf: 'end',
    }}
  >
    {email && (
      <span style={{ fontSize: 13, color: '#6b7280' }}>
        {email}
      </span>
    )}

    <button
      onClick={() => supabase.auth.signOut()}
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
</div>

    </header>
  )
}
