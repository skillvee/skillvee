# Sitemap Automation Guide

## 🎯 Overview

Your sitemap is now **fully automated** and will stay up-to-date without manual intervention!

**Location**: [/src/app/sitemap.ts](src/app/sitemap.ts)
**URL**: https://www.skillvee.com/sitemap.xml

---

## ✅ What's Automated

### 1. **Dynamic Routes** (100% Automatic)
These routes are **automatically fetched from your database** every time the sitemap is accessed:

| Route Type | Example | Auto-Updated |
|------------|---------|--------------|
| User Profiles | `/profile/johndoe` | ✅ Yes |
| Interview Results | `/interview/results/abc123` | ✅ Yes |
| Practice Cases | `/interview/case/xyz789` | ✅ Yes |

**You don't need to do anything!** When users create profiles, complete interviews, or new cases are added, they automatically appear in the sitemap.

### 2. **Static Routes** (Manual Updates Required)
These are explicitly defined in the sitemap file:

- Homepage (`/`)
- Pricing (`/pricing`)
- FAQ (`/faq`)
- Companies (`/companies`)
- Candidates (`/candidates`)
- Practice (`/practice`)
- Legal pages (`/privacy`, `/terms`, etc.)

---

## 📝 How to Add New Static Pages

When you create a new static page (like `/blog` or `/about`), follow these steps:

### Step 1: Open the Sitemap File
File: [/src/app/sitemap.ts](src/app/sitemap.ts)

### Step 2: Add Your Route to the `staticRoutes` Array

```typescript
// Find the staticRoutes array (around line 25)
const staticRoutes: MetadataRoute.Sitemap = [
  // ... existing routes ...

  // ADD YOUR NEW PAGE HERE:
  {
    url: `${baseUrl}/your-new-page`,
    lastModified: new Date(),
    changeFrequency: "weekly",  // How often it changes
    priority: 0.8,              // SEO priority (0.1 to 1.0)
  },
];
```

### Step 3: Choose the Right Values

#### **changeFrequency**
How often the page content changes:
- `"always"` - Changes every time (rare, use for live data)
- `"hourly"` - Changes hourly (news feeds, dashboards)
- `"daily"` - Changes daily (blogs, practice content)
- `"weekly"` - Changes weekly (most pages)
- `"monthly"` - Changes monthly (legal pages, about page)
- `"yearly"` - Changes yearly (archive pages)
- `"never"` - Never changes (deprecated pages)

#### **priority**
SEO importance (0.1 = lowest, 1.0 = highest):
- `1.0` - Homepage only
- `0.9` - Key conversion pages (pricing, companies, candidates)
- `0.8` - Important content pages (features, product pages)
- `0.7` - Secondary content (blog posts, case studies)
- `0.6` - User-generated content (profiles)
- `0.5` - Tertiary pages (individual results, archives)
- `0.4` - Legal pages (terms, privacy)

### Step 4: Save and Deploy
```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): add /new-page to sitemap"
git push
```

**That's it!** Vercel will auto-deploy and Google will discover your new page.

---

## 🔧 How It Works

### Automatic Updates

The sitemap is **generated dynamically** every time it's accessed:

1. **User/Bot visits** `https://www.skillvee.com/sitemap.xml`
2. **Next.js calls** the `sitemap()` function in `/src/app/sitemap.ts`
3. **Function queries database** for latest profiles, interviews, cases
4. **Returns fresh XML** with all current routes

**Benefits**:
- Always up-to-date
- No manual updates needed
- No build-time delays
- Reflects real-time data

### Caching Behavior

- **Vercel caches** sitemap responses for performance
- **Cache duration**: Typically 1 hour (Vercel default)
- **Manual refresh**: Purge cache in Vercel dashboard if needed
- **Google crawls**: Typically daily for popular sites

---

## 🎛️ Configuration Options

### Limiting Sitemap Size

Current limits (in [sitemap.ts](src/app/sitemap.ts)):
```typescript
profiles:  take: 1000  // Max 1000 profiles
interviews: take: 500  // Max 500 interviews
cases:      take: 200  // Max 200 cases
```

**Why limit?**
- Google recommends max 50,000 URLs per sitemap
- Large sitemaps slow down generation
- Most important pages should come first

**To adjust**:
Change the `take` value in the database queries.

### Filtering Dynamic Routes

#### **Example: Only Public Profiles**
```typescript
const profiles = await db.user.findMany({
  where: {
    isPublic: true,        // Only public profiles
    username: { not: null }, // Must have username
  },
  // ...
});
```

#### **Example: Only Completed Interviews**
```typescript
const interviews = await db.interview.findMany({
  where: {
    status: "COMPLETED",     // Only completed
    isPublic: true,          // Only public
  },
  // ...
});
```

**Current Status**: All queries have empty `where` clauses. Adjust based on your privacy/visibility requirements.

---

## 📊 Monitoring & Maintenance

### Google Search Console

**Check sitemap status**:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Sitemaps" in left sidebar
3. View status of `https://www.skillvee.com/sitemap.xml`

**Expected metrics**:
- Status: "Success"
- Discovered URLs: 11+ (will grow with dynamic content)
- Last read: Updated regularly

### Manual Testing

**Test sitemap generation**:
```bash
# Visit in browser
https://www.skillvee.com/sitemap.xml

# Or use curl
curl https://www.skillvee.com/sitemap.xml
```

**Expected output**:
- XML format with `<urlset>` tags
- All static routes (11 pages)
- Dynamic routes (profiles, interviews, cases)
- No errors or warnings

