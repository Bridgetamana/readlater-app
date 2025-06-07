'use client';
import { useEffect, useState } from 'react';

function EmailRow({ email, onMarkRead, onDelete }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <tr className={`border-b hover:bg-gray-50 transition-colors ${!email.read ? 'bg-blue-50' : ''}`}>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {!email.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    <span className="text-sm text-gray-600">{formatDate(email.date)}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{email.from}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm font-semibold text-gray-900">{email.subject}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm text-gray-600">{truncateText(email.textBody || email.htmlBody)}</span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onMarkRead(email)}
                        disabled={email.read}
                        className="px-3 py-1 text-xs rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-green-600 border-green-200 hover:bg-green-50"
                    >
                        {email.read ? '✓' : 'Mark Read'}
                    </button>
                    <button
                        onClick={() => onDelete(email)}
                        className="px-2 py-1 text-xs rounded-md border transition-colors text-red-600 border-red-200 hover:bg-red-50"
                    >
                        ×
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function EmailsDashboard() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEmails() {
            try {
                setLoading(true);
                const res = await fetch('/api/inbound-email');
                if (!res.ok) throw new Error('Failed to fetch emails');
                const data = await res.json();
                setEmails(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchEmails();
    }, []);

    const handleMarkRead = (email) => {
        setEmails((prev) => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    };

    const handleDelete = (email) => {
        setEmails((prev) => prev.filter(e => e.id !== email.id));
    };

    const unreadCount = emails.filter(email => !email.read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ReadLater Inbox</h1>
                    <p className="text-gray-600 mb-4">
                        Forward emails to your special address to save them here for later reading.
                    </p>
                    {emails.length > 0 && (
                        <div className="flex justify-center gap-4">
                            <span className="bg-white px-4 py-2 rounded-full text-sm text-gray-700 border">
                                {emails.length} total email{emails.length !== 1 ? 's' : ''}
                            </span>
                            {unreadCount > 0 && (
                                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600">Loading your emails...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <p className="text-red-600 mb-4">Error loading emails: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📧</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No emails yet</h3>
                                    <p className="text-gray-600">When you receive emails, they&apos;ll appear here in a clean table format.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        From
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preview
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emails.map((email) => (
                                    <EmailRow
                                        key={email.id}
                                        email={email}
                                        onMarkRead={handleMarkRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
