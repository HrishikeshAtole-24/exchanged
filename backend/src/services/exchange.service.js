const MarketAggregator = require('../aggregator/marketAggregator');
const cache = require('../cache/cacheManager');

const aggregator = new MarketAggregator();

const ExchangeService = {
  /**
   * Get list of exchanges.
   */
  async getExchanges({ perPage = 100, page = 1 } = {}) {
    const cacheKey = `exchanges:${perPage}:${page}`;
    return cache.cacheAside(cacheKey, cache.TTL.EXCHANGES, () =>
      aggregator.getExchanges({ perPage, page })
    );
  },

  /**
   * Get details for a single exchange.
   */
  async getExchangeDetails(exchangeId) {
    const cacheKey = `exchange:${exchangeId}`;
    return cache.cacheAside(cacheKey, cache.TTL.EXCHANGES, () =>
      aggregator.getExchangeDetails(exchangeId)
    );
  },
};

module.exports = ExchangeService;
