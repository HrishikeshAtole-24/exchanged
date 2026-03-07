'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { useMarkets, useTrending, useGlobalStats } from '@/hooks/useMarkets';
import MarketTable from '@/components/market/MarketTable';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatCurrency';
import styles from './Home.module.css';

function GlobalStatsBar() {
  const { data, loading } = useGlobalStats();

  if (loading || !data) {
    return (
      <div className={styles.globalStats}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 28, width: 120 }} />
          </div>
        ))}
      </div>
    );
  }

  const d = data.data || data;

  return (
    <div className={styles.globalStats}>
      <div className="stat-card">
        <div className="stat-label">Total Market Cap</div>
        <div className="stat-value">{formatCurrency(d.total_market_cap?.usd, 'USD', true)}</div>
        <div className={`stat-change ${(d.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'text-green' : 'text-red'}`}>
          {formatPercent(d.market_cap_change_percentage_24h_usd)}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">24h Volume</div>
        <div className="stat-value">{formatCurrency(d.total_volume?.usd, 'USD', true)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">BTC Dominance</div>
        <div className="stat-value">{(d.market_cap_percentage?.btc || 0).toFixed(1)}%</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active Cryptocurrencies</div>
        <div className="stat-value">{formatNumber(d.active_cryptocurrencies)}</div>
      </div>
    </div>
  );
}

function TrendingSection() {
  const { data, loading } = useTrending();

  if (loading) {
    return (
      <section className={styles.trendingSection}>
        <div className="section-header">
          <h2 className="section-title"><FontAwesomeIcon icon={faFire} style={{ color: 'var(--yellow)', marginRight: 8 }} /> Trending</h2>
        </div>
        <div className={styles.trendingGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.trendingCard}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 4 }} />
                <div className="skeleton" style={{ height: 12, width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const trendingCoins = data?.coins || data || [];

  if (!trendingCoins.length) return null;

  return (
    <section className={styles.trendingSection}>
      <div className="section-header">
        <h2 className="section-title"><FontAwesomeIcon icon={faFire} style={{ color: 'var(--yellow)', marginRight: 8 }} /> Trending</h2>
        <Link href="/markets" className="btn btn-ghost btn-sm">View All →</Link>
      </div>
      <div className={styles.trendingGrid}>
        {trendingCoins.slice(0, 6).map((item, i) => {
          const coin = item.item || item;
          return (
            <Link href={`/coins/${coin.id}`} key={coin.id} className={styles.trendingCard}>
              <span className={styles.trendingRank}>{i + 1}</span>
              {(coin.thumb || coin.small || coin.large) && (
                <Image
                  src={coin.thumb || coin.small || coin.large}
                  alt={coin.name}
                  width={36}
                  height={36}
                  className={styles.trendingIcon}
                />
              )}
              <div className={styles.trendingInfo}>
                <div className={styles.trendingName}>{coin.name}</div>
                <div className={styles.trendingSym}>{coin.symbol}</div>
              </div>
              {coin.data?.price && (
                <div className={styles.trendingPrice}>
                  <div className={styles.trendingPriceValue}>
                    {typeof coin.data.price === 'number'
                      ? formatCurrency(coin.data.price)
                      : coin.data.price}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: coins, loading } = useMarkets({ per_page: 20, page: 1 });

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Crypto Intelligence,{' '}
          <span className={styles.heroAccent}>Simplified</span>
        </h1>
        <p className={styles.heroSub}>
          Real-time market data, portfolio tracking, and price alerts — everything you need to navigate the crypto market with confidence.
        </p>
        <div className={styles.heroActions}>
          <Link href="/markets" className="btn btn-primary">
            Explore Markets
          </Link>
          <Link href="/exchanges" className="btn btn-outline">
            View Exchanges
          </Link>
        </div>
      </section>

      {/* Global stats */}
      <GlobalStatsBar />

      {/* Trending */}
      <TrendingSection />

      {/* Top coins table */}
      <section className={styles.topSection}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Top Cryptocurrencies</h2>
            <p className="section-subtitle">By market capitalization</p>
          </div>
          <Link href="/markets" className="btn btn-ghost btn-sm">
            See All 100 →
          </Link>
        </div>
        <MarketTable coins={coins} loading={loading} />
      </section>
    </>
  );
}
