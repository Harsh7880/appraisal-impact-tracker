import { supabase } from '../lib/supabase'
import { useEffect } from 'react'

export default function TestAuth() {
  useEffect(() => {
    const runTest = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error('Auth error:', userError)
        return
      }

      const user = userData.user

      const { error } = await supabase.from('logs').insert({
        user_id: user.id,
        title: 'Initial test log',
        description: 'Supabase + React setup successful',
        impact_type: 'Setup',
        effort_level: 'Low'
      })

      if (error) {
        console.error('Insert error:', error)
      } else {
        console.log('✅ Log inserted successfully')
      }
    }

    runTest()
  }, [])

  return <div>Testing auth & insert… check console</div>
}
