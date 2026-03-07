const MarketProviderInterface = require('../interfaces/marketProvider.interface');
const logger = require('../../utils/logger');

/**
 * CryptoCompare adapter — stub for future implementation.
 * Implements the same interface so it can drop-in replace CoinGecko.
 * All methods throw a clear "not available" error so the aggregator
 * can log it properly and the user gets a meaningful message.
 */
class CryptoCompareMarketProvider extends MarketProviderInterface {
  _notAvailable(method) {
    const err = new Error(`CryptoCompare provider not yet implemented [${method}]`);
    err.statusCode = 503;
    logger.warn(err.message);
    throw err;
  }

  async getMarkets() { this._notAvailable('getMarkets'); }
  async getCoinDetails() { this._notAvailable('getCoinDetails'); }
  async getTrending() { this._notAvailable('getTrending'); }
  async getExchanges() { this._notAvailable('getExchanges'); }
  async getExchangeDetails() { this._notAvailable('getExchangeDetails'); }
  async getCoinMarketChart() { this._notAvailable('getCoinMarketChart'); }
  async search() { this._notAvailable('search'); }
  async getGlobalData() { this._notAvailable('getGlobalData'); }
}

module.exports = CryptoCompareMarketProvider;
