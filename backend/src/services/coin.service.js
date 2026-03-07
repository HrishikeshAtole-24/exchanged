const MarketAggregator = require('../aggregator/marketAggregator');
const cache = require('../cache/cacheManager');

const aggregator = new MarketAggregator();

const CoinService = {
  /**
   * Get full details for a single coin.
   */
  async getCoinDetails(coinId) {
    const cacheKey = `coin:${coinId}`;
    return cache.cacheAside(cacheKey, cache.TTL.COIN_DETAILS, () =>
      aggregator.getCoinDetails(coinId)
    );
  },

  /**
   * Get historical market chart (prices, volumes, market caps).
   */
  async getCoinMarketChart(coinId, { vsCurrency = 'usd', days = 7 } = {}) {
    const cacheKey = `chart:${coinId}:${vsCurrency}:${days}`;
    return cache.cacheAside(cacheKey, cache.TTL.CHART, () =>
      aggregator.getCoinMarketChart(coinId, { vsCurrency, days })
    );
  },
};

module.exports = CoinService;
