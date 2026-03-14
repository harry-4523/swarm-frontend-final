import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useCursor } from '../hooks/useCursor';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', username: '', full_name: '', password: '' });
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  useCursor();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)', color: 'var(--text-1)' }}>
      <div style={{ background: 'var(--bg-2)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 600 }}>Create an Account</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>Email</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required 
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-1)', fontSize: '1rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>Username</label>
            <input 
              type="text" name="username" value={formData.username} onChange={handleChange} required minLength={3}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-1)', fontSize: '1rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>Full Name</label>
            <input 
              type="text" name="full_name" value={formData.full_name} onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-1)', fontSize: '1rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-1)', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-2)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}