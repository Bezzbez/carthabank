import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"></path>
  </svg>
);

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        <div style={styles.navLeft}>
          <div style={styles.greeting}>
            Welcome back, <strong>{user.firstName}</strong>!
          </div>
        </div>

        <div style={styles.navRight}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: 'var(--bg-card)',
    padding: '12px 24px',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  greeting: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
};
