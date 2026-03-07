# exchanged — Backend

**Crypto Intelligence Platform** — A production-grade, FAANG-style modular monolith backend for real-time cryptocurrency market intelligence, portfolio tracking, and price alerts.

Built as a portfolio-grade project that demonstrates clean architecture, provider abstraction, caching strategy, background workers, and scalable system design.

---

## Product Story — End to End

### 1. User Opens the Platform

A user visits `exchanged.com`. The Next.js frontend (hosted on Vercel) makes API calls to this backend (hosted on Render). Every response follows a standardized envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {},
  "timestamp": "2026-03-07T12:00:00.000Z"
}
```

---

### 2. Market Dashboard

The homepage shows the **top 100 cryptocurrencies** ranked by market cap — price, 24h change, volume, sparkline charts.

```
User → GET /api/markets → Market Controller → Market Service → Redis Cache
```

**Cache HIT (~10ms):** Data served instantly from Upstash Redis.

**Cache MISS (~200-400ms):**
```
Market Service → Provider Aggregator → CoinGecko Adapter → CoinGecko API
                                                              ↓
                                         response stored in Redis (TTL: 30s)
                                                              ↓
                                                     returned to user
```

The next user who hits the same endpoint within 30 seconds gets the cached response in ~10ms. A background worker also pre-warms this cache every 30 seconds, so most users almost always get a cache HIT.

---

### 3. Coin Research Page

User clicks **Bitcoin** → lands on `/coins/bitcoin`.

Two parallel requests fire:

| Request | What it returns |
|---------|----------------|
| `GET /api/coins/bitcoin` | Price, market cap, supply, developer stats, community data, tickers, links |
| `GET /api/coins/bitcoin/chart?days=7` | Price/volume/market-cap history for the last 7 days |

The chart supports `days=1` (24h), `days=7`, `days=30`, `days=365`, or `days=max` — all cached for 5 minutes.

If the user switches from 7d to 30d, only a new chart request fires. The coin detail data is already cached.

---

### 4. Trending Coins

A "Trending" section shows what's hot right now across the crypto market.

```
GET /api/markets/trending → Redis cache (TTL: 2 min) → CoinGecko /search/trending
```

A background worker refreshes this every 2 minutes automatically.

---

### 5. Exchange Rankings

User navigates to `/exchanges` — sees Binance, Coinbase, Kraken, Bybit ranked by volume and trust score.

```
GET /api/exchanges → Redis cache (TTL: 10 min) → CoinGecko /exchanges
```

Clicking on **Binance** loads:

```
GET /api/exchanges/binance → trading pairs, volume, liquidity, trust score
```

Exchange data is refreshed every 10 minutes by a background worker.

---

### 6. User Signs Up

User creates an account to unlock Portfolio and Alerts features.

```
POST /api/auth/register
Body: { "email": "hrishi@example.com", "password": "securepass123" }
```

**What happens internally:**
1. Joi validates the request (email format, password ≥ 8 chars)
2. Check if email already exists (→ 409 if duplicate)
3. Password hashed with **bcrypt (12 salt rounds)**
4. User row inserted into Neon PostgreSQL
5. JWT signed with `{ userId }` and returned

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "hrishi@example.com", "created_at": "..." },
    "token": "eyJhbGciOi..."
  }
}
```

Login works the same way — verifies bcrypt hash, returns JWT.

After login, the user can fetch their profile anytime:
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### 7. Portfolio Tracker

User adds Bitcoin to their portfolio:

```
POST /api/portfolio
Authorization: Bearer <token>
Body: { "coinId": "bitcoin", "amount": 0.5, "buyPrice": 40000 }
```

Joi validates all fields. The entry is stored in Neon PostgreSQL linked to the user.

**Portfolio dashboard:**
```
GET /api/portfolio → returns all user's holdings
```

The frontend calculates profit/loss by comparing `buyPrice` against the current market price (already available from the cached `/api/markets` data).

