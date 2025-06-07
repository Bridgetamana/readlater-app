import { Trash2 } from 'lucide-react';

export default function EmailRow({ email, onSelect, onDelete, isSelected }) {
    const formattedDate = new Date(email.created_at || email.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    return (
        <li
            onClick={() => onSelect(email)}
            className={`
                flex items-center gap-4 px-4 py-3 border-b border-gray-200 cursor-pointer
                transition-colors duration-150 ease-in-out group
                ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-600'}
            `}
        >
            <div className={`w-2 h-2 rounded-full transition-opacity ${!email.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
            <div className="flex-shrink-0 w-36 truncate">
                {email.from_name || email.from || 'No Name'}
            </div>
            <div className="flex-grow truncate">
                <span className={!email.read ? 'text-gray-800' : 'text-gray-700'}>
                    {email.subject || 'No Subject'}
                </span>
                <span className="ml-2 font-normal text-gray-500 hidden md:inline">
                    - {(email.text_body || email.textBody || '').substring(0, 50)}...
                </span>
            </div>
            <div className="flex-shrink-0 w-20 text-right text-sm font-normal text-gray-500">
                {formattedDate}
            </div>
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onDelete(email);
                    }}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600"
                    aria-label="Delete email"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </li>
    );
}
