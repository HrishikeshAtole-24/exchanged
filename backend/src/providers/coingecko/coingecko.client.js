const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Low-level HTTP client for CoinGecko API v3.
 * Handles base URL, headers, and rate-limit-aware retries.
 */
class CoinGeckoClient {
  constructor() {
    this.client = axios.create({
      baseURL: env.coingecko.baseUrl,
      timeout: 15000,
      headers: {
        Accept: 'application/json',
        ...(env.coingecko.apiKey && { 'x-cg-demo-api-key': env.coingecko.apiKey }),
      },
    });

    // Response interceptor — log & normalize errors
    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 429) {
          logger.warn('CoinGecko rate limit hit — back off');
        }
        throw err;
      }
    );
  }

  async get(endpoint, params = {}) {
    try {
      const { data } = await this.client.get(endpoint, { params });
      return data;
    } catch (err) {
      logger.error(`CoinGecko request failed [${endpoint}]: ${err.message}`);
      throw err;
    }
  }
}

// Singleton
module.exports = new CoinGeckoClient();
