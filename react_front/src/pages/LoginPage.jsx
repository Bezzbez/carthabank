import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { SparklesCore } from '../components/ui/SparklesCore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.login(form.email, form.password);
      const { user, accessToken, refreshToken } = response.data;
      login(user, accessToken, refreshToken);
      toast.success('Welcome back!');
      if (user.role === 'gestionnaire') navigate('/gestionnaire');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => { setForm({ email, password }); setError(''); };

  const demoAccounts = [
    { label: 'John Doe (Client)', email: 'john.doe@example.com', pw: 'Client@1234', icon: '👤', role: 'client' },
    { label: 'Sarah Manager', email: 'manager@ebanking.com', pw: 'Manager@1234', icon: '📋', role: 'gestionnaire' },
    { label: 'Super Admin', email: 'admin@ebanking.com', pw: 'Admin@1234', icon: '🛡️', role: 'admin' },
  ];

  return (
    <div className="auth-container">
      <div className="auth-left" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
            speed={1}
          />
        </div>
        <div className="auth-brand" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '50%', background: '#fff', padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
            <div className="auth-brand-logo" style={{ marginBottom: 0, fontSize: '2.5rem' }}>CharthaBank</div>
          </div>
          <div className="auth-brand-tag">Secure Banking for the Future</div>
          <p className="auth-brand-desc">
            Manage your finances with confidence. Bank-grade security meets modern convenience.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 40, textAlign: 'left', margin: '40px auto 0', maxWidth: 320 }}>
            {['🔒 Enterprise Security', '⚡ Instant Transfers', '📊 Real-time Analytics', '🏦 Loan Management'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box" style={{ width: '100%', maxWidth: 400 }}>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email address</label>
              <input name="email" type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required autoFocus />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="divider">or</div>
          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create one</Link>
          </p>

          <div style={{ marginTop: 28, padding: 20, background: 'rgba(201,168,76,0.04)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gold)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🚀 Quick Demo Login
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demoAccounts.map((d, i) => (
                <button key={i} type="button" onClick={() => fillDemo(d.email, d.pw)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)' }}>
                  <span style={{ fontSize: '1.1rem' }}>{d.icon}</span>
                  <span>
                    <strong style={{ display: 'block', fontWeight: 500, fontSize: '0.85rem' }}>{d.label}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{d.email}</span>
                  </span>
                  <span className={`badge badge-${d.role === 'admin' ? 'warning' : d.role === 'gestionnaire' ? 'purple' : 'info'}`}
                    style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{d.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
