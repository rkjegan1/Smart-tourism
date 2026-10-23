import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api';
import Spinner from '../components/Spinner';
import FadeInSection from '../components/FadeInSection';
import { UserIcon } from '../components/Icons';

export default function LoginPage({ setUser, addToast }) {
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data =
        authMode === 'login'
          ? await loginUser({ email: authForm.email, password: authForm.password })
          : await registerUser(authForm);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      addToast(`Welcome${authMode === 'login' ? ' back' : ''}, ${data.user.name}!`, 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <FadeInSection>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome</h1>
          <p className="text-secondary">Sign in to access personalized recommendations.</p>
        </div>
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(26,23,20,0.04),0_4px_16px_rgba(26,23,20,0.03)]">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-accent/8 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Account</h2>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="animate-fade-in-up">
                <label className="block mb-1.5">Full Name</label>
                <input
                  className="w-full"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block mb-1.5">Email</label>
              <input
                className="w-full"
                type="email"
                placeholder="you@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1.5">Password</label>
              <input
                className="w-full"
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>{authMode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                </>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </FadeInSection>
    </div>
  );
}
