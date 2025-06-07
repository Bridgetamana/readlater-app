'use client';
import { useEffect, useState, useCallback } from 'react';

function EmailRow({ email, onMarkRead, onDelete, onViewFull }) {
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
                        onClick={() => onViewFull(email)}
                        className="px-3 py-1 text-xs rounded-md border transition-colors text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        View
                    </button>
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

function EmailViewer({ email, onClose }) {
    if (!email) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Email Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                        <div>
                            <label className="text-sm font-medium text-gray-500">From:</label>
                            <p className="text-gray-900">{email.from}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">To:</label>
                            <p className="text-gray-900">{email.to}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500">Subject:</label>
                            <p className="text-gray-900 font-medium">{email.subject}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Date:</label>
                            <p className="text-gray-900">{new Date(email.originalDate || email.date).toLocaleString()}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Content:</label>
                        {email.htmlBody ? (
                            <div
                                className="border rounded-md p-4 bg-gray-50 prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                            />
                        ) : (
                            <div className="border rounded-md p-4 bg-gray-50 whitespace-pre-wrap">
                                {email.textBody}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EmailsDashboard() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [viewingEmail, setViewingEmail] = useState(null); useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (!storedEmail) {
            window.location.href = '/';
            return;
        }
        setUserEmail(storedEmail);
    }, []);

    const fetchEmails = useCallback(async () => {
        if (!userEmail) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/inbound-email?user=${encodeURIComponent(userEmail)}`);
            if (!res.ok) throw new Error('Failed to fetch emails');
            const data = await res.json();
            setEmails(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    const handleMarkRead = async (email) => {
        try {
            const res = await fetch(`/api/inbound-email?user=${encodeURIComponent(userEmail)}&id=${email.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });

            if (res.ok) {
                setEmails((prev) => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
            } else {
                console.error('Failed to mark email as read');
            }
        } catch (error) {
            console.error('Error marking email as read:', error);
        }
    };

    const handleDelete = async (email) => {
        try {
            const res = await fetch(`/api/inbound-email?user=${encodeURIComponent(userEmail)}&id=${email.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setEmails((prev) => prev.filter(e => e.id !== email.id));
            } else {
                console.error('Failed to delete email');
            }
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/';
    };

    const unreadCount = emails.filter(email => !email.read).length;

    return (<div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="text-center flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ReadLater Inbox</h1>
                    <p className="text-gray-600 mb-4">
                        Forward emails from <span className="font-medium text-blue-600">{userEmail}</span> to your Postmark address to save them here for later reading.
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
                </div>                    <div className="flex gap-2">
                    <button
                        onClick={fetchEmails}
                        disabled={loading}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
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
                        <tbody className="bg-white divide-y divide-gray-200">                                {emails.map((email) => (
                            <EmailRow
                                key={email.id}
                                email={email}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                                onViewFull={setViewingEmail}
                            />
                        ))}
                        </tbody>                        </table>
                )}
            </div>
        </div>

        {viewingEmail && (
            <EmailViewer
                email={viewingEmail}
                onClose={() => setViewingEmail(null)}
            />
        )}
    </div>
    );
}
