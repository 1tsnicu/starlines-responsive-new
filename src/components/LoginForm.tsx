import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService, UserRole } from "@/lib/auth";
import { validateAndSanitize, CSRFProtection, RateLimiter } from "@/lib/validation";
import { auditLogger, AuditEventType } from "@/lib/audit";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onCancel?: () => void;
}

const LoginForm = ({ onSuccess, onCancel }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Generate CSRF token on component mount
  useState(() => {
    setCsrfToken(CSRFProtection.generateToken());
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      // Rate limiting check
      const clientId = `${formData.email}_${window.location.hostname}`;
      if (!RateLimiter.isAllowed(clientId)) {
        const remainingTime = Math.ceil((RateLimiter.getRemainingAttempts(clientId) * 15 * 60 * 1000) / (1000 * 60));
        throw new Error(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
      }

      // Validate and sanitize input
      const sanitizedData = validateAndSanitize.user.login(formData);

      // Validate CSRF token
      if (!CSRFProtection.validateToken(csrfToken)) {
        auditLogger.logSecurityEvent(AuditEventType.CSRF_VIOLATION, {
          form: "login",
          email: sanitizedData.email,
          ipAddress: "127.0.0.1" // In production, get from request
        });
        throw new Error("Security validation failed. Please refresh the page and try again.");
      }

      // Attempt login
      const result = await authService.login(sanitizedData.email, sanitizedData.password);
      
      // Log successful login
      auditLogger.logAuthEvent(AuditEventType.USER_LOGIN, result.user.email, {
        loginMethod: "email_password",
        userRole: result.user.role,
        timestamp: new Date().toISOString()
      });

      // Clear rate limiting for this user
      RateLimiter.clearAttempts(clientId);

      // Success
      toast.success(`Welcome back, ${result.user.username}!`);
      onSuccess(result.user);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);

      // Log failed login attempt
      auditLogger.logAuthEvent(AuditEventType.USER_LOGIN_FAILED, formData.email, {
        reason: errorMessage,
        timestamp: new Date().toISOString(),
        ipAddress: "127.0.0.1" // In production, get from request
      });

      // Check if it's a rate limiting error
      if (errorMessage.includes("Too many login attempts")) {
        toast.error(errorMessage);
      } else {
        toast.error("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    try {
      setIsLoading(true);
      setError(null);

      let email: string;
      switch (role) {
        case UserRole.SUPER_ADMIN:
          email = "admin@starlines.md";
          break;
        case UserRole.MODERATOR:
          email = "moderator@starlines.md";
          break;
        case UserRole.USER:
          email = "user@starlines.md";
          break;
        default:
          email = "user@starlines.md";
      }

      const result = await authService.login(email, "password123");
      
      // Log successful demo login
      auditLogger.logAuthEvent(AuditEventType.USER_LOGIN, result.user.email, {
        loginMethod: "demo",
        userRole: result.user.role,
        isDemo: true,
        timestamp: new Date().toISOString()
      });

      toast.success(`Demo login successful as ${result.user.role}!`);
      onSuccess(result.user);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Demo login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
        <p className="text-foreground/70">Sign in to your Starlines account</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CSRF Token (hidden) */}
          <input type="hidden" name="csrf_token" value={csrfToken} />
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-foreground/50" />
                ) : (
                  <Eye className="h-4 w-4 text-foreground/50" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs text-foreground/70">
                <p className="font-medium mb-1">Security Features Active:</p>
                <ul className="space-y-1">
                  <li>• CSRF Protection</li>
                  <li>• Rate Limiting</li>
                  <li>• Input Validation</li>
                  <li>• Audit Logging</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Demo Login Buttons */}
          <div className="space-y-2">
            <p className="text-xs text-foreground/50 text-center">Demo Accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.USER)}
                disabled={isLoading}
                className="text-xs"
              >
                User
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.MODERATOR)}
                disabled={isLoading}
                className="text-xs"
              >
                Moderator
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.SUPER_ADMIN)}
                disabled={isLoading}
                className="text-xs"
              >
                Admin
              </Button>
            </div>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </form>

        {/* Additional Security Info */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center text-xs text-foreground/50">
            <p className="mb-2">🔒 All login attempts are logged and monitored</p>
            <p>🛡️ Multiple failed attempts will trigger rate limiting</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
