/* eslint-disable no-console */
import { createExchange } from 'safe-cex';
import type { LogSeverity, Order } from 'safe-cex/dist/types';
import { OrderSide } from 'safe-cex/dist/types';

export const exchange = createExchange(process.env.EXCHANGE as any, {
  key: process.env.API_KEY as string,
  secret: process.env.API_SECRET as string,
  extra: { tickInterval: 1000 * 60 * 5 },
});

exchange.on('error', (error: string) => {
  console.error(error);
});

exchange.on('log', (message: string, severity: LogSeverity) => {
  console.log(`[${severity}] ${message}`);
});

exchange.on('fill', (order: Partial<Order>) => {
  const action = order.side === OrderSide.Buy ? 'BUY' : 'SELL';
  console.log(`${action} ${order.amount} ${order.symbol} @ ${order.price}`);
});
