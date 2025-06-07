'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    localStorage.setItem('userEmail', email);
    window.location.href = '/emails';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            ReadLater Inbox
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Your personal, distraction-free reading space.
          </p>
        </div>

        <div className="bg-white p-8 shadow-lg rounded-xl">
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-0 focus:ring focus:ring-indigo-500 text-gray-700 placeholder-gray-400`}
                placeholder="you@example.com"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <p className="mt-2 text-xs text-gray-500">
                This will be used to identify your personal inbox.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Access My Inbox'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  How it works
                </span>
              </div>
            </div>
            <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 text-sm text-left">
              <li>Forward emails to your designated Postmark inbound address.</li>
              <li>Use the same email address you entered above to log in.</li>
              <li>Only you can see the emails you personally forward.</li>
              <li>Read your saved emails in a clean, reader-friendly format.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}