import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')

  const signIn = async () => {
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for login link')
  }

  return (
    <div>
      <h2>Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={signIn}>Send magic link</button>
    </div>
  )
}
