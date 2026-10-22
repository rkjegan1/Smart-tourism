import { useState, useEffect } from 'react';
import { getHealth } from '../api';

export default function CloudStatusDrawer({ isOpen, onClose }) {
  const [telemetry, setTelemetry] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setTelemetry(data);
    } catch (err) {
      setError(err.message || 'Unable to reach cloud health endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-primary text-surface shadow-2xl flex flex-col border-l border-white/10 animate-slide-in-right">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-primary-dark/80">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  AWS Cloud Architecture
                </h2>
                <p className="text-xs text-white/50">Live Environment Telemetry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Real-time Status Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-light">
                  System Health
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    telemetry?.status === 'healthy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {loading ? 'Pinging…' : telemetry?.status ? telemetry.status.toUpperCase() : 'OFFLINE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">Round-Trip Latency</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {latency !== null ? `${latency} ms` : '—'}
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">Server Uptime</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {telemetry ? formatUptime(telemetry.uptime) : '—'}
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {error}
                </p>
              )}
            </div>

            {/* AWS Service Topology Breakdown */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Deployed AWS & Cloud Services
              </p>

              {/* CloudFront */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 text-sm font-bold">
                  CF
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Amazon CloudFront</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      HTTPS 443
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Global Edge CDN • Origin Access Control (OAC) • Unified /api/* Ingress
                  </p>
                </div>
              </div>

              {/* S3 */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-sm font-bold">
                  S3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Amazon S3</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Private
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Vite/React Static SPA • 100% Block Public Access • AES-256 Encrypted
                  </p>
                </div>
              </div>

              {/* Elastic Beanstalk / EC2 */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-sm font-bold">
                  EB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">AWS Elastic Beanstalk (EC2)</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Node.js 20
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Amazon Linux 2023 • Nginx Reverse Proxy • Single-Instance (Zero Cost)
                  </p>
                </div>
              </div>

              {/* CloudWatch */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-sm font-bold">
                  CW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Amazon CloudWatch</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Centralized Logs (/aws/elasticbeanstalk/*) • Health Alarms
                  </p>
                </div>
              </div>

              {/* MongoDB Atlas */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 text-sm font-bold">
                  DB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">MongoDB Atlas</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        telemetry?.database?.connected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {telemetry?.database?.connected ? 'Replica Set Live' : 'Connecting'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    M0 Free Sandbox • TLS 1.3 Transport Encryption • Document Persistence
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture Request Flow Mini-Diagram */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
                Live Data Pipeline
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-white/70 bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-sky-300">Browser</span>
                <span>→</span>
                <span className="text-orange-300">CloudFront</span>
                <span>→</span>
                <span className="text-amber-300">Beanstalk</span>
                <span>→</span>
                <span className="text-emerald-300">Atlas DB</span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/10 bg-primary-dark/80 flex items-center justify-between gap-3">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 rounded-xl"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Pinging Cloud Infrastructure…</span>
                </>
              ) : (
                <>
                  <span>⚡ Ping Cloud Health</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
