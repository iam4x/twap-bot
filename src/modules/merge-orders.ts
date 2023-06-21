/* eslint-disable max-depth */
import groupBy from 'lodash/groupBy';
import { OrderSide } from 'safe-cex/dist/types';
import { add } from 'safe-cex/dist/utils/safe-math';

import { exchange } from '../utils/exchange';

export const mergeOrders = async () => {
  const groupedSymbol = groupBy(exchange.store.orders, 'symbol');

  for (const [symbol, symbolOrders] of Object.entries(groupedSymbol)) {
    const buyOrders = symbolOrders.filter((o) => o.side === OrderSide.Buy);
    const sellOrders = symbolOrders.filter((o) => o.side === OrderSide.Sell);

    const samePriceBuy = groupBy(buyOrders, 'price');
    const samePriceSell = groupBy(sellOrders, 'price');

    for (const [, childBuyOrders] of Object.entries(samePriceBuy)) {
      if (childBuyOrders.length > 1) {
        // eslint-disable-next-line no-console
        console.log(
          `[info] Merge ${childBuyOrders.length} ${symbol} buy orders at ${childBuyOrders[0].price}`
        );

        const amount = childBuyOrders.reduce((acc, o) => add(acc, o.amount), 0);

        const [firstOrder, ...restOrders] = childBuyOrders;
        const newOrderId = await exchange.updateOrder({
          order: firstOrder,
          update: { amount },
        });

        if (newOrderId.length) {
          try {
            await exchange.cancelOrders(restOrders);
          } catch {
            // do nothing
          }
        }
      }
    }

    for (const [, childSellOrders] of Object.entries(samePriceSell)) {
      if (childSellOrders.length > 1) {
        // eslint-disable-next-line no-console
        console.log(
          `[info] Merge ${childSellOrders.length} ${symbol} buy orders at ${childSellOrders[0].price}`
        );

        const amount = childSellOrders.reduce(
          (acc, o) => add(acc, o.amount),
          0
        );

        const [firstOrder, ...restOrders] = childSellOrders;
        const newOrderId = await exchange.updateOrder({
          order: firstOrder,
          update: { amount },
        });

        if (newOrderId.length) {
          try {
            await exchange.cancelOrders(restOrders);
          } catch {
            // do nothing
          }
        }
      }
    }
  }
};
