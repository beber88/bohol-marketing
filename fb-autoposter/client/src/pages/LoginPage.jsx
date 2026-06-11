import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useProfile } from '../context/ProfileContext';

const STEP = {
  CHECKING: 'checking',
  DISCONNECTED: 'disconnected',
  BROWSER_OPEN: 'browser_open',
  CONNECTED: 'connected',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { selectedProfileId, selectedProfile, setFbLoginStatus } = useProfile();
  const [step, setStep] = useState(STEP.CHECKING);
  const [fbUser, setFbUser] = useState(null);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    setStep(STEP.CHECKING);
    setFbUser(null);
    checkOnce();
    return () => stopPolling();
  }, [selectedProfileId]);

  async function checkOnce() {
    try {
      const res = await auth.liveStatus(selectedProfileId);
      if (res.data.loggedIn) {
        onLoggedIn(res.data);
      } else {
        setStep(STEP.DISCONNECTED);
      }
    } catch {
      setStep(STEP.DISCONNECTED);
    }
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await auth.liveStatus(selectedProfileId);
        if (res.data.loggedIn) {
          stopPolling();
          onLoggedIn(res.data);
        }
      } catch {}
    }, 2000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function onLoggedIn(data) {
    const user = { userName: data.userName || 'משתמש', profilePic: data.profilePic || null };
    setFbUser(user);
    setFbLoginStatus({ loggedIn: true, ...user });
    setStep(STEP.CONNECTED);
  }

  async function handleOpenBrowser() {
    setError('');
    try {
      await auth.openBrowser(selectedProfileId);
      setStep(STEP.BROWSER_OPEN);
      startPolling();
    } catch {
      setError('לא ניתן לפתוח את הדפדפן. האם השרת פועל?');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-40" />
      </div>

      <div className="w-full max-w-sm mx-4 relative">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-semibold text-brand-800 tracking-wide">AutoPost</h1>
          <p className="text-brand-500 text-sm font-body font-medium mt-1.5 tracking-wide">Panglao Prime Villas - פרסום אוטומטי</p>
        </div>

        {/* Agent name badge */}
        {selectedProfile && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-white border border-brand-200 rounded-full px-4 py-1.5 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{selectedProfile.name[0]}</span>
              </div>
              <span className="text-sm font-medium text-brand-700">{selectedProfile.name}</span>
              {!selectedProfile.proxy_url && (
                <span className="text-xs text-amber-500">ללא proxy</span>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">

          <div className={`h-1 w-full transition-colors duration-500 ${
            step === STEP.CONNECTED ? 'bg-green-400' :
            step === STEP.BROWSER_OPEN ? 'bg-amber-400' :
            step === STEP.CHECKING ? 'bg-brand-200 animate-pulse' :
            'bg-brand-100'
          }`} />

          <div className="px-8 py-8 space-y-6">

            <div className="flex justify-center">
              <StatusBadge step={step} />
            </div>

            {step === STEP.CHECKING && (
              <div className="flex justify-center py-4"><Spinner /></div>
            )}

            {step === STEP.DISCONNECTED && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 text-center font-body">
                    {error}
                  </div>
                )}
                <p className="text-brand-600 text-sm text-center leading-relaxed font-body">
                  לחץ על הכפתור ותיפתח חלון Chrome לפייסבוק.<br />
                  התחבר עם פרטי <strong>{selectedProfile?.name || 'הסוכן'}</strong> — המערכת תזהה אוטומטית.
                </p>
                <button
                  onClick={handleOpenBrowser}
                  className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2.5 cursor-pointer font-body tracking-wide"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  התחבר לפייסבוק
                </button>
                <button
                  onClick={() => navigate('/profiles')}
                  className="w-full text-brand-500 hover:text-brand-700 text-sm text-center transition-colors"
                >
                  ניהול סוכנים →
                </button>
              </div>
            )}

            {step === STEP.BROWSER_OPEN && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-center font-body">
                  <p className="font-semibold text-amber-800 mb-2">נפתח חלון Chrome</p>
                  <p className="text-amber-600 leading-relaxed">
                    התחבר לפייסבוק בחלון שנפתח.<br />
                    אם נדרש אימות דו-שלבי — הזן אותו שם.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 text-brand-400 text-sm font-body">
                  <Spinner small />
                  <span>בודק כל 2 שניות...</span>
                </div>
              </div>
            )}

            {step === STEP.CONNECTED && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-brand-50 rounded-xl p-4 border border-brand-100">
                  {fbUser?.profilePic ? (
                    <img
                      src={fbUser.profilePic}
                      alt={fbUser.userName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center ring-2 ring-white shadow flex-shrink-0">
                      <span className="text-brand-700 font-bold text-lg font-body">
                        {fbUser?.userName?.[0] ?? '?'}
                      </span>
                    </div>
                  )}
                  <div className="text-right flex-1 min-w-0">
                    <p className="font-semibold text-brand-800 truncate font-body">{fbUser?.userName}</p>
                    <p className="text-sm text-brand-400 font-body">מחובר לפייסבוק</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/campaigns')}
                  className="w-full bg-cta hover:bg-cta-dark text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer font-body tracking-wide"
                >
                  כניסה לדשבורד
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            )}

          </div>
        </div>

        <p className="text-center text-brand-400 text-xs font-body mt-6">
          AutoPost © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ step }) {
  const map = {
    checking:     { label: 'בודק סטטוס...', dot: 'bg-brand-300 animate-pulse', ring: 'bg-brand-50 text-brand-500 border-brand-100' },
    disconnected: { label: 'לא מחובר',       dot: 'bg-red-400',                  ring: 'bg-red-50 text-red-600 border-red-100' },
    browser_open: { label: 'ממתין להתחברות...', dot: 'bg-amber-400 animate-pulse', ring: 'bg-amber-50 text-amber-700 border-amber-100' },
    connected:    { label: 'מחובר',           dot: 'bg-green-400',               ring: 'bg-green-50 text-green-700 border-green-100' },
  };
  const s = map[step];
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium font-body ${s.ring}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Spinner({ small }) {
  return (
    <span className={`border-2 border-brand-500 border-t-transparent rounded-full animate-spin inline-block ${small ? 'w-4 h-4' : 'w-6 h-6'}`} />
  );
}
