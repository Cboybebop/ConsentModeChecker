import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from './useAuth';

type Mode = 'login' | 'signup' | 'magic';

export function AuthPage() {
  const { signIn, signUp, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    let err: string | null = null;

    if (mode === 'login') {
      err = await signIn(email, password);
      if (!err) navigate('/');
    } else if (mode === 'signup') {
      err = await signUp(email, password);
      if (!err) setSuccess('Check your email to confirm your account.');
    } else {
      err = await signInWithMagicLink(email);
      if (!err) setSuccess('Check your email for a login link.');
    }

    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <button
            className={`pb-3 text-sm font-medium ${mode === 'login' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
          >
            Log in
          </button>
          <button
            className={`pb-3 text-sm font-medium ${mode === 'signup' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
          >
            Sign up
          </button>
          <button
            className={`pb-3 text-sm font-medium ${mode === 'magic' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => { setMode('magic'); setError(null); setSuccess(null); }}
          >
            Magic link
          </button>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {mode !== 'magic' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Sign up' : 'Send magic link'}
          </Button>
        </form>

        {mode === 'login' && (
          <p className="mt-4 text-center text-sm text-gray-500">
            <a href="/reset-password" className="text-primary-600 hover:underline">
              Forgot password?
            </a>
          </p>
        )}
      </Card>
    </div>
  );
}
