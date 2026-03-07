const MarketProviderInterface = require('../interfaces/marketProvider.interface');
const client = require('./coingecko.client');

class CoinGeckoMarketProvider extends MarketProviderInterface {

  async getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1 } = {}) {
    return client.get('/coins/markets', {
      vs_currency: vsCurrency,
      order: 'market_cap_desc',
      per_page: perPage,
      page,
      sparkline: true,
      price_change_percentage: '1h,24h,7d',
    });
  }

  async getCoinDetails(coinId) {
    return client.get(`/coins/${encodeURIComponent(coinId)}`, {
      localization: false,
      tickers: true,
      market_data: true,
      community_data: true,
      developer_data: true,
      sparkline: true,
    });
  }

  async getTrending() {
    return client.get('/search/trending');
  }

  async getExchanges({ perPage = 100, page = 1 } = {}) {
    return client.get('/exchanges', {
      per_page: perPage,
      page,
    });
  }

  async getExchangeDetails(exchangeId) {
    return client.get(`/exchanges/${encodeURIComponent(exchangeId)}`);
  }

  async getCoinMarketChart(coinId, { vsCurrency = 'usd', days = 7 } = {}) {
    return client.get(`/coins/${encodeURIComponent(coinId)}/market_chart`, {
      vs_currency: vsCurrency,
      days,
    });
  }

  async search(queryString) {
    return client.get('/search', { query: queryString });
  }

  async getGlobalData() {
    return client.get('/global');
  }
}

module.exports = CoinGeckoMarketProvider;
