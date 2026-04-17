import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { login } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { extractApiData } from '../../utils/apiData';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';

export default function LoginPage() {
  const [form, setForm] = useState({ universityEmailAddress: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const redirectAfterLogin = useCallback((account) => {
    if (account.role === 'USER') navigate('/portal');
    else navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(form);
      const data = extractApiData(res);
      loginUser(data);
      redirectAfterLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="w-full max-w-[28rem]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-linear-to-br from-primary-700 via-primary-600 to-primary-500 text-white shadow-[0_18px_34px_rgba(31,99,226,0.28)]">
            <GraduationCap size={22} />
          </div>
          <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary-700">Smart Campus Portal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Sign in to Smart Campus</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Use your campus account to continue into the refreshed operations workspace.</p>
        </div>

        <div className="auth-card">
          {error && (
            <div className="soft-alert mb-4 border-red-200 bg-red-50 text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="University email"
              type="email"
              required
              value={form.universityEmailAddress}
              onChange={(event) => setForm({ ...form, universityEmailAddress: event.target.value })}
              placeholder="you@uni.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Enter your password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleOAuthButton
            onAuthenticated={(data) => {
              loginUser(data);
              redirectAfterLogin(data);
            }}
          />
        </div>

        <div className="surface-panel-muted mt-4 px-4 py-4 text-center text-sm text-text-secondary">
          New to the portal? <Link to="/register" className="font-medium text-primary-500 hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