### Performance Monitoring

**Check generation time**:
```bash
# Time sitemap generation
time curl -s https://www.skillvee.com/sitemap.xml > /dev/null
```

**Expected**: < 1 second for typical sizes

**If slow** (> 3 seconds):
- Reduce `take` limits in queries
- Add database indexes on `updatedAt` fields
- Consider sitemap index (for 50,000+ URLs)

---

## 🚨 Troubleshooting

### Issue: "Sitemap not updating"

**Cause**: Vercel cache holding old version

**Solution**:
1. Wait 1 hour for natural cache expiration, OR
2. Purge cache: Vercel Dashboard → Project → Settings → Caching → Purge

### Issue: "Database error in sitemap"

**Cause**: Database query failing (e.g., missing field)

**Solution**:
1. Check Vercel logs for error details
2. Verify database schema matches query
3. Sitemap will **fallback to static routes only** (graceful degradation)

### Issue: "Too many URLs (50,000+ limit)"

**Cause**: Database has grown significantly

**Solution**:
Create a **sitemap index** (split into multiple sitemaps):

```typescript
// Example structure:
/sitemap.xml          → Index file
/sitemap-static.xml   → Static pages
/sitemap-profiles.xml → User profiles
/sitemap-interviews.xml → Interviews
/sitemap-cases.xml    → Cases
```

See [Next.js Sitemap Docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) for implementation.

### Issue: "Sitemap shows private content"

**Cause**: Missing `where` clause filters

**Solution**:
Add visibility filters to database queries in [sitemap.ts](src/app/sitemap.ts).

---

## 🎯 Best Practices

### 1. **Review Sitemap Quarterly**
- Check for outdated routes
- Adjust priorities based on analytics
- Remove deprecated pages

### 2. **Monitor Coverage in Search Console**
- Track indexed vs discovered URLs
- Investigate pages with errors
- Watch for coverage issues

### 3. **Update Priorities Based on Data**
- High-converting pages: Higher priority
- Rarely visited pages: Lower priority
- Update `priority` values in `staticRoutes`

### 4. **Add New Static Pages Immediately**
- Don't wait for next deploy
- Add to sitemap when creating page
- Helps with faster indexing

### 5. **Consider SEO Impact**
- New pages: Start with priority 0.7-0.8
- Test performance over 2-4 weeks
- Adjust based on search performance

---

## 📚 Advanced Features (Future)

### Sitemap Index (For Large Sites)
When you have 50,000+ URLs, split into multiple sitemaps:

```typescript
// sitemap-index.ts
export default function sitemapIndex() {
  return [
    { url: 'https://www.skillvee.com/sitemap-static.xml' },
    { url: 'https://www.skillvee.com/sitemap-profiles.xml' },
    { url: 'https://www.skillvee.com/sitemap-interviews.xml' },
  ];
}
```

### Incremental Static Regeneration (ISR)
Cache sitemap with periodic revalidation:

```typescript
export const revalidate = 3600; // Revalidate every hour
```

### News Sitemap
For time-sensitive content (blogs, announcements):

```xml
<!-- Special news sitemap format -->
<news:news>
  <news:publication_date>2025-10-28</news:publication_date>
  <news:title>Blog Post Title</news:title>
</news:news>
```

---

## 📖 Example: Adding a Blog

Let's say you want to add a blog to SkillVee:

### Step 1: Create Blog Pages
```
/src/app/blog/page.tsx          → Blog listing
/src/app/blog/[slug]/page.tsx   → Individual posts
```

### Step 2: Add Static Route
```typescript
// In sitemap.ts, add to staticRoutes:
{
  url: `${baseUrl}/blog`,
  lastModified: new Date(),
  changeFrequency: "daily",
  priority: 0.8,
},
```

### Step 3: Add Dynamic Routes (Optional)
```typescript
// In sitemap.ts, add after line 94:
const blogPosts = await db.blogPost.findMany({
  where: { published: true },
  select: { slug: true, updatedAt: true },
});

const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(post => ({
  url: `${baseUrl}/blog/${post.slug}`,
  lastModified: post.updatedAt,
  changeFrequency: "monthly",
  priority: 0.6,
}));

// Add to return statement:
return [...staticRoutes, ...blogRoutes, ...profileRoutes, ...];
```

### Step 4: Deploy
```bash
git add src/app/sitemap.ts
git commit -m "feat(blog): add blog routes to sitemap"
git push
```

**Done!** Blog pages now appear in sitemap automatically.

---

## 🔗 Resources

- **Next.js Sitemap Docs**: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- **Google Sitemap Protocol**: https://www.sitemaps.org/protocol.html
- **Google Search Console**: https://search.google.com/search-console
- **Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html

---

## ✅ Summary

### What You Need to Remember

1. **Dynamic content** (profiles, interviews, cases) → **Automatic** ✅
2. **Static pages** → **Manual addition** (but easy!)
3. **Sitemap updates** → **Real-time** (on each request)
4. **Monitoring** → **Check Search Console monthly**

### When to Update Sitemap

✅ **Do update when**:
- Creating new static pages (`/blog`, `/about`, etc.)
- Adding new page sections
- Changing site structure

❌ **Don't update for**:
- New user profiles (automatic)
- New interviews (automatic)
- New cases (automatic)
- Content changes on existing pages

---

**Your sitemap is now intelligent and self-maintaining! 🚀**

Questions? Check the troubleshooting section or review the inline comments in [sitemap.ts](src/app/sitemap.ts).
