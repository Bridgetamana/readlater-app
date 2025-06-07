const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

function getUserId(email) {
    return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

async function fetchEmailsFromBin() {
    const res = await fetch(JSONBIN_URL + '/latest', {
        headers: {
            'X-Master-Key': JSONBIN_API_KEY,
        },
        cache: 'no-store',
    });
    if (!res.ok) return { users: {} };
    const json = await res.json();
    const data = json.record || {};
    if (data.emails && !data.users) {
        console.log('Migrating old data structure to new users structure');
        const users = {};
        data.emails.forEach(email => {
            const senderEmail = email.from || email.From;
            if (senderEmail) {
                const userId = getUserId(senderEmail);
                if (!users[userId]) {
                    users[userId] = [];
                }
                users[userId].push(email);
            }
        });

        data.users = users;
        delete data.emails
        await saveEmailsToBin(data);
    }
    if (!data.users) {
        data.users = {};
    }

    return data;
}

async function saveEmailsToBin(data) {
    console.log('Saving data to JSONBin:', JSON.stringify(data, null, 2));
    const res = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to save emails to JSONBin:', res.status, errorText);
        throw new Error(`JSONBin save failed: ${res.status} ${errorText}`);
    } else {
        console.log('Successfully saved to JSONBin:', res.status);
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        console.log('Received inbound email data:', JSON.stringify(data, null, 2));
        const senderEmail = data.From || data.from;
        if (!senderEmail) {
            console.error('No sender email found in data:', data);
            return new Response('No sender specified', { status: 400 });
        }

        const userId = getUserId(senderEmail);
        console.log('Processing email for user:', senderEmail, 'userId:', userId);
        const allData = await fetchEmailsFromBin();

        if (!allData.users) {
            allData.users = {};
        }
        if (!allData.users[userId]) {
            allData.users[userId] = [];
        }

        const newEmail = {
            from: data.From || data.from,
            to: data.To || data.to,
            subject: data.Subject || data.subject,
            textBody: data.TextBody || data.textBody,
            htmlBody: data.HtmlBody || data.htmlBody,
            date: new Date().toISOString(),
            read: false,
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            messageId: data.MessageID || data.messageId,
            originalDate: data.Date || data.date,
        };

        console.log('Created email object:', newEmail);
        allData.users[userId].unshift(newEmail);
        console.log('Added email to user array. Total emails for user:', allData.users[userId].length);

        await saveEmailsToBin(allData);
        console.log('Successfully saved email to JSONBin');

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Error processing inbound email:', error);
        return new Response('Error', { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get('user');

        if (!userEmail) {
            return Response.json({ error: 'User email required' }, { status: 400 });
        }

        const userId = getUserId(userEmail);
        const allData = await fetchEmailsFromBin();

        if (!allData.users) {
            return Response.json([]);
        }

        const userEmails = allData.users[userId] || [];
        return Response.json(userEmails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        return Response.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { searchParams } = new URL(req.url); const userEmail = searchParams.get('user');
        const emailId = searchParams.get('id');
        const { read } = await req.json();

        if (!userEmail || !emailId) {
            return Response.json({ error: 'User email and email ID required' }, { status: 400 });
        }

        const userId = getUserId(userEmail);
        const allData = await fetchEmailsFromBin();
        if (!allData.users) {
            allData.users = {};
        }
        if (!allData.users[userId]) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const emailIndex = allData.users[userId].findIndex(email => email.id === emailId);
        if (emailIndex === -1) {
            return Response.json({ error: 'Email not found' }, { status: 404 });
        }

        allData.users[userId][emailIndex].read = read;

        await saveEmailsToBin(allData);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error updating email:', error);
        return Response.json({ error: 'Failed to update email' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url); const userEmail = searchParams.get('user');
        const emailId = searchParams.get('id');

        if (!userEmail || !emailId) {
            return Response.json({ error: 'User email and email ID required' }, { status: 400 });
        }

        const userId = getUserId(userEmail);
        const allData = await fetchEmailsFromBin();
        if (!allData.users) {
            allData.users = {};
        }
        if (!allData.users[userId]) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        allData.users[userId] = allData.users[userId].filter(email => email.id !== emailId);

        await saveEmailsToBin(allData);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error deleting email:', error);
        return Response.json({ error: 'Failed to delete email' }, { status: 500 });
    }
}
