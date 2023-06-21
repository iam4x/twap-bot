import { OrderSide } from 'safe-cex/dist/types';
import { add, multiply, subtract } from 'safe-cex/dist/utils/safe-math';

import { exchange } from '../utils/exchange';

export const cleanOrders = async () => {
  // filter orders that are 10% away from the current price
  const toRemove = exchange.store.orders.filter((order) => {
    const ticker = exchange.store.tickers.find(
      (t) => t.symbol === order.symbol
    );

    if (ticker) {
      const sevenPercent = multiply(ticker.last, 0.07);

      if (order.side === OrderSide.Buy) {
        const threshold = subtract(ticker.last, sevenPercent);
        return order.price < threshold;
      }

      if (order.side === OrderSide.Sell) {
        const threshold = add(ticker.last, sevenPercent);
        return order.price > threshold;
      }
    }

    return false;
  });

  if (toRemove.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`[info] Removing ${toRemove.length} orders`);
    await exchange.cancelOrders(toRemove);
  }
};
