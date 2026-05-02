import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

const BILLERS = [
  { id: 'water', name: 'National Water Co.', icon: '💧' },
  { id: 'electric', name: 'City Electric', icon: '⚡' },
  { id: 'internet', name: 'Global Telecom', icon: '🌐' },
  { id: 'gas', name: 'Metro Gas', icon: '🔥' },
];

export default function BillPaymentPage() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fromAccountId: '', billerName: '', billerReference: '', amount: '', otpCode: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.accounts.getAll().then(r => r.data),
  });

  const otpMutation = useMutation({
    mutationFn: () => api.transactions.requestOTP(),
    onSuccess: () => {
      toast.success('OTP sent to your email');
      setStep(2);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send OTP'),
  });

  const payMutation = useMutation({
    mutationFn: (data) => api.transactions.payBill(data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['accounts']);
      qc.invalidateQueries(['dashboard']);
      setStep(3);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Payment failed'),
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) otpMutation.mutate();
    if (step === 2) payMutation.mutate(form);
  };

  const accounts = data?.accounts || data || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Pay Bills</h1>
        <p className="page-subtitle">Instantly settle your utility and service bills</p>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading accounts...</div>
        ) : step === 3 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 10, color: 'var(--success)' }}>Payment Successful</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>Your bill to {form.billerName} has been paid.</p>
            <button className="btn btn-primary" onClick={() => { setStep(1); setForm({ fromAccountId: '', billerName: '', billerReference: '', amount: '', otpCode: '' }); }}>
              Pay Another Bill
            </button>
          </div>
        ) : (
          <form onSubmit={handleNext}>
            {step === 1 && (
              <div className="fade-in">
                <div className="form-group">
                  <label className="form-label">Select Biller</label>
                  <div className="grid-2" style={{ gap: 12 }}>
                    {BILLERS.map(b => (
                      <button key={b.id} type="button" 
                        onClick={() => setForm({ ...form, billerName: b.name })}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 'var(--radius-sm)', border: `1px solid ${form.billerName === b.name ? 'var(--gold)' : 'var(--border)'}`, background: form.billerName === b.name ? 'var(--gold-dim)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition)' }}>
                        <span style={{ fontSize: '1.5rem' }}>{b.icon}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {form.billerName && (
                  <>
                    <div className="form-group">
                      <label className="form-label">From Account</label>
                      <select className="form-select" required value={form.fromAccountId} onChange={e => setForm({ ...form, fromAccountId: e.target.value })}>
                        <option value="">Select account...</option>
                        {(Array.isArray(accounts) ? accounts : []).map(a => (
                          <option key={a.id} value={a.id}>{a.accountNumber} — ${parseFloat(a.balance).toLocaleString()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account / Reference Number</label>
                      <input className="form-input" required placeholder="e.g. 987654321" value={form.billerReference} onChange={e => setForm({ ...form, billerReference: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amount ($)</label>
                      <input className="form-input" type="number" min="1" step="0.01" required placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={otpMutation.isPending}>
                      {otpMutation.isPending ? <><span className="spinner"></span> Processing...</> : 'Continue to Verification'}
                    </button>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="fade-in">
                <div className="otp-info">
                  <span style={{ fontSize: '1.5rem' }}>🔐</span>
                  <div className="otp-info-text">
                    <strong>Security Verification</strong>
                    An OTP has been sent to your registered email. Please enter it below to confirm this payment.
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Enter OTP Code</label>
                  <input className="form-input" required placeholder="123456" value={form.otpCode} onChange={e => setForm({ ...form, otpCode: e.target.value })}
                    style={{ fontSize: '1.5rem', letterSpacing: '0.2em', textAlign: 'center' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn btn-primary btn-full" disabled={payMutation.isPending}>
                    {payMutation.isPending ? <><span className="spinner"></span> Confirming...</> : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
