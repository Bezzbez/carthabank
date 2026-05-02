import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function TransactionHistoryPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, type],
    queryFn: () => api.transactions.getHistory({ page, limit: 10, type: type || undefined }).then(r => r.data),
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || { totalPages: 1 };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">View and filter your past transactions</p>
        </div>
        <select className="form-select" style={{ width: 200 }} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="transfer">Transfers</option>
          <option value="bill_payment">Bill Payments</option>
        </select>
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ref</th><th>Type</th><th>Details</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{t.reference}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`stat-icon ${t.type === 'deposit' ? 'stat-icon-green' : t.type === 'transfer' ? 'stat-icon-blue' : 'stat-icon-purple'}`}
                            style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                            {t.type === 'deposit' ? '↓' : t.type === 'transfer' ? '↔' : '🧾'}
                          </span>
                          <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{t.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {t.description || (t.type === 'transfer' ? `To ${t.toAccount?.accountNumber}` : '')}
                      </td>
                      <td style={{ fontWeight: 600, color: t.type === 'deposit' ? 'var(--success)' : 'var(--text-primary)' }}>
                        {t.type === 'deposit' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page {page} of {pagination.totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
