# ProPhonePlus - Stock Management System

Modern inventory management for mobile phone retail businesses with 100% local storage.

## Built-in Login Credentials

**Admin Account:**
- Email: `admin@prophoneplus.com`
- Password: `Admin2026!`

**Worker Account:**
- Email: `worker@prophoneplus.com`
- Password: `Worker2026!`

These accounts work immediately on any deployment!

## Features

- **Cloud Database** - All data synced with Supabase
- **Multi-Device Access** - Access from any device with internet
- **No Setup Required** - Just deploy and use the built-in accounts
- **Built-in Accounts** - Pre-configured admin and worker logins
- Product inventory tracking with images
- Sales management with detailed records
- Category management with default categories
- Low stock alerts
- Excel import/export
- Multi-language support (English/French)
- Mobile-ready responsive design
- Real-time data synchronization

---

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Cloud Database)
- PostgreSQL

---

## Quick Deployment

### Option 1: Cloudflare Pages (Recommended)

1. Push this repository to GitHub/GitLab
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
3. Click "Create a project" and connect your repository
4. Use these settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables in Settings:
   ```
   VITE_SUPABASE_URL=https://kcdbzhawjtapmpcgyajd.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZGJ6aGF3anRhcG1wY2d5YWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjE1MjAsImV4cCI6MjA4MjkzNzUyMH0.yUiIE6i2PQZlp5ke19gOYY2ur7_zBs3kKqjx67muPGg
   ```
6. Click "Save and Deploy"

See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed instructions.

### Option 2: Netlify Drag & Drop

1. Build the project:
```bash
npm install
npm run build
```

2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page
4. Add environment variables in Netlify dashboard (same as above)
5. Done! Your site is live

### Option 3: Connect to Netlify

1. Push this repository to GitHub
2. Connect your GitHub repository to Netlify
3. Add environment variables (same as Cloudflare)
4. Deploy automatically

---

## Local Development

```bash
npm install
npm run dev
```

Login with the built-in credentials above.

---

## How It Works

- **Cloud Sync** - All data stored in Supabase and accessible from anywhere
- **Multi-User Support** - Multiple users can access the system simultaneously
- **No Database Setup** - Supabase is pre-configured and ready to use
- **Export/Import** - Use Excel to backup or migrate data
- **Add More Workers** - Admin can create additional worker accounts
- **Default Categories** - Starts with pre-configured categories (Smartphones, Accessories, Tablets, Smartwatches)

---

## License

MIT
