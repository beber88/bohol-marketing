import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { campaigns, posts, groups as groupsApi, collections as collectionsApi } from '../api';
import PostForm from '../components/PostForm';
import AppHeader from '../components/AppHeader';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [postList, setPostList] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingGroups, setSavingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testPublish, setTestPublish] = useState(null); // { postId, groupId, loading, result }
  const [publishAll, setPublishAll] = useState(null); // { postId, status, total, done, logs[] }
  const [enriching, setEnriching] = useState(null); // { status, done, total, failed }
  const enrichEsRef = useRef(null);
  const publishEsRef = useRef(null);
  const [allCollections, setAllCollections] = useState([]);
  const [summaryModal, setSummaryModal] = useState(null);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [campRes, groupsRes, colsRes] = await Promise.all([
        campaigns.get(id),
        groupsApi.list(),
        collectionsApi.list(),
      ]);
      setCampaign(campRes.data);
      setPostList(campRes.data.posts || []);
      setSelectedGroupIds([...new Set((campRes.data.groups || []).map((g) => g.id))]);
      setAllGroups(groupsRes.data);
      setAllCollections(colsRes.data);
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    const res = await campaigns.logs(id);
    setLogs(res.data);
  }

  async function handleSyncGroups() {
    setSyncing(true);
    try {
      const res = await groupsApi.sync();
      setAllGroups(res.data.groups);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSaveGroups() {
    setSavingGroups(true);
    try {
      await campaigns.setGroups(id, selectedGroupIds);
      alert('הקבוצות עודכנו בהצלחה');
    } finally {
      setSavingGroups(false);
    }
  }

  async function toggleCampaign() {
    const res = await campaigns.update(id, { is_active: !campaign.is_active });
    setCampaign(res.data);
  }

  async function handleDeletePost(postId) {
    if (!confirm('למחוק פוסט זה?')) return;
    await posts.delete(postId);
    load();
  }

  async function handleTestPublish(postId, groupId) {
    setTestPublish({ postId, groupId, loading: true, result: null });
    try {
      const res = await posts.publish(postId, groupId);
      setTestPublish({ postId, groupId, loading: false, result: res.data });
    } catch (e) {
      setTestPublish({ postId, groupId, loading: false, result: { success: false, error: e.message } });
    }
  }

  function openPublishStream(url, doneOffset = 0, isResume = false) {
    const es = new EventSource(url);
    publishEsRef.current = es;

    es.addEventListener('start', (e) => {
      const data = JSON.parse(e.data);
      if (!isResume) {
        setPublishAll((prev) => ({ ...prev, total: data.total, allGroups: data.groups }));
      }
    });

    es.addEventListener('posting', (e) => {
      const data = JSON.parse(e.data);
      setPublishAll((prev) => ({
        ...prev,
        done: doneOffset + data.index - 1,
        logs: [...prev.logs, { type: 'posting', groupId: data.groupId, groupName: data.groupName }],
      }));
    });

    es.addEventListener('result', (e) => {
      const data = JSON.parse(e.data);
      setPublishAll((prev) => ({
        ...prev,
        done: doneOffset + data.index,
        logs: prev.logs.map((l) =>
          l.type === 'posting' && l.groupId === data.groupId
            ? { ...l, type: 'result', success: data.success, error: data.error, step: data.step, duration: data.duration, postUrl: data.postUrl }
            : l
        ),
      }));
    });

    es.addEventListener('waiting', (e) => {
      const data = JSON.parse(e.data);
      setPublishAll((prev) => ({
        ...prev,
        logs: [...prev.logs, { type: 'waiting', seconds: data.seconds, nextGroupName: data.nextGroupName }],
      }));
    });

    es.addEventListener('done', (e) => {
      const data = JSON.parse(e.data);
      es.close();
      publishEsRef.current = null;
      setPublishAll((prev) => ({
        ...prev,
        status: 'done',
        done: prev.total,
        successCount: (prev.successCount || 0) + data.successCount,
        failedCount: (prev.failedCount || 0) + data.failedCount,
      }));
    });

    es.onerror = () => {
      es.close();
      publishEsRef.current = null;
      setPublishAll((prev) => ({ ...prev, status: 'done', logs: [...prev.logs, { type: 'error', error: 'החיבור לשרת נותק' }] }));
    };
  }

  function handlePublishAll(postId) {
    if (publishAll?.status === 'running') return;
    setTestPublish(null);
    setPublishAll({ postId, status: 'running', total: 0, done: 0, logs: [], allGroups: [], successCount: 0, failedCount: 0 });
    openPublishStream(posts.publishAllUrl(postId, id));
  }

  function stopPublishAll() {
    publishEsRef.current?.close();
    publishEsRef.current = null;
    setPublishAll((prev) => {
      const processedIds = new Set(prev.logs.filter((l) => l.type === 'result').map((l) => l.groupId));
      const remainingGroups = (prev.allGroups || []).filter((g) => !processedIds.has(g.id));
      return { ...prev, status: 'stopped', remainingGroups };
    });
  }

  function handleResumePublishAll(postId) {
    setPublishAll((prev) => {
      if (!prev.remainingGroups?.length) return prev;
      const groupIds = prev.remainingGroups.map((g) => g.id).join(',');
      const url = `${posts.publishAllUrl(postId, id)}&group_ids=${groupIds}`;
      const doneOffset = prev.logs.filter((l) => l.type === 'result').length;
      setTimeout(() => openPublishStream(url, doneOffset, true), 0);
      return { ...prev, status: 'running', remainingGroups: [] };
    });
  }

  function parseMemberCount(str) {
    if (!str) return 0;
    const s = str.replace(/[,\s\u200F]/g, '');
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    const m = s.match(/^([\d.]+)([KMk]?)$/);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    if (m[2] === 'K' || m[2] === 'k') return Math.round(n * 1000);
    if (m[2] === 'M') return Math.round(n * 1000000);
    return Math.round(n);
  }

  function fmtMembers(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString('he-IL');
  }

  function stopEnrichMembers() {
    if (enrichEsRef.current) {
      enrichEsRef.current.close();
      enrichEsRef.current = null;
    }
    setEnriching((prev) => ({ ...prev, status: 'done' }));
  }

  function handleEnrichMembers() {
    if (enriching?.status === 'running') return;
    setEnriching({ status: 'running', done: 0, total: 0, failed: 0 });

    const es = new EventSource('/api/groups/enrich-members');
    enrichEsRef.current = es;

    es.addEventListener('start', (e) => {
      const { total } = JSON.parse(e.data);
      setEnriching((prev) => ({ ...prev, total }));
    });

    es.addEventListener('result', (e) => {
      const { count, groupId } = JSON.parse(e.data);
      setEnriching((prev) => ({ ...prev, done: prev.done + 1, failed: prev.failed + (count ? 0 : 1) }));
      if (count) {
        setAllGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, members_count: count } : g));
      }
    });

    es.addEventListener('done', () => {
      es.close();
      enrichEsRef.current = null;
      setEnriching((prev) => ({ ...prev, status: 'done' }));
    });

    es.onerror = () => {
      es.close();
      enrichEsRef.current = null;
      setEnriching((prev) => ({ ...prev, status: 'done' }));
    };
  }

  function applyCollection(col) {
    const idsInCol = col.groups.map((g) => g.id);
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      idsInCol.forEach((id) => next.add(id));
      return [...next];
    });
  }

  function toggleGroup(groupId) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="min-h-screen bg-brand-50">
      <AppHeader
        title={campaign.name}
        backTo="/campaigns"
        action={
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${campaign.is_active ? 'text-green-600' : 'text-brand-300'}`}>
              {campaign.is_active ? 'פעיל' : 'כבוי'}
            </span>
            <button
              onClick={toggleCampaign}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                campaign.is_active ? 'bg-green-500' : 'bg-brand-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                campaign.is_active ? 'translate-x-1' : 'translate-x-6'
              }`} />
            </button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex border-b border-brand-100 mb-6 gap-1">
          {[
            { key: 'posts', label: 'פוסטים' },
            { key: 'groups', label: 'קבוצות' },
            { key: 'runs', label: 'סיכום ריצות' },
            { key: 'logs', label: 'לוג פרסומים' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'logs' || tab.key === 'runs') loadLogs(); }}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-brand-500 hover:text-brand-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-800">פוסטים בקמפיין</h2>
              <button
                onClick={() => { setEditingPost(null); setShowPostForm(true); }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
              >
                + פוסט חדש
              </button>
            </div>

            {showPostForm && (
              <PostForm
                campaignId={id}
                post={editingPost}
                onSaved={() => { setShowPostForm(false); setEditingPost(null); load(); }}
                onCancel={() => { setShowPostForm(false); setEditingPost(null); }}
              />
            )}

            {postList.length === 0 && !showPostForm ? (
              <div className="text-center py-16 text-brand-300">
                <p className="text-lg mb-1">אין פוסטים בקמפיין זה</p>
                <p className="text-sm">לחץ "+ פוסט חדש" כדי להוסיף</p>
              </div>
            ) : (
              <div className="space-y-3">
                {postList.map((post) => {
                  const isTestOpen = testPublish?.postId === post.id;
                  const isPublishAllOpen = publishAll?.postId === post.id;
                  const _seen = new Set();
                  const campaignGroups = allGroups.filter((g) => {
                    if (!selectedGroupIds.includes(g.id) || _seen.has(g.id)) return false;
                    _seen.add(g.id);
                    return true;
                  });
                  return (
                    <div key={post.id} className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-800">{post.name}</h3>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handlePublishAll(post.id)}
                            disabled={publishAll?.status === 'running'}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800 border border-purple-300 hover:border-purple-500 rounded-lg px-2.5 py-1 transition-colors disabled:opacity-40"
                          >
                            פרסם לכל הקבוצות
                          </button>
                          <button
                            onClick={() => {
                              if (isTestOpen) {
                                setTestPublish(null);
                              } else {
                                setTestPublish({ postId: post.id, groupId: campaignGroups[0]?.id || '', loading: false, result: null });
                              }
                            }}
                            className="text-xs font-medium text-green-600 hover:text-green-800 border border-green-300 hover:border-green-500 rounded-lg px-2.5 py-1 transition-colors"
                          >
                            פרסם לניסיון
                          </button>
                          <button
                            onClick={() => { setEditingPost(post); setShowPostForm(true); }}
                            className="text-brand-600 hover:text-blue-800 text-sm"
                          >
                            עריכה
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            מחיקה
                          </button>
                        </div>
                      </div>

                      <p className="text-brand-600 text-sm whitespace-pre-wrap line-clamp-3">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {post.images.map((img, i) => (
                            <img key={i} src={`/uploads/${img}`} alt=""
                              className="w-16 h-16 object-cover rounded-lg border border-brand-100" />
                          ))}
                        </div>
                      )}

                      {/* Publish-all live log panel */}
                      {isPublishAllOpen && (
                        <div className="mt-4 pt-4 border-t border-brand-50">
                          {publishAll.status === 'done' ? (() => {
                            const successLogs = publishAll.logs.filter((l) => l.type === 'result' && l.success);
                            const failLogs = publishAll.logs.filter((l) => l.type === 'result' && !l.success);
                            const totalMembers = successLogs.reduce((sum, log) => {
                              const g = allGroups.find((ag) => ag.id === log.groupId);
                              return sum + parseMemberCount(g?.members_count);
                            }, 0);
                            const successRate = publishAll.total > 0
                              ? Math.round((publishAll.successCount / publishAll.total) * 100)
                              : 100;
                            return (
                              <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="px-5 pt-5 pb-4">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="font-bold text-brand-800 text-sm leading-tight">הפרסום הושלם!</p>
                                        <p className="text-xs text-brand-500 truncate max-w-[220px]">{post.name}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setPublishAll(null)}
                                      className="text-brand-200 hover:text-brand-500 transition-colors mt-0.5"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Property badges */}
                                  {(post.price || post.location || post.bedrooms || post.bathrooms) && (
                                    <div className="flex gap-2 flex-wrap mb-4">
                                      {post.price && (
                                        <span className="inline-flex items-center gap-1.5 bg-white border border-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          ₪{Number(post.price).toLocaleString('he-IL')}
                                        </span>
                                      )}
                                      {post.location && (
                                        <span className="inline-flex items-center gap-1.5 bg-white border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          {post.location}
                                        </span>
                                      )}
                                      {post.bedrooms && (
                                        <span className="inline-flex items-center gap-1.5 bg-white border border-brand-50 text-brand-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                          </svg>
                                          {post.bedrooms} חד׳
                                        </span>
                                      )}
                                      {post.bathrooms && (
                                        <span className="inline-flex items-center gap-1.5 bg-white border border-brand-50 text-brand-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {post.bathrooms} אמב׳
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Stats grid */}
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-white">
                                      <p className="text-2xl font-bold text-purple-600 leading-none mb-1">{publishAll.successCount}</p>
                                      <p className="text-[11px] text-brand-300">קבוצות פורסמו</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-white">
                                      <p className="text-2xl font-bold text-brand-600 leading-none mb-1">
                                        {totalMembers > 0 ? fmtMembers(totalMembers) : '—'}
                                      </p>
                                      <p className="text-[11px] text-brand-300">פוטנציאל חשיפה</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-white">
                                      {publishAll.failedCount > 0 ? (
                                        <>
                                          <p className="text-2xl font-bold text-red-500 leading-none mb-1">{publishAll.failedCount}</p>
                                          <p className="text-[11px] text-brand-300">נכשלו</p>
                                        </>
                                      ) : (
                                        <>
                                          <p className="text-2xl font-bold text-green-500 leading-none mb-1">{successRate}%</p>
                                          <p className="text-[11px] text-brand-300">הצלחה</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Group breakdown */}
                                <div className="border-t border-purple-100 px-4 py-3 space-y-1 max-h-52 overflow-y-auto" dir="rtl">
                                  {successLogs.map((log, i) => {
                                    const g = allGroups.find((ag) => ag.id === log.groupId);
                                    const mem = parseMemberCount(g?.members_count);
                                    return (
                                      <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-white/60 transition-colors">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">✓</span>
                                          <span className="font-medium text-brand-700 truncate">{log.groupName}</span>
                                          {log.postUrl && (
                                            <a href={log.postUrl} target="_blank" rel="noreferrer"
                                              className="text-blue-400 hover:text-brand-600 flex-shrink-0">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </a>
                                          )}
                                        </div>
                                        {mem > 0 && (
                                          <span className="text-brand-300 flex-shrink-0 mr-2 font-medium">{fmtMembers(mem)}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {failLogs.map((log, i) => (
                                    <div key={`f${i}`} className="flex items-start gap-2 text-xs py-1.5 px-2 rounded-lg bg-red-50">
                                      <span className="w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">✕</span>
                                      <div className="min-w-0">
                                        <p className="font-medium text-red-700">{log.groupName}</p>
                                        {log.error && <p className="text-red-400 truncate mt-0.5">{log.error}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })() : (
                            <>
                              {/* Running / stopped header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-brand-800">
                                    {publishAll.status === 'running' ? 'מפרסם לקבוצות...' : 'פרסום עצר'}
                                  </span>
                                  {publishAll.total > 0 && (
                                    <span className="text-xs text-brand-500">
                                      {Math.min(publishAll.done, publishAll.total)} / {publishAll.total}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {publishAll.status === 'running' && (
                                    <button
                                      onClick={stopPublishAll}
                                      className="text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500 rounded-lg px-2.5 py-1 transition-colors"
                                    >
                                      עצור
                                    </button>
                                  )}
                                  {publishAll.status === 'stopped' && (
                                    <>
                                      <button
                                        onClick={() => handleResumePublishAll(post.id)}
                                        className="text-xs font-medium text-purple-600 hover:text-purple-800 border border-purple-300 hover:border-purple-500 rounded-lg px-2.5 py-1 transition-colors"
                                      >
                                        המשך פרסום ({publishAll.remainingGroups?.length || 0} נותרו)
                                      </button>
                                      <button
                                        onClick={() => setPublishAll(null)}
                                        className="text-xs text-brand-300 hover:text-brand-600"
                                      >
                                        סגור
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Progress bar */}
                              {publishAll.total > 0 && (
                                <div className="w-full bg-brand-100/60 rounded-full h-1.5 mb-3">
                                  <div
                                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(Math.min(publishAll.done, publishAll.total) / publishAll.total) * 100}%` }}
                                  />
                                </div>
                              )}

                              {/* Live log lines */}
                              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1" dir="rtl">
                                {publishAll.logs.map((log, i) => {
                                  if (log.type === 'posting') {
                                    return (
                                      <div key={i} className="flex items-center gap-2 text-xs text-brand-500">
                                        <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                        <span>מפרסם לקבוצה <strong className="text-brand-700">{log.groupName}</strong>...</span>
                                      </div>
                                    );
                                  }
                                  if (log.type === 'result') {
                                    return (
                                      <div key={i} className={`text-xs ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.success ? (
                                          <span>
                                            &#x2713; <strong>{log.groupName}</strong> — פורסם ({Math.round((log.duration || 0) / 1000)}s)
                                            {log.postUrl && (
                                              <a href={log.postUrl} target="_blank" rel="noreferrer"
                                                className="mr-2 text-brand-500 hover:underline">
                                                צפה בפוסט &#x2197;
                                              </a>
                                            )}
                                          </span>
                                        ) : (
                                          <div>
                                            <span>&#x2717; <strong>{log.groupName}</strong> — כשל בשלב <code className="bg-red-50 px-1 rounded">{log.step}</code></span>
                                            <p className="text-red-400 mt-0.5 pr-4 break-words">{log.error}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                  if (log.type === 'waiting') {
                                    return (
                                      <div key={i} className="flex items-center gap-2 text-xs text-brand-300 italic">
                                        <span>&#x23F8;</span>
                                        <span>ממתין {log.seconds}ש׳ לפני: <strong>{log.nextGroupName}</strong></span>
                                      </div>
                                    );
                                  }
                                  if (log.type === 'error') {
                                    return (
                                      <div key={i} className="text-xs text-red-500">&#x2717; {log.error}</div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Test-publish panel */}
                      {isTestOpen && (
                        <div className="mt-4 pt-4 border-t border-brand-50">
                          {testPublish.result ? (
                            <div className={`flex items-center gap-2 text-sm font-medium flex-wrap ${testPublish.result.success ? 'text-green-600' : 'text-red-600'}`}>
                              {testPublish.result.success ? (
                                <>
                                  <span>&#x2713; הפוסט פורסם בהצלחה!</span>
                                  {testPublish.result.postUrl && (
                                    <a href={testPublish.result.postUrl} target="_blank" rel="noreferrer"
                                      className="text-brand-500 hover:underline text-xs font-normal">
                                      צפה בפוסט &#x2197;
                                    </a>
                                  )}
                                </>
                              ) : (
                                <span>&#x2717; שגיאה: {testPublish.result.error}</span>
                              )}
                              <button onClick={() => setTestPublish(null)} className="text-xs text-brand-300 hover:text-brand-600 mr-2">סגור</button>
                            </div>
                          ) : campaignGroups.length === 0 ? (
                            <p className="text-sm text-brand-300">אין קבוצות מוקצות לקמפיין זה. הוסף קבוצות בטאב "קבוצות".</p>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="text-sm text-brand-600">בחר קבוצה:</label>
                              <select
                                value={testPublish.groupId}
                                onChange={(e) => setTestPublish((p) => ({ ...p, groupId: e.target.value }))}
                                className="border border-brand-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                {campaignGroups.map((g) => (
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleTestPublish(post.id, testPublish.groupId)}
                                disabled={testPublish.loading || !testPublish.groupId}
                                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors"
                              >
                                {testPublish.loading
                                  ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> מפרסם...</>
                                  : 'שלח עכשיו'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-800">
                קבוצות ({selectedGroupIds.length} נבחרו)
              </h2>
              <div className="flex gap-2 flex-wrap">
                {enriching?.status === 'running' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-600">{enriching.done}/{enriching.total}</span>
                    <button
                      onClick={stopEnrichMembers}
                      className="border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      עצור
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnrichMembers}
                    disabled={syncing}
                    className="border border-brand-300 text-brand-600 hover:bg-brand-50 font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    עדכן מספר חברים
                  </button>
                )}
                <button
                  onClick={handleSyncGroups}
                  disabled={syncing || enriching?.status === 'running'}
                  className="border border-brand-200 text-brand-700 hover:bg-brand-50 font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50 transition-colors"
                >
                  {syncing ? 'מסנכרן...' : 'סנכרן מפייסבוק'}
                </button>
                <button
                  onClick={handleSaveGroups}
                  disabled={savingGroups}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                >
                  {savingGroups ? 'שומר...' : 'שמור בחירה'}
                </button>
              </div>
            </div>

            {/* Collection picker */}
            {allCollections.length > 0 && (
              <div className="mb-5 p-4 bg-brand-50 border border-brand-100 rounded-2xl">
                <p className="text-xs font-semibold text-brand-700 mb-2">בחר מספרייה — יוסיף את כל קבוצותיה לבחירה</p>
                <div className="flex flex-wrap gap-2">
                  {allCollections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => applyCollection(col)}
                      className="inline-flex items-center gap-1.5 bg-white border border-brand-200 hover:border-indigo-400 hover:bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {col.name}
                      <span className="text-indigo-400">({col.groups.length})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enrich progress bar */}
            {enriching && enriching.total > 0 && (
              <div className="mb-4">
                <div className="w-full bg-brand-100/60 rounded-full h-1.5">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(enriching.done / enriching.total) * 100}%` }}
                  />
                </div>
                {enriching.status === 'done' && (
                  <p className="text-xs text-brand-300 mt-1">
                    עודכנו {enriching.done - enriching.failed} קבוצות
                    {enriching.failed > 0 && ` · ${enriching.failed} נכשלו`}
                  </p>
                )}
              </div>
            )}

            {allGroups.length > 0 && (
              <input
                type="text"
                placeholder="חיפוש קבוצה..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}

            {allGroups.length === 0 ? (
              <div className="text-center py-16 text-brand-300">
                <p className="text-lg mb-1">לא נמצאו קבוצות</p>
                <p className="text-sm">לחץ "סנכרן מפייסבוק" כדי לטעון את הקבוצות שלך</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allGroups
                  .filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                  .map((group) => {
                  const selected = selectedGroupIds.includes(group.id);
                  return (
                    <div
                      key={group.id}
                      onClick={() => toggleGroup(group.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-brand-200 bg-white hover:border-brand-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-brand-500 bg-brand-500' : 'border-brand-200'
                          }`}
                        >
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-brand-800 text-sm truncate">{group.name}</p>
                          <p className="text-xs text-brand-300 truncate">
                            {group.members_count ? `${group.members_count} חברים · ` : ''}{group.fb_group_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Runs Summary Tab */}
        {activeTab === 'runs' && (() => {
          const grouped = [];
          const seen = new Map();
          for (const log of logs) {
            if (!seen.has(log.post_id)) {
              const entry = { post_id: log.post_id, post_name: log.post_name, price: log.price, location: log.location, bedrooms: log.bedrooms, bathrooms: log.bathrooms, latest: log.posted_at, rows: [] };
              seen.set(log.post_id, entry);
              grouped.push(entry);
            }
            seen.get(log.post_id).rows.push(log);
          }

          const totalPublished = grouped.reduce((s, g) => s + g.rows.filter((r) => r.status === 'success').length, 0);
          const totalExposure = grouped.reduce((s, g) => s + g.rows.filter((r) => r.status === 'success').reduce((ss, r) => ss + parseMemberCount(r.members_count), 0), 0);
          const totalRuns = grouped.length;

          return (
            <div>
              {grouped.length === 0 ? (
                <div className="text-center py-20 text-brand-300">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg font-medium">אין ריצות עדיין</p>
                  <p className="text-sm mt-1">לחץ "פרסם לכל הקבוצות" כדי להתחיל</p>
                </div>
              ) : (
                <>
                  {/* Aggregate totals bar */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl border border-brand-50 shadow-sm p-4 text-center">
                      <p className="text-3xl font-bold text-brand-800 leading-none mb-1">{totalRuns}</p>
                      <p className="text-xs text-brand-300">ריצות פרסום</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-brand-50 shadow-sm p-4 text-center">
                      <p className="text-3xl font-bold text-purple-600 leading-none mb-1">{totalPublished}</p>
                      <p className="text-xs text-brand-300">פרסומים מוצלחים</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl shadow-sm p-4 text-center">
                      <p className="text-3xl font-bold text-white leading-none mb-1">
                        {totalExposure > 0 ? fmtMembers(totalExposure) : '—'}
                      </p>
                      <p className="text-xs text-white/70">חשיפה פוטנציאלית</p>
                    </div>
                  </div>

                  {/* Run cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {grouped.map((group) => {
                      const successRows = group.rows.filter((r) => r.status === 'success');
                      const failRows = group.rows.filter((r) => r.status === 'error');
                      const exposure = successRows.reduce((s, r) => s + parseMemberCount(r.members_count), 0);
                      const successRate = group.rows.length > 0 ? Math.round((successRows.length / group.rows.length) * 100) : 0;
                      return (
                        <button
                          key={group.post_id}
                          onClick={() => setSummaryModal(group)}
                          className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 text-right hover:shadow-md hover:border-purple-200 transition-all group"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 text-right">
                              <p className="font-bold text-brand-800 text-sm leading-tight truncate">{group.post_name}</p>
                              <p className="text-xs text-brand-300 mt-0.5">
                                {new Date(group.latest).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
                              </p>
                            </div>
                            <div className="w-8 h-8 bg-purple-50 group-hover:bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 transition-colors">
                              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          </div>

                          {/* Property badges */}
                          {(group.price || group.location || group.bedrooms) && (
                            <div className="flex gap-1.5 flex-wrap mb-3">
                              {group.price && (
                                <span className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                  ₪{Number(group.price).toLocaleString('he-IL')}
                                </span>
                              )}
                              {group.location && (
                                <span className="text-[11px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{group.location}</span>
                              )}
                              {group.bedrooms && (
                                <span className="text-[11px] bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full">{group.bedrooms} חד׳</span>
                              )}
                            </div>
                          )}

                          {/* Stats row */}
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-100">
                            <div className="text-center">
                              <p className="text-lg font-bold text-purple-600 leading-none">{successRows.length}</p>
                              <p className="text-[10px] text-brand-300 mt-0.5">קבוצות</p>
                            </div>
                            <div className="text-center border-x border-brand-100">
                              <p className="text-lg font-bold text-brand-600 leading-none">{exposure > 0 ? fmtMembers(exposure) : '—'}</p>
                              <p className="text-[10px] text-brand-300 mt-0.5">חשיפה</p>
                            </div>
                            <div className="text-center">
                              {failRows.length > 0 ? (
                                <>
                                  <p className="text-lg font-bold text-red-500 leading-none">{failRows.length}</p>
                                  <p className="text-[10px] text-brand-300 mt-0.5">כשלים</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-lg font-bold text-green-500 leading-none">{successRate}%</p>
                                  <p className="text-[10px] text-brand-300 mt-0.5">הצלחה</p>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Logs Tab */}
        {activeTab === 'logs' && (() => {
          // Group logs by post_id (order preserved from server: newest first)
          const grouped = [];
          const seen = new Map();
          for (const log of logs) {
            if (!seen.has(log.post_id)) {
              const entry = { post_id: log.post_id, post_name: log.post_name, price: log.price, location: log.location, bedrooms: log.bedrooms, bathrooms: log.bathrooms, latest: log.posted_at, rows: [] };
              seen.set(log.post_id, entry);
              grouped.push(entry);
            }
            seen.get(log.post_id).rows.push(log);
          }
          return (
            <div>
              <h2 className="text-lg font-semibold text-brand-800 mb-4">היסטוריית פרסומים</h2>
              {grouped.length === 0 ? (
                <div className="text-center py-16 text-brand-300">
                  <p>אין פרסומים עדיין</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {grouped.map((group) => {
                    const successCount = group.rows.filter((r) => r.status === 'success').length;
                    const failCount = group.rows.length - successCount;
                    return (
                      <div key={group.post_id} className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
                        {/* Post group header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-brand-50 border-b border-brand-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <p className="font-semibold text-brand-800 text-sm truncate">{group.post_name}</p>
                            <span className="text-xs text-brand-300 flex-shrink-0">
                              {new Date(group.latest).toLocaleDateString('he-IL')}
                            </span>
                            <div className="flex gap-1.5 flex-shrink-0">
                              {successCount > 0 && (
                                <span className="text-[11px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {successCount} הצלחות
                                </span>
                              )}
                              {failCount > 0 && (
                                <span className="text-[11px] font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                  {failCount} כשלים
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setSummaryModal(group)}
                            className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            סיכום ריצה
                          </button>
                        </div>
                        {/* Individual log rows */}
                        <div className="divide-y divide-gray-50">
                          {group.rows.map((log) => (
                            <div key={log.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-brand-700 truncate">{log.group_name}</p>
                                {log.error && <p className="text-xs text-red-400 truncate mt-0.5">{log.error}</p>}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {log.post_url && (
                                  <a href={log.post_url} target="_blank" rel="noreferrer"
                                    className="text-xs text-brand-500 hover:underline">
                                    צפה &#x2197;
                                  </a>
                                )}
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {log.status === 'success' ? 'הצלחה' : 'שגיאה'}
                                </span>
                                <span className="text-xs text-brand-300">
                                  {new Date(log.posted_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Run Summary Modal */}
      {summaryModal && (() => {
        const successRows = summaryModal.rows.filter((r) => r.status === 'success');
        const failRows = summaryModal.rows.filter((r) => r.status === 'error');
        const totalMembers = successRows.reduce((sum, r) => sum + parseMemberCount(r.members_count), 0);
        const successRate = summaryModal.rows.length > 0
          ? Math.round((successRows.length / summaryModal.rows.length) * 100)
          : 0;
        return (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSummaryModal(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient header */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-500 px-6 pt-6 pb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-base leading-tight">{summaryModal.post_name}</p>
                      <p className="text-white/60 text-xs mt-0.5">
                        {new Date(summaryModal.latest).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSummaryModal(null)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Property badges */}
                {(summaryModal.price || summaryModal.location || summaryModal.bedrooms || summaryModal.bathrooms) && (
                  <div className="flex gap-2 flex-wrap mb-5">
                    {summaryModal.price && (
                      <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ₪{Number(summaryModal.price).toLocaleString('he-IL')}
                      </span>
                    )}
                    {summaryModal.location && (
                      <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {summaryModal.location}
                      </span>
                    )}
                    {summaryModal.bedrooms && (
                      <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {summaryModal.bedrooms} חד׳
                      </span>
                    )}
                    {summaryModal.bathrooms && (
                      <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {summaryModal.bathrooms} אמב׳
                      </span>
                    )}
                  </div>
                )}

                {/* Stats row — floated over the white card below */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-purple-600 leading-none mb-1">{successRows.length}</p>
                    <p className="text-[11px] text-brand-300">קבוצות פורסמו</p>
                  </div>
                  <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-brand-600 leading-none mb-1">
                      {totalMembers > 0 ? fmtMembers(totalMembers) : '—'}
                    </p>
                    <p className="text-[11px] text-brand-300">חשיפה פוטנציאלית</p>
                  </div>
                  <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                    {failRows.length > 0 ? (
                      <>
                        <p className="text-2xl font-bold text-red-500 leading-none mb-1">{failRows.length}</p>
                        <p className="text-[11px] text-brand-300">נכשלו</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-green-500 leading-none mb-1">{successRate}%</p>
                        <p className="text-[11px] text-brand-300">הצלחה</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Group breakdown */}
              <div className="px-4 py-3 max-h-64 overflow-y-auto space-y-1" dir="rtl">
                {successRows.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-2 px-2 rounded-lg hover:bg-brand-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">✓</span>
                      <span className="font-medium text-brand-700 truncate">{r.group_name}</span>
                      {r.post_url && (
                        <a href={r.post_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-brand-600 flex-shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    {parseMemberCount(r.members_count) > 0 && (
                      <span className="text-brand-300 flex-shrink-0 mr-2 font-medium">{fmtMembers(parseMemberCount(r.members_count))}</span>
                    )}
                  </div>
                ))}
                {failRows.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 text-xs py-2 px-2 rounded-lg bg-red-50">
                    <span className="w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">✕</span>
                    <div className="min-w-0">
                      <p className="font-medium text-red-700">{r.group_name}</p>
                      {r.error && <p className="text-red-400 truncate">{r.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
