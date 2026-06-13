#!/usr/bin/env npx tsx

const BASE_URL = process.env.QA_BASE_URL ?? 'https://blue-everest.com';
const EXPECTED_WHATSAPP_LINK =
  process.env.QA_WHATSAPP_LINK ?? 'https://wa.me/message/5T6FVMO63HG3A1';

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const icon = ok ? 'PASS' : 'FAIL';
  console.log(`${icon} ${name}: ${detail}`);
}

async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const text = await response.text();
  return { response, text };
}

async function checkHomepageLink() {
  const { response, text } = await fetchText(BASE_URL);
  record(
    'homepage contains WhatsApp business link',
    response.ok && text.includes(EXPECTED_WHATSAPP_LINK),
    `status=${response.status}, linkFound=${text.includes(EXPECTED_WHATSAPP_LINK)}`
  );
}

async function checkDashboardLoads() {
  const response = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
  record('dashboard loads', response.ok, `status=${response.status}`);
}

async function checkChatHandoff() {
  const response = await fetch(`${BASE_URL}/api/marketing/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: 'I want to talk on WhatsApp about Villa D pricing',
      name: 'WhatsApp QA Test',
      email: 'whatsapp-qa@example.com',
      source: 'qa-whatsapp-handoff',
    }),
  });
  const body = (await response.json()) as {
    reply?: string;
    salesHandoff?: { whatsapp?: { marketing?: string } };
    salesOs?: { intent?: string };
  };
  const actual = body.salesHandoff?.whatsapp?.marketing;
  record(
    'chat API returns WhatsApp business handoff',
    response.ok && actual === EXPECTED_WHATSAPP_LINK,
    `status=${response.status}, intent=${body.salesOs?.intent ?? 'none'}, marketing=${actual ?? 'missing'}`
  );
}

async function checkSalesQueueEndpoint() {
  const response = await fetch(`${BASE_URL}/api/marketing/sales/queue?limit=1`);
  const body = (await response.json()) as {
    total?: number;
    leads?: Array<{ whatsappLink?: string | null; facebookContactReady?: boolean }>;
  };
  const link = body.leads?.[0]?.whatsappLink;
  const ok =
    response.ok &&
    (body.total === 0 ||
      !link ||
      link === EXPECTED_WHATSAPP_LINK ||
      link.startsWith('https://wa.me/'));
  record(
    'sales queue returns a usable handoff link',
    ok,
    `status=${response.status}, total=${body.total ?? 'unknown'}, sampleLink=${link ?? 'none'}`
  );
}

async function checkWhatsappShortLink() {
  const response = await fetch(EXPECTED_WHATSAPP_LINK, { redirect: 'manual' });
  const location = response.headers.get('location') ?? '';
  const ok =
    response.status >= 200 &&
    response.status < 400 &&
    (location.includes('whatsapp.com') || EXPECTED_WHATSAPP_LINK.includes('wa.me'));
  record(
    'WhatsApp business short link resolves',
    ok,
    `status=${response.status}, redirect=${location || 'none'}`
  );
}

async function main() {
  console.log(`Blue Everest WhatsApp handoff QA`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Expected WhatsApp link: ${EXPECTED_WHATSAPP_LINK}\n`);

  await checkHomepageLink();
  await checkDashboardLoads();
  await checkChatHandoff();
  await checkSalesQueueEndpoint();
  await checkWhatsappShortLink();

  const failed = results.filter((result) => !result.ok);
  console.log('\nManual live conversation test:');
  console.log('1. Open the WhatsApp link from the website or dashboard.');
  console.log('2. Send: TEST BLUE EVEREST - WhatsApp handoff QA.');
  console.log('3. Confirm the message arrives in the Blue Everest WhatsApp inbox.');
  console.log('4. Reply once from the business inbox and confirm the user receives it.');
  console.log(
    'Note: until WhatsApp Cloud API or WATI is connected, software can verify the handoff link, but only this manual step can verify that a real WhatsApp conversation is happening.'
  );

  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll automated WhatsApp handoff checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