Users can update or remove entries:
```
PUT    /api/portfolio/1   → update amount/buyPrice
DELETE /api/portfolio/1   → remove from portfolio
```

All portfolio operations are **scoped to the authenticated user** — you can never see or modify another user's data.

---

### 8. Price Alerts

User sets an alert: "Notify me when BTC goes above $70,000."

```
POST /api/alerts
Authorization: Bearer <token>
Body: { "coinId": "bitcoin", "targetPrice": 70000, "direction": "above" }
```

**What happens behind the scenes every 60 seconds:**

```
Alert Worker runs →
  1. Fetch all active (non-triggered) alerts from DB
  2. Fetch current prices for top 250 coins from CoinGecko
  3. Compare each alert's target price against current price
  4. If condition met → mark alert as triggered in DB
```

Users can check their triggered alerts:
```
GET /api/alerts/triggered → shows all alerts that have fired
```

---

### 9. Search

User searches for a coin or exchange:

```
GET /api/markets/search?q=solana
```

Returns matching coins, categories, and exchanges. Cached for 60 seconds.

---

### 10. Global Market Stats

```
GET /api/markets/global → total market cap, 24h volume, BTC dominance, etc.
```

---

### 11. What Happens When CoinGecko Goes Down?

The **Provider Aggregator** automatically handles this:

```
Request → try CoinGecko
              ↓ (fails)
          try CryptoCompare (or any registered fallback)
              ↓ (returns data)
          serve to user
```

The user never notices the failure. Logs capture the fallback event for monitoring.

Currently CryptoCompare is a stub (returns 503). When you implement it, the failover is instant — zero code changes needed in services or controllers.

---

### 12. Background Processing

Four workers run continuously via **BullMQ + Redis**:

| Worker | Frequency | Purpose |
|--------|-----------|---------|
| Market Worker | Every 30s | Pre-warms top 100 coins cache + saves historical snapshots (top 10) to DB |
| Trending Worker | Every 2 min | Pre-warms trending coins cache |
| Exchange Worker | Every 10 min | Pre-warms exchange list cache |
| Alert Worker | Every 60s | Checks all active price alerts against live prices |

The market worker also persists the top 10 coins' prices into the `market_snapshots` table — building historical data for analytics features.

---

## Architecture

```
                    ┌──────────────┐
                    │   Frontend   │
                    │   (Vercel)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Express    │
                    │   Backend    │
                    │   (Render)   │
                    └──┬───┬───┬───┘
                       │   │   │
              ┌────────┘   │   └────────┐
              │            │            │
     ┌────────▼───┐  ┌─────▼────┐  ┌───▼──────────┐
     │  Upstash   │  │   Neon   │  │   BullMQ     │
     │   Redis    │  │ Postgres │  │  (Workers)   │
     │  (Cache)   │  │   (DB)   │  │              │
     └────────────┘  └──────────┘  └──────┬───────┘
                                          │
                                 ┌────────▼───────┐
                                 │  Provider Layer │
                                 │  ┌───────────┐ │
                                 │  │ CoinGecko │ │
                                 │  └───────────┘ │
                                 │  ┌─────────────┐
                                 │  │CryptoCompare│
                                 │  │   (stub)    │
                                 │  └─────────────┘
                                 └────────────────┘
```

