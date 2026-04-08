import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { getGoogleOAuthConfig, googleLogin, login } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { extractApiData } from '../../utils/apiData';

export default function LoginPage() {
  const [form, setForm] = useState({ universityEmailAddress: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const redirectAfterLogin = useCallback((account) => {
    if (account.role === 'USER') navigate('/portal');
    else navigate('/dashboard');
  }, [navigate]);

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response?.credential) return;

    setGoogleLoading(true);
    setError('');
    try {
      const res = await googleLogin(response.credential);
      const data = extractApiData(res);
      loginUser(data);
      redirectAfterLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [loginUser, redirectAfterLogin]);

  const renderGoogleButton = useCallback((clientId) => {
    if (!window.google?.accounts?.id) return;

    const buttonRoot = document.getElementById('google-signin-btn');
    if (!buttonRoot) return;

    buttonRoot.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(buttonRoot, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signin_with',
    });
  }, [handleGoogleResponse]);

  useEffect(() => {
    getGoogleOAuthConfig()
      .then((res) => {
        const config = extractApiData(res);
        if (config?.enabled && config?.clientId) {
          setGoogleClientId(config.clientId);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google OAuth config:', err);
      });
  }, []);

  useEffect(() => {
    if (!googleClientId) return undefined;

    if (window.google?.accounts?.id) {
      renderGoogleButton(googleClientId);
      return undefined;
    }

    let script = document.getElementById('google-gsi-script');

    const handleLoad = () => renderGoogleButton(googleClientId);

    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener('load', handleLoad);

    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, [googleClientId, renderGoogleButton]);

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
      <div className="w-full max-w-[340px]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-text-primary text-white">
            <GraduationCap size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-light text-text-primary">Sign in to Smart Campus</h1>
          <p className="mt-2 text-sm text-text-secondary">Use your campus account to continue.</p>
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

          {googleClientId && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-text-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div id="google-signin-btn" className="flex min-h-10 justify-center">
                {googleLoading && <p className="text-xs text-text-muted">Signing in with Google...</p>}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 rounded-md border border-border bg-white px-4 py-4 text-center text-sm text-text-secondary">
          New to the portal? <Link to="/register" className="font-medium text-primary-500 hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
