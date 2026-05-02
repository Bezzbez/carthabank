import React from 'react';

export default function AnimatedCard({ children, style, className = '' }) {
  const slideInStyles = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animated-card {
      animation: slideIn 0.6s ease-out forwards;
    }
  `;

  return (
    <>
      <style>{slideInStyles}</style>
      <div className={`animated-card ${className}`} style={{ ...styles.card, ...style }}>
        {children}
      </div>
    </>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
};
