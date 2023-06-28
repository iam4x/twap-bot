import { OrderSide, OrderType } from 'safe-cex/dist/types';
import {
  adjust,
  divide,
  multiply,
  add,
  subtract,
} from 'safe-cex/dist/utils/safe-math';

import { exchange } from '../utils/exchange';
import { sleep } from '../utils/sleep';

export class TWAPManager {
  constructor(
    private symbol: string,
    private sizeInUSD: number,
    private duration: number,
    private side: OrderSide
  ) {
    this.start();
  }

  get market() {
    const market = exchange.store.markets.find((m) => m.symbol === this.symbol);
    if (!market) throw new Error(`Market ${this.symbol} not found`);

    return market;
  }

  get ticker() {
    const ticker = exchange.store.tickers.find((t) => t.symbol === this.symbol);
    if (!ticker) throw new Error(`Ticker ${this.symbol} not found`);

    return ticker;
  }

  get orders() {
    return exchange.store.orders.filter((o) => o.symbol === this.symbol);
  }

  start() {
    const min = this.market.limits.amount.min;
    const fiveDollars = divide(5, this.ticker.last);

    const buyAmount = Math.max(min, fiveDollars);

    const pAmount = this.market.precision.amount;
    const pPrice = this.market.precision.price;

    const amount = adjust(this.sizeInUSD / this.ticker.last, pAmount);

    const lotsCount = Math.floor(divide(amount, buyAmount));
    const interval = this.duration / lotsCount;

    const usd = Math.round(multiply(buyAmount, this.ticker.last) * 100) / 100;
    const sec = Math.floor(interval / 1000);
    const total = multiply(buyAmount, lotsCount);
    const totalUSD = Math.round(multiply(total, this.ticker.last) * 100) / 100;

    // eslint-disable-next-line no-console
    console.log(`\nTWAP ${buyAmount} ($${usd}) ${this.symbol} every ${sec}s`);
    // eslint-disable-next-line no-console
    console.log(`Total: ${lotsCount} lots, ${total} ($${totalUSD})`);

    const twap = async () => {
      // skip if we are in profits
      if (exchange.store.balance.upnl > 0) {
        setTimeout(() => twap(), interval);
        return;
      }

      const orderPrice = subtract(this.ticker.ask, pPrice);

      const order = {
        symbol: this.symbol,
        price: orderPrice,
        amount: buyAmount,
        side: this.side,
        type: OrderType.Limit,
      };

      const action = order.side === OrderSide.Buy ? 'LONG' : 'SHORT';

      // we already have an order at this price
      // so we just update it with the new amount
      // to avoid hitting exchange limits
      const existingOrder = this.orders.find(
        (o) => o.side === this.side && o.price === orderPrice
      );

      if (existingOrder) {
        const newAmount = add(existingOrder.amount, min);

        try {
          const orderId = await exchange.updateOrder({
            order: existingOrder,
            update: { amount: newAmount },
          });

          if (orderId.length > 0) {
            // eslint-disable-next-line no-console
            console.log(
              `-> ${action} ${order.amount} ${order.symbol} @ ${order.price}`
            );

            setTimeout(() => twap(), interval);
            return;
          }
        } catch {
          // do nothing
        }
      }

      // place a new order at this price
      const orderId = await exchange.placeOrder(order);

      if (orderId.length === 0) {
        await sleep(100);
        await twap();
        return;
      }

      // eslint-disable-next-line no-console
      console.log(
        `-> ${action} ${order.amount} ${order.symbol} @ ${order.price}`
      );

      setTimeout(() => twap(), interval);
    };

    twap();
  }
}
