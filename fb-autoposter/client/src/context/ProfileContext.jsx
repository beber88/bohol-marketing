import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profilesApi, auth } from '../api';

const ProfileContext = createContext(null);

const SELECTED_KEY = 'fb_autoposter_selected_profile';

export function ProfileProvider({ children }) {
  const [agentProfiles, setAgentProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileIdState] = useState(
    () => localStorage.getItem(SELECTED_KEY) || 'default'
  );
  const [fbLoginStatus, setFbLoginStatus] = useState(null); // null = unchecked, { loggedIn, userName }
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const loadProfiles = useCallback(async () => {
    try {
      const res = await profilesApi.list();
      setAgentProfiles(res.data);
    } catch {}
    setLoadingProfiles(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  // Check FB status silently whenever the selected profile changes
  useEffect(() => {
    setFbLoginStatus(null);
    auth.status(selectedProfileId)
      .then((res) => setFbLoginStatus(res.data))
      .catch(() => setFbLoginStatus({ loggedIn: false }));
  }, [selectedProfileId]);

  const checkLoginStatus = useCallback(async (profileId) => {
    try {
      const res = await auth.status(profileId || selectedProfileId);
      setFbLoginStatus(res.data);
      return res.data;
    } catch {
      setFbLoginStatus({ loggedIn: false });
      return { loggedIn: false };
    }
  }, [selectedProfileId]);

  function selectProfile(profileId) {
    setSelectedProfileIdState(profileId);
    localStorage.setItem(SELECTED_KEY, profileId);
    setFbLoginStatus(null);
  }

  const selectedProfile = agentProfiles.find((p) => p.id === selectedProfileId) || null;

  return (
    <ProfileContext.Provider value={{
      agentProfiles,
      loadProfiles,
      loadingProfiles,
      selectedProfileId,
      selectedProfile,
      selectProfile,
      fbLoginStatus,
      setFbLoginStatus,
      checkLoginStatus,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
