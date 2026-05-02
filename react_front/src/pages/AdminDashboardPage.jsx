import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminDashboardPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('users'); // users or settings

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.admin.getStats().then(r => r.data),
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.admin.getUsers().then(r => r.data),
  });

  const toggleUserMutation = useMutation({
    mutationFn: (userId) => api.admin.toggleUserStatus(userId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['adminUsers']);
      qc.invalidateQueries(['adminStats']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Action failed'),
  });

  const stats = [
    { label: 'Total Users', value: statsData?.totalUsers || 0, icon: '👥', color: 'blue' },
    { label: 'Active Accounts', value: statsData?.totalAccounts || 0, icon: '🏦', color: 'gold' },
    { label: 'Total Deposits', value: `$${parseFloat(statsData?.totalDeposits || 0).toLocaleString()}`, icon: '💰', color: 'green' },
    { label: 'Total Transfers', value: statsData?.totalTransfers || 0, icon: '🔄', color: 'purple' },
  ];

  const users = usersData?.users || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and user management</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 30 }}>
        {loadingStats ? (
          <div style={{ padding: 20, color: 'var(--text-muted)' }}>Loading stats...</div>
        ) : (
          stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon stat-icon-${s.color}`}>
                <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
          <button className={`btn ${activeTab === 'users' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('users')}>
            User Management
          </button>
          <button className={`btn ${activeTab === 'settings' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('settings')}>
            System Logs
          </button>
        </div>

        {activeTab === 'users' && (
          <div>
            {loadingUsers ? (
              <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading users...</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                        <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'gestionnaire' ? 'purple' : 'info'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td><span className={`badge badge-${u.isActive ? 'success' : 'danger'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select 
                                className="form-input" 
                                style={{ width: 'auto', padding: '4px 8px', height: '30px', fontSize: '0.8rem' }}
                                value={u.role}
                                onChange={(e) => {
                                  if(window.confirm(`Change role to ${e.target.value}?`)) {
                                    api.admin.changeRole(u.id, e.target.value)
                                      .then(() => qc.invalidateQueries(['adminUsers']))
                                      .catch(err => toast.error(err.response?.data?.error || 'Role change failed'));
                                  }
                                }}
                              >
                                <option value="client">Client</option>
                                <option value="gestionnaire">Gestionnaire</option>
                              </select>
                              
                              <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                                onClick={() => toggleUserMutation.mutate(u.id)}
                                disabled={toggleUserMutation.isPending}
                                style={{ padding: '4px 8px', height: '30px' }}>
                                {u.isActive ? 'Suspend' : 'Activate'}
                              </button>
                              
                              <button className="btn btn-sm btn-danger"
                                onClick={() => {
                                  if(window.confirm('Are you absolutely sure? This will hard delete the user and all their data!')) {
                                    api.admin.deleteUser(u.id)
                                      .then(() => { toast.success('User deleted'); qc.invalidateQueries(['adminUsers']); })
                                      .catch(err => toast.error(err.response?.data?.error || 'Deletion failed'));
                                  }
                                }}
                                style={{ padding: '4px 8px', height: '30px' }}>
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>⚙️</div>
            System settings and logs will be displayed here in a future update.
          </div>
        )}
      </div>
    </div>
  );
}
