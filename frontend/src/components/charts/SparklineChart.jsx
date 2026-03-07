'use client';

import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatCurrency } from '@/utils/formatCurrency';

export default function SparklineChart({ data = [], color = '#58a6ff', height = 40, width = 120 }) {
  const options = useMemo(() => ({
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height,
      width,
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0],
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      visible: false,
    },
    yAxis: {
      visible: false,
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, Highcharts.color(color).setOpacity(0.3).get('rgba')],
            [1, Highcharts.color(color).setOpacity(0.02).get('rgba')],
          ],
        },
        lineWidth: 1.5,
        lineColor: color,
        marker: { enabled: false },
        enableMouseTracking: false,
      },
    },
    series: [{
      data: data,
    }],
  }), [data, color, height, width]);

  if (!data.length) return null;

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
