# FINAL Developer Checklist — primevilla.ph
### Date: May 25, 2026
### From: Bar Gvili, Blue Everest Asset Group
### Priority: URGENT — Campaign launch blocked until items 1-6 are done

---

**Status of previous request (April 18, 2026):**
- ✅ WhatsApp second number — Done
- ❌ Everything else — Not done

**This message contains ALL remaining work. 17 items total. Please complete all of them.**

---

## GROUP A: TRACKING CODES (CRITICAL — campaigns cannot launch without these)

### 1. Meta Pixel (Facebook/Instagram tracking)

Add this code inside `<head>` on EVERY page, right after `<head>`:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1599211187973958');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1599211187973958&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

### 2. Meta Pixel Events

Add these JavaScript calls to existing code (NOT in head — they fire on user actions):

**On inquiry form submission** (when user clicks Submit and form is valid):
```javascript
fbq('track', 'Lead');
```

**On any WhatsApp button/link click:**
```javascript
fbq('track', 'Contact');
```

### 3. Google Analytics 4 (GA4)

Add inside `<head>`, after the Meta Pixel code:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-04NZJT2C4V"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-04NZJT2C4V');
</script>
```

### 4. Google Ads Tag

Add inside `<head>`, after GA4:

```html
<!-- Google Ads Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18095957436"></script>
<script>
  gtag('config', 'AW-18095957436');
</script>
```

Note: The `gtag` function is already defined by GA4 above, so only the config line is needed if GA4 is loaded first. If you load them separately, include the full snippet.

---

## GROUP B: THANK YOU PAGE (NEW — needed for conversion tracking)

### 5. Create a Thank You page at: `primevilla.ph/thank-you`

This page should contain:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Panglao Prime Villas</title>

  <!-- COPY ALL TRACKING CODES FROM ITEMS 1, 3, 4 HERE -->

  <!-- CONVERSION TRACKING (fires only on this page) -->
  <script>
    // Meta Pixel - Lead conversion
    fbq('track', 'Lead');

    // GA4 - Lead event
    gtag('event', 'generate_lead', {
      currency: 'PHP',
      value: 200000
    });

    // Google Ads - Conversion (update LABEL when campaign is created)
    gtag('event', 'conversion', {
      send_to: 'AW-18095957436/CONVERSION_LABEL'
    });
  </script>

  <meta name="robots" content="noindex, nofollow">
</head>
<body>
  <!-- Use same design/header/footer as main site -->

  <h1>Thank You for Your Inquiry</h1>
  <p>Our team will contact you within 24 hours.</p>
  <p>For immediate assistance:</p>
  <ul>
    <li>WhatsApp (Marketing): <a href="https://wa.me/639542555553">+639542555553</a></li>
    <li>WhatsApp (Office): <a href="https://wa.me/639958565865">+639958565865</a></li>
  </ul>

  <!-- Optional: link back to homepage -->
  <a href="/">Back to Panglao Prime Villas</a>
</body>
</html>
```

### 6. Redirect form to Thank You page

After successful form submission, redirect the user to `/thank-you`:

```javascript
// After form data is sent successfully to Google Sheets:
window.location.href = '/thank-you';
```

Do NOT fire the `fbq('track', 'Lead')` on the form page anymore (item 2). It will fire on the Thank You page instead (item 5). Keep the `fbq('track', 'Contact')` on WhatsApp clicks.

---

## GROUP C: SEO & SOCIAL SHARING

### 7. Open Graph Tags

Add inside `<head>`:

```html
<!-- Open Graph -->
<meta property="og:title" content="Panglao Prime Villas - Luxury Investment Villas in Bohol" />
<meta property="og:description" content="Fully furnished luxury villas in Panglao, Bohol. From PHP 28,000,000. Verified Airbnb income PHP 395,000/month. 17-25% annual ROI." />
<meta property="og:image" content="https://primevilla.ph/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://primevilla.ph" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Panglao Prime Villas" />
```

**IMPORTANT:** Upload a villa hero image (1200x630px, JPG) to `/images/og-image.jpg`. Use the best aerial or front exterior shot.

### 8. Twitter/X Card Tags

Add inside `<head>`, after OG tags:

```html
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Panglao Prime Villas - Luxury Investment Villas in Bohol" />
<meta name="twitter:description" content="From PHP 28,000,000. Verified Airbnb income PHP 395,000/month. 17-25% ROI." />
<meta name="twitter:image" content="https://primevilla.ph/images/og-image.jpg" />
```

### 9. Schema Markup (JSON-LD)

Add before `</head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "Panglao Prime Villas",
  "description": "Luxury investment villas in Panglao, Bohol, Philippines. Between JW Marriott and Mithi Resort, 60 seconds to Panglao Beach.",
  "url": "https://primevilla.ph",
  "image": "https://primevilla.ph/images/og-image.jpg",
  "numberOfBedrooms": 4,
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": 263.78,
    "unitCode": "MTK"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "PHP",
    "price": "28000000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/LimitedAvailability",
    "description": "From PHP 28,000,000. Only 2 villas remaining."
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Panglao",
    "addressRegion": "Bohol",
    "addressCountry": "PH"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 9.6275,
    "longitude": 123.7825
  },
  "provider": {
    "@type": "Organization",
    "name": "Blue Everest Asset Group Holding Inc.",
    "url": "https://blue-everest.com",
    "telephone": "+639542555553"
  }
}
</script>
```

