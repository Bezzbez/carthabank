import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreditCard from '../components/ui/CreditCard';
import { FinancialTable } from '../components/ui/FinancialTable';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.user.getDashboard().then(r => r.data),
  });

  const account = data?.accounts?.[0];
  const balance = parseFloat(data?.totalBalance || 0);

  // Generate fake chart data based on balance
  const chartData = Array.from({ length: 7 }).map((_, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: balance > 0 ? balance - Math.random() * 500 + i * 100 : 0,
  }));

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">Good morning, {user?.firstName}</h1>
        <p className="page-subtitle">Here is what's happening with your accounts today.</p>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading dashboard...</div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 28, alignItems: 'center' }}>
            {/* Balance Card - Premium 3D effect */}
            <div style={{ gridColumn: 'span 2' }}>
              <CreditCard 
                cardHolder={`${user?.firstName} ${user?.lastName}`}
                cardNumber={account?.accountNumber || "4532 1234 5678 9010"}
                variant="gradient"
              />
            </div>

            {/* Quick Actions */}
            <motion.div className="card" {...fadeUp} transition={{ delay: 0.1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/transfer" className="btn btn-primary btn-full" style={{ justifyContent: 'flex-start' }}>💸 Send Money</a>
                <a href="/bill-payment" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>🧾 Pay Bills</a>
                <a href="/loans" className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>🏦 Request Loan</a>
              </div>
            </motion.div>
          </div>

          <div className="grid-2" style={{ marginBottom: 40 }}>
            {/* Chart */}
            <motion.div className="card" {...fadeUp} transition={{ delay: 0.2 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Balance History</h3>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--gold)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div className="card" {...fadeUp} transition={{ delay: 0.3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Transactions</h3>
                <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>View all</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(data?.recentTransactions || []).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No recent transactions</div>
                ) : (
                  data.recentTransactions.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: i !== data.recentTransactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className={`stat-icon ${t.type === 'deposit' ? 'stat-icon-green' : t.type === 'transfer' ? 'stat-icon-blue' : 'stat-icon-red'}`} style={{ width: 40, height: 40, borderRadius: '50%' }}>
                          {t.type === 'deposit' ? '↓' : t.type === 'transfer' ? '↔' : '↑'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{t.description || t.type}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: t.type === 'deposit' ? 'var(--success)' : 'var(--text-primary)' }}>
                        {t.type === 'deposit' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Global Markets</h3>
            <FinancialTable />
          </motion.div>
        </>
      )}
    </div>
  );
}
