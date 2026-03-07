/**
 * MarketProvider Interface
 * ────────────────────────
 * Every data-source adapter MUST implement these methods.
 * This ensures we can swap CoinGecko → CryptoCompare → CoinMarketCap
 * without touching any service code.
 */

class MarketProviderInterface {
  /** Returns top coins by market cap */
  async getMarkets(/* { vsCurrency, perPage, page } */) {
    throw new Error('getMarkets() not implemented');
  }

  /** Returns detailed info for one coin */
  async getCoinDetails(/* coinId */) {
    throw new Error('getCoinDetails() not implemented');
  }

  /** Returns trending coins */
  async getTrending() {
    throw new Error('getTrending() not implemented');
  }

  /** Returns exchange list */
  async getExchanges(/* { perPage, page } */) {
    throw new Error('getExchanges() not implemented');
  }

  /** Returns single exchange details */
  async getExchangeDetails(/* exchangeId */) {
    throw new Error('getExchangeDetails() not implemented');
  }

  /** Returns market chart data for a coin (price history) */
  async getCoinMarketChart(/* coinId, { vsCurrency, days } */) {
    throw new Error('getCoinMarketChart() not implemented');
  }

  /** Search coins/exchanges by query string */
  async search(/* queryString */) {
    throw new Error('search() not implemented');
  }

  /** Returns global crypto market data */
  async getGlobalData() {
    throw new Error('getGlobalData() not implemented');
  }
}

module.exports = MarketProviderInterface;
