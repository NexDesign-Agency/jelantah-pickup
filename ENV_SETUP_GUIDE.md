# Environment Variables Setup Guide

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values (see sections below)

3. Restart your development server after making changes

## 1. Database Configuration

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jelantahgo?schema=public"
```

**How to get:**
- Use your PostgreSQL connection string
- Format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public`

## 2. NextAuth Configuration

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**For production:**
- Set `NEXTAUTH_URL` to your production domain
- Generate a strong secret and keep it secure

## 3. SMTP Configuration (Email Notifications)

### Option A: Gmail Setup (Recommended for Testing)

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "JelantahGO" as the name
   - Copy the 16-character password

3. **Configure .env:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=JelantahGO <noreply@jelantahgo.com>
```

### Option B: Other SMTP Providers

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=JelantahGO <noreply@yourdomain.com>
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM=JelantahGO <noreply@yourdomain.com>
```

**Outlook/Office 365:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=JelantahGO <noreply@yourdomain.com>
```

## 4. Google Sheets Integration

### Step 1: Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in name: "JelantahGO Sheets Service"
   - Click "Create and Continue"
   - Skip role assignment (optional)
   - Click "Done"

5. Create Key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON"
   - Download the JSON file

### Step 2: Extract Credentials from JSON

Open the downloaded JSON file, you'll see:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "xxx@xxx.iam.gserviceaccount.com",
  ...
}
```

### Step 3: Configure .env

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-sheet-id
```

**Important Notes:**
- Copy the entire `private_key` value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters in the private key
- Wrap the entire value in double quotes
- For `GOOGLE_SHEET_ID`, extract from Google Sheet URL:
  - URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
  - Copy the `SPREADSHEET_ID` part

### Step 4: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click "Share" button
3. Paste the service account email (from `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
4. Give it "Editor" permission
5. Click "Send" (uncheck "Notify people" if you don't want to send email)

### Step 5: Prepare Sheet Headers

Make sure your Google Sheet has these headers in Row 1:
- A1: Order Number
- B1: Date
- C1: Customer Name
- D1: Customer Phone
- E1: Courier Name
- F1: Liters
- G1: Price/Liter
- H1: Total Amount

## 5. Socket.io Configuration

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For production:**
- Set to your production domain (e.g., `https://yourdomain.com`)

## Testing Your Configuration

### Test Email:
1. Go to `/admin/settings/integrations`
2. Use the test email feature (if available)
3. Or create an order and check your email

### Test Google Sheets:
1. Go to `/admin/settings/integrations`
2. Click "Test Connection"
3. Should show "Connection successful"
4. Mark a billing as paid
5. Check your Google Sheet for new row

## Troubleshooting

### Email Not Sending?
- ✅ Check SMTP credentials are correct
- ✅ For Gmail: Make sure App Password is used (not regular password)
- ✅ Check spam folder
- ✅ Verify SMTP_HOST and SMTP_PORT are correct for your provider
- ✅ Check server logs for error messages

### Google Sheets Not Syncing?
- ✅ Verify service account email has access to the sheet
- ✅ Check GOOGLE_SHEET_ID is correct (from sheet URL)
- ✅ Ensure private key includes `\n` characters
- ✅ Verify Google Sheets API is enabled
- ✅ Check server logs for error messages

### Connection Issues?
- ✅ Restart development server after changing .env
- ✅ Clear browser cache
- ✅ Check .env file is in project root (not in src/)
- ✅ Verify no typos in variable names

## Security Best Practices

1. **Never commit .env to version control**
   - Already in .gitignore
   - Use .env.example for documentation

2. **Use environment-specific files:**
   - `.env.local` for local development
   - `.env.production` for production (set in hosting platform)

3. **Rotate secrets regularly:**
   - Change NEXTAUTH_SECRET periodically
   - Regenerate app passwords if compromised

4. **Limit service account permissions:**
   - Only give necessary permissions to Google service account

