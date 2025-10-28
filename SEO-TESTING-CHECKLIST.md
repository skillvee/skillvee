# SEO Testing & Validation Checklist

## ✅ **Step 4: Test & Validate Your SEO Implementation**

After deployment completes (~2-3 minutes), follow this checklist to verify everything is working.

---

## **1. Basic Infrastructure Tests** (5 minutes)

### A. Test Sitemap
**URL**: https://skillvee.com/sitemap.xml

**What to Check**:
- [ ] Page loads successfully (no 404 error)
- [ ] Shows XML format with `<urlset>` tags
- [ ] Contains 11 URLs (homepage + 10 pages)
- [ ] All URLs start with `https://skillvee.com`
- [ ] Each URL has `<lastmod>`, `<changefreq>`, and `<priority>` tags

**Expected Result**: Clean XML sitemap with all public pages

---

### B. Test Robots.txt
**URL**: https://skillvee.com/robots.txt

**What to Check**:
- [ ] Page loads successfully
- [ ] Shows `User-agent: *` and `Allow: /`
- [ ] Disallows `/api/`, `/dashboard/`, `/admin/`, `/sign-in/`, `/sign-up/`
- [ ] Sitemap reference: `Sitemap: https://skillvee.com/sitemap.xml`

**Expected Result**: Proper crawler directives

---

### C. Test OG Image
**URL**: https://skillvee.com/og-image.jpg

**What to Check**:
- [ ] Image loads successfully
- [ ] Dimensions: 1200 x 630 pixels (check in browser DevTools)
- [ ] Shows SkillVee branding clearly

**Expected Result**: Professional OG image displays

---

## **2. Metadata Validation** (10 minutes)

### Test Each Page's Metadata

For each page below, **right-click → "View Page Source"** and verify:

#### **Homepage** (https://skillvee.com)
- [ ] `<title>` contains "SkillVee - AI-Powered Data Science Interview Practice"
- [ ] `<meta name="description">` present
- [ ] `<meta property="og:title">` present
- [ ] `<meta property="og:description">` present
- [ ] `<meta property="og:image">` = `https://skillvee.com/og-image.jpg`
- [ ] `<meta name="twitter:card">` = `summary_large_image`
- [ ] `<link rel="canonical">` = `https://skillvee.com/`
- [ ] JSON-LD scripts present (Organization + WebApplication)

#### **Pricing** (https://skillvee.com/pricing)
- [ ] `<title>` contains "Pricing"
- [ ] Unique description (different from homepage)
- [ ] OG tags present with correct URL
- [ ] Canonical: `https://skillvee.com/pricing`
- [ ] JSON-LD Product schema (2 products)

#### **FAQ** (https://skillvee.com/faq)
- [ ] `<title>` contains "FAQ"
- [ ] Unique description
- [ ] OG tags present
- [ ] Canonical: `https://skillvee.com/faq`
- [ ] JSON-LD FAQPage schema with 19 questions

#### **Companies** (https://skillvee.com/companies)
- [ ] `<title>` contains "For Companies"
- [ ] Unique description
- [ ] OG tags present
- [ ] Canonical URL correct

#### **Candidates** (https://skillvee.com/candidates)
- [ ] `<title>` contains "For Candidates"
- [ ] Unique description
- [ ] OG tags present
- [ ] Canonical URL correct

#### **Other Pages** (Privacy, Terms)
- [ ] Each has unique title
- [ ] Each has metadata

---

## **3. Structured Data Validation** (10 minutes)

### Google Rich Results Test

**Tool**: https://search.google.com/test/rich-results

Test these pages:

#### **Homepage**
1. Enter: `https://skillvee.com`
2. Click "Test URL"
3. Wait for results
4. **Expected**:
   - [ ] ✅ Organization schema detected
   - [ ] ✅ WebApplication schema detected
   - [ ] No errors or warnings

#### **FAQ Page**
1. Enter: `https://skillvee.com/faq`
2. Click "Test URL"
3. **Expected**:
   - [ ] ✅ FAQPage schema detected
   - [ ] ✅ Shows 19 Question items
   - [ ] Eligible for rich results

#### **Pricing Page**
1. Enter: `https://skillvee.com/pricing`
2. Click "Test URL"
3. **Expected**:
   - [ ] ✅ Product schema detected (2 products)
   - [ ] No errors