### 10. Sitemap

Create file at `primevilla.ph/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://primevilla.ph/</loc>
    <lastmod>2026-05-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://primevilla.ph/thank-you</loc>
    <lastmod>2026-05-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>
```

### 11. Robots.txt

Create file at `primevilla.ph/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /thank-you

Sitemap: https://primevilla.ph/sitemap.xml
```

### 12. Canonical URL

Add inside `<head>` on the main page:

```html
<link rel="canonical" href="https://primevilla.ph/" />
```

### 13. Language Declaration

Change the opening HTML tag to:

```html
<html lang="en">
```

### 14. Image Alt Tags

Add descriptive `alt` attributes to ALL images. Examples:

```html
<img src="images/villa-01.webp" alt="Panglao Prime Villas aerial view - luxury villas in Bohol Philippines" />
<img src="images/gallery-img-01.webp" alt="Villa interior - modern living room with pool view" />
<img src="images/map.webp" alt="Location map - between JW Marriott and Mithi Resort, Panglao Island" />
```

Every `<img>` tag on the site must have an `alt` attribute. No exceptions.

---

## GROUP D: FUNCTIONAL FIXES

### 15. UTM Parameter Capture

**A) Add hidden fields to the inquiry form** (if not already there):

```html
<input type="hidden" name="utm_source" id="utm_source" />
<input type="hidden" name="utm_medium" id="utm_medium" />
<input type="hidden" name="utm_campaign" id="utm_campaign" />
<input type="hidden" name="utm_content" id="utm_content" />
```

**B) Add this script** (fills the hidden fields from URL parameters):

```javascript
(function(){
  var params = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(function(p){
    var el = document.getElementById(p);
    if(el && params.get(p)) el.value = params.get(p);
  });
})();
```

**C) Add 4 new columns to Google Sheet** (the one receiving form data):
After the last column ("Captcha Score"), add:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

**D) Update the Apps Script / form handler** to pass these hidden field values to the new Sheet columns.

**Test:** Open `primevilla.ph?utm_source=test&utm_medium=cpc&utm_campaign=test_campaign` → submit test form → check Google Sheet for UTM values in new columns.

### 16. Fix PDF Link

There is a broken link on the site:
```
BROKEN:  images//Blue Everest.pdf  (double slash)
FIX:     images/Blue Everest.pdf   (single slash)
```

Find and fix this in the HTML.

### 17. Add Facebook Page Link + Email to Footer

Add to the footer section:

```html
<a href="https://www.facebook.com/BlueEverestGroup" target="_blank" rel="noopener">Facebook</a>
<a href="mailto:ceo@blue-everest.com">ceo@blue-everest.com</a>
```

---

## DO NOT CHANGE

- **Prices** — Keep "From PHP 28,000,000" as is. Do not change any pricing.
- **WhatsApp numbers** — Already correct. Do not change.
- **Design / Layout** — Do not change any visual elements, colors, fonts, or layout.
- **Form fields** — Do not change existing visible form fields. Only add the hidden UTM fields.

---

## CHECKLIST (check each when done)

```
GROUP A: TRACKING
[ ] 1. Meta Pixel code in <head> of every page
[ ] 2. Pixel event: Contact on WhatsApp click
[ ] 3. GA4 code in <head> of every page
[ ] 4. Google Ads tag in <head> of every page

GROUP B: THANK YOU PAGE
[ ] 5. /thank-you page created with conversion tracking
[ ] 6. Form redirects to /thank-you after submission

GROUP C: SEO
[ ] 7. Open Graph tags in <head> + og-image.jpg uploaded
[ ] 8. Twitter Card tags in <head>
[ ] 9. Schema markup (JSON-LD) before </head>
[ ] 10. sitemap.xml created and accessible
[ ] 11. robots.txt created and accessible
[ ] 12. Canonical URL in <head>
[ ] 13. <html lang="en"> set
[ ] 14. Alt tags on ALL images

GROUP D: FIXES
[ ] 15. UTM hidden fields + script + Sheet columns + handler
[ ] 16. PDF link double-slash fixed
[ ] 17. Facebook + email links in footer
```

**Please confirm when ALL items are complete. I will verify from our side.**

---

## IDs REFERENCE

| Item | ID |
|------|----|
| Meta Pixel | 1599211187973958 |
| GA4 | G-04NZJT2C4V |
| Google Ads | AW-18095957436 |
| Website | primevilla.ph |
| WhatsApp Marketing | +639542555553 |
| WhatsApp Office | +639958565865 |
| Facebook Page | facebook.com/BlueEverestGroup |
| Email | ceo@blue-everest.com |
