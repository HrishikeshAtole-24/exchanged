'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { marketService } from '@/services/market.service';
import { formatCurrency, formatPercent } from '@/utils/formatCurrency';
import styles from './Header.module.css';

function TickerBar() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await marketService.getMarkets({ per_page: 20, page: 1 });
        if (!cancelled && res.data) setCoins(res.data);
      } catch { /* silent */ }
    })();
    const id = setInterval(async () => {
      try {
        const res = await marketService.getMarkets({ per_page: 20, page: 1 });
        if (!cancelled && res.data) setCoins(res.data);
      } catch { /* silent */ }
    }, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!coins.length) return <div className={styles.ticker} />;

  const doubled = [...coins, ...coins];

  return (
    <div className={styles.ticker}>
      <div className={styles.tickerTrack}>
        {doubled.map((c, i) => (
          <div key={`${c.id}-${i}`} className={styles.tickerItem}>
            <span className={styles.tickerName}>
              {c.symbol?.toUpperCase()}
            </span>
            <span className={styles.tickerPrice}>
              {formatCurrency(c.current_price)}
            </span>
            <span className={c.price_change_percentage_24h >= 0 ? 'text-green' : 'text-red'}>
              {formatPercent(c.price_change_percentage_24h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/exchanges', label: 'Exchanges' },
  { href: '/portfolio', label: 'Portfolio' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, token, logout, fetchMe } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const { login, register, loading } = useAuthStore();

  useEffect(() => {
    if (token && !user) fetchMe();
  }, [token, user, fetchMe]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const ok = authMode === 'login' ? await login(email, password) : await register(email, password);
    if (ok) {
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } else {
      setAuthError(useAuthStore.getState().error || 'Something went wrong');
    }
  };

  return (
    <header className={styles.header}>
      <TickerBar />

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoAccent}>ex</span>changed
          </Link>

          <div className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ''}`}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.navRight}>
            {token && user ? (
              <div className={styles.userMenu}>
                <span className={styles.userEmail}>{user.email}</span>
                <button className={styles.logoutBtn} onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button
                className={styles.authBtn}
                onClick={() => { setShowAuth(true); setAuthMode('login'); }}
              >
                Sign In
              </button>
            )}

            <button
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              {authError && <p className="form-error">{authError}</p>}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: 12 }}
              >
                {loading ? 'Please wait…' : authMode === 'login' ? 'Sign In' : 'Register'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: '0.8125rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {authMode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
