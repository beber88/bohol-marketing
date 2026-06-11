#!/usr/bin/env npx tsx
/**
 * Google Ads Campaign Setup Guide
 *
 * Google Ads API requires OAuth2 + developer token which we don't have.
 * This script outputs the EXACT campaign structure to create manually
 * in Google Ads UI (ads.google.com).
 *
 * Run: npx tsx scripts/setup-google-ads.ts
 */

console.log(`
╔══════════════════════════════════════════════════════════╗
║       GOOGLE ADS CAMPAIGN SETUP - Panglao Prime Villas  ║
║       Total Budget: $32/day across 3 campaigns           ║
╚══════════════════════════════════════════════════════════╝

Go to https://ads.google.com and create these 3 campaigns:

════════════════════════════════════════════════════════════
CAMPAIGN 1: PPV - Israel Search
════════════════════════════════════════════════════════════

Settings:
  Campaign type:    Search
  Networks:         Google Search only (uncheck Display)
  Location:         Israel
  Language:         Hebrew, English
  Budget:           $13/day
  Bidding:          Maximize Conversions
  Start date:       When simulation mode is OFF

Ad Group 1: "IL - Investment Keywords"
  Match type: Phrase match for all

  Keywords:
    "השקעת נדלן בחול"
    "וילה בפיליפינים"
    "השקעה בפנגלאו"
    "נדלן בוהול"
    "וילה השקעה אסיה"
    "תשואה על נדלן"
    "airbnb השקעה פיליפינים"
    "villa investment philippines"
    "panglao villa israel"
    "bohol real estate investment"

  Negative keywords:
    "rent" "rental" "hotel booking" "cheap" "free"

  Responsive Search Ad:
    Headlines (15):
      1. וילה השקעה בבוהול - 1.53M ₪
      2. 395,000 פזו בחודש מ-Airbnb
      3. ROI 17-25% שנתי מאומת
      4. 2 וילות נותרו בפנגלאו
      5. ליווי ישראלי מלא
      6. 60 שניות מהחוף
      7. ליד JW Marriott
      8. 263.78 מ"ר, 4 חדרים
      9. בריכה פרטית + ג'קוזי גג
      10. בדיקת השקעה חינם
      11. 3 מסלולים משפטיים
      12. Deed of Assignment
      13. Blue Everest Asset Group
      14. מימון BDO זמין
      15. WhatsApp: +639542555553

    Descriptions (4):
      1. 2 וילות בלבד בבוהול בין מלונות 5 כוכבים. הנכס יושב 60 שניות מחוף. מימון זמין. דיווח השקעה חינם.
      2. 1,535,000 ש"ח לוילה עם בריכה פרטית, ג'קוזי על הגג, 4 חדרים. הכנסה חודשית PHP 395,000 מ-Airbnb.
      3. ליווי ישראלי מהשקל הראשון עד מסירת מפתח. Deed of Assignment, Leasehold 25+25, תאגיד מקומי.
      4. תיירות בוהול עלתה 166% מאז 2022. JW Marriott בבנייה. נמל תעופה מתרחב ל-4M נוסעים.

  Sitelinks:
    - "מפרט הוילות" → primevilla.ph/panglao-prime-villas/villas
    - "פרטי השקעה" → primevilla.ph/panglao-prime-villas/investment
    - "בעלות משפטית" → primevilla.ph/panglao-prime-villas/ownership
    - "קבע פגישה" → primevilla.ph/panglao-prime-villas/book

════════════════════════════════════════════════════════════
CAMPAIGN 2: PPV - Philippines Search
════════════════════════════════════════════════════════════

Settings:
  Campaign type:    Search
  Networks:         Google Search only
  Location:         Philippines (Manila, Cebu, Davao)
  Language:         English
  Budget:           $9/day
  Bidding:          Maximize Conversions

Ad Group 1: "PH - Buyer Intent"
  Keywords (phrase match):
    "buy villa bohol"
    "villa for sale panglao"
    "property for sale bohol"
    "luxury villa philippines"
    "beachfront villa panglao"
    "house and lot bohol"
    "panglao property for sale"

Ad Group 2: "PH - Investment Intent"
  Keywords (phrase match):
    "property investment philippines ROI"
    "airbnb investment philippines"
    "villa rental income"
    "real estate investment bohol"
    "passive income property philippines"

  Responsive Search Ad:
    Headlines (15):
      1. Panglao Prime Villas - PHP 32.5M
      2. PHP 395K Monthly Income
      3. 17-25% Annual ROI
      4. Only 2 Units Left
      5. BDO Bank Financing Available
      6. 60 Seconds to Beach
      7. Next to JW Marriott
      8. 4BR Luxury Villa
      9. Private Pool + Rooftop Jacuzzi
      10. 263.78 sqm Floor Area
      11. Reserve with PHP 200,000
      12. Verified Airbnb Income
      13. Free Investment Report
      14. Schedule Site Visit
      15. Blue Everest Asset Group

    Descriptions (4):
      1. Luxury 4-bedroom villa in Bohol between JW Marriott and Mithi Resort. 60 seconds to beach. PHP 395,000/month verified income.
      2. BDO financing available. 25% down, 55% over 24 months, 20% on turnover. Reserve today with PHP 200,000.
      3. 263.78 sqm, private pool, rooftop jacuzzi, Japanese spa bathroom. Only 2 villas remaining at this price.
      4. Bohol tourism grew 166% since 2022. 1.43M visitors in 2025. Your villa generates income while you sleep.

  Sitelinks:
    - "Villa Specs" → primevilla.ph/panglao-prime-villas/villas
    - "Investment Details" → primevilla.ph/panglao-prime-villas/investment
    - "Ownership Guide" → primevilla.ph/panglao-prime-villas/ownership
    - "Book Site Visit" → primevilla.ph/panglao-prime-villas/book

════════════════════════════════════════════════════════════
CAMPAIGN 3: PPV - Korea Search
════════════════════════════════════════════════════════════

Settings:
  Campaign type:    Search
  Networks:         Google Search only
  Location:         South Korea
  Language:         Korean, English
  Budget:           $10/day
  Bidding:          Maximize Conversions

Ad Group 1: "KR - Investment Keywords"
  Keywords (phrase match):
    "보홀 부동산"
    "팡라오 빌라"
    "필리핀 부동산 투자"
    "panglao villa investment"
    "bohol real estate korea"
    "필리핀 빌라 매매"
    "에어비앤비 투자 필리핀"

  Responsive Search Ad:
    Headlines (15):
      1. 팡라오 프라임 빌라 - $528K
      2. 월 395,000 페소 수익
      3. 연간 ROI 17-25%
      4. 강남 절반 가격, 10배 수익
      5. 진에어/제주항공 직항
      6. 해변 60초 거리
      7. JW 매리어트 옆
      8. 4BR 럭셔리 빌라
      9. 프라이빗 풀 + 자쿠지
      10. 2채만 남았습니다
      11. 보홀 한국인 42%
      12. Blue Everest Asset Group
      13. 무료 투자 보고서
      14. WhatsApp 상담
      15. 263.78㎡ 풀빌라

    Descriptions (4):
      1. 보홀 외국인 관광객 42%가 한국인. 팡라오 4BR 풀빌라 ~KRW 7억. 월 395,000 페소 에어비앤비 수익.
      2. 진에어, 제주항공, 에어부산 직항 4시간. JW 매리어트 옆, 해변 60초. 프로 관리 서비스.
      3. 강남 1BR 15억 vs 팡라오 4BR 풀빌라 7억. 절반 가격에 10배 수익률. 지금 상담하세요.
      4. 프라이빗 풀, 루프탑 자쿠지, 일본식 스파 욕실. 263.78㎡. 전문 에어비앤비 관리.

════════════════════════════════════════════════════════════
AFTER CREATING ALL CAMPAIGNS:
════════════════════════════════════════════════════════════

1. Set all campaigns to PAUSED initially
2. Install Google Ads conversion tracking on primevilla.ph (tag: AW-18095957436)
3. Enable ALL campaigns once simulation mode is OFF
4. Monitor for first 3 days:
   - Kill: CPM > $18 or CTR < 0.8%
   - Scale: CTR > 3% or CPL < $30 → double budget
5. Add negative keywords as search term report comes in
`);