# Google Search Console Setup Guide

## Overview
Google Search Console is essential for monitoring your site's search performance, indexing status, and SEO health.

## Setup Instructions

### 1. Add Your Site to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Choose **"URL prefix"** method
4. Enter your site URL: `https://skillvee-rouge.vercel.app`
5. Click **"Continue"**

### 2. Verify Ownership

Google will provide multiple verification methods. We've already prepared for the **HTML tag method**:

#### Option A: HTML Tag (Recommended - Already Prepared)
1. In Google Search Console, select **"HTML tag"** verification method
2. Google will show a meta tag like:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXXX" />
   ```
3. Copy only the content value: `XXXXXXXXXXXXXX`
4. Update `/src/app/layout.tsx`:
   - Find line 80: `google: "google-site-verification-code"`
   - Replace with: `google: "XXXXXXXXXXXXXX"`
5. Deploy to Vercel
6. Return to Search Console and click **"Verify"**

#### Option B: Alternative Methods (If Needed)
- **Domain verification**: Requires DNS record (more complex)
- **Google Analytics**: If already using GA
- **Google Tag Manager**: If already using GTM

### 3. Submit Sitemap

Once verified:
1. In Google Search Console, go to **"Sitemaps"** in left menu
2. Enter: `https://skillvee-rouge.vercel.app/sitemap.xml`
3. Click **"Submit"**
4. Sitemap status should show as "Success" within 24-48 hours

### 4. Monitor Performance

After 2-3 days, you'll start seeing data:
- **Performance**: Clicks, impressions, CTR, position
- **Coverage**: Indexed pages, errors, warnings
- **Enhancements**: Core Web Vitals, mobile usability
- **Security Issues**: Malware or security problems

## Additional Search Engines

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site: `https://skillvee-rouge.vercel.app`
3. Verify using HTML tag method (same process as Google)
4. Update `layout.tsx` with Bing verification code
5. Submit sitemap: `https://skillvee-rouge.vercel.app/sitemap.xml`

### Yandex Webmaster (Optional)
If targeting Russian market:
1. Go to [Yandex Webmaster](https://webmaster.yandex.com/)
2. Follow similar process

## Current Implementation Status

✅ **Completed**:
- Meta tag placeholder added to layout.tsx
- Sitemap.xml ready at `/sitemap.xml`
- robots.txt configured

⏳ **Pending**:
- Get actual verification code from Google Search Console
- Update layout.tsx with real verification code
- Submit sitemap after verification
- Set up Bing Webmaster Tools

## Important Notes

1. **Verification**: Once you update the meta tag, the site must be deployed to Vercel for Google to see it
2. **Indexing Time**: It can take 1-7 days for Google to fully index your site
3. **Sitemap Updates**: The sitemap is automatically generated, no manual updates needed
4. **Multiple Owners**: You can add team members as owners/users in Search Console settings

## Troubleshooting

**"Verification failed"**:
- Ensure the meta tag is in the `<head>` section (it is)
- Check that the site is deployed to production
- Wait 1-2 minutes after deployment and try again
- Clear your browser cache

**"Sitemap couldn't be read"**:
- Test sitemap manually: https://skillvee-rouge.vercel.app/sitemap.xml
- Ensure it's valid XML (it should be with Next.js)
- Wait 24 hours and check again

**"No data yet"**:
- New sites take 2-7 days to appear in Search Console
- Be patient, data will come

## Contact Support

If you encounter issues:
- Google Search Console Help: https://support.google.com/webmasters
- Vercel Support: https://vercel.com/support
