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
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Smart Campus</h1>
          <p className="text-sm text-text-muted mt-1">Operations Hub</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Sign in</h2>
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="University Email"
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
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div id="google-signin-btn" className="flex justify-center min-h-10">
                {googleLoading && <p className="text-xs text-text-muted">Signing in with Google...</p>}
              </div>
            </>
          )}

          <p className="mt-4 text-xs text-center text-text-muted">
            Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