---

### Schema.org Validator

**Tool**: https://validator.schema.org/

1. Enter any page URL
2. Click "Run Test"
3. **Expected**: All schemas valid, no errors

---

## **4. Social Media Preview Testing** (5 minutes)

### Twitter Card Validator

**Tool**: https://cards-dev.twitter.com/validator

1. Enter: `https://skillvee.com`
2. Click "Preview card"
3. **Expected**:
   - [ ] Card type: `summary_large_image`
   - [ ] Shows OG image (1200x630)
   - [ ] Title: "SkillVee - AI-Powered Data Science Interview Practice"
   - [ ] Description visible
   - [ ] No errors

**Repeat for**: `/pricing`, `/faq`, `/companies`, `/candidates`

---

### LinkedIn Post Inspector

**Tool**: https://www.linkedin.com/post-inspector/

1. Enter: `https://skillvee.com`
2. Click "Inspect"
3. **Expected**:
   - [ ] Preview shows OG image
   - [ ] Title and description correct
   - [ ] No errors

---

### Facebook Sharing Debugger

**Tool**: https://developers.facebook.com/tools/debug/

1. Enter: `https://skillvee.com`
2. Click "Debug"
3. **Expected**:
   - [ ] OG tags detected
   - [ ] Image preview (1200x630)
   - [ ] No warnings

**Note**: First time may require "Scrape Again" button to refresh cache

---

## **5. Performance Testing** (5 minutes)

### Google PageSpeed Insights

**Tool**: https://pagespeed.web.dev/

1. Enter: `https://skillvee.com`
2. Wait for analysis (30-60 seconds)
3. **Expected Scores**:
   - [ ] Performance: 85+ (desktop), 75+ (mobile)
   - [ ] Accessibility: 90+
   - [ ] Best Practices: 95+
   - [ ] **SEO: 95-100** ✅ (KEY METRIC)

**SEO Audit Items to Check**:
- [x] Page has `<title>` tag
- [x] Document has meta description
- [x] Page is mobile-friendly
- [x] Links have descriptive text
- [x] Document has valid robots.txt
- [x] Image elements have alt attributes
- [x] Links are crawlable

---

### Lighthouse CLI (Optional - Local Testing)

```bash
# Install Lighthouse
npm install -g @lhci/cli lighthouse

# Run audit
lighthouse https://skillvee.com --view

# Or save report
lighthouse https://skillvee.com --output html --output-path ./lighthouse-report.html
```

---

## **6. Mobile Testing** (3 minutes)

### Google Mobile-Friendly Test

**Tool**: https://search.google.com/test/mobile-friendly

1. Enter: `https://skillvee.com`
2. Click "Test URL"
3. **Expected**:
   - [ ] ✅ "Page is mobile-friendly"
   - [ ] Screenshot shows proper mobile layout
   - [ ] No loading issues

---

## **7. Google Search Console Verification** (5 minutes)

### After Submitting Sitemap

