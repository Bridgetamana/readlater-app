'use client';
import { useEffect } from 'react';

export default function EmailViewer({ email, onClose, onMarkRead }) {
    useEffect(() => {
        if (email && !email.read && onMarkRead) {
            onMarkRead(email);
        }
    }, [email, onMarkRead]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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
