import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../api/users';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/constants';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(user.userId).then(res => setProfile(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user.userId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!profile) return null;

  const fields = [
    { icon: User, label: 'Full Name', value: profile.fullName },
    { icon: Mail, label: 'Email', value: profile.universityEmailAddress },
    { icon: Phone, label: 'Contact', value: profile.contactNumber || '—' },
    { icon: Shield, label: 'Role', value: profile.role },
    { icon: Calendar, label: 'Member Since', value: formatDate(profile.createdAt) },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-lg font-semibold mb-5">Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-semibold">
            {profile.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-base font-semibold">{profile.fullName}</p>
            <p className="text-sm text-text-muted">{profile.role}</p>
          </div>
        </div>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon size={16} className="text-text-muted shrink-0" />
              <div>
                <p className="text-xs text-text-muted">{f.label}</p>
                <p className="text-sm font-medium">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
