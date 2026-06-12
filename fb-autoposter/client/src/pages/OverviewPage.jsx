import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { overview } from '../api';
import AppHeader from '../components/AppHeader';

const MARKET_STYLES = {
  filipino: { label: 'Philippines', badge: 'PH', bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  international: { label: 'International', badge: 'INT', bar: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700' },
  israeli: { label: 'Israel', badge: 'IL', bar: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700' },
  jewish_diaspora: { label: 'Jewish Diaspora', badge: 'JD', bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  unknown: { label: 'Unknown', badge: '?', bar: 'bg-zinc-400', bg: 'bg-zinc-50', text: 'text-zinc-600' },
};

function marketStyle(market) {
  return MARKET_STYLES[market] || MARKET_STYLES.unknown;
}

function n(value) {
  return Number(value || 0).toLocaleString('en-US');
}

function shortDate(value) {
  if (!value) return 'No activity';
  return new Date(value).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' });
}

function shortTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await overview.get();
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const maxRemaining = useMemo(() => {
    if (!data?.marketOpportunity?.length) return 1;
    return Math.max(...data.marketOpportunity.map((m) => Number(m.remaining || 0)), 1);
  }, [data]);

  return (
    <div className="min-h-screen bg-brand-50" dir="rtl">
      <AppHeader
        title="לוח מחוונים"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/campaigns')}
              className="border border-brand-200 text-brand-600 hover:bg-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              הקמפיינים שלי
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? 'טוען...' : 'רענן'}
            </button>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading && !data ? (
          <div className="flex justify-center py-24">
            <span className="w-9 h-9 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-semibold mb-2">לא ניתן לטעון את הדשבורד</p>
            <p className="text-brand-400 text-sm">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide">AutoPost Command Center</p>
                <h1 className="font-display text-3xl text-brand-900 mt-1">לוח מחוונים והמלצות קמפיינים</h1>
                <p className="text-sm text-brand-400 mt-2">
                  עודכן {new Date(data.generatedAt).toLocaleString('he-IL')} · הסוכן השיווקי מנתח קבוצות, קמפיינים ותקלות בזמן אמת.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/reports')} className="rounded-lg border border-brand-200 px-4 py-2 text-sm text-brand-600 hover:bg-white">דוח יומי</button>
                <button onClick={() => navigate('/groups-library')} className="rounded-lg border border-brand-200 px-4 py-2 text-sm text-brand-600 hover:bg-white">ספריית קבוצות</button>
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <Kpi label="קמפיינים" value={data.totals.campaigns} sub={`${data.totals.activeCampaigns} פעילים`} />
              <Kpi label="קבוצות" value={data.totals.groups} sub="במאגר" />
              <Kpi label="פוסטים" value={data.totals.posts} sub="תבניות פעילות" />
              <Kpi label="פורסם" value={data.totals.success} sub={`${data.totals.successRate}% הצלחה`} tone="green" />
              <Kpi label="נכשל" value={data.totals.failed} sub="דורש ניקוי" tone="red" />
              <Kpi label="7 ימים" value={data.totals.sevenDaySuccess} sub={`${data.totals.sevenDayFailed} כשלים`} tone="blue" />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
              <Panel title="Marketing Agent" subtitle={`${data.agent.name} · confidence ${data.agent.confidence}%`}>
                <div className="space-y-4">
                  <div className="rounded-xl bg-brand-900 text-white p-4">
                    <p className="text-xs text-white/60 mb-1">Mission</p>
                    <p className="text-sm leading-6">{data.agent.mission}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {data.agent.recommendations.slice(0, 4).map((r, idx) => (
                      <div key={idx} className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {r.priority}
                          </span>
                          <span className="text-xs text-brand-300">#{idx + 1}</span>
                        </div>
                        <h3 className="font-semibold text-brand-800 text-sm mb-2">{r.title}</h3>
                        <p className="text-xs text-brand-500 leading-5 mb-2">{r.why}</p>
                        <p className="text-xs font-medium text-brand-700 leading-5">{r.action}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-4 gap-2">
                    {data.agent.collaboration.map((item) => (
                      <div key={item.agent} className="rounded-lg border border-brand-100 p-3">
                        <p className="text-xs font-semibold text-brand-700">{item.agent}</p>
                        <p className="text-[11px] leading-4 text-brand-400 mt-1">{item.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="פילוח מדינות ושווקים" subtitle="הזדמנות שנותרה מול ביצועים בפועל">
                <div className="space-y-4">
                  {data.marketOpportunity.map((m) => {
                    const style = marketStyle(m.market);
                    const width = Math.max(5, Math.round((Number(m.remaining || 0) / maxRemaining) * 100));
                    const perf = data.marketPerformance.find((p) => p.market === m.market);
                    return (
                      <div key={m.market} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.badge}</span>
                            <span className="text-sm font-semibold text-brand-800">{style.label}</span>
                          </div>
                          <span className="text-xs text-brand-400">{n(m.remaining)} נותרו · {perf?.successRate || 0}% הצלחה</span>
                        </div>
                        <div className="h-3 rounded-full bg-brand-100 overflow-hidden">
                          <div className={`h-full ${style.bar}`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel title="דירוג הקבוצות הטובות ביותר" subtitle="קבוצות שכבר הוכיחו הצלחה">
                <div className="space-y-2">
                  {data.topGroups.slice(0, 8).map((g, idx) => (
                    <GroupRow key={g.id} group={g} index={idx} metric={`${g.success}/${g.attempts}`} />
                  ))}
                </div>
              </Panel>

              <Panel title="איפה כדאי לפרסם עכשיו" subtitle="קבוצות איכות שעדיין לא נוסו">
                <div className="space-y-2">
                  {data.recommendedGroups.slice(0, 8).map((g, idx) => (
                    <GroupRow key={g.id} group={g} index={idx} metric={`score ${g.publishing_score || 0}`} muted />
                  ))}
                </div>
              </Panel>

              <Panel title="תגובות, הודעות ומקורות" subtitle="מה קיים ומה חסר במדידה">
                <div className="space-y-3">
                  {data.sources.map((s) => (
                    <div key={s.source} className="rounded-xl border border-brand-100 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-brand-800">{s.source}</p>
                        <span className="text-xs text-brand-400">{s.pending ? `${s.pending} pending` : 'tracked'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <MiniStat label="חיובי" value={s.success} />
                        <MiniStat label="כשלים" value={s.failed} />
                      </div>
                      <p className="text-[11px] text-brand-400 leading-4 mt-2">{s.note}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
              <Panel title="כשלים שחוזרים על עצמם" subtitle="הסוכן משתמש בזה כדי להוריד דירוג קבוצות בעייתיות">
                <div className="space-y-2">
                  {data.errorSignals.map((e, idx) => (
                    <div key={`${e.step}-${e.label}`} className="flex items-center gap-3 rounded-xl bg-red-50/60 border border-red-100 px-3 py-2">
                      <span className="text-xs font-bold text-red-500 w-6">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-brand-800 truncate">{e.label}</p>
                        <p className="text-[11px] text-brand-400">{e.step}</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">{n(e.count)}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="כל הקמפיינים שלי" subtitle="סטטוס, תכולה וביצועים">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-brand-400 border-b border-brand-100">
                        <th className="py-2 text-right font-medium">קמפיין</th>
                        <th className="py-2 text-right font-medium">שוק</th>
                        <th className="py-2 text-right font-medium">פוסטים</th>
                        <th className="py-2 text-right font-medium">הצלחה</th>
                        <th className="py-2 text-right font-medium">סטטוס</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campaigns.map((c) => (
                        <tr key={c.id} className="border-b border-brand-50 hover:bg-brand-50 cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                          <td className="py-3 pr-2 font-semibold text-brand-800">{c.name}</td>
                          <td className="py-3 text-brand-500">{marketStyle(c.market).badge}</td>
                          <td className="py-3 text-brand-500">{n(c.posts)}</td>
                          <td className="py-3 text-brand-500">{n(c.success)} / {n(c.attempts)}</td>
                          <td className="py-3">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-400'}`}>
                              {c.is_active ? 'פעיל' : 'כבוי'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </section>

            <Panel title="פעילות אחרונה" subtitle="מה קרה בפרסום בפועל">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2">
                {data.recentActivity.map((a, idx) => {
                  const style = marketStyle(a.market);
                  return (
                    <div key={`${a.posted_at}-${idx}`} className="rounded-xl border border-brand-100 p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.badge}</span>
                        <span className={`text-xs font-bold ${a.status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{a.status}</span>
                      </div>
                      <p className="text-sm font-semibold text-brand-800 truncate">{a.group_name}</p>
                      <p className="text-xs text-brand-400 truncate mt-1">{a.post_name}</p>
                      <p className="text-[11px] text-brand-300 mt-2">{shortDate(a.posted_at)} · {shortTime(a.posted_at)}</p>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Kpi({ label, value, sub, tone = 'default' }) {
  const toneClass = {
    default: 'border-brand-100 bg-white text-brand-800',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    blue: 'border-sky-100 bg-sky-50 text-sky-700',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{n(value)}</p>
      <p className="text-[11px] opacity-60 mt-1">{sub}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-xl border border-brand-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-brand-800">{title}</h2>
        {subtitle && <p className="text-xs text-brand-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function GroupRow({ group, index, metric, muted = false }) {
  const style = marketStyle(group.market);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-100 px-3 py-2 hover:bg-brand-50">
      <span className={`w-6 text-xs font-bold ${muted ? 'text-brand-300' : 'text-brand-600'}`}>{index + 1}</span>
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.badge}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-800 truncate">{group.name}</p>
        <p className="text-[11px] text-brand-400">{group.members_count || 'unknown size'} · {shortDate(group.lastActivity)}</p>
      </div>
      <span className="text-xs font-bold text-brand-600 whitespace-nowrap">{metric}</span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-brand-50 px-3 py-2">
      <p className="text-[11px] text-brand-400">{label}</p>
      <p className="text-sm font-bold text-brand-800">{n(value)}</p>
    </div>
  );
}
