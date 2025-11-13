# Cloudflare Configuration Guide

This guide shows you exactly where to find all the configuration values needed for Cloudflare integration.

## Quick Reference: All Environment Variables Needed

```bash
# Cloudflare Account (used by all services)
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Cloudflare Images
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash

# Cloudflare R2 (for HEIC storage)
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.your-domain.com  # Optional

# Cloudflare Turnstile (bot protection)
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
```

---

## 1. Cloudflare Account ID

**Where to find it:**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any domain/account
3. Look at the URL: `https://dash.cloudflare.com/{ACCOUNT_ID}/...`
4. Or go to **Right sidebar** → Your account name → **Account ID** is displayed there
5. Or go to **Workers & Pages** → The account ID is shown in the URL

**Example:** If URL is `https://dash.cloudflare.com/abc123def456/...`, then `CLOUDFLARE_ACCOUNT_ID=abc123def456`

---

## 2. Cloudflare API Token

**Where to create it:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click your **profile icon** (top right) → **My Profile**
3. Go to **API Tokens** tab
4. Click **Create Token**
5. Click **Create Custom Token**

**Permissions needed:**
- **Account** → **Cloudflare Images** → **Edit** (REQUIRED for HEIC conversion)
- **Account** → **Cloudflare R2** → **Object Read & Write** (optional, only if using R2)
- **Zone** → **Zone** → **Read** (optional, only if using Workers)

**Account Resources:**
- Include → **All accounts** (or select specific account)

6. Click **Continue to summary** → **Create Token**
7. **Copy the token immediately** (you won't see it again!)

**Set in Convex:**
```bash
CLOUDFLARE_API_TOKEN=your_token_here
```

---

## 3. Cloudflare Images Account Hash

**Where to find it:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Images** in the left sidebar
3. Click **Get Started** (if first time)
4. The **Account Hash** is displayed at the top of the Images dashboard
5. Or go to **Images** → **Settings** → Account Hash is shown there

**Example:** `CLOUDFLARE_IMAGES_ACCOUNT_HASH=a1b2c3d4e5f6g7h8`

**Also set in frontend:**
```bash
# apps/app/.env.local
VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash

# apps/native/.env.local (or app.json)
EXPO_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash
```

---

## 4. Cloudflare R2 Credentials

### 4a. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `rackd-images`)
5. Choose location (closest to your users)
6. Click **Create bucket**

**Set in Convex:**
```bash
R2_BUCKET_NAME=rackd-images
```

### 4b. Create R2 API Token

1. In **R2** dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Enter token name (e.g., `rackd-r2-token`)
4. **Permissions:**
   - **Object Read & Write** (for uploads)
   - **Object Read** (for downloads)
5. **TTL:** Leave blank for no expiration (or set expiration)
6. **Buckets:** Select your bucket or **All buckets**
7. Click **Create API Token**
8. **Copy both values immediately:**
   - **Access Key ID**
   - **Secret Access Key**

**Set in Convex:**
```bash
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
```

### 4c. R2 Public URL (Optional)

If you want public access to R2 files:

1. Go to **R2** → Your bucket → **Settings**
2. Scroll to **Public Access**
3. Enable **Public Access**
4. You'll see a public URL like: `https://pub-xxxxx.r2.dev`
5. Or configure a custom domain:
   - Go to **Settings** → **Custom Domains**
   - Add your domain (e.g., `cdn.yourdomain.com`)
   - Follow DNS setup instructions

**Set in Convex (optional):**
```bash
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
# OR
R2_PUBLIC_URL=https://cdn.yourdomain.com
```

---

## 5. Cloudflare Turnstile Keys

**Where to create:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar
3. Click **Add Site**
4. Enter site name (e.g., `Rackd App`)
5. **Domain:** Enter your domain (e.g., `rackd.net`)
   - Or use `localhost` for development
6. **Widget Mode:** Choose:
   - **Managed** (recommended) - Cloudflare handles challenge
   - **Non-Interactive** - No user interaction needed
   - **Invisible** - Completely invisible to users
7. Click **Create**
8. You'll see:
   - **Site Key** (public, safe for frontend)
   - **Secret Key** (private, backend only)

**Set in frontend:**
```bash
# apps/app/.env.local
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key

# apps/native/.env.local (or app.json)
EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
```

**Set in Convex:**
```bash
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
```

---

## Where to Set Environment Variables

### Convex Backend

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add Variable**
5. Add each variable one by one

Or use Convex CLI:
```bash
npx convex env set CLOUDFLARE_ACCOUNT_ID=your_value
npx convex env set CLOUDFLARE_API_TOKEN=your_value
# ... etc
```

### Frontend (Web App)

Create/edit `apps/app/.env.local`:
```bash
VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
```

### Frontend (React Native)

Create/edit `apps/native/.env.local` or add to `app.json`:
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH": "your_account_hash",
      "EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY": "your_site_key"
    }
  }
}
```

---

## Verification Checklist

After setting up, verify everything works:

- [ ] Account ID is correct (check URL format)
- [ ] API Token has correct permissions (Images + R2)
- [ ] Images Account Hash matches dashboard
- [ ] R2 bucket exists and is accessible
- [ ] R2 API token has read/write permissions
- [ ] Turnstile site created and keys copied
- [ ] All environment variables set in Convex
- [ ] Frontend env vars set (if using client-side features)

---

## Troubleshooting

### "Cloudflare credentials not configured"
- Check that all required env vars are set in Convex
- Verify variable names match exactly (case-sensitive)
- Restart Convex dev server after adding env vars

### "R2 upload failed"
- Verify R2 API token has correct permissions
- Check bucket name is correct
- Ensure bucket exists in your account

### "Cloudflare Images upload failed"
- Verify API token has Images:Edit permission
- Check Account ID is correct
- Ensure Images is enabled in your account

### "Turnstile verification failed"
- Verify secret key matches the site key
- Check domain matches Turnstile site configuration
- Ensure site key is set in frontend env vars

---

## Security Best Practices

1. **Never commit secrets to git** - Use `.env.local` and `.gitignore`
2. **Rotate API tokens regularly** - Especially if compromised
3. **Use least privilege** - Only grant necessary permissions
4. **Use separate tokens** - Different tokens for dev/prod
5. **Set token expiration** - For R2 tokens, set TTL when possible
6. **Monitor usage** - Check Cloudflare dashboard for unusual activity

---

## Cost Considerations

- **Cloudflare Images**: Free tier (100k images/month), then $1 per 100k
- **Cloudflare R2**: $0.015/GB/month storage, no egress fees
- **Cloudflare Turnstile**: Free, unlimited verifications
- **Cloudflare Workers**: Free tier (100k requests/day)

Most small-to-medium apps will stay within free tiers!

