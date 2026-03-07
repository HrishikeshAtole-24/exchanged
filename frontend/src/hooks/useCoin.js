'use client';

import { useState, useEffect, useCallback } from 'react';
import { coinService } from '@/services/coin.service';

export function useCoin(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await coinService.getCoin(id);
        if (!cancelled) setData(res.data || null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}

export function useCoinChart(id, days = 7) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChart = useCallback(async (d) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await coinService.getChart(id, { days: d || days });
      setData(res.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, days]);

  useEffect(() => { fetchChart(); }, [fetchChart]);

  return { data, loading, error, refetch: fetchChart };
}
