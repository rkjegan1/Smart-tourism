import { useRef, useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CompassIcon } from './Icons';
import Toast from './Toast';
import CloudStatusDrawer from './CloudStatusDrawer';
import { getHealth } from '../api';

export default function Layout({ user, onLogout, toasts, dismissToast, theme, onThemeChange }) {
  const [cloudDrawerOpen, setCloudDrawerOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState({ healthy: true, latency: null });

  const compassRef = useRef(null);
  const compassFrameRef = useRef(null);
  const compassAngleRef = useRef(0);
  const compassSpeedRef = useRef(0.18);

  useEffect(() => {
    let isMounted = true;
    const pingCloud = async () => {
      const start = performance.now();
      try {
        const data = await getHealth();
        const end = performance.now();
        if (isMounted) {
          setCloudStatus({
            healthy: data.status === 'healthy',
            latency: Math.round(end - start),
          });
        }
      } catch {
        if (isMounted) {
          setCloudStatus({ healthy: false, latency: null });
        }
      }
    };

    pingCloud();
    const interval = setInterval(pingCloud, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const linkClass = ({ isActive }) =>
    `nav-link text-sm ${isActive ? 'nav-link--active after:w-full' : ''}`;

  const startCompassSpin = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || compassFrameRef.current) return;

    let lastTime = performance.now();
    const spin = (now) => {
      const elapsed = Math.min(now - lastTime, 50);
      lastTime = now;
      compassSpeedRef.current = Math.min(compassSpeedRef.current + elapsed * 0.0012, 1.65);
      compassAngleRef.current += compassSpeedRef.current * elapsed;
      if (compassRef.current) {
        compassRef.current.style.transform = `rotate(${compassAngleRef.current}deg)`;
      }
      compassFrameRef.current = requestAnimationFrame(spin);
    };

    compassFrameRef.current = requestAnimationFrame(spin);
  };

  const stopCompassSpin = () => {
    if (compassFrameRef.current) cancelAnimationFrame(compassFrameRef.current);
    compassFrameRef.current = null;
    compassAngleRef.current = 0;
    compassSpeedRef.current = 0.18;
    if (compassRef.current) compassRef.current.style.transform = 'rotate(0deg)';
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ─── Navbar ──────────────────────────────────────── */}
      <nav className="bg-primary-dark/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group no-underline" aria-label="Smart Tourism home">
              <div
                className="brand-mark w-9 h-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                onMouseEnter={startCompassSpin}
                onMouseLeave={stopCompassSpin}
              >
                <CompassIcon ref={compassRef} className="brand-compass w-6 h-6" />
              </div>
              <span className="hidden sm:block text-white text-lg font-semibold tracking-[-0.035em]">
                Smart Tourism
              </span>
            </NavLink>

            {/* Nav Links */}
            <div className="flex items-center gap-3 sm:gap-5 lg:gap-7">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/explore" className={linkClass}>
                Explore
              </NavLink>
              <NavLink to="/recommend" className={linkClass}>
                Recommend
              </NavLink>
              <NavLink to="/architecture" className={linkClass}>
                Architecture
              </NavLink>

              {/* Live AWS Cloud Architecture Telemetry Pill */}
              <button
                type="button"
                onClick={() => setCloudDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="View live AWS Cloud Architecture telemetry & diagnostics"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      cloudStatus.healthy ? 'bg-emerald-400' : 'bg-amber-400'
                    } opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      cloudStatus.healthy ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="hidden md:inline font-medium tracking-tight">Cloud Status</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    cloudStatus.healthy
                      ? 'bg-emerald-500/25 text-emerald-300'
                      : 'bg-amber-500/25 text-amber-300'
                  }`}
                >
                  {cloudStatus.latency !== null ? `${cloudStatus.latency}ms` : 'Live'}
                </span>
              </button>

              <div className="theme-switcher hidden lg:flex" aria-label="Choose a theme">
                {['light', 'dark', 'beach'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`theme-choice ${theme === option ? 'is-active' : ''}`}
                    onClick={() => onThemeChange(option)}
                    aria-pressed={theme === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <select
                className="theme-mobile-select lg:hidden"
                value={theme}
                onChange={(event) => onThemeChange(event.target.value)}
                aria-label="Choose a theme"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="beach">Beach</option>
              </select>

              {user ? (
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                  <span className="text-white/50 text-sm hidden sm:block">
                    {user.name}
                  </span>
                  <button onClick={onLogout} className="btn-ghost text-sm py-1.5 px-3">
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Toast Layer ─────────────────────────────────── */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ─── Page Content ────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      <div className="beach-waves" aria-hidden="true">
        <span className="beach-wave beach-wave-back" />
        <span className="beach-wave beach-wave-front" />
        <span className="beach-crab beach-crab-one">🦀</span>
        <span className="beach-crab beach-crab-two">🦀</span>
        <span className="beach-crab beach-crab-three">🦀</span>
        <span className="beach-crab beach-crab-four">🦀</span>
        <span className="beach-crab beach-crab-five">🦀</span>
        <span className="beach-crab beach-crab-six">🦀</span>
        <span className="beach-crab beach-crab-seven">🦀</span>
        <span className="beach-float beach-float-one">🛟</span>
        <span className="beach-float beach-float-two">🛟</span>
        <span className="beach-float beach-float-three">🛟</span>
        <span className="beach-fish beach-fish-one">🐟</span>
        <span className="beach-fish beach-fish-two">🐠</span>
        <span className="beach-fish beach-fish-three">🐟</span>
      </div>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="bg-primary-dark mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="brand-mark w-7 h-7 flex items-center justify-center">
                <CompassIcon className="w-4 h-4" />
              </div>
              <span className="text-white/70 text-sm font-semibold">Smart Tourism</span>
            </div>
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} Smart Tourism. Crafted with care for travelers.
            </p>
          </div>
        </div>
      </footer>

      {/* ─── Cloud Architecture Telemetry Drawer ─────────── */}
      <CloudStatusDrawer
        isOpen={cloudDrawerOpen}
        onClose={() => setCloudDrawerOpen(false)}
      />
    </div>
  );
}
