import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession()
      setEmail(data.session?.user.email ?? null)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user.email ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid #eee'
      }}
    >
      <Link to="/logs">
        <strong>Appraisal Tracker</strong>
      </Link>

      {email ? (
        <div>
          <span style={{ marginRight: 12 }}>{email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <Link to="/">
          <button>Login</button>
        </Link>
      )}
    </div>
  )
}
