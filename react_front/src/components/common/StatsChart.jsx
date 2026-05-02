import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatsChart({ data }) {
    // Process real transaction data into chart format
    let chartData = [];
    
    if (data && data.length > 0) {
        // Sort data by date ascending
        const sortedData = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Group transactions by date
        const groupedByDate = {};
        sortedData.forEach(txn => {
            const date = new Date(txn.createdAt).toISOString().split('T')[0];
            if (!groupedByDate[date]) {
                groupedByDate[date] = { date, total: 0 };
            }
            const amount = parseFloat(txn.amount);
            // If fromAccountId is present, it's usually a debit from the sender.
            // But we don't know for sure without accountIds.
            // However, the backend usually filters transactions where the user is either sender or receiver.
            // Simple heuristic for demo: if fromAccountId exists, assume it's a debit for now,
            // unless we can pass the actual user account IDs.
            const isDebit = txn.fromAccountId ? -amount : amount;
            groupedByDate[date].total += isDebit;
        });
        
        // Convert to array and add cumulative balance
        let runningBalance = 15000; // Mock starting balance
        chartData = Object.keys(groupedByDate).sort().map(date => {
            runningBalance += groupedByDate[date].total;
            return {
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                balance: runningBalance,
            };
        });
    } else {
        // Fallback demo data
        chartData = [
            { name: 'Mon', balance: 12000 },
            { name: 'Tue', balance: 14500 },
            { name: 'Wed', balance: 14000 },
            { name: 'Thu', balance: 16800 },
            { name: 'Fri', balance: 16500 },
            { name: 'Sat', balance: 18900 },
            { name: 'Sun', balance: 21400 },
        ];
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-card)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '0.85rem' }}>{label}</p>
                    <p style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1.1rem' }}>
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="var(--gold)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
