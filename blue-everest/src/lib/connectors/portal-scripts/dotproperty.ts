// src/lib/connectors/portal-scripts/dotproperty.ts
// Dot Property Philippines Playwright automation script.

import type {
  PortalScript,
  Page,
  PortalPropertyInput,
  LoginResult,
  FillResult,
  SubmitResult,
  StatusResult,
  RefreshResult,
} from './types';

export const dotpropertyScript: PortalScript = {
  portalSlug: 'dotproperty-ph',
  loginUrl: 'https://www.dotproperty.com.ph/en/login',
  displayName: 'Dot Property Philippines',

  async login(page: Page): Promise<LoginResult> {
    try {
      await page.goto(this.loginUrl, { waitUntil: 'networkidle' });
      const email = process.env.DOTPROPERTY_EMAIL;
      const password = process.env.DOTPROPERTY_PASSWORD;
      if (!email || !password) {
        return { success: false, error: 'DOTPROPERTY_EMAIL or DOTPROPERTY_PASSWORD not set' };
      }
      await page.fill('input[name="email"], input[type="email"]', email);
      await page.fill('input[name="password"], input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  },

  async fillForm(page: Page, property: PortalPropertyInput): Promise<FillResult> {
    try {
      await page.goto('https://www.dotproperty.com.ph/en/post-listing', { waitUntil: 'networkidle' });

      // Fill listing form
      await page.fill('input[name="title"]', property.title);
      await page.fill('textarea[name="description"]', property.description);
      await page.fill('input[name="price"]', property.price.toString());
      await page.selectOption('select[name="property_type"]', property.propertyType);
      await page.fill('input[name="bedrooms"]', property.bedrooms.toString());
      await page.fill('input[name="bathrooms"]', property.bathrooms.toString());
      await page.fill('input[name="floor_size"]', property.floorArea.toString());

      // Location
      await page.fill('input[name="location"]', `${property.city}, ${property.province ?? 'Bohol'}`);

      // Images
      if (property.imagePaths.length > 0) {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.setInputFiles(property.imagePaths.slice(0, 20));
        }
      }

      // Contact
      await page.fill('input[name="contact_name"]', property.contactName);
      await page.fill('input[name="contact_phone"]', property.contactPhone);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Form fill failed' };
    }
  },

  async submit(page: Page): Promise<SubmitResult> {
    try {
      await page.click('button[type="submit"], button:has-text("Post"), button:has-text("Publish")');
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      const url = page.url();
      return { success: true, listingUrl: url };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Submit failed' };
    }
  },

  async checkStatus(_page: Page, _listingId: string): Promise<StatusResult> {
    return { status: 'unknown', error: 'Status check not yet implemented' };
  },

  async refreshListing(_page: Page, _listingId: string): Promise<RefreshResult> {
    return { success: false, error: 'Refresh not yet implemented' };
  },
};
