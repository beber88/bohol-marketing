// src/lib/connectors/portal-scripts/types.ts
// Interface for Playwright-based portal automation scripts.
// Each portal without an API gets its own script implementing this interface.

/**
 * Portal script interface - each portal automation implements this.
 * Mirrors the fb-autoposter's posting flow pattern.
 */
export interface PortalScript {
  /** Unique slug matching the portal registry */
  portalSlug: string;

  /** Login URL for the portal dashboard */
  loginUrl: string;

  /** Portal display name */
  displayName: string;

  /**
   * Login to the portal using stored credentials.
   * Called only when session has expired.
   */
  login(page: Page): Promise<LoginResult>;

  /**
   * Fill the listing creation form with property data.
   * Does NOT submit - allows for review.
   */
  fillForm(page: Page, property: PortalPropertyInput): Promise<FillResult>;

  /**
   * Submit the filled form to create/update the listing.
   */
  submit(page: Page): Promise<SubmitResult>;

  /**
   * Check the status of an existing listing.
   */
  checkStatus(page: Page, listingId: string): Promise<StatusResult>;

  /**
   * Refresh/bump an existing listing to keep it active.
   */
  refreshListing(page: Page, listingId: string): Promise<RefreshResult>;
}

// Playwright Page type stub (actual type comes from playwright package)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Page = any;

export interface PortalPropertyInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  floorArea: number;
  lotArea?: number;
  propertyType: string;
  city: string;
  province?: string;
  address?: string;
  imagePaths: string[];
  amenities?: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface FillResult {
  success: boolean;
  error?: string;
  screenshotPath?: string;
}

export interface SubmitResult {
  success: boolean;
  listingId?: string;
  listingUrl?: string;
  error?: string;
  screenshotPath?: string;
}

export interface StatusResult {
  status: 'active' | 'expired' | 'rejected' | 'pending' | 'unknown';
  views?: number;
  inquiries?: number;
  expiresAt?: string;
  error?: string;
}

export interface RefreshResult {
  success: boolean;
  newExpiresAt?: string;
  error?: string;
}
