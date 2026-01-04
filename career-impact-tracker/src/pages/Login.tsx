import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const signIn = async () => {
    if (!email) {
      alert('Please enter your email')
      return
    }

    setLoading(true)

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      navigate('/logs')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the login link')
    }

    setLoading(false)
  }
   useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        navigate('/logs')
      }
    }

    checkSession()
  }, [navigate])

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 6 }}>
          Welcome to Appraisal Tracker
        </h2>

        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          Log your work, track impact, and generate appraisal-ready summaries.
        </p>

        <label
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Work Email
        </label>

        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            marginBottom: 16,
          }}
        />

        <button
          onClick={signIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Sending magic link…' : 'Send Magic Link'}
        </button>

        <p
          style={{
            fontSize: 12,
            color: '#6b7280',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          We’ll email you a secure login link. No password required.
        </p>
      </div>
    </div>
  )
}
