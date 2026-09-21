'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app you would trigger an email. Here we just simulate success.
    setSent(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded bg-white p-6 shadow-md"
      >
        <h1 className="mb-4 text-center text-2xl font-bold">Forgot Password</h1>
        {sent ? (
          <p className="text-center text-green-600">
            If the address exists in our system, a reset link has been sent.
          </p>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
            >
              Send reset link
            </button>
          </>
        )}
      </form>
    </main>
  );
}
