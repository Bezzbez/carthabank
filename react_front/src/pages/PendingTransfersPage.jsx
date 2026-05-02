import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function PendingTransfersPage() {
  const qc = useQueryClient();
  const [reviewingId, setReviewingId] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pendingTransfers'],
    queryFn: () => api.gestionnaire.getPendingTransfers().then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }) => api.gestionnaire.reviewTransfer(id, { action, note }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['pendingTransfers']);
      qc.invalidateQueries(['gestionnaireDashboard']);
      setReviewingId(null);
      setNote('');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Review failed'),
  });

  const handleReview = (id, action) => {
    reviewMutation.mutate({ id, action, note });
  };

  const transfers = data?.transfers || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Pending Transfers</h1>
        <p className="page-subtitle">Review and approve or reject pending transfer operations</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading transfers...</div>
        ) : transfers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            ✅ No pending transfers to review
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reference</th><th>From</th><th>To</th><th>Amount</th><th>Type</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.reference}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{t.fromAccount?.owner?.firstName} {t.fromAccount?.owner?.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.fromAccount?.accountNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{t.toAccount?.owner?.firstName} {t.toAccount?.owner?.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.toAccount?.accountNumber}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>${parseFloat(t.amount).toLocaleString()}</td>
                    <td><span className="badge badge-info">{t.type}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      {reviewingId === t.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
                          <input className="form-input" placeholder="Optional comment..." value={note}
                            onChange={e => setNote(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleReview(t.id, 'approve')}
                              disabled={reviewMutation.isPending}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReview(t.id, 'reject')}
                              disabled={reviewMutation.isPending}>✗ Reject</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setReviewingId(null); setNote(''); }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setReviewingId(t.id)}>Review</button>
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
