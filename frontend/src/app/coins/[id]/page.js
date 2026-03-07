'use client';

import { use } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faLink, faCode, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faReddit, faGithub } from '@fortawesome/free-brands-svg-icons';
import { useCoin } from '@/hooks/useCoin';
import CoinHeader from '@/components/coin/CoinHeader';
import PriceChart from '@/components/charts/PriceChart';
import styles from './CoinPage.module.css';

export default function CoinPage({ params }) {
  const { id } = use(params);
  const { data: coin, loading, error } = useCoin(id);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon"><FontAwesomeIcon icon={faTriangleExclamation} /></div>
        <p>{error || 'Coin not found'}</p>
        <Link href="/markets" className="btn btn-outline" style={{ marginTop: 16 }}>
          ← Back to Markets
        </Link>
      </div>
    );
  }

  const description = coin.description?.en || '';
  const cleanDesc = description.replace(/<[^>]*>/g, '').slice(0, 600);

  return (
    <div className={styles.coinPage}>
      <Link href="/markets" className={styles.backLink}>
        ← Back to Markets
      </Link>

      <CoinHeader coin={coin} />

      <PriceChart coinId={id} coinName={coin.name} />

      {cleanDesc && (
        <div className={styles.descriptionCard}>
          <h2 className={styles.descTitle}>About {coin.name}</h2>
          <p className={styles.descBody}>
            {cleanDesc}{cleanDesc.length >= 600 ? '…' : ''}
          </p>

          <div className={styles.linksGrid}>
            {coin.links?.homepage?.[0] && (
              <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" className={styles.linkChip}>
                <FontAwesomeIcon icon={faGlobe} style={{ marginRight: 6 }} /> Website
              </a>
            )}
            {coin.links?.blockchain_site?.[0] && (
              <a href={coin.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className={styles.linkChip}>
                <FontAwesomeIcon icon={faLink} style={{ marginRight: 6 }} /> Explorer
              </a>
            )}
            {coin.links?.subreddit_url && (
              <a href={coin.links.subreddit_url} target="_blank" rel="noopener noreferrer" className={styles.linkChip}>
                <FontAwesomeIcon icon={faReddit} style={{ marginRight: 6 }} /> Reddit
              </a>
            )}
            {coin.links?.repos_url?.github?.[0] && (
              <a href={coin.links.repos_url.github[0]} target="_blank" rel="noopener noreferrer" className={styles.linkChip}>
                <FontAwesomeIcon icon={faGithub} style={{ marginRight: 6 }} /> GitHub
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
