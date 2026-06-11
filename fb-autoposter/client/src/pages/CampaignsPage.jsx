import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaigns } from '../api';
import AppHeader from '../components/AppHeader';
import { useProfile } from '../context/ProfileContext';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { selectedProfileId } = useProfile();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newMarket, setNewMarket] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, [selectedProfileId]);

  async function load() {
    setLoading(true);
    try {
      const res = await campaigns.list(selectedProfileId);
      setList(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await campaigns.create({ name: newName.trim(), profileId: selectedProfileId, market: newMarket || null });
      setNewName('');
      setNewMarket('');
      setShowForm(false);
      navigate(`/campaigns/${res.data.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(campaign) {
    await campaigns.update(campaign.id, { is_active: !campaign.is_active });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('למחוק קמפיין זה?')) return;
    await campaigns.delete(id);
    load();
  }

  const activeCount = list.filter((c) => c.is_active).length;

  return (
    <div className="min-h-screen bg-brand-50">
      <AppHeader
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/groups-library')}
              className="flex items-center gap-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 hover:border-brand-400 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200 cursor-pointer font-body"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              ספריית קבוצות
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 cursor-pointer font-body"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              קמפיין חדש
            </button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-brand-800 tracking-wide">הקמפיינים שלי</h1>
          {list.length > 0 && (
            <p className="text-brand-400 text-sm font-body mt-1">
              {list.length} קמפיינים · {activeCount} פעילים
            </p>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6 mb-6">
            <h3 className="font-display text-base font-semibold text-brand-800 mb-4">קמפיין חדש</h3>
            <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
              <input
                autoFocus
                type="text"
                placeholder="שם הקמפיין..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 min-w-[200px] border border-brand-100 rounded-xl px-4 py-2.5 text-sm font-body text-brand-800 placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 bg-brand-50"
              />
              <select
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                className="border border-brand-100 rounded-xl px-3 py-2.5 text-sm font-body text-brand-600 bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">שוק (אופציונלי)</option>
                <option value="israeli">ישראלי</option>
                <option value="filipino">פיליפיני</option>
                <option value="international">בינלאומי</option>
                <option value="jewish_diaspora">תפוצות</option>
              </select>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors duration-200 cursor-pointer font-body"
              >
                {creating ? 'יוצר...' : 'צור'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-brand-100 text-brand-500 hover:bg-brand-50 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors duration-200 cursor-pointer font-body"
              >
                ביטול
              </button>
            </form>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="font-display text-lg text-brand-700 mb-1">אין קמפיינים עדיין</p>
            <p className="text-brand-400 text-sm font-body">לחץ על "קמפיין חדש" כדי להתחיל</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/campaigns/${c.id}`)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.is_active ? 'bg-green-400' : 'bg-brand-200'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-brand-800 font-body group-hover:text-brand-600 transition-colors duration-200">{c.name}</h3>
                      {c.market && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          c.market === 'israeli' ? 'bg-blue-100 text-blue-700' :
                          c.market === 'filipino' ? 'bg-green-100 text-green-700' :
                          c.market === 'international' ? 'bg-purple-100 text-purple-700' :
                          c.market === 'jewish_diaspora' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {c.market === 'israeli' ? 'IL' : c.market === 'filipino' ? 'PH' : c.market === 'international' ? 'INT' : c.market === 'jewish_diaspora' ? 'JD' : c.market}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-300 font-body mt-0.5">
                      נוצר {new Date(c.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className={`text-xs font-medium font-body ${c.is_active ? 'text-green-600' : 'text-brand-300'}`}>
                    {c.is_active ? 'פעיל' : 'כבוי'}
                  </span>
                  <button
                    onClick={() => toggleActive(c)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      c.is_active ? 'bg-green-400' : 'bg-brand-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      c.is_active ? 'translate-x-1' : 'translate-x-4'
                    }`} />
                  </button>
                  <div className="w-px h-4 bg-brand-100" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                    className="text-brand-200 hover:text-red-400 transition-colors duration-200 cursor-pointer p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg className="w-4 h-4 text-brand-300 group-hover:text-brand-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