### Design Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **Modular Monolith** | Entire backend | Easy to deploy, easy to split into microservices later |
| **Provider Adapter** | `providers/` | Swap data sources without touching business logic |
| **Factory** | `providerFactory.js` | Instantiate providers by name |
| **Aggregator + Fallback** | `marketAggregator.js` | Auto-failover across providers |
| **Cache-Aside** | `cacheManager.js` | Read cache → miss → fetch → write cache |
| **Repository** | `services/` + `models/` | Data access abstracted from controllers |
| **Middleware Chain** | `app.js` | Security, rate limiting, auth, error handling in layers |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js + Express | API server |
| Database | Neon PostgreSQL | Serverless Postgres (free tier) |
| Cache | Upstash Redis | Serverless Redis (free tier) |
| Queue | BullMQ | Background job processing |
| Auth | bcryptjs + jsonwebtoken | Password hashing + JWT tokens |
| Validation | Joi | Request body validation |
| HTTP Client | Axios | CoinGecko API calls |
| Logging | Winston | Structured logging with levels |
| Security | Helmet + CORS + express-rate-limit | Security headers, CORS, rate limiting |
| Data Source | CoinGecko API v3 | Cryptocurrency market data |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.js                    # Centralized environment config
│   │
│   ├── database/
│   │   ├── neonClient.js             # Neon PostgreSQL client (parameterized queries)
│   │   ├── migrate.js                # Schema migrations (5 tables, 3 indexes)
│   │   └── seed.js                   # Seed top 10 coins reference data
│   │
│   ├── cache/
│   │   ├── redisClient.js            # Upstash Redis singleton
│   │   └── cacheManager.js           # get/set/del + cache-aside helper + TTL config
│   │
│   ├── providers/
│   │   ├── interfaces/
│   │   │   └── marketProvider.interface.js   # Contract: 8 methods every provider implements
│   │   ├── coingecko/
│   │   │   ├── coingecko.client.js    # Axios client (15s timeout, rate-limit handling)
│   │   │   └── market.provider.js     # Full CoinGecko adapter
│   │   ├── cryptocompare/
│   │   │   └── market.provider.js     # Stub (503) — ready for implementation
│   │   └── providerFactory.js         # Factory to get providers by name
│   │
│   ├── aggregator/
│   │   └── marketAggregator.js        # Calls primary provider, auto-fallback to secondaries
│   │
│   ├── services/
│   │   ├── auth.service.js            # Register, login, JWT signing
│   │   ├── market.service.js          # Markets, trending, global, search
│   │   ├── coin.service.js            # Coin details, chart data
│   │   ├── exchange.service.js        # Exchange list, exchange details
│   │   ├── portfolio.service.js       # Portfolio CRUD (DB only)
│   │   └── alert.service.js           # Alert CRUD + triggered alerts
│   │
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Joi validation + auth service calls
│   │   │   ├── market.controller.js   # Query param parsing + market service
│   │   │   ├── coin.controller.js     # Route param handling + coin service
│   │   │   ├── exchange.controller.js # Exchange endpoints
│   │   │   ├── portfolio.controller.js# Joi validation + portfolio CRUD
│   │   │   └── alert.controller.js    # Joi validation + alert CRUD
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── market.routes.js
│   │       ├── coin.routes.js
│   │       ├── exchange.routes.js
│   │       ├── portfolio.routes.js
│   │       └── alert.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js         # JWT Bearer token verification
│   │   ├── error.middleware.js        # Global error handler (Winston + envelope)
│   │   └── rateLimiter.middleware.js  # 100 req/min (configurable)
│   │
│   ├── models/
│   │   ├── user.model.js             # findById, findByEmail
│   │   ├── portfolio.model.js        # findByUser, create
│   │   └── alert.model.js            # findByUser, create
│   │
│   ├── queue/
│   │   └── bullmq.js                 # 4 named BullMQ queues
│   │
│   ├── workers/
│   │   ├── market.worker.js          # Refreshes every 30s + persists snapshots
│   │   ├── trending.worker.js        # Refreshes every 2 min
│   │   ├── exchange.worker.js        # Refreshes every 10 min
│   │   └── alert.worker.js           # Checks price alerts every 60s
│   │
│   ├── utils/
│   │   ├── logger.js                 # Winston (timestamped, colorized, stack traces)
│   │   └── response.js               # success(), created(), paginated(), error()
│   │
│   ├── app.js                        # Express app (middleware + routes)
│   ├── server.js                     # Entry point (starts server + scheduler + graceful shutdown)
│   └── scheduler.js                  # Registers all repeating BullMQ jobs
│
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Template for env vars
├── .gitignore
└── package.json
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new account |
| `POST` | `/api/auth/login` | — | Login and get JWT |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |

