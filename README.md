# TWAP-BOT

> Script to run TWAP on multiple exchanges

## Config

Create a `.env` file at directory source and specify your options:

- `EXCHANGE` (bybit,binance,gateio,bitget,woo,okx)
- `API_KEY`
- `API_SECRET`
- `API_PASSPHRASE` (only needed for certain exchanges)
- `DURATION` (TWAP duration in ms)
- `TWAP` (COIN_AMOUNTUSD_SIDE separated by commas)

Example:

```sh
EXCHANGE=bybit

API_KEY=foo
API_SECRET=bar

DURATION=259200000
TWAP=BTCUSDT_10000_LONG,ETH_10000_SHORT
```

## How to run

- `$ yarn install && yarn build && yarn start`
