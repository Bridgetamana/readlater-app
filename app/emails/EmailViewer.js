'use client';
import { useEffect } from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function EmailViewer({ email, onClose, onMarkRead, onDelete }) {
    useEffect(() => {
        if (email && !email.read && onMarkRead) {
            onMarkRead(email);
        }
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [email, onMarkRead, onClose]);

    if (!email) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDelete(email)}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"
                            aria-label="Delete email"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </header>
                <div className="flex-grow overflow-y-auto p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{email.subject}</h1>
                    <div className="flex items-center gap-4 mb-8 text-sm">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                            {(email.from_name || email.from || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{email.from_name || email.from}</p>
                            <p className="text-gray-500">{email.from_email || email.to}</p>
                        </div>
                    </div>
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: email.html_body || email.htmlBody || `<p>${email.text_body || email.textBody}</p>` }}
                    />
                </div>
            </div>
        </div>
    );
}
