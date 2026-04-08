import { useEffect, useState } from 'react';
import { Calendar, Mail, Phone, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { getUserProfile } from '../../api/users';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/constants';
import { extractApiData, normalizeUser } from '../../utils/apiData';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    getUserProfile(user.id)
      .then((res) => {
        const normalizedProfile = normalizeUser(extractApiData(res));
        setProfile(normalizedProfile);
        updateUser(normalizedProfile);
      })
      .catch((err) => {
        console.error('Failed to load user profile:', err);
      })
      .finally(() => setLoading(false));
  }, [user?.id, updateUser]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  if (!profile) return null;

  const fields = [
    { icon: User, label: 'Full Name', value: profile.fullName },
    { icon: Mail, label: 'Email', value: profile.universityEmailAddress },
    { icon: Phone, label: 'Contact', value: profile.contactNumber || '-' },
    { icon: Shield, label: 'Role', value: profile.role },
    { icon: Calendar, label: 'Member Since', value: formatDate(profile.createdAt) },
  ];

  return (
    <div className="app-page max-w-4xl">
      <div className="page-header">
        <div>
          <p className="page-kicker">Account</p>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your identity, contact details, and portal access role at a glance.</p>
        </div>
      </div>

      <Card className="surface-panel overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
          <div className="bg-[linear-gradient(180deg,rgba(15,92,192,0.96),rgba(13,78,159,0.96))] px-6 py-8 text-white">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[24px] bg-white/14 text-3xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
              {profile.fullName?.charAt(0)}
            </div>
            <p className="mt-5 text-2xl font-semibold">{profile.fullName}</p>
            <p className="mt-2 inline-flex rounded-[14px] border border-white/18 bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/84">
              {profile.role}
            </p>
            <p className="mt-5 text-sm leading-6 text-white/76">
              This profile card stays in sync with the authenticated session so your portal experience matches your current access level.
            </p>
          </div>

          <div className="px-6 py-8">
            <div className="detail-grid">
              {fields.map((field) => (
                <div key={field.label} className="detail-tile">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary-50 text-primary-700">
                      <field.icon size={17} />
                    </span>
                    <div>
                      <p className="detail-tile__label">{field.label}</p>
                      <p className="detail-tile__value">{field.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
