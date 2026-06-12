import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const profilesApi = {
  list: () => api.get('/profiles'),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.patch(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

export const auth = {
  status: (profileId) => api.get('/auth/status', { params: { profileId } }),
  liveStatus: (profileId) => api.get('/auth/status', { params: { profileId, live: true } }),
  openBrowser: (profileId) => api.post('/auth/open-browser', { profileId }),
};

export const campaigns = {
  list: (profileId) => api.get('/campaigns', { params: { profileId } }),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.patch(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  setGroups: (id, group_ids) => api.put(`/campaigns/${id}/groups`, { group_ids }),
  logs: (id) => api.get(`/campaigns/${id}/logs`),
};

export const posts = {
  create: (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.patch(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/posts/${id}`),
  publish: (id, group_id) => api.post(`/posts/${id}/publish`, { group_id }),
  validate: (id, market) => api.post(`/posts/${id}/validate`, { market }),
  publishAllUrl: (id, campaignId) => `/api/posts/${id}/publish-all?campaign_id=${campaignId}`,
};

export const groups = {
  list: (profileId) => api.get('/groups', { params: { profileId } }),
  sync: (profileId) => api.post('/groups/sync', { profileId }),
  enrichMembersUrl: (profileId, groupIds, missingOnly) => {
    const params = new URLSearchParams({ profileId });
    if (missingOnly) params.set('missing_only', 'true');
    if (groupIds?.length) params.set('group_ids', groupIds.join(','));
    return `/api/groups/enrich-members?${params}`;
  },
  enrichInfoUrl: (profileId, groupIds, missingOnly) => {
    const params = new URLSearchParams({ profileId });
    if (missingOnly) params.set('missing_only', 'true');
    if (groupIds?.length) params.set('group_ids', groupIds.join(','));
    return `/api/groups/enrich-info?${params}`;
  },
  update: (id, data) => api.patch(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
};

export const collections = {
  list: (profileId) => api.get('/group-collections', { params: { profileId } }),
  create: (name, profileId) => api.post('/group-collections', { name, profileId }),
  rename: (id, name) => api.patch(`/group-collections/${id}`, { name }),
  setGroups: (id, group_ids) => api.put(`/group-collections/${id}/groups`, { group_ids }),
  delete: (id) => api.delete(`/group-collections/${id}`),
};

export const templates = {
  list: (params) => api.get('/templates', { params }),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.patch(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  render: (id, vars) => api.post(`/templates/${id}/render`, { vars }),
  variables: () => api.get('/templates/meta/variables'),
};

export const safety = {
  limits: (profileId) => api.get(`/safety/limits/${profileId}`),
  blockedGroups: (profileId) => api.get(`/safety/blocked-groups/${profileId}`),
  cooldownGroups: (profileId) => api.get(`/safety/cooldown-groups/${profileId}`),
  resetCooldown: (groupId) => api.post(`/safety/reset-cooldown/${groupId}`),
  dashboard: () => api.get('/safety/dashboard'),
};

export const reports = {
  daily: (date) => api.get('/reports/daily', { params: { date } }),
};

export const overview = {
  get: () => api.get('/overview'),
};

export const queueBridge = {
  today: () => api.get('/queue/today'),
  complete: (task_id, results) => api.post('/queue/complete', { task_id, results }),
  status: () => api.get('/queue/status'),
};
