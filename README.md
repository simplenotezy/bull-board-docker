# Bull Board Docker

Docker image for [bull-board]. Allow you to monitor your bull queue without any coding!

Supports both: bull and bullmq. bull-board version v3.2.6

**Now with TypeScript support and pnpm package management!**

## Development

This project has been converted to TypeScript with the following features:

-   **TypeScript**: Full type safety and modern JavaScript features
-   **pnpm**: Fast, disk space efficient package manager
-   **Development scripts**: Hot reloading and type checking
-   **Testing**: Vitest for fast, modern testing

### Development Commands

```bash
# Install dependencies
pnpm install

# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production build
pnpm start

# Run tests
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui
```

### Quick start with Docker

```
docker run -p 3000:3000 deadly0/bull-board
```

will run bull-board interface on `localhost:3000` and connect to your redis instance on `localhost:6379` without password.

To configurate redis see "Environment variables" section.

### Quick start with docker-compose

```yaml
version: "3.5"

services:
    bullboard:
        container_name: bullboard
        image: deadly0/bull-board
        restart: always
        ports:
            - 3000:3000
```

will run bull-board interface on `localhost:3000` and connect to your redis instance on `localhost:6379` without password.

see "Example with docker-compose" section for example with env parameters

### Environment variables

#### Redis

-   `REDIS_URL` - complete redis connection URL (e.g. redis://user:pass@localhost:6379/0 or rediss://host:6380/0 for TLS). **Takes precedence over individual Redis settings below**
-   `REDIS_HOST` - host to connect to redis (localhost by default)
-   `REDIS_PORT` - redis port (6379 by default)
-   `REDIS_DB` - redis db to use ('0' by default)
-   `REDIS_USE_TLS` - enable TLS true or false (false by default)
-   `REDIS_PASSWORD` - password to connect to redis (no password by default)

#### Bull-board

-   `BULL_PREFIX` - prefix to your bull queue name (bull by default)
-   `BULL_VERSION` - version of bull lib to use 'BULLMQ' or 'BULL' ('BULLMQ' by default)
-   `PROXY_PATH` - proxyPath for bull board, e.g. https://<server_name>/my-base-path/queues [docs] ('' by default)
-   `USER_LOGIN` - login to restrict access to bull-board interface (disabled by default)
-   `USER_PASSWORD` - password to restrict access to bull-board interface (disabled by default)

#### Bull Board UI Configuration

All Bull Board UI options can be configured via environment variables with the `BULL_BOARD_` prefix. The system uses **dynamic parsing** - no hardcoded mappings required!

**Dynamic Nested Configuration**: Use double underscores (`__`) to create nested objects. The system automatically converts:

-   `BULL_BOARD_UI_CONFIG__BOARD_TITLE` → `uiConfig.boardTitle`
-   `BULL_BOARD_UI_CONFIG__BOARD_LOGO__PATH` → `uiConfig.boardLogo.path`
-   `BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__SHOW_SETTING` → `uiConfig.pollingInterval.showSetting`
-   `BULL_BOARD_UI_CONFIG__LOCALE__LNG` → `uiConfig.locale.lng`
-   `BULL_BOARD_UI_CONFIG__DATE_FORMATS__SHORT` → `uiConfig.dateFormats.short`

**Automatic Type Conversion**:

-   String numbers → numbers: `"3000"` → `3000`
-   Boolean strings → booleans: `"true"` → `true`, `"false"` → `false`
-   Other strings remain as strings: `"My Dashboard"` → `"My Dashboard"`

**Future-Proof**: Works with any new Bull Board configuration options without code changes!

**Common Examples**:

-   `BULL_BOARD_UI_BASE_PATH` - Base path for the UI
-   `BULL_BOARD_UI_CONFIG__BOARD_TITLE` - Board title
-   `BULL_BOARD_UI_CONFIG__BOARD_LOGO__PATH` - Logo path
-   `BULL_BOARD_UI_CONFIG__BOARD_LOGO__WIDTH` - Logo width
-   `BULL_BOARD_UI_CONFIG__BOARD_LOGO__HEIGHT` - Logo height
-   `BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__SHOW_SETTING` - Show polling interval setting
-   `BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__FORCE_INTERVAL` - Force polling interval
-   `BULL_BOARD_UI_CONFIG__DATE_FORMATS__SHORT` - Date format for same day (e.g., "HH:mm:ss" for 24-hour format)
-   `BULL_BOARD_UI_CONFIG__DATE_FORMATS__COMMON` - Date format for same year (e.g., "MM-dd HH:mm:ss" for 24-hour format)
-   `BULL_BOARD_UI_CONFIG__DATE_FORMATS__FULL` - Full date format (e.g., "yyyy-MM-dd HH:mm:ss" for 24-hour format)

### Restrict access with login and password

To restrict access to bull-board use `USER_LOGIN` and `USER_PASSWORD` env vars.
Only when both `USER_LOGIN` and `USER_PASSWORD` specified, access will be restricted with login/password

### Example with docker-compose

```yaml
version: "3.5"

services:
  redis:
    container_name: redis
    image: redis:5.0-alpine
    restart: always
    ports:
      - 6379:6379
    volumes:
      - redis_db_data:/data

  bullboard:
    container_name: bullboard
    image: deadly0/bull-board
    restart: always
    ports:
      - 3000:3000
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: example-password
            REDIS_USE_TLS: "false"
      BULL_PREFIX: bull
      # Bull Board UI Configuration
      BULL_BOARD_UI_CONFIG__BOARD_TITLE: "My Queue Dashboard"
      BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__SHOW_SETTING: "true"
      BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__FORCE_INTERVAL: "5000"
      # 24-hour date format configuration
      BULL_BOARD_UI_CONFIG__DATE_FORMATS__SHORT: "HH:mm:ss"
      BULL_BOARD_UI_CONFIG__DATE_FORMATS__COMMON: "MM-dd HH:mm:ss"
      BULL_BOARD_UI_CONFIG__DATE_FORMATS__FULL: "yyyy-MM-dd HH:mm:ss"
    depends_on:
      - redis

volumes:
  redis_db_data:
    external: false
```

[bull-board]: https://github.com/vcapretz/bull-board
[bull-board]: https://github.com/felixmosh/bull-board#hosting-router-on-a-sub-path

