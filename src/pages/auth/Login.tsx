import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useIntlayer } from 'react-intlayer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setProfile } = useAuthStore();
  const {
    title,
    subtitle,
    emailLabel,
    emailPlaceholder,
    passwordLabel,
    passwordPlaceholder,
    forgotPassword,
    signInButton,
    signingIn,
    dontHaveAccount,
    registerLink
  } = useIntlayer('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Fetch profile to get role
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);

        // Redirect based on role
        const role = profileData?.role;
        if (role === 'patient') navigate('/patient/dashboard');
        else if (role === 'doctor') navigate('/doctor/dashboard');
        else if (role === 'hospital') navigate('/hospital/dashboard');
        else navigate('/'); // Fallback
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
        <CardDescription className="text-center font-medium">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              {emailLabel}
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder={emailPlaceholder} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                {passwordLabel}
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline font-medium">
                {forgotPassword}
              </Link>
            </div>
            <Input 
              id="password" 
              type="password"
              placeholder={passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {signingIn}
              </>
            ) : (
              signInButton
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-gray-500 font-medium">
          {dontHaveAccount}{' '}
          <Link to="/auth/register" className="text-primary font-semibold hover:underline">
            {registerLink}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}