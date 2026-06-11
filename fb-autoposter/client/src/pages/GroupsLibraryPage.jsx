import { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
import { groups as groupsApi, collections as collectionsApi } from '../api';
import { useProfile } from '../context/ProfileContext';

export default function GroupsLibraryPage() {
  const { selectedProfileId } = useProfile();
  const [tab, setTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [cols, setCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [search, setSearch] = useState('');
  const [editingCol, setEditingCol] = useState(null);
  const [enriching, setEnriching] = useState(null);
  const enrichEsRef = useRef(null);
  const [enrichingInfo, setEnrichingInfo] = useState(null);
  const enrichInfoEsRef = useRef(null);
  const [drawerGroup, setDrawerGroup] = useState(null);

  const missingCount = groups.filter((g) => !g.members_count || !/^\d/.test(g.members_count)).length;
  const infoMissingCount = groups.filter((g) => !g.info_scraped_at).length;

  function handleEnrichMissing() {
    if (enriching?.status === 'running') return;
    setEnriching({ status: 'running', done: 0, total: 0 });
    const url = groupsApi.enrichMembersUrl(selectedProfileId, null, true);
    const es = new EventSource(url);
    enrichEsRef.current = es;
    es.addEventListener('start', (e) => {
      setEnriching((p) => ({ ...p, total: JSON.parse(e.data).total }));
    });
    es.addEventListener('result', (e) => {
      const { groupId, count } = JSON.parse(e.data);
      setEnriching((p) => ({ ...p, done: p.done + 1 }));
      if (count) setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, members_count: count } : g));
    });
    es.addEventListener('done', () => {
      es.close(); enrichEsRef.current = null;
      setEnriching((p) => ({ ...p, status: 'done' }));
    });
    es.onerror = () => {
      es.close(); enrichEsRef.current = null;
      setEnriching((p) => ({ ...p, status: 'done' }));
    };
  }

  function stopEnrich() {
    enrichEsRef.current?.close();
    enrichEsRef.current = null;
    setEnriching((p) => ({ ...p, status: 'done' }));
  }

  function handleEnrichInfoMissing() {
    if (enrichingInfo?.status === 'running') return;
    setEnrichingInfo({ status: 'running', done: 0, total: 0 });
    const url = groupsApi.enrichInfoUrl(selectedProfileId, null, true);
    const es = new EventSource(url);
    enrichInfoEsRef.current = es;
    es.addEventListener('start', (e) => {
      setEnrichingInfo((p) => ({ ...p, total: JSON.parse(e.data).total }));
    });
    es.addEventListener('result', (e) => {
      const { groupId, info } = JSON.parse(e.data);
      setEnrichingInfo((p) => ({ ...p, done: p.done + 1 }));
      if (info) {
        setGroups((prev) => prev.map((g) =>
          g.id === groupId ? { ...g, ...info, info_scraped_at: new Date().toISOString() } : g
        ));
      }
    });
    es.addEventListener('done', () => {
      es.close(); enrichInfoEsRef.current = null;
      setEnrichingInfo((p) => ({ ...p, status: 'done' }));
    });
    es.onerror = () => {
      es.close(); enrichInfoEsRef.current = null;
      setEnrichingInfo((p) => ({ ...p, status: 'done' }));
    };
  }

  function stopEnrichInfo() {
    enrichInfoEsRef.current?.close();
    enrichInfoEsRef.current = null;
    setEnrichingInfo((p) => ({ ...p, status: 'done' }));
  }

  function handleGroupDataUpdate(updatedGroup) {
    setGroups((prev) => prev.map((g) => g.id === updatedGroup.id ? updatedGroup : g));
    if (drawerGroup?.id === updatedGroup.id) setDrawerGroup(updatedGroup);
  }

  useEffect(() => { loadAll(); }, [selectedProfileId]);

  async function loadAll() {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        groupsApi.list(selectedProfileId),
        collectionsApi.list(selectedProfileId),
      ]);
      setGroups(gRes.data);
      setCols(cRes.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await groupsApi.sync(selectedProfileId);
      setGroups(res.data.groups);
      setSyncResult(res.data.synced);
    } catch {
      setSyncResult(-1);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteGroup(id) {
    if (!confirm('להסיר קבוצה זו מהספרייה?')) return;
    await groupsApi.delete(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (drawerGroup?.id === id) setDrawerGroup(null);
  }

  async function handleDeleteCol(id) {
    if (!confirm('למחוק ספרייה זו?')) return;
    await collectionsApi.delete(id);
    setCols((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleRemoveFromCollection(colId, groupId) {
    const col = cols.find((c) => c.id === colId);
    if (!col) return;
    const newIds = col.groups.filter((g) => g.id !== groupId).map((g) => g.id);
    await collectionsApi.setGroups(colId, newIds);
    setCols((prev) => prev.map((c) =>
      c.id === colId ? { ...c, groups: c.groups.filter((g) => g.id !== groupId) } : c
    ));
  }

  function handleGroupUpdated(groupId, count) {
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, members_count: count } : g));
    setCols((prev) => prev.map((col) => ({
      ...col,
      groups: col.groups.map((g) => g.id === groupId ? { ...g, members_count: count } : g),
    })));
  }

  async function handleSaveCol({ id, name, selectedIds }) {
    if (id) {
      const [rn, sg] = await Promise.all([
        collectionsApi.rename(id, name),
        collectionsApi.setGroups(id, selectedIds),
      ]);
      setCols((prev) => prev.map((c) => c.id === id ? { ...rn.data, groups: sg.data.groups } : c));
    } else {
      const created = await collectionsApi.create(name, selectedProfileId);
      const withGroups = await collectionsApi.setGroups(created.data.id, selectedIds);
      setCols((prev) => [{ ...withGroups.data }, ...prev]);
    }
    setEditingCol(null);
  }

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-brand-50">
      <AppHeader
        title="ספריית הקבוצות"
        backTo="/campaigns"
        action={
          tab === 'groups' ? (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {syncing
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />סנכרן...</>
                : 'סנכרן קבוצות'}
            </button>
          ) : (
            <button
              onClick={() => setEditingCol('new')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              + ספרייה חדשה
            </button>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex border-b border-brand-100 mb-6 gap-1">
          {[{ key: 'groups', label: `כל הקבוצות (${groups.length})` }, { key: 'collections', label: `ספריות (${cols.length})` }].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-brand-400 hover:text-brand-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'groups' ? (
          <GroupsTab
            groups={filtered}
            total={groups.length}
            search={search}
            setSearch={setSearch}
            syncing={syncing}
            syncResult={syncResult}
            onDelete={handleDeleteGroup}
            missingCount={missingCount}
            enriching={enriching}
            onEnrich={handleEnrichMissing}
            onStopEnrich={stopEnrich}
            infoMissingCount={infoMissingCount}
            enrichingInfo={enrichingInfo}
            onEnrichInfo={handleEnrichInfoMissing}
            onStopEnrichInfo={stopEnrichInfo}
            onGroupClick={setDrawerGroup}
          />
        ) : (
          <CollectionsTab
            cols={cols}
            onEdit={(col) => setEditingCol(col)}
            onDelete={handleDeleteCol}
            onGroupUpdated={handleGroupUpdated}
            onRemoveFromCollection={handleRemoveFromCollection}
          />
        )}
      </div>

      {editingCol !== null && (
        <CollectionEditor
          col={editingCol === 'new' ? null : editingCol}
          allGroups={groups}
          onSave={handleSaveCol}
          onCancel={() => setEditingCol(null)}
        />
      )}

      {drawerGroup && (
        <GroupDetailDrawer
          group={drawerGroup}
          onClose={() => setDrawerGroup(null)}
          onSaved={handleGroupDataUpdate}
        />
      )}
    </div>
  );
}

// ─── Groups Tab ───────────────────────────────────────────────────────────────

function GroupsTab({ groups, total, search, setSearch, syncing, syncResult, onDelete, missingCount, enriching, onEnrich, onStopEnrich, infoMissingCount, enrichingInfo, onEnrichInfo, onStopEnrichInfo, onGroupClick }) {
  return (
    <>
      {/* Enrich missing members banner */}
      {missingCount > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-3">
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{missingCount} קבוצות</span> חסר להן מספר חברים
          </p>
          {enriching?.status === 'running' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600">{enriching.done}/{enriching.total}</span>
              <button onClick={onStopEnrich} className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors">עצור</button>
            </div>
          ) : (
            <button onClick={onEnrich} className="text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-500 bg-white rounded-lg px-3 py-1.5 transition-colors">
              {enriching?.status === 'done' ? 'עדכן שוב' : 'עדכן חברים'}
            </button>
          )}
        </div>
      )}

      {/* Enrich missing info banner */}
      {infoMissingCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-3">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">{infoMissingCount} קבוצות</span> טרם נשלף מהן מידע (אודות + הודעה נעוצה)
          </p>
          {enrichingInfo?.status === 'running' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600">{enrichingInfo.done}/{enrichingInfo.total}</span>
              <button onClick={onStopEnrichInfo} className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors">עצור</button>
            </div>
          ) : (
            <button onClick={onEnrichInfo} className="text-xs font-semibold text-blue-700 hover:text-blue-900 border border-blue-300 hover:border-blue-500 bg-white rounded-lg px-3 py-1.5 transition-colors">
              {enrichingInfo?.status === 'done' ? 'שלוף שוב' : 'שלוף מידע'}
            </button>
          )}
        </div>
      )}

      {syncing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">מסנכרן קבוצות...</p>
            <p className="text-brand-600 text-sm mt-0.5">נכנס לפייסבוק, גולל את רשימת הקבוצות וטוען את כולן. זה עלול לקחת דקה-שתיים.</p>
          </div>
        </div>
      )}
      {syncResult !== null && !syncing && (
        <div className={`rounded-2xl p-4 mb-5 text-sm font-medium ${syncResult >= 0 ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {syncResult >= 0 ? `✓ סנכרון הושלם – נמצאו ${syncResult} קבוצות` : '✗ שגיאה בסנכרון. ודא שאתה מחובר לפייסבוק.'}
        </div>
      )}
      <div className="flex items-center justify-between mb-4 gap-4">
        <p className="text-sm text-brand-500">{groups.length} קבוצות{search ? ` (מתוך ${total})` : ''}</p>
        <input
          type="text"
          placeholder="חיפוש קבוצה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-brand-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      {groups.length === 0 ? (
        <div className="text-center py-20 text-brand-300">
          <p className="text-lg mb-1">אין קבוצות בספרייה</p>
          <p className="text-sm">לחץ "סנכרן קבוצות" כדי לייבא את הקבוצות שלך מפייסבוק</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((g) => <GroupCard key={g.id} group={g} onDelete={onDelete} onClick={() => onGroupClick(g)} />)}
        </div>
      )}
    </>
  );
}

const MARKET_BADGE = {
  israeli: { label: 'IL', bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
  filipino: { label: 'PH', bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
  international: { label: 'INT', bg: '#f3e8ff', text: '#9333ea', border: '#c4b5fd' },
  jewish_diaspora: { label: 'JD', bg: '#ffedd5', text: '#ea580c', border: '#fdba74' },
};

function GroupCard({ group, onDelete, onClick }) {
  const initials = group.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const marketBadge = MARKET_BADGE[group.market];
  const groupTypeLabel = GROUP_TYPE_OPTIONS.find(t => t.val === group.group_type)?.label;
  const langLabel = LANGUAGE_OPTIONS.find(l => l.val === group.language)?.label;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer ${group.is_blocked ? 'border-red-200 opacity-60' : 'border-brand-100 hover:border-blue-200'}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brand-800 text-sm leading-snug line-clamp-2">{group.name}</p>
          {group.members_count && (
            <p className="text-xs text-brand-300 mt-0.5">{group.members_count} חברים</p>
          )}
        </div>
        {marketBadge && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: marketBadge.bg, color: marketBadge.text, border: `1px solid ${marketBadge.border}` }}>
            {marketBadge.label}
          </span>
        )}
      </div>

      {/* Classification badges */}
      {(groupTypeLabel || langLabel || group.region || group.is_blocked) && (
        <div className="flex flex-wrap gap-1">
          {group.is_blocked === 1 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">חסום</span>
          )}
          {groupTypeLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{groupTypeLabel}</span>
          )}
          {langLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">{langLabel}</span>
          )}
          {group.region && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">{group.region}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-brand-50" onClick={(e) => e.stopPropagation()}>
        <a href={group.url} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-xs font-medium text-brand-600 hover:text-blue-800 py-1 transition-colors cursor-pointer">
          פתח בפייסבוק
        </a>
        <div className="w-px h-4 bg-brand-200" />
        <button onClick={() => onDelete(group.id)}
          className="flex-1 text-center text-xs font-medium text-red-500 hover:text-red-700 py-1 transition-colors cursor-pointer">
          הסר
        </button>
      </div>
    </div>
  );
}

// ─── Group Detail Drawer ──────────────────────────────────────────────────────

const MARKET_OPTIONS = [
  { val: 'israeli', label: 'ישראלי', color: 'blue' },
  { val: 'filipino', label: 'פיליפיני', color: 'green' },
  { val: 'international', label: 'בינלאומי', color: 'purple' },
  { val: 'jewish_diaspora', label: 'תפוצות', color: 'orange' },
];
const GROUP_TYPE_OPTIONS = [
  { val: 'real_estate', label: 'נדל"ן' },
  { val: 'investment', label: 'השקעות' },
  { val: 'expat_community', label: 'קהילת אקספטים' },
  { val: 'jewish_community', label: 'קהילה יהודית' },
  { val: 'business', label: 'עסקים' },
  { val: 'lifestyle', label: 'לייפסטייל' },
  { val: 'tourism', label: 'תיירות' },
];
const LANGUAGE_OPTIONS = [
  { val: 'hebrew', label: 'עברית' },
  { val: 'english', label: 'אנגלית' },
  { val: 'tagalog', label: 'טגלוג' },
  { val: 'cebuano', label: 'סבואנו' },
  { val: 'mixed', label: 'מעורב' },
];

function GroupDetailDrawer({ group, onClose, onSaved }) {
  const [form, setForm] = useState({
    market: group.market || '',
    group_type: group.group_type || '',
    language: group.language || '',
    region: group.region || group.area || '',
    posting_rules: group.posting_rules || '',
    notes: group.notes || '',
    quality_score: group.quality_score ?? 0,
    is_blocked: group.is_blocked || 0,
  });
  const [saving, setSaving] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);

  function setField(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        market: form.market || null,
        group_type: form.group_type || null,
        language: form.language || null,
        region: form.region || null,
        posting_rules: form.posting_rules || null,
        notes: form.notes || null,
        quality_score: form.quality_score || null,
        is_blocked: form.is_blocked,
      };
      const res = await groupsApi.update(group.id, payload);
      onSaved(res.data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-brand-100 sticky top-0 bg-white z-10">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-brand-800 text-base leading-snug">{group.name}</h2>
            {group.members_count && <p className="text-xs text-brand-400 mt-0.5">{group.members_count} חברים</p>}
          </div>
          <button onClick={onClose} className="text-brand-300 hover:text-brand-600 text-2xl leading-none mr-3 flex-shrink-0">x</button>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 px-5 pt-4 flex-wrap">
          {group.privacy_status && group.privacy_status !== 'unknown' && (
            <span className={`text-xs px-2 py-1 rounded-full border ${group.privacy_status === 'public' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {group.privacy_status === 'public' ? 'ציבורית' : 'פרטית'}
            </span>
          )}
          {group.is_blocked === 1 && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">חסום</span>
          )}
          {group.cooldown_until && new Date(group.cooldown_until) > new Date() && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              השהייה עד {new Date(group.cooldown_until).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {group.last_post_at && (
            <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-500 border border-brand-200">
              פורסם {new Date(group.last_post_at).toLocaleDateString('he-IL')}
            </span>
          )}
          {group.info_scraped_at
            ? <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">נשלף {new Date(group.info_scraped_at).toLocaleDateString('he-IL')}</span>
            : <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-400 border border-brand-200">טרם נשלף</span>
          }
        </div>

        {/* Raw scraped data */}
        {(group.about_text || group.pinned_post_text) && (
          <div className="px-5 pt-4">
            <button
              onClick={() => setRawOpen((p) => !p)}
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
            >
              <span>{rawOpen ? '▲' : '▼'}</span> טקסט גולמי מהקבוצה
            </button>
            {rawOpen && (
              <div className="mt-2 space-y-3 text-xs text-brand-600 bg-brand-50 rounded-xl p-3 border border-brand-100">
                {group.about_text && (
                  <div>
                    <p className="font-semibold text-brand-700 mb-1">אודות</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{group.about_text}</p>
                  </div>
                )}
                {group.pinned_post_text && (
                  <div>
                    <p className="font-semibold text-brand-700 mb-1">הודעה נעוצה</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{group.pinned_post_text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Classification form */}
        <div className="px-5 pt-5 pb-3 space-y-4 flex-1">
          <p className="text-sm font-semibold text-brand-700 border-b border-brand-100 pb-2">סיווג קבוצה</p>

          {/* Market */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">שוק יעד</label>
            <div className="flex gap-2 flex-wrap">
              {MARKET_OPTIONS.map(({ val, label, color }) => (
                <button
                  key={val}
                  onClick={() => setField('market', form.market === val ? '' : val)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    form.market === val
                      ? `bg-${color}-600 text-white border-${color}-600`
                      : 'border-brand-200 text-brand-600 hover:border-brand-400'
                  }`}
                  style={form.market === val ? { backgroundColor: color === 'blue' ? '#2563eb' : color === 'green' ? '#16a34a' : color === 'purple' ? '#9333ea' : '#ea580c', color: 'white', borderColor: 'transparent' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Group type */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">סוג קבוצה</label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_TYPE_OPTIONS.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setField('group_type', form.group_type === val ? '' : val)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.group_type === val ? 'bg-indigo-600 text-white border-indigo-600' : 'border-brand-200 text-brand-600 hover:border-indigo-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">שפה</label>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGE_OPTIONS.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setField('language', form.language === val ? '' : val)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.language === val ? 'bg-brand-600 text-white border-brand-600' : 'border-brand-200 text-brand-600 hover:border-brand-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">אזור</label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setField('region', e.target.value)}
              placeholder="לדוגמה: תל אביב, Manila, USA, Singapore"
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Quality score */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">ציון איכות</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setField('quality_score', form.quality_score === n ? 0 : n)}
                  className={`text-xl transition-colors cursor-pointer ${n <= form.quality_score ? 'text-amber-400' : 'text-brand-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Blocked toggle */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">חסום</label>
            <button
              onClick={() => setField('is_blocked', form.is_blocked ? 0 : 1)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${form.is_blocked ? 'bg-red-500 text-white border-red-500' : 'border-brand-200 text-brand-600 hover:border-red-400'}`}
            >
              {form.is_blocked ? 'חסום - לא יפורסם' : 'לא חסום'}
            </button>
          </div>

          {/* Posting rules */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">כללי פרסום</label>
            <textarea
              value={form.posting_rules}
              onChange={(e) => setField('posting_rules', e.target.value)}
              rows={2}
              placeholder="כללי הקבוצה לגבי פרסום..."
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">הערות</label>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={3}
              placeholder="הערות חופשיות על הקבוצה..."
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-brand-100 p-5 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {saving ? 'שומר...' : 'שמור'}
          </button>
          <button onClick={onClose} className="border border-brand-200 text-brand-600 hover:bg-brand-50 font-medium py-2 px-4 rounded-lg text-sm cursor-pointer">
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseMemberCount(str) {
  if (!str || !/^\d/.test(str)) return 0;
  const m = str.replace(/,/g, '').match(/^([\d.]+)\s*([KkMm]|אלף|מיליון)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = (m[2] || '').toLowerCase();
  if (u === 'k' || u === 'אלף') return n * 1000;
  if (u === 'm' || u === 'מיליון') return n * 1000000;
  return n;
}

function formatTotal(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ─── Collections Tab ──────────────────────────────────────────────────────────

function CollectionsTab({ cols, onEdit, onDelete, onGroupUpdated, onRemoveFromCollection }) {
  if (cols.length === 0) {
    return (
      <div className="text-center py-20 text-brand-300">
        <p className="text-lg mb-1">אין ספריות עדיין</p>
        <p className="text-sm">לחץ "+ ספרייה חדשה" כדי ליצור קבוצת קבוצות</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {cols.map((col) => (
        <CollectionCard key={col.id} col={col} onEdit={onEdit} onDelete={onDelete} onGroupUpdated={onGroupUpdated} onRemoveFromCollection={onRemoveFromCollection} />
      ))}
    </div>
  );
}

function CollectionCard({ col, onEdit, onDelete, onGroupUpdated, onRemoveFromCollection }) {
  const { selectedProfileId } = useProfile();
  const [expanded, setExpanded] = useState(false);
  const [sortDir, setSortDir] = useState('desc');
  const [enriching, setEnriching] = useState(null);
  const esRef = useRef(null);

  const missingGroups = col.groups.filter((g) => !g.members_count || !/^\d/.test(g.members_count));
  const totalMembers = col.groups.reduce((sum, g) => sum + parseMemberCount(g.members_count), 0);

  const sortedGroups = [...col.groups].sort((a, b) => {
    const diff = parseMemberCount(a.members_count) - parseMemberCount(b.members_count);
    return sortDir === 'desc' ? -diff : diff;
  });

  function handleEnrich() {
    if (enriching?.status === 'running' || missingGroups.length === 0) return;
    const ids = missingGroups.map((g) => g.id);
    setEnriching({ status: 'running', done: 0, total: missingGroups.length });
    const url = groupsApi.enrichMembersUrl(selectedProfileId, ids, false);
    const es = new EventSource(url);
    esRef.current = es;
    es.addEventListener('result', (e) => {
      const { groupId, count } = JSON.parse(e.data);
      setEnriching((p) => ({ ...p, done: p.done + 1 }));
      if (count) onGroupUpdated(groupId, count);
    });
    es.addEventListener('done', () => { es.close(); esRef.current = null; setEnriching((p) => ({ ...p, status: 'done' })); });
    es.onerror = () => { es.close(); esRef.current = null; setEnriching((p) => ({ ...p, status: 'done' })); };
  }

  function stopEnrich() {
    esRef.current?.close(); esRef.current = null;
    setEnriching((p) => ({ ...p, status: 'done' }));
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-brand-800">{col.name}</p>
            <p className="text-xs text-brand-300">
              {col.groups.length} קבוצות
              {totalMembers > 0 && <span className="mr-1">· {formatTotal(totalMembers)} חברים בסה״כ</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {missingGroups.length > 0 && (
            enriching?.status === 'running' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-amber-600">{enriching.done}/{enriching.total}</span>
                <button onClick={stopEnrich} className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1.5 transition-colors">עצור</button>
              </div>
            ) : (
              <button onClick={handleEnrich} className="text-xs text-amber-600 hover:text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1.5 transition-colors">
                עדכן חברים ({missingGroups.length})
              </button>
            )
          )}
          <button onClick={() => setExpanded((p) => !p)}
            className="text-xs text-brand-300 hover:text-brand-600 border border-brand-100 rounded-lg px-3 py-1.5 transition-colors">
            {expanded ? 'סגור' : 'הצג'}
          </button>
          <button onClick={() => onEdit(col)}
            className="text-xs text-brand-600 hover:text-indigo-800 border border-brand-200 rounded-lg px-3 py-1.5 transition-colors">
            ערוך
          </button>
          <button onClick={() => onDelete(col.id)}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors">
            מחק
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-brand-50">
          {col.groups.length === 0 ? (
            <p className="text-sm text-brand-300">אין קבוצות בספרייה זו</p>
          ) : (
            <>
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1 text-xs text-brand-300 hover:text-brand-600 transition-colors"
                >
                  מיון לפי חברים
                  <span>{sortDir === 'desc' ? '↓' : '↑'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {sortedGroups.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 bg-brand-50 rounded-lg px-3 py-2 group">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{g.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-700 truncate">{g.name}</p>
                      {g.members_count && /^\d/.test(g.members_count) && (
                        <p className="text-xs text-brand-300">{g.members_count} חברים</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveFromCollection(col.id, g.id)}
                      className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Collection Editor Modal ──────────────────────────────────────────────────

function CollectionEditor({ col, allGroups, onSave, onCancel }) {
  const [name, setName] = useState(col?.name || '');
  const [selectedIds, setSelectedIds] = useState(new Set(col?.groups?.map((g) => g.id) || []));
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  function toggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ id: col?.id, name: name.trim(), selectedIds: [...selectedIds] });
    } finally {
      setSaving(false);
    }
  }

  const filtered = allGroups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-50">
          <h2 className="text-lg font-semibold text-brand-800">{col ? 'עריכת ספרייה' : 'ספרייה חדשה'}</h2>
          <button onClick={onCancel} className="text-brand-300 hover:text-brand-600 text-xl leading-none">×</button>
        </div>

        {/* Name input */}
        <div className="px-6 pt-5 pb-3">
          <label className="block text-sm font-medium text-brand-700 mb-1">שם הספרייה</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='לדוגמה: "קבוצות נדל״ן תל אביב"'
            className="w-full border border-brand-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        {/* Group search */}
        <div className="px-6 pb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-brand-700">בחר קבוצות ({selectedIds.size} נבחרו)</label>
            {selectedIds.size > 0 && (
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-brand-300 hover:text-brand-600">נקה הכל</button>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש..."
            className="w-full border border-brand-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Group list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-1" dir="rtl">
          {filtered.map((g) => {
            const checked = selectedIds.has(g.id);
            return (
              <label key={g.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-brand-50' : 'hover:bg-brand-50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-indigo-500 bg-brand-500' : 'border-brand-200'}`}>
                  {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(g.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-800 truncate">{g.name}</p>
                  {g.members_count && <p className="text-xs text-brand-300">{g.members_count} חברים</p>}
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-brand-50">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {saving ? 'שומר...' : col ? 'שמור שינויים' : 'צור ספרייה'}
          </button>
          <button onClick={onCancel} className="border border-brand-200 text-brand-600 hover:bg-brand-50 font-medium py-2 px-4 rounded-lg text-sm">
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