**Register / Login body:**
```json
{ "email": "user@example.com", "password": "minimum8chars" }
```

---

### Markets

| Method | Endpoint | Auth | Query Params |
|--------|----------|------|-------------|
| `GET` | `/api/markets` | — | `vs_currency` (default: usd), `per_page` (default: 100), `page` (default: 1) |
| `GET` | `/api/markets/trending` | — | — |
| `GET` | `/api/markets/global` | — | — |
| `GET` | `/api/markets/search` | — | `q` (required) |

---

### Coins

| Method | Endpoint | Auth | Query Params |
|--------|----------|------|-------------|
| `GET` | `/api/coins/:id` | — | — |
| `GET` | `/api/coins/:id/chart` | — | `vs_currency` (default: usd), `days` (default: 7) |

---

### Exchanges

| Method | Endpoint | Auth | Query Params |
|--------|----------|------|-------------|
| `GET` | `/api/exchanges` | — | `per_page` (default: 100), `page` (default: 1) |
| `GET` | `/api/exchanges/:id` | — | — |

---

### Portfolio (Auth Required)

| Method | Endpoint | Body |
|--------|----------|------|
| `GET` | `/api/portfolio` | — |
| `POST` | `/api/portfolio` | `{ coinId, amount, buyPrice }` |
| `PUT` | `/api/portfolio/:id` | `{ amount, buyPrice }` |
| `DELETE` | `/api/portfolio/:id` | — |

---

### Alerts (Auth Required)

| Method | Endpoint | Body |
|--------|----------|------|
| `GET` | `/api/alerts` | — |
| `GET` | `/api/alerts/triggered` | — |
| `POST` | `/api/alerts` | `{ coinId, targetPrice, direction: "above"\|"below" }` |
| `DELETE` | `/api/alerts/:id` | — |

---

### Health Check

```
GET /api/health → { success: true, message: "exchanged API is running", environment: "development" }
```

---

## Database Schema

### Tables

```sql
users            — id, email (unique), password_hash, created_at
cached_coins     — coin_id (PK), symbol, name, last_updated
portfolios       — id, user_id (FK), coin_id, amount, buy_price, created_at
alerts           — id, user_id (FK), coin_id, target_price, direction, triggered, created_at
market_snapshots — id, coin_id, price, market_cap, volume, timestamp
```

### Indexes
```
idx_portfolios_user   — portfolios(user_id)
idx_alerts_user       — alerts(user_id)
idx_snapshots_coin_ts — market_snapshots(coin_id, timestamp DESC)
```

---

## Caching Strategy

| Data | Cache Key | TTL | Refreshed By |
|------|-----------|-----|-------------|
| Top coins | `market:top:{currency}:{perPage}:{page}` | 30s | Market Worker |
| Trending | `trending:coins` | 2 min | Trending Worker |
| Global stats | `market:global` | 30s | On-demand |
| Search | `search:{query}` | 60s | On-demand |
| Coin details | `coin:{coinId}` | 5 min | On-demand |
| Chart data | `chart:{coinId}:{currency}:{days}` | 5 min | On-demand |
| Exchange list | `exchanges:{perPage}:{page}` | 10 min | Exchange Worker |
| Exchange detail | `exchange:{exchangeId}` | 10 min | On-demand |

**Pattern:** Cache-aside with background pre-warming via workers.

---

## Multi-Provider Architecture

```
Service Layer
     ↓
MarketAggregator
     ↓
┌── try Primary (CoinGecko) ──┐
│   success → return data     │
│   failure ↓                 │
├── try Fallback 1            │
│   success → return data     │
│   failure ↓                 │
├── try Fallback N            │
│   all fail → throw error    │
└─────────────────────────────┘
```

