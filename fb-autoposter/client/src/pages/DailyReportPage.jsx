import { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { reports } from '../api';

const MARKET_COLORS = {
  filipino: { bg: '#dcfce7', text: '#16a34a', border: '#86efac', label: 'PH' },
  international: { bg: '#f3e8ff', text: '#9333ea', border: '#c4b5fd', label: 'INT' },
  israeli: { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd', label: 'IL' },
  jewish_diaspora: { bg: '#ffedd5', text: '#ea580c', border: '#fdba74', label: 'JD' },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export default function DailyReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  async function loadReport(d) {
    setLoading(true);
    try {
      const res = await reports.daily(d);
      setData(res.data);
    } catch (e) {
      console.error('Failed to load report:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReport(date); }, [date]);

  return (
    <div className="min-h-screen bg-brand-50" dir="rtl">
      <AppHeader
        title="דוח פרסום יומי"
        backTo="/campaigns"
        action={
          <button
            onClick={() => loadReport(date)}
            disabled={loading}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />טוען...</>
              : 'רענן'}
          </button>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Date picker */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {data?.activeDates?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {data.activeDates.slice(0, 7).map((d) => (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    d === date
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-brand-200 text-brand-500 hover:border-brand-400'
                  }`}
                >
                  {formatDate(d)}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <SummaryCard label="פורסם היום" value={data.today.success} color="green" />
              <SummaryCard label="נכשל היום" value={data.today.failed} color="red" />
              <SummaryCard label="סה״כ פורסם" value={data.allTime.success} color="blue" />
              <SummaryCard label="נותר לפרסום" value={data.allTime.remaining} color="gray" />
            </div>

            {/* Market breakdown */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 mb-6">
              <h3 className="font-semibold text-brand-800 text-sm mb-4">פילוח לפי שוק</h3>

              {/* Today by market */}
              {data.byMarket.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-brand-400 mb-2">היום ({formatDate(date)})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {data.byMarket.map((m) => {
                      const mc = MARKET_COLORS[m.market] || { bg: '#f5f5f5', text: '#666', border: '#ddd', label: m.market };
                      return (
                        <div key={m.market} className="rounded-xl px-3 py-2 border" style={{ backgroundColor: mc.bg, borderColor: mc.border }}>
                          <p className="text-xs font-bold" style={{ color: mc.text }}>{mc.label}</p>
                          <p className="text-lg font-bold" style={{ color: mc.text }}>{m.success}</p>
                          {m.failed > 0 && <p className="text-xs" style={{ color: mc.text, opacity: 0.7 }}>{m.failed} נכשל</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Remaining by market */}
              <p className="text-xs text-brand-400 mb-2">נותר לפרסום</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {data.remainingByMarket.map((m) => {
                  const mc = MARKET_COLORS[m.market] || { bg: '#f5f5f5', text: '#666', border: '#ddd', label: m.market };
                  const pct = m.total > 0 ? Math.round(((m.total - m.remaining) / m.total) * 100) : 0;
                  return (
                    <div key={m.market} className="rounded-xl px-3 py-2 border border-brand-100 bg-brand-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: mc.bg, color: mc.text }}>{mc.label}</span>
                        <span className="text-xs text-brand-400">{pct}%</span>
                      </div>
                      <p className="text-sm font-semibold text-brand-700">{m.remaining} <span className="text-xs font-normal text-brand-400">/ {m.total}</span></p>
                      <div className="w-full bg-brand-100 rounded-full h-1.5 mt-1">
                        <div className="h-1.5 rounded-full" style={{ width: pct + '%', backgroundColor: mc.text }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Post variety */}
            {data.postVariety.length > 0 && (
              <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 mb-6">
                <h3 className="font-semibold text-brand-800 text-sm mb-3">חלוקת תוכן היום</h3>
                <div className="space-y-2">
                  {data.postVariety.map((pv) => {
                    const maxCount = data.postVariety[0].count;
                    const pct = maxCount > 0 ? Math.round((pv.count / maxCount) * 100) : 0;
                    return (
                      <div key={pv.name} className="flex items-center gap-3">
                        <span className="text-xs text-brand-600 font-medium w-40 truncate flex-shrink-0">{pv.name}</span>
                        <div className="flex-1 bg-brand-50 rounded-full h-5 relative overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: pct + '%' }} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-700">{pv.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent activity - full list with links */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-brand-800 text-sm">רשימת פרסומים ({data.recentActivity.filter(a => a.status === 'success').length} מוצלחים מתוך {data.recentActivity.length})</h3>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-brand-300 py-8 text-center">אין פעילות ביום זה</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" dir="rtl">
                    <thead>
                      <tr className="border-b border-brand-100 text-xs text-brand-400">
                        <th className="py-2 px-2 text-right font-medium">#</th>
                        <th className="py-2 px-2 text-right font-medium">סטטוס</th>
                        <th className="py-2 px-2 text-right font-medium">שוק</th>
                        <th className="py-2 px-2 text-right font-medium">קבוצה</th>
                        <th className="py-2 px-2 text-right font-medium">פוסט</th>
                        <th className="py-2 px-2 text-right font-medium">שעה</th>
                        <th className="py-2 px-2 text-right font-medium">לינק</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentActivity.map((a, i) => {
                        const mc = MARKET_COLORS[a.market] || { bg: '#f5f5f5', text: '#666', label: '?' };
                        return (
                          <tr key={i} className="border-b border-brand-50 hover:bg-brand-50 transition-colors">
                            <td className="py-2 px-2 text-brand-400 text-xs">{data.recentActivity.length - i}</td>
                            <td className="py-2 px-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${a.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                            </td>
                            <td className="py-2 px-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: mc.bg, color: mc.text }}>{mc.label}</span>
                            </td>
                            <td className="py-2 px-2 max-w-[200px]">
                              <p className="text-brand-700 truncate text-xs">{a.group_name}</p>
                            </td>
                            <td className="py-2 px-2">
                              <p className="text-brand-500 text-xs truncate max-w-[140px]">{a.post_name}</p>
                            </td>
                            <td className="py-2 px-2 text-brand-400 text-xs whitespace-nowrap">{formatTime(a.posted_at)}</td>
                            <td className="py-2 px-2">
                              {a.status === 'success' && a.link ? (
                                <a href={a.link} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap">
                                  {a.post_url ? 'פוסט' : 'קבוצה'}
                                </a>
                              ) : a.status === 'error' ? (
                                <span className="text-xs text-red-400 truncate" title={a.error}>{(a.error || '').slice(0, 25)}</span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-brand-300 py-20">לא ניתן לטעון את הדוח</p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-brand-50 border-brand-200 text-brand-600',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
