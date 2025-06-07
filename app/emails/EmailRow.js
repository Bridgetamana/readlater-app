export default function EmailRow({ email, onMarkRead, onDelete, onViewFull, isSelected }) {
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
        <tr className={`border-b hover:bg-gray-50 transition-colors ${!email.read ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : ''}`}>
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
