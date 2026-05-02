import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('gestionnaire/transfers')) return 'Pending Transfers';
    if (path.includes('gestionnaire/loans')) return 'Loan Requests';
    if (path.includes('gestionnaire/customers')) return 'Customer Accounts';
    if (path.includes('gestionnaire')) return 'Manager Portal';
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('transfer')) return 'Transfer Money';
    if (path.includes('bill-payment')) return 'Bill Payment';
    if (path.includes('transactions')) return 'Transaction History';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('admin')) return 'Admin Panel';
    if (path.includes('loans')) return 'Loans';
    return 'CharthaBank';
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-title">{getPageTitle()}</div>
        <div className="header-greeting">
          Welcome back, {user?.firstName || 'User'}
          {user?.role && <span style={{ marginLeft: 8, fontSize: '0.68rem', color: 'var(--gold)', textTransform: 'uppercase' }}>• {user.role}</span>}
        </div>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" placeholder="Search..." />
        </div>
        <button className="notification-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span className="notification-badge"></span>
        </button>
      </div>
    </header>
  );
}
