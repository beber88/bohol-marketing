# Message to Developer - primevilla.ph Updates

Hi,

We're launching paid campaigns for primevilla.ph and need the following changes installed on the site. Everything below goes into the same `<head>` section of every page.

---

## 1. Meta Pixel (Facebook/Instagram tracking)

Add this code right after the opening `<head>` tag:

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

### Pixel Events (add to existing code):

**On inquiry form submission** (when user clicks Submit), fire:
```javascript
fbq('track', 'Lead');
```

**On WhatsApp button click**, fire:
```javascript
fbq('track', 'Contact');
```

---

## 2. Google Analytics 4

Add this code in the `<head>`, after the Meta Pixel:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-04NZJT2C4V"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-04NZJT2C4V');
</script>
```

---

## 3. Open Graph Meta Tags

Add these inside `<head>` for proper link previews on Facebook, WhatsApp, Messenger:

```html
<meta property="og:title" content="Panglao Prime Villas - Luxury Villa Investment in Bohol" />
<meta property="og:description" content="Fully furnished luxury villas in Panglao, Bohol. From PHP 28,000,000. Verified Airbnb income PHP 395,000/month. 17-25% annual ROI." />
<meta property="og:image" content="https://primevilla.ph/images/og-image.jpg" />
<meta property="og:url" content="https://primevilla.ph" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Panglao Prime Villas" />
```

**Note:** Please upload a villa hero image (1200x630px, JPG) to `/images/og-image.jpg` on the server. Use the best exterior front view.

---

## 4. Second WhatsApp Number

Everywhere there is a WhatsApp button or link on the site, please add a second number:

- **Current (keep):** +639542555553 (Marketing)
- **Add:** +639958565865 (Office)

Display both as separate clickable buttons/links. Example:
```
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## 5. UTM Parameter Capture on Form

On the inquiry form, please add hidden fields that capture UTM parameters from the URL:

```html
<input type="hidden" name="utm_source" id="utm_source" />
<input type="hidden" name="utm_medium" id="utm_medium" />
<input type="hidden" name="utm_campaign" id="utm_campaign" />
<input type="hidden" name="utm_content" id="utm_content" />
```

And this script to auto-fill them:

```javascript
(function(){
  var params = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(function(p){
    var el = document.getElementById(p);
    if(el && params.get(p)) el.value = params.get(p);
  });
})();
```

---

## 6. Form Destination

Please confirm: where does the inquiry form currently send data? (Google Sheets / email / database?)
We need access to view incoming leads.

---

## Summary of IDs

| Item | ID |
|------|----|
| Meta Pixel | 1599211187973958 |
| GA4 Measurement ID | G-04NZJT2C4V |
| Website | https://primevilla.ph |

Please let me know once everything is installed and I'll verify from our side.

Thanks!