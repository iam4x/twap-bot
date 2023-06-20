import { OrderSide } from 'safe-cex/dist/types';

export const DURATION = parseInt(process.env.DURATION as string, 10);
export const TWAP = (process.env.TWAP as string)
  .split(',')
  .map((str) => str.split('_'))
  .map(([symbol, sizeInUSD, side]) => {
    return {
      symbol: `${symbol}USDT`,
      sizeInUSD: parseFloat(sizeInUSD),
      side: side === 'LONG' ? OrderSide.Buy : OrderSide.Sell,
    };
  });
