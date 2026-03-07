'use client';

import { useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useCoinChart } from '@/hooks/useCoin';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './Charts.module.css';

const TIME_OPTIONS = [
  { label: '24H', value: 1 },
  { label: '7D', value: 7 },
  { label: '1M', value: 30 },
  { label: '1Y', value: 365 },
  { label: 'All', value: 'max' },
];

export default function PriceChart({ coinId, coinName = '' }) {
  const [days, setDays] = useState(7);
  const { data, loading } = useCoinChart(coinId, days);

  const options = useMemo(() => {
    const prices = data?.prices || [];

    return {
      chart: {
        type: 'areaspline',
        backgroundColor: 'transparent',
        height: 350,
        style: { fontFamily: 'var(--font-sans)' },
        spacing: [10, 0, 10, 0],
      },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        type: 'datetime',
        lineColor: '#21262d',
        tickColor: '#21262d',
        labels: {
          style: { color: '#6e7681', fontSize: '11px' },
        },
        crosshair: {
          color: 'rgba(88, 166, 255, 0.3)',
          dashStyle: 'Dash',
        },
      },
      yAxis: {
        title: { text: null },
        gridLineColor: '#21262d',
        labels: {
          style: { color: '#6e7681', fontSize: '11px' },
          formatter() {
            return formatCurrency(this.value, 'USD', true);
          },
        },
      },
      tooltip: {
        backgroundColor: '#1a1f28',
        borderColor: '#30363d',
        borderRadius: 8,
        style: { color: '#e6edf3', fontSize: '12px' },
        formatter() {
          return `<b>${Highcharts.dateFormat('%b %e, %Y %H:%M', this.x)}</b><br/>Price: <b>${formatCurrency(this.y)}</b>`;
        },
      },
      plotOptions: {
        areaspline: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(88, 166, 255, 0.25)'],
              [1, 'rgba(88, 166, 255, 0.02)'],
            ],
          },
          lineWidth: 2,
          lineColor: '#58a6ff',
          marker: { enabled: false, radius: 2 },
          states: {
            hover: { lineWidth: 2.5 },
          },
          threshold: null,
        },
      },
      series: [
        {
          name: coinName || 'Price',
          data: prices.map((p) => [p[0], p[1]]),
        },
      ],
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: {
            chart: { height: 250 },
          },
        }],
      },
    };
  }, [data, coinName]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Price Chart</span>
        <div className={styles.timeButtons}>
          {TIME_OPTIONS.map((t) => (
            <button
              key={t.value}
              className={`${styles.timeBtn} ${days === t.value ? styles.timeBtnActive : ''}`}
              onClick={() => setDays(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.chartBody}>
        {loading ? (
          <div className="loading-center">
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={options} />
        )}
      </div>
    </div>
  );
}
