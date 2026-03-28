'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Leaf, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your local inbox at http://localhost:54324 to confirm!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/') // Redirect to home after login
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-pompey-bg">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pompey-teal to-pompey-gold shadow-lg shadow-pompey-teal/20">
            <Leaf className="text-pompey-bg w-10 h-10 fill-current" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-4">GoKind</h1>
          <p className="text-slate-400">Portsmouth’s 100 Year Celebration</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleAuth} className="mt-8 space-y-4">
          {error && (
            <div className="p-3 text-xs text-pompey-coral bg-pompey-coral/10 border border-pompey-coral/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-pompey-card border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-pompey-teal transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-pompey-card border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-pompey-teal transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pompey-teal hover:bg-opacity-90 text-pompey-bg font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : isSignUp ? 'Create Account' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Toggle between Login/Signup */}
        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-400 hover:text-pompey-teal transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Join the movement"}
          </button>
        </div>
      </div>
    </div>
  )
}