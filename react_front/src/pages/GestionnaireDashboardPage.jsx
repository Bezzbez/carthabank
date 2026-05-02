import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function GestionnaireDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['gestionnaireDashboard'],
    queryFn: () => api.gestionnaire.getDashboard().then(r => r.data),
  });

  const stats = [
    { label: 'Pending Transfers', value: data?.pendingTransfers || 0, color: 'warning', icon: '⏳' },
    { label: 'Pending Loans', value: data?.pendingLoans || 0, color: 'info', icon: '📋' },
    { label: 'Approved Today', value: data?.approvedToday || 0, color: 'success', icon: '✅' },
    { label: 'Rejected Today', value: data?.rejectedToday || 0, color: 'danger', icon: '❌' },
    { label: 'Total Clients', value: data?.totalClients || 0, color: 'purple', icon: '👥' },
    { label: 'Active Accounts', value: data?.totalAccounts || 0, color: 'gold', icon: '🏦' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Manager Portal</h1>
        <p className="page-subtitle">Review operations, approve transfers, and manage loan requests</p>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading dashboard...</div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 28 }}>
            {stats.map((s, i) => (
              <motion.div key={i} className="stat-card" {...fadeUp} transition={{ delay: i * 0.08 }}>
                <div className={`stat-icon stat-icon-${s.color === 'gold' ? 'gold' : s.color}`}>
                  <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                </div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/gestionnaire/transfers" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                  ⏳ Review Pending Transfers ({data?.pendingTransfers || 0})
                </a>
                <a href="/gestionnaire/loans" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                  📋 Review Loan Requests ({data?.pendingLoans || 0})
                </a>
                <a href="/gestionnaire/customers" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                  👥 Customer Accounts
                </a>
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Today's Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Total Pending</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>{data?.pendingTotal || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Approved</span>
                  <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>{data?.approvedToday || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Rejected</span>
                  <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>{data?.rejectedToday || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
