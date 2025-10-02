import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
  updated_at: string
  is_admin: boolean
  avatar_url: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AuthError | null }>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
        
        // If user just confirmed email, redirect to home
        if (event === 'SIGNED_IN' && session.user.email_confirmed_at) {
          navigate('/')
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    phone: string
  ): Promise<{ error: AuthError | null; needsEmailConfirmation?: boolean; userExists?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone
          }
        }
      })

      if (error) {
        // Check if user already exists
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          return { error: null, userExists: true }
        }
        return { error }
      }
      
      if (data.user && !data.user.email_confirmed_at) {
        // User created but needs email confirmation
        return { error: null, needsEmailConfirmation: true }
      }

      if (data.user) {
        // User is immediately confirmed (for development/testing)
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          return { error: { message: profileError.message, status: 400 } as AuthError }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error as AuthError }
    }
  }

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      return { error }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      // Redirect to home page
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: AuthError | null }> => {
    if (!user) {
      return { error: { message: 'No user logged in', status: 401 } as AuthError }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        return { error: { message: error.message, status: 400 } as AuthError }
      }

      // Refresh profile
      await fetchProfile(user.id)

      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error: error as AuthError }
    }
  }

  const isAdmin = profile?.is_admin || false

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