To add a new provider:
1. Create `src/providers/newprovider/market.provider.js` extending `MarketProviderInterface`
2. Register it in `providerFactory.js`
3. Done — the aggregator picks it up as a fallback automatically

---

## Background Workers

| Worker | Schedule | What It Does |
|--------|----------|-------------|
| **Market** | Every 30s | Fetches top 100 coins → caches → saves top 10 to `market_snapshots` |
| **Trending** | Every 2 min | Fetches trending coins → caches |
| **Exchange** | Every 10 min | Fetches top 100 exchanges → caches |
| **Alert** | Every 60s | Compares all active alerts against live prices → marks triggered |

Workers use **BullMQ** with Redis. If Redis is not configured, workers are disabled and the API still works (just without pre-warming).

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- Free accounts on:
  - [Neon](https://neon.tech) — PostgreSQL database
  - [Upstash](https://upstash.com) — Redis cache
  - [CoinGecko](https://www.coingecko.com/en/api) — API key (optional for free tier)

### Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your Neon, Upstash, and JWT credentials

# 3. Run database migrations
npm run migrate

# 4. Seed reference data (optional)
npm run seed

# 5. Start development server
npm run dev
```

The server starts at `http://localhost:5000`.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` or `production` |
| `PORT` | No | `5000` | Server port |
| `DATABASE_URL` | **Yes** | — | Neon PostgreSQL connection string |
| `UPSTASH_REDIS_URL` | No | — | Upstash Redis REST URL |
| `UPSTASH_REDIS_TOKEN` | No | — | Upstash Redis REST token |
| `REDIS_HOST` | No | — | Redis host for BullMQ workers |
| `REDIS_PORT` | No | `6379` | Redis port for BullMQ |
| `REDIS_PASSWORD` | No | — | Redis password for BullMQ |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiration |
| `COINGECKO_BASE_URL` | No | `https://api.coingecko.com/api/v3` | CoinGecko API URL |
| `COINGECKO_API_KEY` | No | — | CoinGecko demo API key |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |

**Graceful degradation:** Without Upstash → cache disabled (direct API calls). Without Redis host → workers disabled (on-demand data only). The API always works.

---

## Deployment (Free Tier)

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Backend API | [Render](https://render.com) | Free web service |
| Database | [Neon](https://neon.tech) | Free serverless PostgreSQL |
| Cache | [Upstash](https://upstash.com) | Free Redis (10K commands/day) |
| Frontend | [Vercel](https://vercel.com) | Free Next.js hosting |

```
Users → Vercel (Frontend) → Render (Backend) → Upstash (Cache) → Neon (DB)
                                              → CoinGecko (Data)
```

---

## Middleware Pipeline

Every request flows through this chain:

```
Request
  → Helmet (security headers)
  → CORS (origin check)
  → JSON parser (10kb limit)
  → Morgan (HTTP logging)
  → Rate Limiter (100 req/min)
  → Route Handler
    → [Auth Middleware] (if protected route)
    → Controller
    → Service
    → Cache / DB / Provider
  → Error Handler (if error thrown)
Response
```

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Production server |
| Dev | `npm run dev` | Development with nodemon |
| Migrate | `npm run migrate` | Create/update database tables |
| Seed | `npm run seed` | Seed reference coin data |
| Test | `npm test` | Run tests with coverage |
| Lint | `npm run lint` | ESLint check |

---

## What This Platform Demonstrates

- **Clean architecture** — clear separation: routes → controllers → services → providers
- **Provider abstraction** — swap CoinGecko for any other API with zero business logic changes
- **Caching strategy** — cache-aside + background pre-warming = fast responses + low API usage
- **Background workers** — BullMQ jobs keep data fresh without user-triggered API calls
- **Security** — bcrypt hashing, JWT auth, Helmet headers, rate limiting, Joi validation, parameterized SQL queries
- **Graceful degradation** — works without cache, works without workers, auto-fallback between providers
- **Scalability path** — modular monolith today, split into microservices when needed

---

*Built by Hrishikesh*
