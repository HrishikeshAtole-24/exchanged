'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency, formatNumber } from '@/utils/formatCurrency';
import styles from './ExchangeTable.module.css';

function getTrustClass(score) {
  if (score >= 8) return styles.trustHigh;
  if (score >= 5) return styles.trustMedium;
  return styles.trustLow;
}

export default function ExchangeTable({ exchanges = [], loading = false }) {
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      </div>
    );
  }

  if (!exchanges.length) {
    return (
      <div className={styles.tableWrap}>
        <div className="empty-state">
          <div className="empty-state-icon"><FontAwesomeIcon icon={faBuildingColumns} /></div>
          <p>No exchange data available</p>
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
              <th className={styles.nameCol}>Exchange</th>
              <th className="text-center">Trust</th>
              <th className="text-right">Volume (24h BTC)</th>
              <th className={`text-right ${styles.hideOnMobile}`}>Country</th>
              <th className={`text-right ${styles.hideOnMobile}`}>Year Est.</th>
            </tr>
          </thead>
          <tbody>
            {exchanges.map((ex, i) => (
              <tr key={ex.id}>
                <td className={styles.rankCol}>{ex.trust_score_rank || i + 1}</td>
                <td className={styles.nameCol}>
                  <a
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.exchangeLink}
                  >
                    {ex.image && (
                      <Image
                        src={ex.image}
                        alt={ex.name}
                        width={28}
                        height={28}
                        className={styles.exchangeImg}
                      />
                    )}
                    <span className={styles.exchangeName}>{ex.name}</span>
                  </a>
                </td>
                <td className="text-center">
                  <span
                    className={`${styles.trustScore} ${getTrustClass(ex.trust_score)}`}
                    title={`Trust Score: ${ex.trust_score || 'N/A'}`}
                  />
                </td>
                <td className={`text-right ${styles.volumeCol}`}>
                  {formatNumber(ex.trade_volume_24h_btc, true)} BTC
                </td>
                <td className={`text-right ${styles.hideOnMobile}`}>
                  {ex.country || '—'}
                </td>
                <td className={`text-right ${styles.hideOnMobile}`}>
                  {ex.year_established || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
