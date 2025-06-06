'use client';
import { useEffect, useState } from 'react';

export default function EmailsDashboard() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmails() {
            const res = await fetch('/api/inbound-email');
            const data = await res.json();
            setEmails(data);
            setLoading(false);
        }
        fetchEmails();
    }, []);

    return (
        <main style={{ padding: 32 }}>
            <h1>Received Emails</h1>
            {loading ? (
                <p>Loading...</p>
            ) : emails.length === 0 ? (
                <p>No emails received yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Subject</th>
                            <th>Text Body</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emails.map((email, idx) => (
                            <tr key={idx}>
                                <td>{new Date(email.date).toLocaleString()}</td>
                                <td>{email.from}</td>
                                <td>{email.to}</td>
                                <td>{email.subject}</td>
                                <td style={{ maxWidth: 400, whiteSpace: 'pre-wrap' }}>{email.textBody}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
