import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { GraduationCap } from 'lucide-react';

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
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Create Account</h1>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Full Name" required value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
            <Input label="University Email" type="email" required value={form.universityEmailAddress} onChange={set('universityEmailAddress')} placeholder="you@uni.com" />
            <Input label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="Min 8 characters, include Test@123 style" error={fieldErrors.password} />
            <Input label="Contact Number" value={form.contactNumber} onChange={set('contactNumber')} placeholder="0771234567" maxLength={10} error={fieldErrors.contactNumber} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
          </form>
          <p className="mt-4 text-xs text-center text-text-muted">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
