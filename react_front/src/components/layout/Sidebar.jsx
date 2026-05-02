import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Icon = ({ path }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
    <path d={path} />
  </svg>
);

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  transfer: "M7 16V4m0 0L3 8m4-4l4 4 M17 8v12m0 0l4-4m-4 4l-4-4",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  bills: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  profile: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  admin: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  loan: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  pending: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  customers: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  manager: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3M9 7h1m-1 4h1m4-4h1m-1 4h1",
};

export default function Sidebar() {
  const { user, logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  };

  const isGestionnaire = user?.role === 'gestionnaire';
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo.png" alt="Logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: '50%', background: '#fff', padding: 4 }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>CharthaBank</h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Digital</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>

        <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Icon path={ICONS.dashboard} /> <span>Dashboard</span>
        </NavLink>

        {/* Client-only links */}
        {!isGestionnaire && (
          <>
            <NavLink to="/transfer" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.transfer} /> <span>Transfer Money</span>
            </NavLink>
            <NavLink to="/bill-payment" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.bills} /> <span>Pay Bills</span>
            </NavLink>
            <NavLink to="/transactions" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.history} /> <span>Transactions</span>
            </NavLink>
            <NavLink to="/loans" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.loan} /> <span>Loans</span>
            </NavLink>
          </>
        )}

        {/* Gestionnaire links */}
        {(isGestionnaire || isAdmin) && (
          <>
            <div className="nav-section-label" style={{ marginTop: 16 }}>Manager Portal</div>
            <NavLink to="/gestionnaire" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.manager} /> <span>Manager Dashboard</span>
            </NavLink>
            <NavLink to="/gestionnaire/transfers" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.pending} /> <span>Pending Transfers</span>
            </NavLink>
            <NavLink to="/gestionnaire/loans" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.loan} /> <span>Loan Requests</span>
            </NavLink>
            <NavLink to="/gestionnaire/customers" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon path={ICONS.customers} /> <span>Customer Accounts</span>
            </NavLink>
          </>
        )}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Settings</div>
        <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Icon path={ICONS.profile} /> <span>Profile</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon path={ICONS.admin} /> <span>Admin Panel</span>
          </NavLink>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{getInitials()}</div>
          <div className="avatar-info">
            <div className="avatar-name">{user?.firstName} {user?.lastName}</div>
            <div className="avatar-role">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-link" style={{ marginTop: 8, color: 'var(--danger)' }}>
          <Icon path={ICONS.logout} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
