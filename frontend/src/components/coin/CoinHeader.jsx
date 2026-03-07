'use client';

import Image from 'next/image';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatCurrency';
import styles from './CoinHeader.module.css';

export default function CoinHeader({ coin }) {
  if (!coin) return null;

  const md = coin.market_data || {};
  const price = md.current_price?.usd;
  const change24h = md.price_change_percentage_24h;

  return (
    <div className={styles.coinHeader}>
      {coin.image?.large && (
        <Image
          src={coin.image.large}
          alt={coin.name}
          width={56}
          height={56}
          className={styles.coinIcon}
        />
      )}

      <div className={styles.coinInfo}>
        <div className={styles.coinTopRow}>
          <h1 className={styles.coinTitle}>{coin.name}</h1>
          <span className={styles.coinSym}>{coin.symbol}</span>
          {coin.market_cap_rank && (
            <span className={styles.coinRank}>Rank #{coin.market_cap_rank}</span>
          )}
        </div>

        <div className={styles.priceRow}>
          <span className={styles.priceMain}>{formatCurrency(price)}</span>
          {change24h != null && (
            <span className={`${styles.priceChange} ${change24h >= 0 ? 'text-green' : 'text-red'}`}>
              {formatPercent(change24h)}
            </span>
          )}
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Market Cap</span>
            <span className={styles.metaValue}>{formatCurrency(md.market_cap?.usd, 'USD', true)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>24h Volume</span>
            <span className={styles.metaValue}>{formatCurrency(md.total_volume?.usd, 'USD', true)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Circulating Supply</span>
            <span className={styles.metaValue}>{formatNumber(md.circulating_supply, true)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Total Supply</span>
            <span className={styles.metaValue}>{md.total_supply ? formatNumber(md.total_supply, true) : '∞'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>24h High</span>
            <span className={styles.metaValue}>{formatCurrency(md.high_24h?.usd)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>24h Low</span>
            <span className={styles.metaValue}>{formatCurrency(md.low_24h?.usd)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>All-Time High</span>
            <span className={styles.metaValue}>{formatCurrency(md.ath?.usd)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>All-Time Low</span>
            <span className={styles.metaValue}>{formatCurrency(md.atl?.usd)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
