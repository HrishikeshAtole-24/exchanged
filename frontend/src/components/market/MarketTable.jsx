'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import SparklineChart from '@/components/charts/SparklineChart';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatCurrency';
import styles from './MarketTable.module.css';

export default function MarketTable({ coins = [], loading = false }) {
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <div className="loading-center">
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (!coins.length) {
    return (
      <div className={styles.tableWrap}>
        <div className="empty-state">
          <div className="empty-state-icon"><FontAwesomeIcon icon={faChartBar} /></div>
          <p>No market data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableScroll}>
        <table className="data-table">
          <thead>
            <tr>
              <th className={styles.rankCol}>#</th>
              <th className={styles.nameCol}>Name</th>
              <th className="text-right">Price</th>
              <th className="text-right">24h %</th>
              <th className={`text-right ${styles.capCol}`}>Market Cap</th>
              <th className={`text-right ${styles.volumeCol}`}>Volume (24h)</th>
              <th className={styles.sparkCol}>Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => {
              const change = coin.price_change_percentage_24h;
              const sparkColor = change >= 0 ? '#3fb950' : '#f85149';

              return (
                <tr key={coin.id}>
                  <td className={styles.rankCol}>{coin.market_cap_rank}</td>
                  <td className={styles.nameCol}>
                    <Link href={`/coins/${coin.id}`} className={styles.coinLink}>
                      {coin.image && (
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={28}
                          height={28}
                          className={styles.coinImg}
                        />
                      )}
                      <span>
                        <span className={styles.coinNameText}>{coin.name}</span>
                        <span className={styles.coinSymbolText}>{coin.symbol}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={`text-right ${styles.priceCol}`}>
                    {formatCurrency(coin.current_price)}
                  </td>
                  <td className={`text-right ${styles.changeCol} ${change >= 0 ? 'text-green' : 'text-red'}`}>
                    {formatPercent(change)}
                  </td>
                  <td className={`text-right ${styles.capCol}`}>
                    {formatCurrency(coin.market_cap, 'USD', true)}
                  </td>
                  <td className={`text-right ${styles.volumeCol}`}>
                    {formatCurrency(coin.total_volume, 'USD', true)}
                  </td>
                  <td className={styles.sparkCol}>
                    <div className="sparkline-container">
                      <SparklineChart
                        data={coin.sparkline_in_7d?.price || []}
                        color={sparkColor}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
