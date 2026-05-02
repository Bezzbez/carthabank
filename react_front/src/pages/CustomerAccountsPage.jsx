import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function CustomerAccountsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['gestionnaireCustomers', search],
    queryFn: () => api.gestionnaire.getCustomers({ search: search || undefined }).then(r => r.data),
  });

  const freezeMutation = useMutation({
    mutationFn: (id) => api.gestionnaire.toggleAccountFreeze(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['gestionnaireCustomers']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Action failed'),
  });

  const customers = data?.customers || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Customer Accounts</h1>
        <p className="page-subtitle">View customer details, freeze or unfreeze accounts</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-input" placeholder="Search by name or email..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading customers...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No customers found</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Customer</th><th>Email</th><th>Accounts</th><th>Total Balance</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const totalBal = (c.accounts || []).reduce((s, a) => s + parseFloat(a.balance || 0), 0);
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                      <td style={{ fontSize: '0.82rem' }}>{c.email}</td>
                      <td>{(c.accounts || []).length}</td>
                      <td style={{ fontWeight: 600, color: 'var(--gold)' }}>${totalBal.toLocaleString()}</td>
                      <td><span className={`badge badge-${c.isActive ? 'success' : 'danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {(c.accounts || []).map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.accountNumber?.slice(-8)}</span>
                              <span className={`badge badge-${a.isActive ? 'success' : 'danger'}`} style={{ fontSize: '0.6rem' }}>
                                {a.isActive ? 'Active' : 'Frozen'}
                              </span>
                              <button className={`btn btn-sm ${a.isActive ? 'btn-danger' : 'btn-success'}`}
                                style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                                onClick={() => freezeMutation.mutate(a.id)}
                                disabled={freezeMutation.isPending}>
                                {a.isActive ? 'Freeze' : 'Unfreeze'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
