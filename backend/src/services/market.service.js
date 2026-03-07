const MarketAggregator = require('../aggregator/marketAggregator');
const cache = require('../cache/cacheManager');

const aggregator = new MarketAggregator();

const MarketService = {
  /**
   * Fetch top coins by market cap.
   */
  async getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1 } = {}) {
    const cacheKey = `market:top:${vsCurrency}:${perPage}:${page}`;
    return cache.cacheAside(cacheKey, cache.TTL.MARKETS, () =>
      aggregator.getMarkets({ vsCurrency, perPage, page })
    );
  },

  /**
   * Fetch trending coins.
   */
  async getTrending() {
    return cache.cacheAside('trending:coins', cache.TTL.TRENDING, () =>
      aggregator.getTrending()
    );
  },

  /**
   * Fetch global crypto market stats.
   */
  async getGlobalData() {
    return cache.cacheAside('market:global', cache.TTL.MARKETS, () =>
      aggregator.getGlobalData()
    );
  },

  /**
   * Search coins, categories, exchanges.
   */
  async search(query) {
    // Short TTL for search results
    const cacheKey = `search:${query}`;
    return cache.cacheAside(cacheKey, 60, () =>
      aggregator.search(query)
    );
  },
};

module.exports = MarketService;
