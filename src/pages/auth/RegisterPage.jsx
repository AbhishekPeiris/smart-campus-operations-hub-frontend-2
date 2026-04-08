import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, GraduationCap, ShieldCheck, UserPlus } from 'lucide-react';
import { register } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', universityEmailAddress: '', password: '', contactNumber: '', role: 'USER' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
                <p className="mt-1 text-lg font-semibold">Create your portal access</p>
              </div>
            </div>

            <div className="mt-10 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">Member onboarding</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-white">
                Join the campus operations platform with one streamlined account.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/72">
                Register once to report incidents, request resource bookings, and follow every update through a single member portal.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-4">
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-primary-200" />
                <div>
                  <p className="text-sm font-semibold text-white">Validated access details</p>
                  <p className="mt-1 text-sm leading-6 text-white/68">Your registration feeds the same identity model used by the booking, ticketing, and notification services.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <UserPlus size={18} className="mt-0.5 text-primary-200" />
                <div>
                  <p className="text-sm font-semibold text-white">Ready for day-one use</p>
                  <p className="mt-1 text-sm leading-6 text-white/68">Once your account is created, you can immediately start filing issues, checking resource availability, and managing bookings.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="mx-auto flex w-full max-w-[420px] flex-col justify-center">
            <div className="rounded-[18px] border border-border bg-white/78 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <p className="page-kicker">Get started</p>
              <h2 className="mt-2 text-[1.85rem] font-semibold tracking-tight text-text-primary">Create account</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Set up your portal profile to access campus support, booking, and service workflows.</p>
            </div>

            <div className="mt-6 rounded-[26px] border border-border bg-white/88 p-6 shadow-[0_22px_44px_rgba(15,23,42,0.08)] sm:p-7">
              {error && <div className="soft-alert mb-5 border-red-200 bg-red-50 text-danger">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full name" required value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
                <Input label="University email" type="email" required value={form.universityEmailAddress} onChange={set('universityEmailAddress')} placeholder="you@uni.com" />
                <Input label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="Use a strong password" error={fieldErrors.password} />
                <Input label="Contact number" value={form.contactNumber} onChange={set('contactNumber')} placeholder="0771234567" maxLength={10} error={fieldErrors.contactNumber} />
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
              </form>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-border bg-white/72 px-4 py-4 text-sm text-text-secondary">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary-600" />
              <p>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
