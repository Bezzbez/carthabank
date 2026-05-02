import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function TransferPage() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fromAccountId: '', toAccountNumber: '', amount: '', description: '', otpCode: '' });

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

  const transferMutation = useMutation({
    mutationFn: (data) => api.transactions.transfer(data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['accounts']);
      qc.invalidateQueries(['dashboard']);
      setStep(3); // Success step
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Transfer failed'),
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) otpMutation.mutate();
    if (step === 2) transferMutation.mutate(form);
  };

  const accounts = data?.accounts || data || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Transfer Money</h1>
        <p className="page-subtitle">Send funds securely to other accounts</p>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading accounts...</div>
        ) : step === 3 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 10, color: 'var(--gold)' }}>Transfer Initiated</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>
              Your transfer is currently pending review by a manager for security purposes.
            </p>
            <button className="btn btn-primary" onClick={() => { setStep(1); setForm({ fromAccountId: '', toAccountNumber: '', amount: '', description: '', otpCode: '' }); }}>
              Make Another Transfer
            </button>
          </div>
        ) : (
          <form onSubmit={handleNext}>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--gold)', borderRadius: 2 }}></div>
              <div style={{ flex: 1, height: 4, background: step === 2 ? 'var(--gold)' : 'var(--border)', borderRadius: 2 }}></div>
            </div>

            {step === 1 && (
              <div className="fade-in">
                <div className="form-group">
                  <label className="form-label">From Account</label>
                  <select className="form-select" required value={form.fromAccountId} onChange={e => setForm({ ...form, fromAccountId: e.target.value })}>
                    <option value="">Select source account...</option>
                    {(Array.isArray(accounts) ? accounts : []).map(a => (
                      <option key={a.id} value={a.id}>{a.accountNumber} — ${parseFloat(a.balance).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recipient Account Number</label>
                  <input className="form-input" required placeholder="e.g. ACC-12345678" value={form.toAccountNumber} onChange={e => setForm({ ...form, toAccountNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount ($)</label>
                  <input className="form-input" type="number" min="1" step="0.01" required placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input className="form-input" placeholder="What is this for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={otpMutation.isPending}>
                  {otpMutation.isPending ? <><span className="spinner"></span> Processing...</> : 'Continue'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in">
                <div className="otp-info">
                  <span style={{ fontSize: '1.5rem' }}>🔐</span>
                  <div className="otp-info-text">
                    <strong>Security Verification</strong>
                    An OTP has been sent to your registered email. Please enter it below to confirm this transfer.
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Enter OTP Code</label>
                  <input className="form-input" required placeholder="123456" value={form.otpCode} onChange={e => setForm({ ...form, otpCode: e.target.value })}
                    style={{ fontSize: '1.5rem', letterSpacing: '0.2em', textAlign: 'center' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn btn-primary btn-full" disabled={transferMutation.isPending}>
                    {transferMutation.isPending ? <><span className="spinner"></span> Confirming...</> : 'Confirm Transfer'}
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
