import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { register } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/useAuth';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', universityEmailAddress: '', password: '', contactNumber: '', role: 'USER' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const redirectAfterLogin = (account) => {
    if (account.role === 'USER') navigate('/portal');
    else navigate('/dashboard');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setFieldErrors({});

    const errors = {};
    if (form.contactNumber) {
      if (!/^\d*$/.test(form.contactNumber)) {
        errors.contactNumber = 'Contact number must contain only digits';
      }
      if (form.contactNumber.length > 10) {
        errors.contactNumber = 'Contact number must be at most 10 digits';
      }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number and special character';
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (event) => {
    let value = event.target.value;
    if (key === 'contactNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setForm({ ...form, [key]: value });
    setFieldErrors({ ...fieldErrors, [key]: undefined });
    setError('');
  };

  const handleGoogleAuthenticated = (data) => {
    loginUser(data);
    redirectAfterLogin(data);
  };

  return (
    <div className="auth-shell">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-text-primary text-white">
            <GraduationCap size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-light text-text-primary">Create your account</h1>
          <p className="mt-2 text-sm text-text-secondary">Register for access to the Smart Campus portal.</p>
        </div>

        <div className="auth-card">
          {error && <div className="soft-alert mb-4 border-red-200 bg-red-50 text-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" required value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
            <Input label="University email" type="email" required value={form.universityEmailAddress} onChange={set('universityEmailAddress')} placeholder="you@uni.com" />
            <Input label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="Use a strong password" error={fieldErrors.password} />
            <Input label="Contact number" value={form.contactNumber} onChange={set('contactNumber')} placeholder="0771234567" maxLength={10} error={fieldErrors.contactNumber} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleOAuthButton onAuthenticated={handleGoogleAuthenticated} />
        </div>

        <div className="mt-4 rounded-md border border-border bg-white px-4 py-4 text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="font-medium text-primary-500 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
