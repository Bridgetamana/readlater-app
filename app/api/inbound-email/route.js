let emails = [];

export async function POST(req) {
    try {
        const data = await req.json();
        emails.unshift({
            from: data.From,
            to: data.To,
            subject: data.Subject,
            textBody: data.TextBody,
            htmlBody: data.HtmlBody,
            date: new Date().toISOString(),
        });
        console.log('Inbound email received:', data);
        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Error processing inbound email:', error);
        return new Response('Error', { status: 500 });
    }
}

export async function GET() {
    return Response.json(emails);
}
