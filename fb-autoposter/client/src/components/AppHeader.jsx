import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

export default function AppHeader({ title, backTo, action }) {
  const navigate = useNavigate();
  const { agentProfiles, selectedProfileId, selectedProfile, selectProfile, fbLoginStatus } = useProfile();

  const isConnected = fbLoginStatus?.loggedIn === true;
  const isChecking = fbLoginStatus === null;

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-brand-100 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between h-16">

        {/* Right: logo + back + title */}
        <div className="flex items-center gap-4">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 transition-colors text-sm font-medium cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              חזרה
            </button>
          )}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/campaigns')}
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-display text-brand-800 font-semibold text-base tracking-wide leading-none block">AutoPost</span>
              {title && title !== 'AutoPost' && (
                <span className="text-brand-500 text-xs font-body font-medium leading-none">{title}</span>
              )}
            </div>
          </div>
        </div>

        {/* Left: actions + nav + agent switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-medium text-brand-500 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors hidden sm:block"
          >
            דוח יומי
          </button>
          <button
            onClick={() => navigate('/groups-library')}
            className="text-xs font-medium text-brand-500 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors hidden sm:block"
          >
            ספריית קבוצות
          </button>
          {action}

          <div className="flex items-center gap-2 pl-3 border-l border-brand-100">

            {/* FB status dot + agent name */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 hover:bg-brand-50 rounded-lg px-2 py-1.5 transition-colors group"
              title={isConnected ? `${fbLoginStatus?.userName || ''} — מחובר לפייסבוק` : 'לא מחובר — לחץ להתחברות'}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {selectedProfile?.name?.[0] ?? '?'}
                  </span>
                </div>
                {/* Connection dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isChecking ? 'bg-brand-200 animate-pulse' :
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </div>

              {/* Name */}
              <span className="text-sm font-medium text-brand-700 max-w-[110px] truncate hidden sm:block">
                {selectedProfile?.name ?? 'פרופיל ראשי'}
              </span>
            </button>

            {/* Agent dropdown */}
            {agentProfiles.length > 1 && (
              <select
                value={selectedProfileId}
                onChange={(e) => selectProfile(e.target.value)}
                className="text-xs text-brand-500 bg-transparent border border-brand-200 rounded-md px-2 py-1 outline-none cursor-pointer"
                title="החלף סוכן"
              >
                {agentProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}

            {/* Manage profiles */}
            <button
              onClick={() => navigate('/profiles')}
              className="p-1.5 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="ניהול סוכנים"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
