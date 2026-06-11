// src/lib/connectors/wati.ts
// WATI WhatsApp Business API connector for Blue Everest marketing platform.
// Handles template messages, text messages, contacts, flows, and broadcasts.

const WATI_BASE_URL = 'https://live-mt-server.wati.io/api/v2';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WatiMessage {
  id: string;
  text: string;
  type: string;
  timestamp: string;
  owner: boolean;
}

export interface WatiTemplateParam {
  name: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class WatiConnector {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WATI_API_KEY || '';
  }

  // ---- Messages ----

  async sendTemplateMessage(
    phone: string,
    templateName: string,
    params?: WatiTemplateParam[]
  ): Promise<{ result: boolean }> {
    const normalizedPhone = this.normalizePhone(phone);
    const body: Record<string, unknown> = {
      template_name: templateName,
      broadcast_name: `template_${templateName}_${Date.now()}`,
    };
    if (params && params.length > 0) {
      body.parameters = params.map((p) => ({
        name: p.name,
        value: p.value,
      }));
    }

    const result = (await this.apiCall(
      `/sendTemplateMessage?whatsappNumber=${normalizedPhone}`,
      'POST',
      body
    )) as { result: boolean };
    return { result: result.result ?? true };
  }

  async sendTextMessage(
    phone: string,
    message: string
  ): Promise<{ result: boolean }> {
    const normalizedPhone = this.normalizePhone(phone);
    // WATI only allows session messages (within 24h of last customer message)
    // for free-form text. If the window is closed, this will fail and a
    // template message should be used instead.
    const result = (await this.apiCall(
      `/sendSessionMessage/${normalizedPhone}`,
      'POST',
      { messageText: message }
    )) as { result: boolean };
    return { result: result.result ?? true };
  }

  // ---- Contacts ----

  async getContactMessages(phone: string): Promise<WatiMessage[]> {
    const normalizedPhone = this.normalizePhone(phone);
    const result = (await this.apiCall(
      `/getMessages/${normalizedPhone}`,
      'GET'
    )) as {
      messages?: {
        items?: Array<{
          id: string;
          text: string;
          type: string;
          created: string;
          owner: boolean;
        }>;
      };
    };

    if (!result.messages?.items) {
      return [];
    }

    return result.messages.items.map((msg) => ({
      id: msg.id,
      text: msg.text,
      type: msg.type,
      timestamp: msg.created,
      owner: msg.owner,
    }));
  }

  // ---- Flows ----

  async triggerFlow(phone: string, flowId: string): Promise<void> {
    const normalizedPhone = this.normalizePhone(phone);
    await this.apiCall(
      `/assignFlow`,
      'POST',
      {
        whatsappNumber: normalizedPhone,
        flowId,
      }
    );
    console.log(
      `[wati] Triggered flow ${flowId} for phone ${normalizedPhone}`
    );
  }

  // ---- Broadcast ----

  async sendBroadcast(
    templateName: string,
    phones: string[],
    params?: Record<string, string>
  ): Promise<{ result: boolean }> {
    const receivers = phones.map((phone) => {
      const entry: Record<string, string> = {
        whatsappNumber: this.normalizePhone(phone),
      };
      // Attach template parameters as custom fields
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          entry[key] = value;
        }
      }
      return entry;
    });

    const body = {
      template_name: templateName,
      broadcast_name: `broadcast_${templateName}_${Date.now()}`,
      receivers,
    };

    const result = (await this.apiCall(
      '/sendTemplateMessages',
      'POST',
      body
    )) as { result: boolean };
    return { result: result.result ?? true };
  }

  // ---- Private helpers ----

  /**
   * Normalize phone number to digits only, removing leading + and spaces.
   * WATI expects phone numbers without the leading +.
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  private async apiCall(
    endpoint: string,
    method: string,
    body?: unknown
  ): Promise<unknown> {
    if (!this.apiKey) {
      throw new Error(
        '[wati] WATI_API_KEY is not set. Cannot make API calls.'
      );
    }

    const url = `${WATI_BASE_URL}${endpoint}`;
    const fetchOptions: RequestInit = {
      method,
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[wati] API error ${response.status} on ${method} ${endpoint}: ${errorBody}`
      );
    }

    // Some WATI endpoints return empty bodies on success
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { result: true };
    }

    return response.json();
  }
}

export const wati = new WatiConnector();
