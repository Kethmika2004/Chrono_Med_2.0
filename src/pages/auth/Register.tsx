import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2, User, Stethoscope, Building2 } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'patient' | 'doctor' | 'hospital' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  // Additional fields depending on role
  const [licenseNumber, setLicenseNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into user_profiles
        const profilePayload = {
          id: authData.user.id,
          role: role,
          full_name: fullName,
          email: email,
          contact_number: contactNumber,
          is_verified: role === 'patient', // Patients verified immediately, others maybe need manual
          license_number: role === 'doctor' ? licenseNumber : null,
          registration_number: role === 'hospital' ? registrationNumber : null,
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([profilePayload]);

        if (profileError) {
          // If inserting profile fails, we probably should handle cleanup or alert, but for now just throw
          throw profileError;
        }

        // Redirect to OTP Verify or login depending on whether email verification is enforced
        // By default Supabase sends confirmation email if enabled.
        navigate('/auth/login', { state: { message: 'Registration successful! Please check your email to verify your account or login.' } });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          {step === 1 ? 'Select your account type to begin' : 'Fill in your details to register'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm mb-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setRole('patient'); setStep(2); }}
              className="flex items-center p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                <User className="text-teal-700 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Patient</h3>
                <p className="text-sm text-gray-500">Book appointments and manage health records</p>
              </div>
            </button>
            <button
              onClick={() => { setRole('doctor'); setStep(2); }}
              className="flex items-center p-4 border rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                <Stethoscope className="text-amber-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Doctor</h3>
                <p className="text-sm text-gray-500">Manage sessions, appointments, and patients</p>
              </div>
            </button>
            <button
              onClick={() => { setRole('hospital'); setStep(2); }}
              className="flex items-center p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Building2 className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hospital / Clinic</h3>
                <p className="text-sm text-gray-500">Manage doctors, departments, and analytics</p>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name {role === 'hospital' && '/ Hospital Name'}</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Number</label>
              <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
            </div>

            {role === 'doctor' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Medical License Number</label>
                <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
              </div>
            )}

            {role === 'hospital' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Number</label>
                <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required />
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-100 pt-6">
        <div className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}