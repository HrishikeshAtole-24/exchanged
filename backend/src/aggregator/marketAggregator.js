const ProviderFactory = require('../providers/providerFactory');
const logger = require('../utils/logger');

/**
 * MarketAggregator
 * ─────────────────
 * Sits between services and providers.
 * If the primary provider fails, it can fall back to secondary providers.
 */
class MarketAggregator {
  constructor(primaryProviderName = 'coingecko') {
    this.primary = ProviderFactory.getProvider(primaryProviderName);
    this.fallbacks = ProviderFactory.listProviders()
      .filter((name) => name !== primaryProviderName)
      .map((name) => {
        try {
          return { name, provider: ProviderFactory.getProvider(name) };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  /**
   * Execute a method with automatic fallback.
   * Tries primary first, then each fallback in order.
   */
  async _execute(method, ...args) {
    try {
      return await this.primary[method](...args);
    } catch (err) {
      logger.warn(`Primary provider failed [${method}]: ${err.message}`);

      for (const { name, provider } of this.fallbacks) {
        try {
          logger.info(`Falling back to provider: ${name}`);
          return await provider[method](...args);
        } catch (fbErr) {
          logger.warn(`Fallback ${name} also failed [${method}]: ${fbErr.message}`);
        }
      }

      throw new Error(`All providers failed for ${method}`);
    }
  }

  getMarkets(opts) { return this._execute('getMarkets', opts); }
  getCoinDetails(coinId) { return this._execute('getCoinDetails', coinId); }
  getTrending() { return this._execute('getTrending'); }
  getExchanges(opts) { return this._execute('getExchanges', opts); }
  getExchangeDetails(id) { return this._execute('getExchangeDetails', id); }
  getCoinMarketChart(coinId, opts) { return this._execute('getCoinMarketChart', coinId, opts); }
  search(q) { return this._execute('search', q); }
  getGlobalData() { return this._execute('getGlobalData'); }
}

module.exports = MarketAggregator;
