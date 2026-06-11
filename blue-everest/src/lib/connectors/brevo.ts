// src/lib/connectors/brevo.ts
// Brevo (Sendinblue) email connector for Blue Everest marketing platform.
// Handles contacts, transactional email, automation triggers, and campaign stats.

const BREVO_BASE_URL = 'https://api.brevo.com/v3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BrevoStats {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
}

export interface SendTransactionalParams {
  to: string;
  templateId: number;
  params?: Record<string, string>;
  subject?: string;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class BrevoConnector {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
  }

  // ---- Contacts ----

  async createContact(
    email: string,
    attributes: Record<string, unknown>,
    listIds?: number[]
  ): Promise<{ id: number }> {
    const body: Record<string, unknown> = {
      email,
      attributes,
      updateEnabled: false,
    };
    if (listIds && listIds.length > 0) {
      body.listIds = listIds;
    }

    const result = (await this.apiCall('/contacts', 'POST', body)) as {
      id: number;
    };
    return { id: result.id };
  }

  async updateContact(
    email: string,
    attributes: Record<string, unknown>
  ): Promise<void> {
    await this.apiCall(`/contacts/${encodeURIComponent(email)}`, 'PUT', {
      attributes,
    });
  }

  // ---- Transactional Email ----

  async sendTransactional(
    params: SendTransactionalParams
  ): Promise<{ messageId: string }> {
    const body: Record<string, unknown> = {
      to: [{ email: params.to }],
      templateId: params.templateId,
    };
    if (params.params) {
      body.params = params.params;
    }
    if (params.subject) {
      body.subject = params.subject;
    }

    const result = (await this.apiCall(
      '/smtp/email',
      'POST',
      body
    )) as { messageId: string };
    return { messageId: result.messageId };
  }

  // ---- Automation ----

  async triggerAutomation(
    workflowId: number,
    email: string
  ): Promise<void> {
    // Brevo automation is triggered by injecting a contact into a workflow
    // via the automation/contacts endpoint or by updating a contact attribute
    // that the workflow listens on. The direct trigger endpoint:
    await this.apiCall(
      `/contacts/import`,
      'POST',
      {
        jsonBody: [
          {
            email,
            attributes: {
              AUTOMATION_TRIGGER: workflowId.toString(),
              AUTOMATION_TRIGGERED_AT: new Date().toISOString(),
            },
          },
        ],
        listIds: [],
        updateExistingContacts: true,
        emptyContactsAttributes: false,
      }
    );
    console.log(
      `[brevo] Triggered automation workflow ${workflowId} for ${email}`
    );
  }

  // ---- Campaign Stats ----

  async getCampaignStats(campaignId: number): Promise<BrevoStats> {
    const result = (await this.apiCall(
      `/emailCampaigns/${campaignId}`,
      'GET'
    )) as {
      statistics?: {
        globalStats?: {
          sent?: number;
          delivered?: number;
          uniqueOpens?: number;
          uniqueClicks?: number;
          hardBounces?: number;
          softBounces?: number;
          unsubscriptions?: number;
        };
      };
    };

    const stats = result.statistics?.globalStats;
    if (!stats) {
      return {
        sent: 0,
        delivered: 0,
        opens: 0,
        clicks: 0,
        bounces: 0,
        unsubscribes: 0,
      };
    }

    return {
      sent: stats.sent ?? 0,
      delivered: stats.delivered ?? 0,
      opens: stats.uniqueOpens ?? 0,
      clicks: stats.uniqueClicks ?? 0,
      bounces: (stats.hardBounces ?? 0) + (stats.softBounces ?? 0),
      unsubscribes: stats.unsubscriptions ?? 0,
    };
  }

  // ---- Private helper ----

  private async apiCall(
    endpoint: string,
    method: string,
    body?: unknown
  ): Promise<unknown> {
    if (!this.apiKey) {
      throw new Error(
        '[brevo] BREVO_API_KEY is not set. Cannot make API calls.'
      );
    }

    const url = `${BREVO_BASE_URL}${endpoint}`;
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // 204 No Content is a valid success response for PUT/DELETE
    if (response.status === 204) {
      return {};
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[brevo] API error ${response.status} on ${method} ${endpoint}: ${errorBody}`
      );
    }

    return response.json();
  }
}

export const brevo = new BrevoConnector();
