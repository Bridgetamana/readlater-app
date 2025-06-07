# ReadLater Email App

## Features

- Forward emails to shared Postmark address
- Private inboxes - users only see emails they forwarded
- Auto-mark emails as read when viewing
- Delete emails
- Full email viewer with HTML/text content
- Arrow keys (↑↓) to navigate email list
- Enter to open selected email
- Space to mark selected email as read
- Delete key to remove selected email
- Escape to close email viewer

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```
JSONBIN_API_KEY=your_jsonbin_api_key
JSONBIN_BIN_ID=your_jsonbin_bin_id
```

3. Run development server:

```bash
npm run dev
```

4. Configure Postmark webhook URL to point to: `your-domain.com/api/inbound-email`

## How It Works

1. Users login with their email address
2. Users forward emails FROM their email address TO your Postmark inbound address
3. Each user sees only emails they personally forwarded
4. Complete user isolation based on sender email address

## Deployment

Deploy to Vercel, Netlify, or any Node.js hosting platform. Ensure environment variables are configured in production.
