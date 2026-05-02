import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function LoanRequestsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['gestionnaireLoans', filter],
    queryFn: () => api.gestionnaire.getLoans({ status: filter || undefined }).then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }) => api.gestionnaire.reviewLoan(id, { action, note }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['gestionnaireLoans']);
      qc.invalidateQueries(['gestionnaireDashboard']);
      setReviewingId(null);
      setNote('');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Review failed'),
  });

  const loans = data?.loans || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Loan Requests</h1>
        <p className="page-subtitle">Review and decide on customer loan applications</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'approved', 'rejected', ''].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}>
            {f || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading loans...</div>
        ) : loans.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No loan requests found</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Reference</th><th>Borrower</th><th>Amount</th><th>Term</th><th>Rate</th><th>Monthly</th><th>Purpose</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.reference}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{l.borrower?.firstName} {l.borrower?.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.borrower?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>${parseFloat(l.amount).toLocaleString()}</td>
                    <td>{l.termMonths} mo</td>
                    <td>{l.interestRate}%</td>
                    <td>${parseFloat(l.monthlyPayment || 0).toLocaleString()}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.purpose}</td>
                    <td>
                      <span className={`badge badge-${l.status === 'approved' || l.status === 'disbursed' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        reviewingId === l.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                            <input className="form-input" placeholder="Reason..." value={note}
                              onChange={e => setNote(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" onClick={() => reviewMutation.mutate({ id: l.id, action: 'approve', note })}
                                disabled={reviewMutation.isPending}>Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => reviewMutation.mutate({ id: l.id, action: 'reject', note })}
                                disabled={reviewMutation.isPending}>Reject</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => { setReviewingId(null); setNote(''); }}>×</button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn btn-secondary btn-sm" onClick={() => setReviewingId(l.id)}>Review</button>
                        )
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {l.reviewer ? `by ${l.reviewer.firstName}` : '—'}
                        </span>
                      )}
                    </td>
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
