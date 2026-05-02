import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function LoansPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', termMonths: '12', purpose: '', accountId: '' });

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['myLoans'],
    queryFn: () => api.loans.getMyLoans().then(r => r.data),
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.accounts.getAll().then(r => r.data),
  });

  const requestMutation = useMutation({
    mutationFn: (data) => api.loans.request(data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['myLoans']);
      setShowForm(false);
      setForm({ amount: '', termMonths: '12', purpose: '', accountId: '' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Request failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    requestMutation.mutate(form);
  };

  const loans = loansData?.loans || [];
  const accounts = accountsData?.accounts || accountsData || [];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Loans</h1>
          <p className="page-subtitle">Request and track your loan applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Request Loan'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>New Loan Application</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Loan Amount ($)</label>
                <input className="form-input" type="number" min="100" step="100" required
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" />
              </div>
              <div className="form-group">
                <label className="form-label">Term (months)</label>
                <select className="form-select" value={form.termMonths} onChange={e => setForm({ ...form, termMonths: e.target.value })}>
                  {[3, 6, 12, 24, 36, 48, 60, 120, 240, 360].map(m => (
                    <option key={m} value={m}>{m} months ({(m / 12).toFixed(1)} years)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Disbursement Account</label>
                <select className="form-select" value={form.accountId} onChange={e => setForm({ ...form, accountId: e.target.value })}>
                  <option value="">Select account...</option>
                  {(Array.isArray(accounts) ? accounts : []).map(a => (
                    <option key={a.id} value={a.id}>{a.accountNumber} ({a.type}) — ${parseFloat(a.balance).toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input className="form-input" required value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Home renovation, car purchase..." />
              </div>
            </div>
            {form.amount && form.termMonths && (
              <div className="alert alert-info" style={{ marginTop: 8 }}>
                Estimated monthly payment: <strong>${((parseFloat(form.amount || 0) * (5.5 / 100 / 12) * Math.pow(1 + 5.5 / 100 / 12, parseInt(form.termMonths || 12))) / (Math.pow(1 + 5.5 / 100 / 12, parseInt(form.termMonths || 12)) - 1)).toFixed(2)}</strong> at 5.50% APR
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 16 }} disabled={requestMutation.isPending}>
              {requestMutation.isPending ? <><span className="spinner"></span> Submitting...</> : 'Submit Loan Request'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>My Loan History</h3>
        {isLoading ? (
          <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
        ) : loans.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No loan applications yet</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Reference</th><th>Amount</th><th>Term</th><th>Monthly</th><th>Purpose</th><th>Status</th><th>Reviewer</th><th>Date</th></tr></thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.reference}</td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>${parseFloat(l.amount).toLocaleString()}</td>
                    <td>{l.termMonths} mo</td>
                    <td>${parseFloat(l.monthlyPayment || 0).toFixed(2)}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.purpose}</td>
                    <td>
                      <span className={`badge badge-${l.status === 'approved' || l.status === 'disbursed' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}`}>
                        {l.status}
                      </span>
                      {l.reviewNote && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>"{l.reviewNote}"</div>}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{l.reviewer ? `${l.reviewer.firstName} ${l.reviewer.lastName}` : '—'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
