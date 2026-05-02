import React, { useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function DepositModal({ isOpen, onClose, accounts, onSuccess }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        accountId: accounts[0]?.id || '',
        amount: '',
        description: 'External Deposit'
    });

    // Update default account when accounts list arrives
    React.useEffect(() => {
        if (accounts.length > 0 && !form.accountId) {
            setForm(f => ({ ...f, accountId: accounts[0].id }));
        }
    }, [accounts, form.accountId]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.accountId || !form.amount) {
            return setError('Please fill in all required fields.');
        }

        if (parseFloat(form.amount) <= 0) {
            return setError('Amount must be greater than zero.');
        }

        setLoading(true);
        try {
            await API.transactions.deposit(form);
            toast.success('Money added successfully!');
            onSuccess(); // refresh dashboard data
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Deposit failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: '450px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '32px',
                animation: 'slideUp 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Add Money</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Select Account</label>
                        <select 
                            className="form-select" 
                            value={form.accountId} 
                            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                            required
                        >
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.type.toUpperCase()} — {a.accountNumber.slice(-8)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            placeholder="0.00" 
                            value={form.amount} 
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            min="0.01"
                            step="0.01"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g., Salary, Gift" 
                            value={form.description} 
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            maxLength={255}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button type="button" className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                            {loading ? <><span className="spinner"></span> Processing...</> : 'Confirm Deposit'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
