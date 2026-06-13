// src/lib/connectors/portal-scripts/fazwaz.ts
// FazWaz Philippines Playwright automation script.

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

export const fazwazScript: PortalScript = {
  portalSlug: 'fazwaz-ph',
  loginUrl: 'https://www.fazwaz.com.ph/login',
  displayName: 'FazWaz Philippines',

  async login(page: Page): Promise<LoginResult> {
    try {
      await page.goto(this.loginUrl, { waitUntil: 'networkidle' });
      const email = process.env.FAZWAZ_EMAIL;
      const password = process.env.FAZWAZ_PASSWORD;
      if (!email || !password) {
        return { success: false, error: 'FAZWAZ_EMAIL or FAZWAZ_PASSWORD not set' };
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
      await page.goto('https://www.fazwaz.com.ph/listing/create', { waitUntil: 'networkidle' });

      // Select property type
      await page.selectOption('select[name="type"]', property.propertyType);

      // Fill basic fields
      await page.fill('input[name="title"]', property.title);
      await page.fill('textarea[name="description"]', property.description);
      await page.fill('input[name="price"]', property.price.toString());
      await page.fill('input[name="bedrooms"]', property.bedrooms.toString());
      await page.fill('input[name="bathrooms"]', property.bathrooms.toString());
      await page.fill('input[name="indoor_area"]', property.floorArea.toString());
      if (property.lotArea) {
        await page.fill('input[name="outdoor_area"]', property.lotArea.toString());
      }

      // Location
      await page.fill('input[name="location"]', `${property.city}, ${property.province ?? 'Bohol'}`);

      // Upload images
      if (property.imagePaths.length > 0) {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.setInputFiles(property.imagePaths.slice(0, 20));
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Form fill failed' };
    }
  },

  async submit(page: Page): Promise<SubmitResult> {
    try {
      await page.click('button[type="submit"], button:has-text("Publish")');
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      const url = page.url();
      const listingId = url.split('/').pop() ?? undefined;

      return { success: true, listingId, listingUrl: url };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Submit failed' };
    }
  },

  async checkStatus(_page: Page, _listingId: string): Promise<StatusResult> {
    return { status: 'unknown', error: 'Status check not yet implemented for FazWaz' };
  },

  async refreshListing(_page: Page, _listingId: string): Promise<RefreshResult> {
    return { success: false, error: 'Refresh not yet implemented for FazWaz' };
  },
};
