const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function fetchEmailsFromBin() {
    const res = await fetch(JSONBIN_URL + '/latest', {
        headers: {
            'X-Master-Key': JSONBIN_API_KEY,
        },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.record.emails || [];
}

async function saveEmailsToBin(emails) {
    const res = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ emails }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to save emails to JSONBin:', errorText);
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const emails = await fetchEmailsFromBin();
        const newEmail = {
            from: data.From,
            to: data.To,
            subject: data.Subject,
            textBody: data.TextBody,
            htmlBody: data.HtmlBody,
            date: new Date().toISOString(),
            read: false,
            id: Date.now().toString() + Math.random().toString(36).slice(2),
        };
        emails.unshift(newEmail);
        await saveEmailsToBin(emails);
        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Error processing inbound email:', error);
        return new Response('Error', { status: 500 });
    }
}

export async function GET() {
    const emails = await fetchEmailsFromBin();
    return Response.json(emails);
}
