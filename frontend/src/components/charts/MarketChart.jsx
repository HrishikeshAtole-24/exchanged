'use client';

import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './Charts.module.css';

export default function MarketChart({ data, title = 'Market Overview' }) {
  const options = useMemo(() => {
    const volumes = data?.total_volumes || [];
    const marketCaps = data?.market_caps || [];

    return {
      chart: {
        backgroundColor: 'transparent',
        height: 350,
        style: { fontFamily: 'var(--font-sans)' },
      },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        type: 'datetime',
        lineColor: '#21262d',
        tickColor: '#21262d',
        labels: { style: { color: '#6e7681', fontSize: '11px' } },
      },
      yAxis: [
        {
          title: { text: 'Market Cap', style: { color: '#58a6ff' } },
          gridLineColor: '#21262d',
          labels: {
            style: { color: '#6e7681', fontSize: '11px' },
            formatter() { return formatCurrency(this.value, 'USD', true); },
          },
        },
        {
          title: { text: 'Volume', style: { color: '#3fb950' } },
          opposite: true,
          gridLineWidth: 0,
          labels: {
            style: { color: '#6e7681', fontSize: '11px' },
            formatter() { return formatCurrency(this.value, 'USD', true); },
          },
        },
      ],
      tooltip: {
        shared: true,
        backgroundColor: '#1a1f28',
        borderColor: '#30363d',
        borderRadius: 8,
        style: { color: '#e6edf3', fontSize: '12px' },
      },
      legend: {
        itemStyle: { color: '#8b949e', fontSize: '12px' },
        itemHoverStyle: { color: '#e6edf3' },
      },
      series: [
        {
          name: 'Market Cap',
          type: 'areaspline',
          data: marketCaps.map((p) => [p[0], p[1]]),
          color: '#58a6ff',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(88, 166, 255, 0.2)'],
              [1, 'rgba(88, 166, 255, 0.01)'],
            ],
          },
          lineWidth: 2,
          marker: { enabled: false },
        },
        {
          name: 'Volume',
          type: 'column',
          yAxis: 1,
          data: volumes.map((p) => [p[0], p[1]]),
          color: 'rgba(63, 185, 80, 0.4)',
          borderWidth: 0,
          pointPadding: 0.05,
          groupPadding: 0.05,
        },
      ],
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: { chart: { height: 250 } },
        }],
      },
    };
  }, [data]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>{title}</span>
      </div>
      <div className={styles.chartBody}>
        {!data ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={options} />
        )}
      </div>
    </div>
  );
}
