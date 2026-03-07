'use client';

import { useExchanges } from '@/hooks/useExchanges';
import ExchangeTable from '@/components/exchange/ExchangeTable';

export default function ExchangesPage() {
  const { data: exchanges, loading } = useExchanges({ per_page: 100 });

  return (
    <>
      <h1 className="page-title">Exchanges</h1>
      <p className="page-description">
        Top cryptocurrency exchanges ranked by trust score and 24h trading volume
      </p>

      <ExchangeTable exchanges={exchanges} loading={loading} />
    </>
  );
}
