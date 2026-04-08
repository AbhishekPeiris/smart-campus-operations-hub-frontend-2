import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
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
        <aside className="auth-showcase">
          <div className="relative z-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/16 bg-white/12">
              <GraduationCap size={26} className="text-white" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-white/72">Enterprise Campus Operations</p>
            <h1 className="mt-3 max-w-lg text-4xl font-semibold tracking-tight text-balance">
              A cleaner control center for tickets, bookings, and campus service visibility.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/74">
              Access the operations workspace built for students, technicians, and administrators with clear workflows and structured status tracking.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              { icon: ShieldCheck, title: 'Trusted sign-in', text: 'University authentication with role-aware routing after login.' },
              { icon: Sparkles, title: 'Unified workflow', text: 'One place to report incidents, review bookings, and monitor response activity.' },
              { icon: CheckCircle2, title: 'Operational clarity', text: 'Structured cards, cleaner tables, and focused detail views across the product.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/14 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/12 text-white">
                    <item.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/72">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="auth-card">
          <div className="mb-8">
            <p className="page-kicker">Welcome Back</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Use your campus account to enter the Smart Campus operations workspace.
            </p>
          </div>

          {error && (
            <div className="soft-alert mb-5 border-red-200 bg-red-50 text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div id="google-signin-btn" className="flex min-h-10 justify-center">
                {googleLoading && <p className="text-xs text-text-muted">Signing in with Google...</p>}
              </div>
            </>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 rounded-[20px] border border-border bg-surface-alt/60 px-4 py-4 text-sm text-text-secondary">
            <span>Need a new account?</span>
            <Link to="/register" className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-800">
              Register
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
