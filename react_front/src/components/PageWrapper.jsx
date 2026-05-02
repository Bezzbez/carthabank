import React from 'react';

export default function PageWrapper({ children, title, subtitle }) {
  const animationStyles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .page-wrapper {
      animation: fadeIn 0.5s ease-out;
    }

    .page-header {
      animation: slideInDown 0.6s ease-out;
    }

    .page-content {
      animation: scaleIn 0.6s ease-out;
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div className="page-wrapper" style={styles.page}>
        <div style={styles.container}>
          {(title || subtitle) && (
            <div className="page-header" style={styles.header}>
              {title && <h1 style={styles.title}>{title}</h1>}
              {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>
          )}
          <div className="page-content" style={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 20px',
    background: 'var(--bg-primary)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '40px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
  },
  content: {},
};
