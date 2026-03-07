'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faEnvelope,
  faShieldHalved,
  faFileContract,
  faCircleInfo,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  faTwitter,
  faDiscord,
  faTelegram,
  faGithub,
  faReddit,
} from '@fortawesome/free-brands-svg-icons';
import styles from './Footer.module.css';

const PRODUCT_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/exchanges', label: 'Exchanges' },
  { href: '/portfolio', label: 'Portfolio' },
];

const RESOURCE_LINKS = [
  { href: '#', label: 'API Documentation' },
  { href: '#', label: 'Status Page' },
  { href: '#', label: 'Help Center' },
];

const LEGAL_LINKS = [
  { href: '#', label: 'Privacy Policy', icon: faShieldHalved },
  { href: '#', label: 'Terms of Service', icon: faFileContract },
  { href: '#', label: 'Disclaimer', icon: faCircleInfo },
];

const SOCIALS = [
  { href: '#', icon: faTwitter, label: 'Twitter' },
  { href: '#', icon: faDiscord, label: 'Discord' },
  { href: '#', icon: faTelegram, label: 'Telegram' },
  { href: '#', icon: faReddit, label: 'Reddit' },
  { href: '#', icon: faGithub, label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand}>
            <FontAwesomeIcon icon={faChartLine} className={styles.brandIcon} />
            <span>
              <span className={styles.brandAccent}>ex</span>changed
            </span>
          </Link>
          <p className={styles.brandTagline}>
            Real-time crypto intelligence platform. Track markets, manage
            portfolios, and stay ahead with actionable insights.
          </p>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className={styles.socialLink}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Product Links */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Product</h4>
          <ul className={styles.linkList}>
            {PRODUCT_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={styles.footerLink}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources Links */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Resources</h4>
          <ul className={styles.linkList}>
            {RESOURCE_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={styles.footerLink}>
                  {l.label}
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className={styles.externalIcon}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Links */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Legal</h4>
          <ul className={styles.linkList}>
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={styles.footerLink}>
                  <FontAwesomeIcon icon={l.icon} className={styles.legalIcon} />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} exchanged. All rights reserved.
          </p>
          <p className={styles.dataAttrib}>
            Market data provided by{' '}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.coingeckoLink}
            >
              CoinGecko
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className={styles.externalIcon}
              />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
