const CoinGeckoMarketProvider = require('./coingecko/market.provider');
const CryptoCompareMarketProvider = require('./cryptocompare/market.provider');
const logger = require('../utils/logger');

/**
 * ProviderFactory — single place to obtain data-source adapters.
 *
 * Usage:
 *   const provider = ProviderFactory.getProvider('coingecko');
 *   const markets = await provider.getMarkets();
 */

const providers = {
  coingecko: CoinGeckoMarketProvider,
  cryptocompare: CryptoCompareMarketProvider,
};

class ProviderFactory {
  static getProvider(name = 'coingecko') {
    const Provider = providers[name];
    if (!Provider) {
      logger.error(`Unknown provider: ${name}`);
      throw new Error(`Provider "${name}" is not registered`);
    }
    return new Provider();
  }

  static listProviders() {
    return Object.keys(providers);
  }
}

module.exports = ProviderFactory;
