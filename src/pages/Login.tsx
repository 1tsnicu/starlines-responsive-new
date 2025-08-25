import React, { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { Button } from '@/components/ui/button'
import { useLocalization } from '@/contexts/LocalizationContext'

const Login = () => {
  const { t } = useLocalization()
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Toggle between Login and SignUp */}
        <div className="flex mb-6 bg-muted rounded-lg p-1">
          <Button
            variant={isLogin ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setIsLogin(true)}
          >
            {t('auth.login.button')}
          </Button>
          <Button
            variant={!isLogin ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setIsLogin(false)}
          >
            {t('auth.signUp.button')}
          </Button>
        </div>

        {/* Show appropriate form */}
        {isLogin ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  )
}

export default Login
