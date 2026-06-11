"use client";

import { useState } from "react";
import { Share2, ExternalLink, RefreshCw } from "lucide-react";

const AUTOPOSTER_URL = process.env.NEXT_PUBLIC_AUTOPOSTER_URL || "http://localhost:3001";

export function AutoposterSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600">
            <Share2 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">FB Autoposter</h2>
            <p className="text-xs text-muted">Automated group posting across markets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={() => { setError(false); setLoading(true); }}
              className="flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          )}
          <a
            href={AUTOPOSTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <ExternalLink size={14} />
            Open in new tab
          </a>
        </div>
      </div>

      {/* Iframe container */}
      <div className="relative rounded-2xl overflow-hidden border border-stroke bg-surface/50">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4E85BF] border-t-transparent" />
              <p className="text-sm text-muted">Loading Autoposter...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <Share2 size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Cannot connect to Autoposter</h3>
            <p className="text-sm text-muted max-w-md mb-4">
              The autoposter server is not responding. Make sure it&apos;s running and accessible.
            </p>
            <a
              href={AUTOPOSTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] transition-colors cursor-pointer"
            >
              Try opening directly
            </a>
          </div>
        )}

        {!error && (
          <iframe
            src={AUTOPOSTER_URL}
            className="w-full border-0"
            style={{ height: "calc(100vh - 140px)", minHeight: "500px" }}
            allow="clipboard-write"
            title="FB Autoposter"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        )}
      </div>
    </div>
  );
}
