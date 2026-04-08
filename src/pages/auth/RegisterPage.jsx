import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowRight, CheckCircle2, GraduationCap, LockKeyhole, UserRoundPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', universityEmailAddress: '', password: '', contactNumber: '', role: 'USER' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setFieldErrors({});
    // validate phone and password
    const errors = {};
    if (form.contactNumber) {
      if (!/^\d*$/.test(form.contactNumber)) {
        errors.contactNumber = 'Contact number must contain only digits';
      }
      if (form.contactNumber.length > 10) {
        errors.contactNumber = 'Contact number must be at most 10 digits';
      }
    }
    // password: at least 8 chars, one upper, one lower, one digit, one special
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!pwdRegex.test(form.password)) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number and special character (e.g. Test@123)';
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

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === 'contactNumber') {
      // keep digits only and limit to 10 characters
      v = v.replace(/\D/g, '').slice(0, 10);
    }
    setForm({ ...form, [k]: v });
    setFieldErrors({ ...fieldErrors, [k]: undefined });
    setError('');
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <aside className="auth-showcase">
          <div className="relative z-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/16 bg-white/12">
              <GraduationCap size={26} className="text-white" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-white/72">Smart Campus Access</p>
            <h1 className="mt-3 max-w-lg text-4xl font-semibold tracking-tight text-balance">
              Create your portal account and join the operations workspace.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/74">
              New users can register once, then move between resource booking, incident reporting, and profile tracking without leaving the platform.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              { icon: UserRoundPlus, title: 'Quick onboarding', text: 'Create a user profile with university identity and contact details.' },
              { icon: LockKeyhole, title: 'Stronger password policy', text: 'Account setup respects the existing password validation rules in the backend flow.' },
              { icon: CheckCircle2, title: 'Immediate portal access', text: 'Once approved, you can book resources and submit service incidents right away.' },
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
            <p className="page-kicker">Create Account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">Register for portal access</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Set up your campus account details to start using the Smart Campus operations tools.
            </p>
          </div>

          {error && <div className="soft-alert mb-5 border-red-200 bg-red-50 text-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" required value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
            <Input label="University Email" type="email" required value={form.universityEmailAddress} onChange={set('universityEmailAddress')} placeholder="you@uni.com" />
            <Input label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="Min 8 characters, include Test@123 style" error={fieldErrors.password} />
            <Input label="Contact Number" value={form.contactNumber} onChange={set('contactNumber')} placeholder="0771234567" maxLength={10} error={fieldErrors.contactNumber} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
          </form>

          <div className="mt-8 flex items-center justify-between gap-3 rounded-[20px] border border-border bg-surface-alt/60 px-4 py-4 text-sm text-text-secondary">
            <span>Already have an account?</span>
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-800">
              Sign in
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
