'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    localStorage.setItem('userEmail', email);
    window.location.href = '/emails';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ReadLater Inbox</h1>
          <p className="text-gray-600">
            Enter your email to access your personal read-later inbox
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-500"
              placeholder="you@example.com"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              This will be used to identify your personal inbox
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Accessing...' : 'Access My Inbox'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Forward emails to your Postmark inbound address</li>
            <li>• Use the same email address you entered above</li>
            <li>• Only you can see emails you personally forwarded</li>
            <li>• Read emails in their original format</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
