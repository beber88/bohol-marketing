import { useState, useRef, useEffect } from "react";

const CAMPAIGN_CONTEXT = `
You are the Panglao Prime Villas AI Sales & Marketing Agent. You specialize in two campaigns: the Israeli investor campaign and the Philippines local buyer campaign.

PROJECT FACTS:
- Project: Panglao Prime Villas, Bohol Philippines
- Developer: Blue Everest Asset Group Holding Inc.
- Website: primevilla.ph | WhatsApp: +639542555553
- Available: Villa C (PHP 30M) and Villa D (PHP 28M) ONLY
- Sold: Villa A and Villa B
- Reservation: PHP 200,000
- Payment: 25% down / 55% x 24 months / 20% turnover
- Floor area: 263.78 sqm | 3 storeys + roof deck | 4 bedrooms all en-suite
- Private pool, rooftop jacuzzi, floor-ceiling glass, outdoor kitchen, full sea view
- Location: Between JW Marriott and Mithi Resort, 60 sec to beach, 8-12 min TAG Airport
- ROI: 17-25% gross annual | PHP 395,000/month avg | PHP 4.74M annual gross
- 5-year appreciation: +80.9% | 5-year ROI: 136.9%
- BDO Bank financing available

CAMPAIGN 1 - ISRAEL:
- Angle: "Blue Everest accompanies Israeli investors. We have sold to happy Israeli clients in previous projects."
- Core message: Proven track record with Israeli buyers + full Hebrew support + legal solutions for foreigners
- Currency angle: PHP 28M = approx ILS 1,364,892 (less than a Tel Aviv 3-bedroom apartment)
- Legal solutions for Israelis: (1) Deed of Assignment - most popular, full title to structure, simple and fast. (2) Leasehold 25+25 years - full control for 50 years, no corporation needed. (3) Domestic Corporation - 40% foreign ownership, maximum security.
- Blue Everest handles all legal work. Process can be completed 100% remotely from Israel.
- Language: Hebrew primary. Professional, warm, peer-to-peer tone.
- Targeting: Israel, age 35-60, business owners, property investors
- WhatsApp is primary CTA for Israeli market
- Best days: Sunday-Thursday. Best hours: 20:00-23:00 Israel time.

CAMPAIGN 2 - PHILIPPINES:
- Angle: Stop renting a villa in Bohol. Own one. BDO Bank financing available.
- Core message: Status + passive income + local pride. "Maging may-ari, hindi bisita."
- BDO Bank financing is the key differentiator for local buyers
- Offer site visit to Bohol in WhatsApp flows
- Language: English primary, Tagalog secondary
- Tone: aspirational, status-aware, community-oriented
- Targeting: Metro Manila (BGC, Makati, Alabang), Cebu. Age 35-58. Business owners, executives, OFW returnees.
- Facebook performs better than Instagram for this audience
- Best hours: Tuesday-Thursday, 7pm-11pm PHT

LEGAL OPTIONS FOR FOREIGN BUYERS:
1. Deed of Assignment (MOST POPULAR): Full legal title to villa structure. Land stays with Blue Everest. Simple, fast, low costs. Best for private investors.
2. Leasehold 25+25 years: Full control to live, rent, sell for 50 years. No corporation needed. Best for families.
3. Domestic Corporation: 40% foreign / 60% Filipino. Indirect land ownership. Maximum security. Best for multiple properties.
Blue Everest handles everything end-to-end. Remote closing possible.

OUTPUT RULES:
- Hebrew content: proper literary Hebrew, not slang
- Tagalog content: warm and community-oriented tone
- Always include a specific number in every piece of content
- Always mention legal solutions when targeting Israelis
- Always mention BDO financing when targeting Filipinos
- Always include WhatsApp CTA
- All outputs ready to paste into the relevant platform
`;

