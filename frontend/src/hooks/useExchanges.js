'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange.service';

export function useExchanges(params = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await exchangeService.getExchanges(params);
        if (!cancelled) setData(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}
