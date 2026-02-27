import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Logged in successfully!');
        
        // Store token and user data
        localStorage.setItem('kleoni_token', result.data.session?.access_token || result.data.token);
        localStorage.setItem('kleoni_user_id', result.data.session?.user_id || result.data.user?.id);
        localStorage.setItem('kleoni_user', JSON.stringify(result.data.user));
        
        if (onLogin) onLogin(result.data.user);
        
        // Redirect based on role or previous location
        const from = location.state?.from || '/';
        if (result.data.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Split name into first and last name
      const nameParts = signupName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signupEmail, 
          password: signupPassword,
          firstName,
          lastName
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Account created! Please check your email to verify your account, then login.');
        // Switch to login tab
        document.querySelector('[value="login"]')?.click();
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-24" data-testid="login-page">
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight text-center mb-8">
          Welcome to Kleoniverse
        </h1>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  data-testid="login-email"
                  required
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  data-testid="login-password"
                  required
                  className="rounded-full"
                />
              </div>
              <Button 
                type="submit" 
                data-testid="login-submit"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <button 
                type="button"
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Forgot Password?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  data-testid="signup-name"
                  required
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  data-testid="signup-email"
                  required
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  data-testid="signup-password"
                  required
                  minLength={6}
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="9876543210"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  data-testid="signup-phone"
                  required
                  className="rounded-full"
                />
              </div>
              <Button 
                type="submit" 
                data-testid="signup-submit"
                className="w-full rounded-full font-bold uppercase tracking-wide"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