const QUICK_COMMANDS = [
  { campaign: "israel", label: "🇮🇱 מודעה פייסבוק - ישראלים", prompt: "כתוב מודעת פייסבוק בעברית לישראלים. השתמש בזווית שישראלים כבר השקיעו ו-Blue Everest מלווה אותם. כלול 3 גרסאות headline ו-primary text מלא. מוכן להדבקה ב-Ads Manager." },
  { campaign: "israel", label: "⚖️ פתרונות רכישה לישראלים", prompt: "כתוב הסבר מלא בעברית לישראלים על 3 אפשרויות הרכישה. מותאם לשליחה בוואטסאפ. מקצועי ומשכנע." },
  { campaign: "israel", label: "💬 WhatsApp Bot - עברית", prompt: "כתוב flow מלא לבוט הוואטסאפ בעברית לשוק הישראלי. כולל הודעת פתיחה, 5 אפשרויות תפריט, ותגובה לכל אחת. מוכן ל-WATI.io" },
  { campaign: "israel", label: "📧 Email ישראלי #1 - מיידי", prompt: "כתוב Email 1 מסדרת הנרצ'ר לישראלים בעברית. שולח מיידית אחרי הגשת טופס. 3 גרסאות נושא + גוף מלא. מוכן ל-Brevo." },
  { campaign: "israel", label: "📊 ROI Calculator - ישראלי", prompt: "Generate a detailed ROI calculation for Villa D (PHP 28M) for an Israeli investor. Show ILS equivalent, 5-year projection, and comparison vs Tel Aviv real estate. Format as a table." },
  { campaign: "israel", label: "🔴 Urgency Ad - Israeli Retarget", prompt: "Write an urgency retargeting ad in Hebrew for Israelis who visited primevilla.ph but did not convert. 3 primary text variations. Maximum urgency. WhatsApp CTA." },
  { campaign: "philippines", label: "🇵🇭 Facebook Ad - Filipino Buyers", prompt: "Write a Facebook ad in English with a Tagalog version targeting high-income Filipino buyers in Metro Manila. Status angle: stop renting a villa in Bohol, own one. Mention BDO financing. 3 headline variations." },
  { campaign: "philippines", label: "🏖️ Tagalog Reel Script", prompt: "Write a 15-second Reel script in Tagalog for the Philippines campaign. Status angle. First 3 seconds hook, full script, and caption. Ready to film." },
  { campaign: "philippines", label: "🏠 WhatsApp Flow - Philippines", prompt: "Write the complete WhatsApp bot flow for Filipino buyers in English. Include welcome message, 5 menu options with full responses. Emphasize BDO financing and site visit option." },
  { campaign: "philippines", label: "🔴 Urgency Ad - PH Hot Leads", prompt: "Write a retargeting urgency ad for Filipinos who visited primevilla.ph but did not convert. English and Tagalog versions. Mention BDO financing. Maximum urgency." },
  { campaign: "both", label: "📅 30-Day Plan - Both Campaigns", prompt: "Generate a day-by-day 30-day execution plan for both campaigns (Israel + Philippines). What to launch each day, budget allocation, optimization checkpoints. Practical calendar format." },
  { campaign: "both", label: "📞 Sales Call Script - Bilingual", prompt: "Write two sales call scripts: one for Israeli buyers (Hebrew) and one for Filipino buyers (English). 15 minutes each. Include opening, qualification, objection handling, and close." },
];

const STATS = [
  { label: "Available", value: "2 Only", sub: "C & D", color: "#ef4444" },
  { label: "Villa D", value: "PHP 28M", sub: "ILS 1.36M", color: "#c9a84c" },
  { label: "Villa C", value: "PHP 30M", sub: "PHP 30,000,000", color: "#c9a84c" },
  { label: "Monthly", value: "PHP 395K", sub: "verified avg", color: "#22c55e" },
  { label: "Annual", value: "PHP 4.74M", sub: "gross Airbnb", color: "#22c55e" },
  { label: "5-Year ROI", value: "136.9%", sub: "combined", color: "#60a5fa" },
];

