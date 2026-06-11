/**
 * Google Apps Script — Web App for Landing Page Form Submissions
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets: https://docs.google.com/spreadsheets/d/1oVnbkLNM_DgOAd7EZQVxxaPD0TwNGqqsD7Ezmp0bXSo
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire code
 * 4. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL
 * 6. Paste it into the 3 Hebrew landing pages (replace GOOGLE_APPS_SCRIPT_URL)
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('1oVnbkLNM_DgOAd7EZQVxxaPD0TwNGqqsD7Ezmp0bXSo').getActiveSheet();

    var data = JSON.parse(e.postData.contents);

    var row = [
      data.name || '',           // Full Name
      data.phone || '',          // Phone
      data.email || '',          // Email
      data.country || 'Israel',  // Country (default: Israel for Hebrew pages)
      data.budget || '',         // Purpose / Budget
      'Panglao Prime Villas',    // Villa
      '',                        // Visit Date
      data.notes || '',          // Message
      new Date().toLocaleString('en-US', {timeZone: 'Asia/Manila'}), // Timestamp (PHT)
      'landing_page'             // Source (instead of captcha score)
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok', message: 'Panglao Prime Villas Lead Capture Active'}))
    .setMimeType(ContentService.MimeType.JSON);
}
