import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
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
      <div className="auth-grid">
        <section className="auth-showcase">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/12 text-white">
                <GraduationCap size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">Smart Campus</p>
                <p className="mt-1 text-lg font-semibold">Operations Hub</p>
              </div>
            </div>

            <div className="mt-10 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">Unified workspace</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-white">
                Run campus operations from a cleaner, faster control layer.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/72">
                Sign in to review incident activity, reserve shared resources, and keep every request visible from one modern operations workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-4">
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-primary-200" />
                <div>
                  <p className="text-sm font-semibold text-white">Protected account access</p>
                  <p className="mt-1 text-sm leading-6 text-white/68">Use your university identity or Google sign-in when enabled by the backend configuration.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="mt-0.5 text-primary-200" />
                <div>
                  <p className="text-sm font-semibold text-white">Operational visibility</p>
                  <p className="mt-1 text-sm leading-6 text-white/68">Bookings, tickets, resources, and updates stay connected so users and administrators work from the same live data.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="mx-auto flex w-full max-w-[380px] flex-col justify-center">
            <div className="rounded-[18px] border border-border bg-white/78 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <p className="page-kicker">Welcome back</p>
              <h2 className="mt-2 text-[1.85rem] font-semibold tracking-tight text-text-primary">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Use your campus credentials to continue into the Smart Campus workspace.</p>
            </div>

            <div className="mt-6 rounded-[26px] border border-border bg-white/88 p-6 shadow-[0_22px_44px_rgba(15,23,42,0.08)] sm:p-7">
              {error && (
                <div className="soft-alert mb-5 border-red-200 bg-red-50 text-danger">
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
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">or continue</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="rounded-[18px] border border-border bg-white/80 p-3">
                    <div id="google-signin-btn" className="flex min-h-10 justify-center">
                      {googleLoading && <p className="text-xs text-text-muted">Signing in with Google...</p>}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-border bg-white/72 px-4 py-4 text-sm text-text-secondary">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary-600" />
              <p>
                New to the portal?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
