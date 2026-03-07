'use client';

import { useState } from 'react';
import { useMarkets, useGlobalStats } from '@/hooks/useMarkets';
import MarketTable from '@/components/market/MarketTable';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatCurrency';

export default function MarketsPage() {
  const [page, setPage] = useState(1);
  const { data: coins, loading } = useMarkets({ per_page: 100, page });
  const { data: global } = useGlobalStats();

  const g = global?.data || global;

  return (
    <>
      <h1 className="page-title">Markets</h1>
      <p className="page-description">
        Top 100 cryptocurrencies ranked by market capitalization
      </p>

      {g && (
        <div className="stats-grid" style={{ marginBottom: 'var(--sp-xl)' }}>
          <div className="stat-card">
            <div className="stat-label">Total Market Cap</div>
            <div className="stat-value">{formatCurrency(g.total_market_cap?.usd, 'USD', true)}</div>
            <div className={`stat-change ${(g.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'text-green' : 'text-red'}`}>
              {formatPercent(g.market_cap_change_percentage_24h_usd)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">24h Volume</div>
            <div className="stat-value">{formatCurrency(g.total_volume?.usd, 'USD', true)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">BTC Dominance</div>
            <div className="stat-value">{(g.market_cap_percentage?.btc || 0).toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Coins</div>
            <div className="stat-value">{formatNumber(g.active_cryptocurrencies)}</div>
          </div>
        </div>
      )}

      <MarketTable coins={coins} loading={loading} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 'var(--sp-lg)' }}>
        <button
          className="btn btn-outline btn-sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Previous
        </button>
        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem' }}>
          Page {page}
        </span>
        <button
          className="btn btn-outline btn-sm"
          disabled={coins.length < 100}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>
    </>
  );
}
