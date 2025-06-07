'use client';
import EmailRow from './EmailRow';
import EmailViewer from './EmailViewer';
import { useEffect, useState, useCallback } from 'react';

export default function EmailsDashboard() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [viewingEmail, setViewingEmail] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    useEffect(() => {
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

    const handleMarkRead = useCallback(async (email) => {
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
    }, [userEmail]);

    const handleDelete = useCallback(async (email) => {
        try {
            const res = await fetch(`/api/inbound-email?user=${encodeURIComponent(userEmail)}&id=${email.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setEmails((prev) => prev.filter(e => e.id !== email.id));
                setSelectedIndex(prev => Math.max(0, prev - 1));
            } else {
                console.error('Failed to delete email');
            }
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    }, [userEmail]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (viewingEmail) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(0, prev - 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(emails.length - 1, prev + 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (emails[selectedIndex]) {
                        setViewingEmail(emails[selectedIndex]);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    if (emails[selectedIndex] && !emails[selectedIndex].read) {
                        handleMarkRead(emails[selectedIndex]);
                    }
                    break;
                case 'Delete':
                    e.preventDefault();
                    if (emails[selectedIndex]) {
                        handleDelete(emails[selectedIndex]);
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [emails, selectedIndex, viewingEmail, handleMarkRead, handleDelete]);
    useEffect(() => {
        setSelectedIndex(0);
    }, [emails]);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/';
    };

    const unreadCount = emails.filter(email => !email.read).length;

    return (
        <div className="min-h-screen bg-gray-50">
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
                                    </span>)}
                            </div>
                        )}

                        {/* Keyboard navigation hints */}
                        {emails.length > 0 && (
                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-500">
                                    Use ↑↓ to navigate • Enter to open • Space to mark read • Delete to remove • Esc to close
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
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
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emails.map((email, index) => (
                                    <EmailRow
                                        key={email.id}
                                        email={email}
                                        onMarkRead={handleMarkRead}
                                        onDelete={handleDelete}
                                        onViewFull={setViewingEmail}
                                        isSelected={index === selectedIndex}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {viewingEmail && (
                <EmailViewer
                    email={viewingEmail}
                    onClose={() => setViewingEmail(null)}
                    onMarkRead={handleMarkRead}
                />
            )}
        </div>
    );
}
