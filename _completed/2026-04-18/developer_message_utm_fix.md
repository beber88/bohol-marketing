# Quick Fix - UTM Columns in Google Sheet

Hi,

The hidden UTM fields are working in the form HTML - great job. But they're not being sent to the Google Sheet yet.

Please add 4 new columns to the Google Sheet (after "Captcha Score"):
- utm_source
- utm_medium
- utm_campaign
- utm_content

And update the form submission script (Apps Script / form handler) to pass these values from the hidden fields into the new columns.

Quick test after done: open primevilla.ph?utm_source=test&utm_medium=cpc&utm_campaign=test123 and submit a test inquiry. The UTM values should appear in the new columns.

Thanks!
