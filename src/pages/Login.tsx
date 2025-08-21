import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, Users, Route, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import { authService, User, UserRole } from "@/lib/auth";
import { auditLogger, AuditEventType } from "@/lib/audit";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginSuccess = async (user: User) => {
    try {
      setIsAuthenticating(true);
      
      // Log successful login
      auditLogger.logAuthEvent(AuditEventType.USER_LOGIN, user.email, {
        loginMethod: "form",
        userRole: user.role,
        timestamp: new Date().toISOString(),
        redirectUrl: window.location.href
      });

      // Show success message
      toast.success(`Welcome back, ${user.username}! Redirecting...`);

      // Redirect based on user role
      setTimeout(() => {
        switch (user.role) {
          case UserRole.SUPER_ADMIN:
          case UserRole.ADMIN:
            navigate("/admin/routes");
            break;
          case UserRole.MODERATOR:
            navigate("/admin/routes");
            break;
          case UserRole.USER:
            navigate("/transport-routes");
            break;
          default:
            navigate("/");
        }
      }, 1000);

    } catch (error) {
      console.error("Error handling login success:", error);
      toast.error("Login successful but there was an error redirecting");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Full system access, user management, and configuration";
      case UserRole.ADMIN:
        return "Route management, system monitoring, and user oversight";
      case UserRole.MODERATOR:
        return "Route creation, editing, and content moderation";
      case UserRole.USER:
        return "View routes, make bookings, and access public features";
      default:
        return "Basic access to public information";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Settings className="h-5 w-5" />;
      case UserRole.ADMIN:
        return <Shield className="h-5 w-5" />;
      case UserRole.MODERATOR:
        return <Route className="h-5 w-5" />;
      case UserRole.USER:
        return <Users className="h-5 w-5" />;
      default:
        return <Eye className="h-5 w-5" />;
    }
  };

  const roles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.USER
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Login Form */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Starlines</h1>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Secure Access Portal
              </h2>
              <p className="text-foreground/70 max-w-md">
                Sign in to access your Starlines account and manage transport routes, 
                user accounts, and system configurations.
              </p>
            </div>

            <LoginForm 
              onSuccess={handleLoginSuccess}
              onCancel={handleCancel}
            />

            {/* Security Features */}
            <div className="mt-8 w-full max-w-md">
              <Card className="border-border bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Security Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs text-foreground/70">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>CSRF Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Rate Limiting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Input Validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Audit Logging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Session Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Secure Storage</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Role Information */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  User Roles & Permissions
                </h3>
                <p className="text-foreground/70">
                  Different access levels for different responsibilities
                </p>
              </div>

              <div className="grid gap-4">
                {roles.map((role) => (
                  <Card key={role} className="border-border bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {getRoleIcon(role)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 capitalize">
                            {role.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-foreground/70">
                            {getRoleDescription(role)}
                          </p>
                        </div>
                        <div className="text-xs text-foreground/50 bg-muted/30 px-2 py-1 rounded">
                          {role}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Demo Access Info */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Demo Access
                  </h4>
                  <p className="text-sm text-foreground/70 mb-3">
                    Use the demo buttons to quickly test different user roles and permissions.
                  </p>
                  <div className="text-xs text-foreground/60">
                    <p><strong>Demo Password:</strong> password123</p>
                    <p><strong>Note:</strong> All demo actions are logged for security purposes</p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-600" />
                    Security Notice
                  </h4>
                  <p className="text-sm text-foreground/80">
                    This is a secure application with comprehensive logging and monitoring. 
                    All user actions are recorded for security and compliance purposes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg border border-border/20">
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Shield className="h-4 w-4 text-primary" />
              <span>Enterprise Security</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Lock className="h-4 w-4 text-primary" />
              <span>256-bit Encryption</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Eye className="h-4 w-4 text-primary" />
              <span>24/7 Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Setting up your session...
            </h3>
            <p className="text-foreground/70">
              Please wait while we securely authenticate your account
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
