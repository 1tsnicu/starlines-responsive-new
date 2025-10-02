import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Eroare la confirmarea email-ului. Te rugăm să încerci din nou.')
          setLoading(false)
          return
        }

        if (data.session) {
          // User is now authenticated
          setSuccess(true)
          
          // Create profile if it doesn't exist
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email || '',
                first_name: data.session.user.user_metadata?.first_name || '',
                last_name: data.session.user.user_metadata?.last_name || '',
                phone: data.session.user.user_metadata?.phone || '',
                is_admin: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Error creating profile:', insertError)
            }
          }

          // Redirect to home page after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          setError('Nu s-a putut confirma email-ul. Te rugăm să verifici linkul.')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('A apărut o eroare neprevăzută. Te rugăm să încerci din nou.')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Se confirmă email-ul...</h2>
            <p className="text-muted-foreground">
              Te rugăm să aștepți în timp ce confirmăm email-ul tău.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Email Confirmat!</h2>
            <p className="text-muted-foreground mb-4">
              Email-ul tău a fost confirmat cu succes. Contul tău este acum activ.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Vei fi redirecționat automat pe pagina principală în câteva secunde...
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Mergi la Pagina Principală
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Eroare la Confirmare</h2>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/login')} className="w-full">
                Mergi la Login
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Pagina Principală
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default AuthCallback
