import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from './useAuth';

export function PasswordReset() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await resetPassword(email);
    if (err) setError(err);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Reset password</h2>

        {sent ? (
          <Alert variant="success">
            If an account exists for {email}, you will receive a password reset email shortly.
          </Alert>
        ) : (
          <>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <Button type="submit" loading={loading} className="w-full">
                Send reset link
              </Button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          <a href="/login" className="text-primary-600 hover:underline">
            Back to login
          </a>
        </p>
      </Card>
    </div>
  );
}
