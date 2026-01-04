# Cloudflare Pages Deployment Guide

## Quick Setup

### 1. Connect Your Repository to Cloudflare Pages

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Click "Create a project"
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Select your repository

### 2. Configure Build Settings

Use these settings when setting up the project:

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave default)
- **Node version**: `18` or higher

### 3. Add Environment Variables

In Cloudflare Pages, go to Settings → Environment variables and add:

**Production and Preview:**

```
VITE_SUPABASE_URL=https://kcdbzhawjtapmpcgyajd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZGJ6aGF3anRhcG1wY2d5YWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjE1MjAsImV4cCI6MjA4MjkzNzUyMH0.yUiIE6i2PQZlp5ke19gOYY2ur7_zBs3kKqjx67muPGg
```

### 4. Deploy

Click "Save and Deploy" and Cloudflare will build and deploy your app automatically.

## Features Configured

- SPA routing with `_redirects`
- Service Worker support with proper headers
- Security headers
- Supabase database integration
- Offline support

## Automatic Deployments

Every push to your main branch will automatically trigger a new deployment on Cloudflare Pages.

## Custom Domain (Optional)

1. Go to your project in Cloudflare Pages
2. Click on "Custom domains"
3. Add your domain and follow the DNS configuration instructions
