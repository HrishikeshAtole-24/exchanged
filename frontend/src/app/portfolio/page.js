'use client';

import { useState, useEffect, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import useAuthStore from '@/store/authStore';
import usePortfolioStore from '@/store/portfolioStore';
import { formatCurrency, formatPercent } from '@/utils/formatCurrency';
import styles from './Portfolio.module.css';

function PortfolioAllocationChart({ holdings }) {
  const options = useMemo(() => ({
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 280,
      style: { fontFamily: 'var(--font-sans)' },
    },
    title: { text: null },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: '#1a1f28',
      borderColor: '#30363d',
      borderRadius: 8,
      style: { color: '#e6edf3', fontSize: '12px' },
      pointFormat: '<b>{point.percentage:.1f}%</b><br/>Value: {point.value}',
    },
    plotOptions: {
      pie: {
        borderWidth: 0,
        borderColor: '#161b22',
        innerSize: '55%',
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          style: { color: '#8b949e', fontSize: '11px', fontWeight: 400, textOutline: 'none' },
          distance: 15,
        },
        colors: ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#79c0ff', '#56d364', '#e3b341'],
      },
    },
    series: [{
      name: 'Allocation',
      data: holdings.map((h) => ({
        name: h.coin_id,
        y: h.amount * h.buy_price,
        value: formatCurrency(h.amount * h.buy_price),
      })),
    }],
  }), [holdings]);

  if (!holdings.length) return null;

  return (
    <div className="card">
      <h3 className="section-title" style={{ marginBottom: 16 }}>Allocation</h3>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

function PortfolioSummary({ holdings }) {
  const totalValue = holdings.reduce((sum, h) => sum + h.amount * h.buy_price, 0);

  return (
    <div className="card">
      <h3 className="section-title" style={{ marginBottom: 16 }}>Summary</h3>
      <div className="stats-grid">
        <div>
          <div className="stat-label">Total Value</div>
          <div className="stat-value">{formatCurrency(totalValue)}</div>
        </div>
        <div>
          <div className="stat-label">Holdings</div>
          <div className="stat-value">{holdings.length}</div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { token, user, fetchMe } = useAuthStore();
  const { holdings, loading, fetchPortfolio, addCoin, removeEntry } = usePortfolioStore();
  const [coinId, setCoinId] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token && !user) fetchMe();
  }, [token, user, fetchMe]);

  useEffect(() => {
    if (token) fetchPortfolio();
  }, [token, fetchPortfolio]);

  if (!token) {
    return (
      <div className={styles.authGate}>
        <div className={styles.authGateIcon}><FontAwesomeIcon icon={faLock} /></div>
        <p className={styles.authGateText}>Sign in to access your portfolio</p>
      </div>
    );
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!coinId.trim()) return setFormError('Coin ID is required');
    const amt = parseFloat(amount);
    const price = parseFloat(buyPrice);
    if (isNaN(amt) || amt <= 0) return setFormError('Amount must be > 0');
    if (isNaN(price) || price <= 0) return setFormError('Buy price must be > 0');

    try {
      setSubmitting(true);
      await addCoin(coinId.trim().toLowerCase(), amt, price);
      setCoinId('');
      setAmount('');
      setBuyPrice('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeEntry(id);
    } catch { /* silent */ }
  };

  return (
    <div className={styles.portfolioPage}>
      <h1 className="page-title">Portfolio</h1>
      <p className="page-description">Track your crypto holdings and allocation</p>

      {/* Summary + Chart row */}
      <div className={styles.chartRow}>
        <PortfolioSummary holdings={holdings} />
        <PortfolioAllocationChart holdings={holdings} />
      </div>

      {/* Add coin form */}
      <div className={styles.addForm}>
        <h3 className={styles.addFormTitle}>Add Holding</h3>
        <form onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="form-label">Coin ID</label>
              <input
                className="form-input"
                placeholder="e.g. bitcoin"
                value={coinId}
                onChange={(e) => setCoinId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                className="form-input"
                type="number"
                step="any"
                min="0"
                placeholder="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Price (USD)</label>
              <input
                className="form-input"
                type="number"
                step="any"
                min="0"
                placeholder="40000"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '…' : 'Add'}
            </button>
          </div>
          {formError && <p className="form-error" style={{ marginTop: 8 }}>{formError}</p>}
        </form>
      </div>

      {/* Holdings table */}
      <div className={styles.holdingsWrap}>
        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : !holdings.length ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FontAwesomeIcon icon={faFolderOpen} /></div>
            <p>No holdings yet. Add your first coin above.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Buy Price</th>
                <th className="text-right">Value</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.coin_id}</td>
                  <td className="text-right">{h.amount}</td>
                  <td className="text-right">{formatCurrency(h.buy_price)}</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>
                    {formatCurrency(h.amount * h.buy_price)}
                  </td>
                  <td className="text-right">
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(h.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
