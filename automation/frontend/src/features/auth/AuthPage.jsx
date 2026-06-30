import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name };
      
      const response = await axios.post(`http://localhost:5001/api${endpoint}`, payload);
      
      const { token, tenant } = response.data;
      login(token, tenant);
      
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
          {isLogin ? 'Sign in to access your WhatsApp flows' : 'Sign up to start building automations'}
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={labelStyle}>Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
                placeholder="Acme Corp"
              />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#10B981',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

export default AuthPage;
