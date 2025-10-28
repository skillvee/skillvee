# OG Image Creation Guide

## Required OG Image

Create a professional Open Graph image for social media sharing.

### Specifications
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG or JPEG
- **File name**: `og-image.png`
- **Location**: `/public/og-image.png`

### Design Requirements
1. **Brand Colors**: Use SkillVee blue (#237CF1 or rgb(35, 124, 241))
2. **Logo**: Include skillvee-logo.png (already in /public/)
3. **Tagline**: "AI-Powered Data Science Interview Practice"
4. **Visual Elements**:
   - Clean, professional design
   - Data science themed (code snippets, charts, or analytics visuals)
   - Readable text at small sizes

### Design Tools
- Figma (recommended)
- Canva Pro
- Adobe Photoshop/Illustrator

### Example Content
```
[SkillVee Logo]

Turn Interview Prep into Job Offers

AI-Powered Practice | Real Companies | Free Forever

skillvee-rouge.vercel.app
```

### After Creation
1. Place file at: `/public/og-image.png`
2. The metadata is already configured to use this image
3. Test with:
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
   - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/

## Dynamic OG Images (Future Enhancement)

For dynamic pages (interview results, profiles), consider using:
- Next.js OG Image generation (@vercel/og)
- Generate images on-the-fly with results data
- Cache generated images

### Example Implementation
```typescript
// app/interview/results/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export default async function Image({ params }: { params: { id: string } }) {
  // Fetch interview data
  // Generate custom OG image with score, date, etc.
}
```

## Current Status
- ✅ Metadata configured to use `/og-image.png`
- ⏳ Actual image file needs to be created
- ⏳ Dynamic OG images not yet implemented
