import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function RegisterPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const res = await api.register(form.firstName, form.lastName, form.email, form.password, form.phone);
			const { user, accessToken, refreshToken } = res.data;
			login(user, accessToken, refreshToken);
			toast.success('🎉 Account created! Welcome to SecureBank.');
			navigate('/dashboard');
		} catch (err) {
			const errors = err.response?.data?.errors;
			const msg = errors ? errors[0]?.msg : (err.response?.data?.error || 'Registration failed.');
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			{/* Left Side */}
			<div className="auth-left">
				<div className="auth-brand">
					<div className="auth-brand-logo">SecureBank</div>
					<div className="auth-brand-tag">Digital Banking Excellence</div>
					<p className="auth-brand-desc">
						Join thousands of clients who trust SecureBank for their financial needs.
					</p>
					
					<div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px', textAlign: 'left', margin: '40px auto 0', maxWidth: '320px' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
							<span style={{ fontSize: '1.2rem' }}>✨</span> Instant Setup
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
							<span style={{ fontSize: '1.2rem' }}>🔒</span> Bank-Grade Security
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
							<span style={{ fontSize: '1.2rem' }}>💳</span> Multiple Accounts
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
							<span style={{ fontSize: '1.2rem' }}>🌍</span> Global Transfers
						</div>
					</div>
				</div>
			</div>

			{/* Right Side */}
			<div className="auth-right">
				<div className="auth-form-box">
					<h2 className="auth-title">Create Account</h2>
					<p className="auth-subtitle">Start banking in minutes</p>

					{error && <div className="alert alert-danger">{error}</div>}

					<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
						<div className="grid-2" style={{ gap: '15px' }}>
							<div className="form-group" style={{ marginBottom: 0 }}>
								<label className="form-label">First Name</label>
								<input
									name="firstName"
									type="text"
									className="form-input"
									placeholder="John"
									value={form.firstName}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="form-group" style={{ marginBottom: 0 }}>
								<label className="form-label">Last Name</label>
								<input
									name="lastName"
									type="text"
									className="form-input"
									placeholder="Doe"
									value={form.lastName}
									onChange={handleChange}
									required
								/>
							</div>
						</div>

						<div className="form-group" style={{ marginBottom: 0 }}>
							<label className="form-label">Email</label>
							<input
								name="email"
								type="email"
								className="form-input"
								placeholder="you@example.com"
								value={form.email}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-group" style={{ marginBottom: 0 }}>
							<label className="form-label">Phone</label>
							<input
								name="phone"
								type="tel"
								className="form-input"
								placeholder="+1 (555) 000-0000"
								value={form.phone}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group" style={{ marginBottom: 0 }}>
							<label className="form-label">Password</label>
							<input
								name="password"
								type="password"
								className="form-input"
								placeholder="••••••••"
								value={form.password}
								onChange={handleChange}
								required
							/>
							<div className="form-hint">✓ Min 8 chars, mix of upper & lowercase</div>
						</div>

						<button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '10px' }}>
							{loading ? <><span className="spinner"></span> Creating Account...</> : 'Create Account'}
						</button>
					</form>

					<div className="divider">or</div>

					<p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
						Already have an account?{' '}
						<Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>
							Sign in here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
