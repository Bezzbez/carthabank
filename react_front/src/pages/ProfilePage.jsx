import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const qc = useQueryClient();
  const { user, updateUser } = useAuth();
  
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.user.getProfile().then(r => r.data),
  });

  useEffect(() => {
    if (data?.user) {
      setProfileForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || '',
      });
    }
  }, [data]);

  const profileMutation = useMutation({
    mutationFn: (data) => api.user.updateProfile(data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      updateUser(res.data.user);
      qc.invalidateQueries(['profile']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.api.put('/users/password', data), // Using raw api instance as it wasn't exposed in service layer directly
    onSuccess: () => {
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Password update failed'),
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    passwordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal information and security preferences</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{user?.firstName} {user?.lastName}</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>{user?.email}</div>
              <span className={`badge badge-${user?.role === 'admin' ? 'warning' : user?.role === 'gestionnaire' ? 'purple' : 'info'}`}>
                {user?.role} Account
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Personal Information</h3>
          {isLoading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading profile...</div>
          ) : (
            <form onSubmit={handleProfileSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" required value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" required value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Security & Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" required minLength={8} value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              <div className="form-hint">Must be at least 8 characters long</div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-secondary" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: 12 }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button type="button" className="btn btn-danger" onClick={() => toast('Account deletion must be requested through support.', { icon: 'ℹ️' })}>
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