export default function App() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `**Panglao Prime Villas - AI Marketing Agent**
**2 Campaigns Active: Israel + Philippines**

**Campaign Israel:**
"ישראלים משקיעים בפיליפינים - אנחנו מלווים אותם"
Track record with Israeli buyers. Full Hebrew support.
3 legal solutions. PHP 28M = ILS 1.36M.

**Campaign Philippines:**
"Stop renting a villa in Bohol. Own one."
BDO Bank financing available. Tagalog + English.
Status angle. Site visit offer.

Select a campaign filter above or ask me anything.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("chat");
  const [campaign, setCampaign] = useState("both");
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: CAMPAIGN_CONTEXT,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: msg }],
        }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.content?.[0]?.text || "Error." }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const fmt = (text) => text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontWeight: 700, color: "#c9a84c", marginTop: 6 }}>{line.slice(2,-2)}</div>;
    if (line.startsWith("- ")) return <div key={i} style={{ marginLeft: 10, color: "#94a3b8" }}>• {line.slice(2)}</div>;
    if (/^#+\s/.test(line)) return <div key={i} style={{ fontWeight: 700, color: "#e2e8f0", marginTop: 10 }}>{line.replace(/^#+\s/,"")}</div>;
    if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
    return <div key={i} style={{ color: "#94a3b8", lineHeight: 1.65 }}>{line}</div>;
  });

  const cmds = QUICK_COMMANDS.filter(c => campaign === "both" || c.campaign === campaign || c.campaign === "both");

  return (
    <div style={{ background: "#07101e", minHeight: "100vh", fontFamily: "system-ui,sans-serif", color: "white" }}>
      {/* Header */}
      <div style={{ background: "#0b1929", borderBottom: "1px solid #162840", padding: "13px 18px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#c9a84c", letterSpacing: 0.5 }}>PANGLAO PRIME VILLAS</div>
            <div style={{ fontSize: 11, color: "#334155" }}>AI Agent - Israel + Philippines Campaigns</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: "#450a0a", color: "#fca5a5", fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>2 UNITS LEFT</span>
            <span style={{ background: "#052e16", color: "#86efac", fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: "#0b1929", borderBottom: "1px solid #0f2040", padding: "9px 18px", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 8 }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ minWidth: 100, padding: "7px 11px", background: "#0f1e30", borderRadius: 7, border: `1px solid ${s.color}30`, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "#1e293b" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "13px 18px 0" }}>
        {/* Campaign Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>CAMPAIGN:</span>
          {[{k:"both",l:"All"},{k:"israel",l:"🇮🇱 Israel"},{k:"philippines",l:"🇵🇭 Philippines"}].map(c => (
            <button key={c.k} onClick={() => setCampaign(c.k)}
              style={{ padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                background: campaign === c.k ? "#c9a84c" : "#0f1e30",
                color: campaign === c.k ? "#07101e" : "#475569" }}>
              {c.l}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {["chat","quick"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12,
                background: tab === t ? "#c9a84c" : "#0f1e30",
                color: tab === t ? "#07101e" : "#475569" }}>
              {t === "chat" ? "AI Chat" : "Quick Commands"}
            </button>
          ))}
        </div>

        {tab === "quick" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {cmds.map((c,i) => (
              <button key={i} onClick={() => { setTab("chat"); send(c.prompt); }}
                style={{ padding: "10px 13px", background: "#0f1e30", border: "1px solid #162840", borderRadius: 8,
                  color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 12, lineHeight: 1.4 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#c9a84c"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#162840"}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {tab === "chat" && (
          <>
            <div style={{ height: 410, overflowY: "auto", background: "#0b1929", borderRadius: 10, border: "1px solid #162840", padding: 13, marginBottom: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 13, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 9, color: "#1e3a5f", marginBottom: 3, fontWeight: 700 }}>{m.role === "user" ? "YOU" : "AGENT"}</div>
                  <div style={{ maxWidth: "87%", padding: "10px 13px",
                    borderRadius: m.role === "user" ? "10px 10px 0 10px" : "10px 10px 10px 0",
                    background: m.role === "user" ? "#0f2040" : "#0f1e30",
                    border: m.role === "user" ? "1px solid #1e3a5f" : "1px solid #162840",
                    fontSize: 12.5, lineHeight: 1.65 }}>
                    {fmt(m.content)}
                  </div>
                  {m.role === "assistant" && (
                    <button onClick={() => navigator.clipboard.writeText(m.content)}
                      style={{ fontSize: 10, color: "#1e3a5f", background: "none", border: "none", cursor: "pointer", marginTop: 2, padding: "1px 5px" }}>
                      Copy
                    </button>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a84c", animation: `blink 1s ${i*0.2}s infinite` }} />)}
                  <span style={{ fontSize: 11, color: "#334155", marginLeft: 4 }}>Generating...</span>
                </div>
              )}
              <div ref={ref} />
            </div>

            <div style={{ display: "flex", gap: 7 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder={campaign === "israel" ? "שאל על קמפיין ישראל..." : campaign === "philippines" ? "Ask about Philippines campaign..." : "Ask about any campaign asset..."}
                style={{ flex: 1, padding: "10px 13px", background: "#0f1e30", border: "1px solid #162840", borderRadius: 8, color: "white", fontSize: 12.5, outline: "none" }} />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                style={{ padding: "10px 20px", background: !input.trim() || loading ? "#0f1e30" : "#c9a84c",
                  color: !input.trim() || loading ? "#1e3a5f" : "#07101e",
                  border: "none", borderRadius: 8, fontWeight: 700, cursor: !input.trim() || loading ? "not-allowed" : "pointer", fontSize: 12 }}>
                Generate
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#162840;border-radius:2px}input::placeholder{color:#1e3a5f}`}</style>
    </div>
  );
}
