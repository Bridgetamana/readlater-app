'use client';
import EmailRow from './EmailRow';
import EmailViewer from './EmailViewer';
import { useEffect, useState, useCallback } from 'react';
import { RotateCw, LogOut, Mail, Inbox, AlertTriangle } from 'lucide-react';

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

    const handleDelete = useCallback(async (emailToDelete) => {
        try {
            const res = await fetch(`/api/inbound-email?user=${encodeURIComponent(userEmail)}&id=${emailToDelete.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEmails((prev) => prev.filter(e => e.id !== emailToDelete.id));
                if (viewingEmail && viewingEmail.id === emailToDelete.id) {
                    setViewingEmail(null);
                }
                setSelectedIndex(prev => Math.max(0, prev - 1));
            } else {
                console.error('Failed to delete email');
            }
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    }, [userEmail, viewingEmail]);

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
                case 'r':
                    e.preventDefault();
                    fetchEmails();
                    break;
                case 'Backspace':
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
    }, [emails, selectedIndex, viewingEmail, handleDelete, fetchEmails]);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/';
    };

    const unreadCount = emails.filter(email => !email.read).length;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <header className="flex items-center justify-between p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Inbox className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-semibold text-gray-900">ReadLater Inbox</h1>
                    {unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {unreadCount} Unread
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchEmails}
                        disabled={loading}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                        aria-label="Refresh emails"
                    >
                        <RotateCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Logout">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4">
                {loading ? (
                    <div className="text-center py-20">
                        <RotateCw className="mx-auto h-10 w-10 text-blue-600 animate-spin" />
                        <p className="mt-4 text-lg text-gray-600">Loading your emails...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 p-8 rounded-lg">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                        <p className="mt-4 text-xl font-semibold text-red-700">Error: {error}</p>
                        <button
                            onClick={fetchEmails}
                            className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="text-center py-20">
                        <Mail className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-2xl font-semibold text-gray-900">Your inbox is empty</h3>
                        <p className="mt-2 text-base text-gray-500">
                            Forward or send emails to <b>1ec7cccf281e3ae5274b1ce1f0598e6d@inbound.postmarkapp.com</b> and they&apos;ll show up here.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <ul>
                            {emails.map((email, index) => (
                                <EmailRow
                                    key={email.id}
                                    email={email}
                                    onSelect={setViewingEmail}
                                    onDelete={handleDelete}
                                    isSelected={index === selectedIndex}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </main>
            {viewingEmail && (
                <EmailViewer
                    email={viewingEmail}
                    onClose={() => setViewingEmail(null)}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}