**Go to**: [Google Search Console](https://search.google.com/search-console)

#### **Coverage Report**
1. Click "Coverage" in left sidebar
2. **Expected** (within 24-48 hours):
   - [ ] Valid pages: 11+
   - [ ] Errors: 0
   - [ ] Submitted: 11
   - [ ] Indexed: Growing (1-7 days)

#### **Sitemaps Status**
1. Click "Sitemaps"
2. **Expected**:
   - [ ] Status: "Success"
   - [ ] Discovered URLs: 11
   - [ ] Last read: Recent timestamp

#### **URL Inspection**
1. Enter: `https://skillvee.com`
2. Click "Test Live URL"
3. **Expected**:
   - [ ] ✅ URL is on Google
   - [ ] Crawl allowed: Yes
   - [ ] Indexing allowed: Yes
   - [ ] No errors

---

## **8. Manual Testing Checklist** (5 minutes)

### Browser DevTools Testing

Open DevTools (F12) on any page:

#### **Network Tab**
- [ ] OG image loads (200 status)
- [ ] No 404 errors for metadata resources
- [ ] Robots.txt loads (200 status)

#### **Console Tab**
- [ ] No JavaScript errors
- [ ] No CSP violations

#### **Elements Tab → `<head>` Section**
```html
<!-- Verify these are present -->
<title>...</title>
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:image" content="https://skillvee.com/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="...">
<script type="application/ld+json">...</script>
```

---

## **9. Real-World Sharing Test** (2 minutes)

### Test Actual Sharing

1. **Copy URL**: `https://skillvee.com`
2. **Paste into**:
   - [ ] Slack channel → See preview?
   - [ ] Discord message → See preview?
   - [ ] WhatsApp/Telegram → See preview?
   - [ ] Twitter/X draft → See card preview?

**Expected**: All show professional preview with OG image, title, description

---

## **10. SEO Tools Testing** (Optional)

### Third-Party SEO Analysis

#### **Screaming Frog SEO Spider** (Desktop Tool)
- Download: https://www.screamingfrogseoseo.com/seo-spider/
- Crawl: `https://skillvee.com`
- Check: All pages have titles, descriptions, canonical URLs

#### **Ahrefs Site Audit** (Paid)
- Run full site audit
- Check SEO health score

#### **SEMrush Site Audit** (Paid/Free Trial)
- Run comprehensive audit
- Check technical SEO score

---

## **📋 SUMMARY CHECKLIST**

### Critical Items (Must Pass)
- [ ] Sitemap loads at `/sitemap.xml`
- [ ] Robots.txt loads at `/robots.txt`
- [ ] OG image loads at `/og-image.jpg`
- [ ] All 8 pages have unique metadata
- [ ] Structured data validates (no errors)
- [ ] Social previews work on Twitter/LinkedIn
- [ ] PageSpeed SEO score: 95+
- [ ] Mobile-friendly test passes
- [ ] Sitemap submitted to Search Console

### High Priority
- [ ] All pages have canonical URLs
- [ ] JSON-LD schemas present (4 types)
- [ ] OG images show in social previews
- [ ] No console errors
- [ ] Security headers present

### Nice to Have
- [ ] Lighthouse performance 85+
- [ ] Third-party SEO tools showing improvements
- [ ] Real sharing tests successful

---

## **🚨 TROUBLESHOOTING**

### "Sitemap couldn't be fetched"
- **Solution**: Wait 5-10 minutes for DNS propagation
- **Check**: Manually visit https://skillvee.com/sitemap.xml in browser

### "Rich results not detected"
- **Solution**: Use "View Page Source" and look for `<script type="application/ld+json">`
- **Check**: Validate JSON in https://jsonlint.com/

### "OG image not showing"
- **Solution**: Clear cache, use "Scrape Again" in Facebook Debugger
- **Check**: Image dimensions (must be 1200x630)

### "Metadata not updating"
- **Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Check**: Deployment completed successfully on Vercel

---

## **✅ COMPLETION CRITERIA**

### You're Done When:
1. ✅ All critical items checked
2. ✅ PageSpeed SEO score 95+
3. ✅ Structured data validates
4. ✅ Social previews working
5. ✅ Sitemap submitted to Search Console
6. ✅ No errors in Search Console (after 24-48h)

---

## **📊 EXPECTED TIMELINE**

- **Immediate** (0-5 min): Sitemap, robots.txt, OG image accessible
- **5-15 min**: Metadata visible in page source
- **15-30 min**: Social previews working (may need cache clear)
- **1-2 hours**: PageSpeed results stable
- **24-48 hours**: Search Console shows sitemap success
- **1-7 days**: Pages start appearing in Google search
- **2-4 weeks**: Full SEO impact visible (rankings, traffic)

---

## **🎯 SUCCESS METRICS**

Track these over the next 4 weeks:

### Week 1
- [ ] All pages indexed by Google
- [ ] Rich results appearing in search
- [ ] Sitemap processing successfully

### Week 2-4
- [ ] Organic impressions increasing
- [ ] CTR improving (better titles/descriptions)
- [ ] Keyword rankings improving
- [ ] Social shares increasing

---

**Testing Started**: _________________
**Testing Completed**: _________________
**Issues Found**: _________________
**All Tests Passed**: [ ] Yes [ ] No

---

**Need Help?**
- Google Search Console Help: https://support.google.com/webmasters
- Schema.org Documentation: https://schema.org/docs/gs.html
- Next.js Metadata Docs: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
