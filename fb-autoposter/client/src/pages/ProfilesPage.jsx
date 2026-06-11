import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useProfile } from '../context/ProfileContext';
import { profilesApi } from '../api';

export default function ProfilesPage() {
  const navigate = useNavigate();
  const { agentProfiles, loadProfiles, selectedProfileId, selectProfile } = useProfile();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', proxy_url: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function openAdd() {
    setForm({ name: '', proxy_url: '' });
    setEditingId(null);
    setShowAdd(true);
    setError('');
  }

  function openEdit(profile) {
    setForm({ name: profile.name, proxy_url: profile.proxy_url || '' });
    setEditingId(profile.id);
    setShowAdd(true);
    setError('');
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('שם הסוכן נדרש'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await profilesApi.update(editingId, { name: form.name.trim(), proxy_url: form.proxy_url.trim() || null });
      } else {
        await profilesApi.create({ name: form.name.trim(), proxy_url: form.proxy_url.trim() || null });
      }
      await loadProfiles();
      setShowAdd(false);
    } catch (e) {
      setError(e.response?.data?.error || 'שגיאה בשמירה');
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (id === 'default') return;
    if (!confirm('למחוק את פרופיל הסוכן?')) return;
    await profilesApi.delete(id);
    await loadProfiles();
    if (selectedProfileId === id) selectProfile('default');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50/30 font-body" dir="rtl">
      <AppHeader
        title="ניהול סוכנים"
        backTo="/campaigns"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            הוסף סוכן
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-brand-900">פרופילי סוכנים</h1>
          <p className="text-brand-500 text-sm mt-1">כל סוכן מתחבר בנפרד לפייסבוק ומפרסם דרך הפרופיל שלו</p>
        </div>

        <div className="space-y-3">
          {agentProfiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white rounded-xl border p-4 flex items-center justify-between shadow-sm transition-all ${
                selectedProfileId === profile.id ? 'border-brand-400 ring-1 ring-brand-300' : 'border-brand-100 hover:border-brand-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { selectProfile(profile.id); navigate('/login'); }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                    selectedProfileId === profile.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                  title="בחר פרופיל"
                >
                  {profile.name[0]}
                </button>
                <div>
                  <div className="font-semibold text-brand-900 text-sm">{profile.name}</div>
                  {profile.proxy_url ? (
                    <div className="text-xs text-brand-400 mt-0.5 font-mono truncate max-w-xs">{profile.proxy_url}</div>
                  ) : (
                    <div className="text-xs text-amber-500 mt-0.5">ללא proxy — מומלץ להגדיר</div>
                  )}
                </div>
                {selectedProfileId === profile.id && (
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">פעיל</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { selectProfile(profile.id); navigate('/login'); }}
                  className="text-xs text-brand-600 hover:text-brand-800 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  חיבור לפייסבוק
                </button>
                <button
                  onClick={() => openEdit(profile)}
                  className="p-1.5 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {profile.id !== 'default' && (
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
            <h2 className="text-lg font-display font-bold text-brand-900 mb-4">
              {editingId ? 'עריכת סוכן' : 'הוספת סוכן'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">שם הסוכן</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="למשל: יוסי כהן"
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">
                  Proxy URL <span className="text-brand-400 font-normal">(מומלץ לכל סוכן)</span>
                </label>
                <input
                  type="text"
                  value={form.proxy_url}
                  onChange={(e) => setForm((f) => ({ ...f, proxy_url: e.target.value }))}
                  placeholder="http://user:pass@ip:port"
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                  dir="ltr"
                />
                <p className="text-xs text-brand-400 mt-1">כל סוכן צריך IP נפרד כדי שפייסבוק לא יזהה פרסום מרוכז</p>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'שומר...' : 'שמור'}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 bg-brand-50 hover:bg-brand-100 text-brand-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
