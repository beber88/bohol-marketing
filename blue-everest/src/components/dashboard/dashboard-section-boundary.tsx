"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DashboardSectionBoundaryProps {
  sectionId: string;
  children: ReactNode;
}

interface DashboardSectionBoundaryState {
  hasError: boolean;
  message: string;
}

export class DashboardSectionBoundary extends Component<
  DashboardSectionBoundaryProps,
  DashboardSectionBoundaryState
> {
  state: DashboardSectionBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): DashboardSectionBoundaryState {
    return {
      hasError: true,
      message: error.message || "This dashboard section could not load.",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[dashboard-section]", this.props.sectionId, error, errorInfo);
  }

  componentDidUpdate(prevProps: DashboardSectionBoundaryProps) {
    if (prevProps.sectionId !== this.props.sectionId && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-400" />
        <h2 className="font-display text-lg font-semibold text-text-primary">
          This dashboard section could not load
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          The rest of the dashboard is still available. Try reloading this tab, or switch to another section.
        </p>
        {this.state.message && (
          <p className="mx-auto mt-3 max-w-xl rounded-lg border border-stroke bg-surface p-3 text-xs text-muted">
            {this.state.message}
          </p>
        )}
        <button
          type="button"
          onClick={() => this.setState({ hasError: false, message: "" })}
          className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl border border-stroke bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface/80"
        >
          <RefreshCw size={14} />
          Retry section
        </button>
      </div>
    );
  }
}
